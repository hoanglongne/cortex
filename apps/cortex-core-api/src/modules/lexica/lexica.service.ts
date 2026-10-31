import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { StudioLlm } from '../studio/studio-llm';
import { DEFAULT_GEMINI_MODEL } from '../shared/gemini';
import {
  DailyLimit,
  MAX_AUDIO_BASE64,
  parseSentenceReply,
  parseTranscript,
  pcmRate,
  pcmToWav,
  readingFromReply,
  readingInput,
  readingKey,
  readingPrompt,
  sentenceInput,
  sentencePrompt,
  str,
  transcribePrompt,
  ttsInput,
  ttsKey,
  ttsPrompt,
} from './lexica-ai';

const BUCKET = 'lexica-content';
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Small in-memory LRU in front of the storage cache. */
class Lru<V> {
  private map = new Map<string, V>();
  constructor(private readonly max: number) {}
  get(k: string): V | undefined {
    const v = this.map.get(k);
    if (v !== undefined) {
      this.map.delete(k);
      this.map.set(k, v);
    }
    return v;
  }
  set(k: string, v: V) {
    this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.max)
      this.map.delete(this.map.keys().next().value as string);
  }
}

@Injectable()
export class LexicaService {
  private readonly log = new Logger(LexicaService.name);
  private readings = new Lru<unknown>(300);
  private clips = new Lru<Buffer>(400);
  private limits = {
    reading: new DailyLimit(20),
    transcribe: new DailyLimit(150),
    tts: new DailyLimit(300),
    sentence: new DailyLimit(60),
  };

  constructor(
    private readonly config: ConfigService,
    private readonly llm: StudioLlm,
    private readonly supabase: SupabaseService,
  ) {}

  /** A reading around the learner's words; the same word set is written once for everyone. */
  async reading(body: unknown, who: string) {
    const input = readingInput(body);
    if (!input) throw new BadRequestException('Need 2–6 English words');
    const key = `reading/${readingKey(input)}.json`;
    const hit = this.readings.get(key) ?? (await this.loadJson(key));
    if (hit) {
      this.readings.set(key, hit);
      return hit;
    }
    this.take('reading', who);
    for (let attempt = 0; attempt < 2; attempt++) {
      const { json } = await this.llm.generateJson(readingPrompt(input));
      const draft = readingFromReply(input, json);
      if (!draft) continue;
      const out = { id: `r_${readingKey(input)}`, ...draft };
      this.readings.set(key, out);
      void this.save(key, Buffer.from(JSON.stringify(out)), 'application/json');
      return out;
    }
    throw new ServiceUnavailableException('Could not write a reading');
  }

  /** Kind feedback on a sentence the learner wrote with a word. Not cached: every sentence differs. */
  async sentence(body: unknown, who: string) {
    const input = sentenceInput(body);
    if (!input) throw new BadRequestException('Need a word and a sentence');
    this.take('sentence', who);
    const { json } = await this.llm.generateJson(sentencePrompt(input));
    const reply = parseSentenceReply(json);
    if (!reply) throw new ServiceUnavailableException('Could not check it');
    return reply;
  }

  /** What the learner said, when the browser could not recognise it. Not cached: every attempt differs. */
  async transcribe(body: unknown, who: string) {
    const o = (body ?? {}) as Record<string, unknown>;
    const audio = typeof o.audio === 'string' ? o.audio : '';
    const target = str(o.target).slice(0, 200);
    if (!audio || audio.length > MAX_AUDIO_BASE64 || !target)
      throw new BadRequestException('Need a short WAV recording and a target');
    this.take('transcribe', who);
    const model =
      this.config.get<string>('LEXICA_SPEECH_MODEL') ??
      this.config.get<string>('GEMINI_MODEL') ??
      DEFAULT_GEMINI_MODEL;
    const reply = await this.gemini(model, {
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'audio/wav', data: audio } },
            { text: transcribePrompt(target) },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0,
      },
    });
    const text = reply?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('');
    let json: unknown = null;
    try {
      json = JSON.parse(text ?? '');
    } catch {
      json = null;
    }
    const { transcript, confidence } = parseTranscript(json);
    return { transcripts: transcript ? [transcript] : [], confidence };
  }

  /** A natural voice for a word or a sentence, as WAV. Cached for good. */
  async tts(query: Record<string, unknown>, who: string): Promise<Buffer> {
    const input = ttsInput(query);
    if (!input) throw new BadRequestException('Need text (≤ 1200 chars)');
    const key = `tts/${ttsKey(input)}.wav`;
    const hit = this.clips.get(key) ?? (await this.load(key));
    if (hit) {
      this.clips.set(key, hit);
      return hit;
    }
    this.take('tts', who);
    const model =
      this.config.get<string>('LEXICA_TTS_MODEL') ??
      'gemini-2.5-flash-preview-tts';
    const reply = await this.gemini(model, {
      contents: [
        { role: 'user', parts: [{ text: ttsPrompt(input.text, input.slow) }] },
      ],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: input.voice } },
        },
      },
    });
    const part = reply?.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData?.data,
    );
    if (!part?.inlineData)
      throw new ServiceUnavailableException('No audio from the voice model');
    const wav = pcmToWav(
      Buffer.from(part.inlineData.data, 'base64'),
      pcmRate(part.inlineData.mimeType),
    );
    this.clips.set(key, wav);
    void this.save(key, wav, 'audio/wav');
    return wav;
  }

  private take(kind: keyof LexicaService['limits'], who: string) {
    if (!this.limits[kind].take(who))
      throw new HttpException(
        'Daily limit reached, try again tomorrow',
        HttpStatus.TOO_MANY_REQUESTS,
      );
  }

  private async gemini(
    model: string,
    body: unknown,
  ): Promise<GeminiReply | null> {
    const key = this.config.get<string>('GEMINI_API_KEY');
    if (!key) throw new ServiceUnavailableException('GEMINI_API_KEY not set');
    const res = await fetch(`${GEMINI}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      this.log.warn(`gemini ${model} ${res.status}`);
      throw new ServiceUnavailableException('Voice model unavailable');
    }
    return (await res.json()) as GeminiReply;
  }

  // Storage cache (service role). Without it, the in-memory cache still works.
  private async load(path: string): Promise<Buffer | null> {
    const client = this.supabase.serviceClient();
    if (!client) return null;
    try {
      const { data } = await client.storage
        .from(BUCKET)
        .download(`cache/${path}`);
      return data ? Buffer.from(await data.arrayBuffer()) : null;
    } catch {
      return null;
    }
  }

  private async loadJson(path: string): Promise<unknown> {
    const buf = await this.load(path);
    if (!buf) return null;
    try {
      return JSON.parse(buf.toString('utf8')) as unknown;
    } catch {
      return null;
    }
  }

  private async save(path: string, data: Buffer, contentType: string) {
    const client = this.supabase.serviceClient();
    if (!client) return;
    try {
      await client.storage
        .from(BUCKET)
        .upload(`cache/${path}`, data, { contentType, upsert: true });
    } catch (e) {
      this.log.warn(`cache save failed: ${String(e)}`);
    }
  }
}

interface GeminiReply {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
        inlineData?: { mimeType?: string; data: string };
      }[];
    };
  }[];
}
