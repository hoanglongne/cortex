/**
 * On-device speech metrics for the solo result screen: how long the learner
 * actually spoke and how many long pauses (> 1.5 s of silence) they left.
 * Pure maths over decoded samples; nothing is uploaded.
 */

export interface SpeechMetrics {
  /** Time with voice, short gaps between words included */
  speakingMs: number;
  totalMs: number;
  /** Silences of at least `longPauseMs` between two stretches of speech */
  longPauses: number;
  longestPauseMs: number;
  /** Held "mmm" sounds that were not counted as speech */
  hums?: number;
}

export interface AnalyzeOptions {
  frameMs?: number;
  /** A silence at least this long counts as a long pause */
  longPauseMs?: number;
  /** Gaps shorter than this are breaths between words, still "speaking" */
  bridgeMs?: number;
  /** RMS below this is silence whatever the recording level (mic noise floor) */
  minRms?: number;
  /** Speech threshold as a share of the loud (95th percentile) level */
  relativeThreshold?: number;
}


export interface Hum {
  startMs: number;
  endMs: number;
}

/**
 * A learner who cannot find the next word often hums "mmm / ừmmm" for a second
 * or two. That has voice in it, so a plain loudness check counts it as speech
 * and the answer looks fluent. Speech rises and falls with every syllable; a
 * hum is almost flat. Any voiced stretch of at least `minMs` whose loudness
 * hardly changes is taken out of the voiced frames and reported as a hum.
 * Pure maths; tuned on synthetic tones and noise, not on real recordings.
 */
export function maskHums(rms: ArrayLike<number>, voiced: boolean[], frameMs: number, minMs = 700, maxVariation = 0.3): { voiced: boolean[]; hums: Hum[] } {
  const win = Math.max(4, Math.round(minMs / frameMs));
  const flat = new Array<boolean>(rms.length).fill(false);
  for (let s = 0; s + win <= rms.length; s++) {
    let ok = true;
    let sum = 0;
    for (let i = s; i < s + win; i++) {
      if (!voiced[i]) {
        ok = false;
        break;
      }
      sum += rms[i];
    }
    if (!ok) continue;
    const mean = sum / win;
    let sq = 0;
    for (let i = s; i < s + win; i++) sq += (rms[i] - mean) ** 2;
    if (mean > 0 && Math.sqrt(sq / win) / mean < maxVariation) for (let i = s; i < s + win; i++) flat[i] = true;
  }
  const out = voiced.slice();
  const hums: Hum[] = [];
  let f = 0;
  while (f < flat.length) {
    if (!flat[f]) {
      f++;
      continue;
    }
    let end = f;
    while (end < flat.length && flat[end]) end++;
    for (let i = f; i < end; i++) out[i] = false;
    hums.push({ startMs: f * frameMs, endMs: end * frameMs });
    f = end;
  }
  return { voiced: out, hums };
}

export function analyzeSamples(samples: Float32Array, sampleRate: number, opts: AnalyzeOptions = {}): SpeechMetrics {
  const { frameMs = 50, longPauseMs = 1500, bridgeMs = 300, minRms = 0.01, relativeThreshold = 0.15 } = opts;
  const totalMs = sampleRate > 0 ? (samples.length / sampleRate) * 1000 : 0;
  const frameSize = Math.max(1, Math.round((sampleRate * frameMs) / 1000));
  const frames = Math.floor(samples.length / frameSize);
  if (frames === 0) return { speakingMs: 0, totalMs, longPauses: 0, longestPauseMs: 0 };

  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const base = f * frameSize;
    for (let i = 0; i < frameSize; i++) sum += samples[base + i] * samples[base + i];
    rms[f] = Math.sqrt(sum / frameSize);
  }

  // Adaptive: quiet recordings still work, while pure noise stays silent
  const sorted = Array.from(rms).sort((a, b) => a - b);
  const loud = sorted[Math.min(frames - 1, Math.floor(frames * 0.95))];
  const threshold = Math.max(minRms, loud * relativeThreshold);
  const masked = maskHums(rms, Array.from(rms, (v) => v >= threshold), frameMs);
  const voiced = masked.voiced;

  const first = voiced.indexOf(true);
  if (first === -1) return { speakingMs: 0, totalMs, longPauses: 0, longestPauseMs: 0, hums: masked.hums.length };
  const last = voiced.lastIndexOf(true);

  const bridgeFrames = Math.round(bridgeMs / frameMs);
  const pauseFrames = Math.round(longPauseMs / frameMs);
  let speakingFrames = 0;
  let longPauses = 0;
  let longestPause = 0;

  // Leading and trailing silence is not a pause: the learner was not mid-answer
  let f = first;
  while (f <= last) {
    if (voiced[f]) {
      speakingFrames++;
      f++;
      continue;
    }
    let end = f;
    while (!voiced[end]) end++;
    const gap = end - f;
    if (gap <= bridgeFrames) speakingFrames += gap;
    if (gap >= pauseFrames) longPauses++;
    longestPause = Math.max(longestPause, gap);
    f = end;
  }

  return {
    speakingMs: speakingFrames * frameMs,
    totalMs,
    longPauses,
    longestPauseMs: longestPause * frameMs,
    hums: masked.hums.length,
  };
}

/** Decode a recorded Blob to mono samples (browser only). */
export async function decodeBlobToMono(blob: Blob): Promise<{ samples: Float32Array; sampleRate: number }> {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    const mono = new Float32Array(buffer.length);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i++) mono[i] += data[i] / buffer.numberOfChannels;
    }
    return { samples: mono, sampleRate: buffer.sampleRate };
  } finally {
    void ctx.close();
  }
}

export async function analyzeBlob(blob: Blob, opts?: AnalyzeOptions): Promise<SpeechMetrics> {
  const { samples, sampleRate } = await decodeBlobToMono(blob);
  return analyzeSamples(samples, sampleRate, opts);
}


export interface SpeechProfile {
  durationMs: number;
  /** Loudness per bar, 0 to 1, for drawing the voice map */
  peaks: number[];
  /** Silences of at least `minPauseMs` between two stretches of speech */
  pauses: { startMs: number; endMs: number }[];
  /** Held "mmm" sounds: voice, but not words */
  hums: Hum[];
  /** Share of the time between the first and the last word that has voice in it */
  voicedShare: number;
}

/**
 * What the screen shows as "bản đồ giọng nói": a loudness bar per slice of the
 * recording and where the long pauses are, so a rater can see hesitation and
 * jump to it instead of hunting for it by ear. Pure maths over decoded
 * samples; nothing is uploaded.
 */
export function profileSamples(samples: Float32Array, sampleRate: number, opts: { bars?: number; minPauseMs?: number } & AnalyzeOptions = {}): SpeechProfile {
  const { bars = 96, minPauseMs = 1500, frameMs = 50, bridgeMs = 300, minRms = 0.01, relativeThreshold = 0.15 } = opts;
  const durationMs = sampleRate > 0 ? (samples.length / sampleRate) * 1000 : 0;
  const frameSize = Math.max(1, Math.round((sampleRate * frameMs) / 1000));
  const frames = Math.floor(samples.length / frameSize);
  const empty = { durationMs, peaks: new Array<number>(bars).fill(0), pauses: [], hums: [], voicedShare: 0 };
  if (frames === 0) return empty;

  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const base = f * frameSize;
    for (let i = 0; i < frameSize; i++) sum += samples[base + i] * samples[base + i];
    rms[f] = Math.sqrt(sum / frameSize);
  }
  const sorted = Array.from(rms).sort((a, b) => a - b);
  const loud = sorted[Math.min(frames - 1, Math.floor(frames * 0.95))] || 1e-6;
  const threshold = Math.max(minRms, loud * relativeThreshold);
  const masked = maskHums(rms, Array.from(rms, (v) => v >= threshold), frameMs);
  const voiced = masked.voiced;

  const peaks = Array.from({ length: bars }, (_, b) => {
    const from = Math.floor((b * frames) / bars);
    const to = Math.max(from + 1, Math.floor(((b + 1) * frames) / bars));
    let m = 0;
    for (let f = from; f < to && f < frames; f++) m = Math.max(m, rms[f]);
    return Math.min(1, Math.sqrt(m / loud));
  });

  const first = voiced.indexOf(true);
  if (first === -1) return { ...empty, peaks };
  const last = voiced.lastIndexOf(true);
  const bridgeFrames = Math.round(bridgeMs / frameMs);
  const pauseFrames = Math.round(minPauseMs / frameMs);
  const pauses: SpeechProfile["pauses"] = [];
  let voicedFrames = 0;
  let f = first;
  while (f <= last) {
    if (voiced[f]) {
      voicedFrames++;
      f++;
      continue;
    }
    let end = f;
    while (!voiced[end]) end++;
    const gap = end - f;
    if (gap <= bridgeFrames) voicedFrames += gap;
    if (gap >= pauseFrames) pauses.push({ startMs: f * frameMs, endMs: end * frameMs });
    f = end;
  }
  return { durationMs, peaks, pauses, hums: masked.hums, voicedShare: voicedFrames / (last - first + 1) };
}

/** Decode and profile a recording from a URL (blob: or the signed link). Null when it cannot be fetched or decoded. */
export async function profileUrl(url: string, opts?: Parameters<typeof profileSamples>[2]): Promise<SpeechProfile | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const { samples, sampleRate } = await decodeBlobToMono(await res.blob());
    return profileSamples(samples, sampleRate, opts);
  } catch {
    return null;
  }
}
