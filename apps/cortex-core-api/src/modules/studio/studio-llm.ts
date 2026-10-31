import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_GEMINI_MODEL } from '../shared/gemini';

export interface LlmResult {
  json: unknown;
  model: string;
}

/**
 * The only place Studio calls an LLM. Provider and model come from env:
 *   STUDIO_LLM_PROVIDER = gemini | groq (default: whichever key is set)
 *   STUDIO_LLM_MODEL    = provider model id
 */
@Injectable()
export class StudioLlm {
  constructor(private readonly config: ConfigService) {}

  async generateJson(prompt: string): Promise<LlmResult> {
    const geminiKey = this.config.get<string>('GEMINI_API_KEY');
    const groqKey = this.config.get<string>('GROQ_API_KEY');
    const provider =
      this.config.get<string>('STUDIO_LLM_PROVIDER') ??
      (geminiKey ? 'gemini' : groqKey ? 'groq' : null);
    const model = this.config.get<string>('STUDIO_LLM_MODEL');

    if (provider === 'gemini' && geminiKey) {
      return this.gemini(
        geminiKey,
        model ??
          this.config.get<string>('GEMINI_MODEL') ??
          DEFAULT_GEMINI_MODEL,
        prompt,
      );
    }
    if (provider === 'groq' && groqKey) {
      return this.groq(groqKey, model ?? 'llama-3.3-70b-versatile', prompt);
    }
    throw new ServiceUnavailableException(
      'No LLM configured for Studio (set GEMINI_API_KEY or GROQ_API_KEY)',
    );
  }

  private async gemini(
    key: string,
    model: string,
    prompt: string,
  ): Promise<LlmResult> {
    const genModel = new GoogleGenerativeAI(key).getGenerativeModel({ model });
    const result = await genModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.9,
      },
    });
    return {
      json: parseJson(result.response.text()),
      model: `gemini:${model}`,
    };
  }

  private async groq(
    key: string,
    model: string,
    prompt: string,
  ): Promise<LlmResult> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
      }),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 300);
      throw new Error(`Groq error ${res.status}: ${detail}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return {
      json: parseJson(data.choices?.[0]?.message?.content ?? '{}'),
      model: `groq:${model}`,
    };
  }
}

export function parseJson(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    throw new Error(
      `Model returned invalid JSON (${trimmed.length} chars, ends with "${trimmed.slice(-40)}")`,
    );
  }
}
