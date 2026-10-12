import { UnauthorizedException } from '@nestjs/common';
import { CAPTURE_PLACEHOLDER, hashToken } from './capture';
import { CaptureService, captureRecord } from './capture.service';
import type { StudioService } from './studio.service';
import type { SupabaseService } from '../supabase/supabase.service';
import { fakeDb } from './__testkit__/fake-db';

const THREADS_HTML = `<html><head>
<meta property="og:title" content="Mai (@mai.vy) on Threads">
<meta property="og:description" content="lương chưa về mà bill đã tới &#x1f62d;">
</head></html>`;

function service(
  rpc: (name: string, args: Record<string, unknown>) => unknown = () => ({
    data: 7,
    error: null,
  }),
  studio: Partial<StudioService> = {},
) {
  const supabase = {
    getClient: () => ({
      rpc: (name: string, args: Record<string, unknown>) =>
        Promise.resolve(rpc(name, args)),
    }),
  } as unknown as SupabaseService;
  const s = new CaptureService(supabase, studio as StudioService);
  s.fetchPage = () => Promise.resolve(THREADS_HTML);
  return s;
}

describe('captureRecord', () => {
  it('maps the link to a source and uses a placeholder without text', () => {
    expect(
      captureRecord({ url: 'https://www.threads.com/@a/post/1' }),
    ).toMatchObject({
      source_id: 'capture_threads',
      phrase: CAPTURE_PLACEHOLDER,
      body: null,
    });
  });
});

describe('CaptureService', () => {
  it('rejects requests without a capture token', async () => {
    await expect(
      service().captureWithToken(undefined, { text: 'hi' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service().captureWithToken('eyJhbGciOi', { text: 'hi' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('reads the post from the page when only a link is sent', async () => {
    let sent: Record<string, unknown> = {};
    const s = service((_name, args) => {
      sent = args;
      return { data: 7, error: null };
    });
    const r = await s.captureWithToken('lxs_abc', {
      url: 'https://www.threads.net/@mai.vy/post/C1',
      note: 'trend đi làm',
    });
    expect(r).toEqual({ id: 7 });
    expect(sent.p_token_hash).toBe(hashToken('lxs_abc'));
    expect(sent.p_capture).toMatchObject({
      source_id: 'capture_threads',
      phrase: 'lương chưa về mà bill đã tới 😭',
      author: '@mai.vy',
      note: 'trend đi làm',
    });
  });

  it('keeps the capture when the page cannot be read', async () => {
    const s = service();
    s.fetchPage = () => Promise.reject(new Error('HTTP 403'));
    const out = await s.enrich({ url: 'https://www.facebook.com/x/posts/1' });
    expect(out).toEqual({ url: 'https://www.facebook.com/x/posts/1' });
  });

  it('turns a revoked or unknown token into 401', async () => {
    const s = service(() => ({
      data: null,
      error: { message: 'invalid capture token', code: '28000' },
    }));
    await expect(
      s.captureWithToken('lxs_old', { text: 'hello there' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('updates the earlier capture of the same link instead of adding one', async () => {
    const existing = {
      id: 3,
      source_id: 'capture_threads',
      phrase: CAPTURE_PLACEHOLDER,
      body: null,
      note: 'cũ',
      url: 'https://www.threads.net/@mai.vy/post/C1',
      seen_at: '2026-10-10T00:00:00Z',
      dismissed: true,
    };
    const { db, calls } = fakeDb((c) =>
      c.op === 'select' ? { data: [existing] } : { data: [existing] },
    );
    await service().createCapture(db, 'u1', {
      url: existing.url,
      note: 'mới',
    });
    const update = calls.find((c) => c.op === 'update');
    expect(update?.payload).toMatchObject({
      note: 'mới',
      body: 'lương chưa về mà bill đã tới 😭',
      phrase: 'lương chưa về mà bill đã tới 😭',
      dismissed: false,
    });
    expect(calls.some((c) => c.op === 'insert')).toBe(false);
  });

  it('creates a trend from a capture, links it and reports generation errors', async () => {
    const capture = {
      id: 5,
      source_id: 'capture_tiktok',
      url: 'https://www.tiktok.com/@a/video/1',
      seen_at: '2026-10-10T00:00:00Z',
    };
    const { db, calls } = fakeDb((c) =>
      c.table === 'studio_signals'
        ? { data: capture }
        : { data: [{ id: 'tr9', label: 'x' }] },
    );
    const createTrend = jest.fn().mockResolvedValue({ id: 'tr9' });
    const generateForTrend = jest
      .fn()
      .mockRejectedValue(new Error('Đã chạm trần'));
    const r = await service(undefined, {
      createTrend,
      generateForTrend,
    }).createTrendFromCapture(db, 'u1', 5, {
      label: 'bill tới trước lương',
      tags: [],
      targetWords: [],
      generate: true,
    });
    expect(createTrend).toHaveBeenCalledWith(
      db,
      'u1',
      expect.objectContaining({ url: capture.url }),
    );
    expect(
      calls.find((c) => c.table === 'studio_trend_signals')?.payload,
    ).toEqual({ trend_id: 'tr9', signal_id: 5 });
    expect(
      calls.find((c) => c.table === 'studio_trends' && c.op === 'update')
        ?.payload,
    ).toMatchObject({ source: 'capture_tiktok', signal_count: 1 });
    expect(r.generateError).toBe('Đã chạm trần');
  });

  it('stores only the hash of a new token', async () => {
    const { db, calls } = fakeDb(() => ({
      data: [{ id: 't1', name: 'Chrome' }],
    }));
    const r = await service().createToken(db, 'u1', 'Chrome');
    expect(r.token).toMatch(/^lxs_[\w-]{32}$/);
    expect(calls[0].payload).toEqual({
      user_id: 'u1',
      name: 'Chrome',
      token_hash: hashToken(r.token),
    });
  });
});

describe('CaptureService.enrich', () => {
  it('never fetches pages outside the supported networks', async () => {
    const s = service();
    const fetchPage = jest.fn();
    s.fetchPage = fetchPage;
    await s.enrich({ url: 'http://169.254.169.254/latest' });
    await s.enrich({ url: 'https://example.com/post' });
    expect(fetchPage).not.toHaveBeenCalled();
  });
});

describe('CaptureService.checkToken', () => {
  it('returns the token name, or 401 when unknown', async () => {
    await expect(
      service(() => ({ data: 'Chrome', error: null })).checkToken('lxs_a'),
    ).resolves.toEqual({ name: 'Chrome' });
    await expect(
      service(() => ({ data: null, error: null })).checkToken('lxs_a'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
