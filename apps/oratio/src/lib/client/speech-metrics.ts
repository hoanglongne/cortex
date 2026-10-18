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
  const voiced = Array.from(rms, (v) => v >= threshold);

  const first = voiced.indexOf(true);
  if (first === -1) return { speakingMs: 0, totalMs, longPauses: 0, longestPauseMs: 0 };
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
