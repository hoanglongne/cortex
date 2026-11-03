import { describe, expect, it } from 'vitest';
import { anonymizeClassId, anonymousId, buildIdentify, buildPayload, sanitizeProps } from './index';

describe('sanitizeProps', () => {
  it('keeps numbers, flags and short labels', () => {
    expect(sanitizeProps({ score: 7, passed: true, mode: 'solo', none: null })).toEqual({ score: 7, passed: true, mode: 'solo', none: null });
  });
  it('drops free text by key and by length', () => {
    const out = sanitizeProps({ transcript: 'hello', answer_text: 'x', note: 'n', email: 'a@b', label: 'x'.repeat(81), ok: 1, obj: { a: 1 } as never });
    expect(out).toEqual({ ok: 1 });
  });
  it('keeps ids that only contain the letters of a banned word', () => {
    expect(sanitizeProps({ nameless: 1, contexts: 2 })).toEqual({ nameless: 1, contexts: 2 });
  });
  it('also catches camelCase keys', () => {
    expect(sanitizeProps({ answerText: 'x', userEmail: 'a', score: 1 })).toEqual({ score: 1 });
  });
});

describe('buildPayload', () => {
  const base = { event: 'class_joined', app: 'lexica' as const, anonId: 'anon-1', apiKey: 'k' };
  it('is anonymous before sign-in', () => {
    const p = buildPayload({ ...base, userId: null });
    expect(p.distinct_id).toBe('anon-1');
    expect(p.properties).toEqual({ app: 'lexica' });
  });
  it('uses the user id as the person after sign-in, with track and class', () => {
    const p = buildPayload({ ...base, userId: 'u-1', track: 'class', classHash: 'abc123', props: { size: 12 } });
    expect(p.distinct_id).toBe('u-1');
    expect(p.properties).toMatchObject({ app: 'lexica', track: 'class', class: 'abc123', cortex_user_id: 'u-1', size: 12 });
  });
});

describe('buildIdentify', () => {
  it('joins the anonymous id to the user', () => {
    expect(buildIdentify('u-1', 'anon-1', 'k', 'oratio')).toMatchObject({ event: '$identify', distinct_id: 'u-1', properties: { $anon_distinct_id: 'anon-1', app: 'oratio' } });
  });
});

describe('anonymizeClassId', () => {
  it('is stable, short and not the id', async () => {
    const a = await anonymizeClassId('class-123');
    expect(a).toMatch(/^[0-9a-f]{12}$/);
    expect(a).toBe(await anonymizeClassId('class-123'));
    expect(a).not.toBe(await anonymizeClassId('class-124'));
  });
});

describe('anonymousId', () => {
  it('creates once and reuses', () => {
    const data: Record<string, string> = {};
    const store = { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) };
    const first = anonymousId('k', store);
    expect(anonymousId('k', store)).toBe(first);
    expect(data.k).toBe(first);
  });
});

import { createAppAnalytics, type AuthLike } from './index';

describe('createAppAnalytics', () => {
  it('does nothing without a key', () => {
    const a = createAppAnalytics({ app: 'oratio' });
    expect(a.enabled).toBe(false);
    expect(a.boot(null)).toBeTypeOf('function');
  });

  it('opens once and stops listening when told to', async () => {
    let unsub = 0;
    const client: AuthLike = {
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'u-1' } } } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => void unsub++ } } }),
      },
    };
    const a = createAppAnalytics({ app: 'teach', key: 'k' });
    const stop = a.boot(client);
    expect(a.boot(client)).toBeTypeOf('function');
    await new Promise((r) => setTimeout(r, 0));
    stop();
    expect(unsub).toBe(1);
  });
});
