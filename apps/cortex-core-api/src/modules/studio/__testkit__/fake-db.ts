/* Test-only stand-in for the Supabase client (excluded from the build). */
export type Call = {
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
export function fakeDb(
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
      'is',
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
      // Latest upload at that path, like a real bucket with upsert.
      download: (path: string) => {
        const hit = [...uploads].reverse().find((u) => u.path === path);
        return Promise.resolve(
          hit
            ? { data: { text: () => Promise.resolve(hit.body) }, error: null }
            : { data: null, error: { message: 'not found' } },
        );
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://cdn/${path}` },
      }),
    }),
  };
  return { db: { from, storage } as never, calls, uploads };
}
