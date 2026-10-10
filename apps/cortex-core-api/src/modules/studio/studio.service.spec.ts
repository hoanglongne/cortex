import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { StudioService } from './studio.service';
import type { StudioLlm } from './studio-llm';
import type { CardRow } from './studio.types';

type Call = {
  table: string;
  op: string;
  payload?: unknown;
  filters: unknown[][];
};

/**
 * Minimal stand-in for the Supabase query builder: every chain method
 * records itself, and awaiting the chain returns whatever `respond`
 * gives for that table + operation.
 */
function fakeDb(
  respond: (c: Call) => { data?: unknown; error?: unknown; count?: number },
) {
  const calls: Call[] = [];
  const uploads: { path: string; body: string }[] = [];
  const from = (table: string) => {
    const call: Call = { table, op: 'select', filters: [] };
    const chain: Record<string, unknown> = {};
    for (const m of [
      'select',
      'eq',
      'neq',
      'in',
      'gte',
      'order',
      'limit',
      'ilike',
      'single',
      'maybeSingle',
    ]) {
      chain[m] = (...args: unknown[]) => {
        if (m !== 'select' || call.op === 'select')
          call.filters.push([m, ...args]);
        return chain;
      };
    }
    for (const op of ['insert', 'update', 'delete', 'upsert']) {
      chain[op] = (payload?: unknown) => {
        call.op = op;
        call.payload = payload;
        return chain;
      };
    }
    chain.then = (resolve: (v: unknown) => unknown) => {
      calls.push(call);
      const r = respond(call);
      return Promise.resolve({
        data: r.data ?? null,
        error: r.error ?? null,
        count: r.count ?? null,
      }).then(resolve);
    };
    return chain;
  };
  const storage = {
    from: () => ({
      upload: (path: string, body: string) => {
        uploads.push({ path, body });
        return Promise.resolve({ error: null });
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://cdn/${path}` },
      }),
    }),
  };
  return { db: { from, storage } as never, calls, uploads };
}

const config = new ConfigService({ STUDIO_MAX_GENERATIONS_PER_DAY: 5 });

const lexemes = [
  {
    word: 'frugal',
    ipa: 'ˈfruːɡəl',
    elo: 1000,
    level: 'intermediate',
    in_core: true,
    times_used: 0,
    last_used_at: null,
  },
  {
    word: 'deficit',
    ipa: null,
    elo: 1100,
    level: 'advanced',
    in_core: true,
    times_used: 0,
    last_used_at: null,
  },
];

const trend = {
  id: 'tr1',
  label: 'lương chưa về',
  summary: null,
  url: null,
  source: 'manual',
  status: 'new',
  hotness: 0,
  tags: [],
  target_words: [],
  generated_at: null,
  created_at: '',
};

describe('StudioService.generateForTrend', () => {
  it('validates model output and stores pending / auto-rejected drafts', async () => {
    const llm = {
      generateJson: jest.fn().mockResolvedValue({
        model: 'test:model',
        json: {
          drafts: [
            {
              word: 'frugal',
              scenario:
                'Cuối tháng sống FRUGAL tới mức ly trà đá cũng chia đôi với đứa bạn thân.',
              translation_hint: 'Tiết kiệm',
            },
            // duplicate of the first one in the same batch
            {
              word: 'frugal',
              scenario:
                'Cuối tháng sống FRUGAL tới mức ly trà đá cũng chia đôi với đứa bạn thân.',
              translation_hint: 'Tiết kiệm',
            },
            {
              word: 'deficit',
              scenario: 'Quá ngắn DEFICIT.',
              translation_hint: 'Thâm hụt',
            },
            // not in the lexicon: dropped (FK)
            {
              word: 'thrifty',
              scenario:
                'Sống THRIFTY tới mức ly trà đá cũng chia đôi với đứa bạn thân luôn.',
              translation_hint: 'x',
            },
          ],
        },
      }),
    } as unknown as StudioLlm;

    const { db, calls } = fakeDb((c) => {
      if (c.table === 'studio_job_runs' && c.op === 'select')
        return { count: 0 };
      if (c.table === 'studio_job_runs' && c.op === 'insert')
        return { data: { id: 7 } };
      if (c.table === 'studio_trends' && c.op === 'select')
        return { data: trend };
      if (c.table === 'studio_lexemes') return { data: lexemes };
      return { data: [] };
    });

    const result = await new StudioService(llm, config).generateForTrend(
      db,
      'u1',
      'tr1',
    );
    expect(result).toEqual({
      created: 1,
      rejectedAuto: 3,
      model: 'test:model',
    });

    const insert = calls.find(
      (c) => c.table === 'studio_drafts' && c.op === 'insert',
    )!;
    const rows = insert.payload as { word: string; status: string }[];
    expect(rows.map((r) => [r.word, r.status])).toEqual([
      ['frugal', 'pending'],
      ['frugal', 'rejected_auto'],
      ['deficit', 'rejected_auto'],
    ]);
    const finished = calls.find(
      (c) => c.table === 'studio_job_runs' && c.op === 'update',
    )!;
    expect(finished.payload).toMatchObject({ ok: true });
  });

  it('refuses once the daily budget is used up', async () => {
    const generateJson = jest.fn();
    const llm = { generateJson } as unknown as StudioLlm;
    const { db } = fakeDb(() => ({ count: 5 }));
    await expect(
      new StudioService(llm, config).generateForTrend(db, 'u1', 'tr1'),
    ).rejects.toBeInstanceOf(HttpException);
    expect(generateJson).not.toHaveBeenCalled();
  });

  it('records a failed run when the model output is unusable', async () => {
    const llm = {
      generateJson: jest
        .fn()
        .mockResolvedValue({ model: 'm', json: { nope: 1 } }),
    } as unknown as StudioLlm;
    const { db, calls } = fakeDb((c) => {
      if (c.table === 'studio_job_runs' && c.op === 'select')
        return { count: 0 };
      if (c.table === 'studio_job_runs' && c.op === 'insert')
        return { data: { id: 8 } };
      if (c.table === 'studio_trends') return { data: trend };
      if (c.table === 'studio_lexemes') return { data: lexemes };
      return { data: [] };
    });
    await expect(
      new StudioService(llm, config).generateForTrend(db, 'u1', 'tr1'),
    ).rejects.toThrow('Sinh nháp thất bại');
    const finished = calls.find(
      (c) => c.table === 'studio_job_runs' && c.op === 'update',
    )!;
    expect(finished.payload).toMatchObject({ ok: false });
  });
});

const card = (id: string, over: Partial<CardRow> = {}): CardRow => ({
  id,
  draft_id: null,
  word: 'frugal',
  ipa: null,
  elo: 1000,
  level: 'intermediate',
  scenario: `Câu ${id}`,
  translation_hint: 'Tiết kiệm',
  trend_label: 'lương chưa về',
  tags: [],
  lifecycle: 'trend',
  revision: 1,
  created_at: '',
  ...over,
});

describe('StudioService.publishDrop', () => {
  it('uploads drop + library packs and a manifest learners can verify', async () => {
    const { db, uploads, calls } = fakeDb((c) => {
      if (c.table === 'studio_drops' && c.op === 'select') {
        return {
          data: {
            id: 'drop-2',
            title: 'Tuần 2',
            expires_at: '2026-11-01T00:00:00Z',
          },
        };
      }
      if (c.table === 'studio_drop_cards' && c.op === 'select') {
        const isEarlier = c.filters.some((f) => f[0] === 'in');
        return isEarlier
          ? {
              data: [
                { studio_cards: card('t_old') },
                { studio_cards: card('t_gone', { lifecycle: 'retired' }) },
              ],
            }
          : {
              data: [
                { position: 0, studio_cards: card('t1') },
                {
                  position: 1,
                  studio_cards: card('t2', { lifecycle: 'retired' }),
                },
              ],
            };
      }
      return { data: [] };
    });

    const { manifest } = await new StudioService(
      {} as StudioLlm,
      config,
    ).publishDrop(db, 'u1', 'drop-2');

    expect(uploads.map((u) => u.path)).toEqual([
      expect.stringMatching(/^packs\/drop-2\.[0-9a-f]{12}\.json$/),
      expect.stringMatching(/^packs\/library-.*\.json$/),
      'packs/manifest.json',
    ]);
    const dropPack = JSON.parse(uploads[0].body) as { cards: { id: string }[] };
    expect(dropPack.cards.map((c) => c.id)).toEqual(['t1']);
    const library = JSON.parse(uploads[1].body) as { cards: { id: string }[] };
    expect(library.cards.map((c) => c.id).sort()).toEqual([
      't2',
      't_gone',
      't_old',
    ]);
    expect([...manifest.retired].sort()).toEqual(['t2', 't_gone']);

    const { createHash } = await import('node:crypto');
    expect(manifest.current?.sha256).toBe(
      createHash('sha256').update(uploads[0].body).digest('hex'),
    );
    expect(JSON.parse(uploads[2].body)).toEqual(manifest);

    const statusUpdates = calls.filter(
      (c) => c.table === 'studio_drops' && c.op === 'update',
    );
    expect(
      statusUpdates.map((c) => (c.payload as { status: string }).status),
    ).toEqual(['archived', 'published']);
  });
});
