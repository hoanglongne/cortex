import { describe, expect, it } from "vitest";
import { claimAll } from "@/lib/matchmaking/claim";

type Row = { id: string; status: string };

/**
 * In-memory stand-in for the match_queue table. Each conditional update is
 * applied atomically (like a single Postgres UPDATE ... WHERE), and every
 * awaited query yields to the event loop so concurrent callers interleave.
 */
function fakeQueue(rows: Row[]) {
  const table = new Map(rows.map((r) => [r.id, { ...r }]));

  function query() {
    let patch: Partial<Row> = {};
    const filters: ((r: Row) => boolean)[] = [];
    const run = async () => {
      await new Promise((r) => setTimeout(r, 0));
      const hit = [...table.values()].filter((r) => filters.every((f) => f(r)));
      hit.forEach((r) => Object.assign(r, patch));
      return { data: hit.map((r) => ({ id: r.id })), error: null };
    };
    const builder = {
      update(p: Partial<Row>) {
        patch = p;
        return builder;
      },
      eq(col: keyof Row, val: string) {
        filters.push((r) => r[col] === val);
        return builder;
      },
      in(col: keyof Row, vals: string[]) {
        filters.push((r) => vals.includes(r[col]));
        return builder;
      },
      select: run,
      then: (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
        run().then(resolve, reject),
    };
    return builder;
  }

  return { client: { from: () => query() }, table };
}

describe("claimAll", () => {
  it("claims all entries when they are free", async () => {
    const { client, table } = fakeQueue([
      { id: "a", status: "waiting" },
      { id: "b", status: "waiting" },
    ]);
    await expect(claimAll(client, ["b", "a"])).resolves.toEqual({ ok: true });
    expect(table.get("a")!.status).toBe("matched");
    expect(table.get("b")!.status).toBe("matched");
  });

  it("lets exactly one of two users who pick each other win", async () => {
    for (let i = 0; i < 50; i++) {
      const { client, table } = fakeQueue([
        { id: "alice", status: "waiting" },
        { id: "bob", status: "waiting" },
      ]);
      const [aliceTry, bobTry] = await Promise.all([
        claimAll(client, ["alice", "bob"]),
        claimAll(client, ["bob", "alice"]),
      ]);
      expect([aliceTry.ok, bobTry.ok].filter(Boolean)).toHaveLength(1);
      expect(table.get("alice")!.status).toBe("matched");
      expect(table.get("bob")!.status).toBe("matched");
    }
  });

  it("lets only one of two users claim the same partner", async () => {
    const { client, table } = fakeQueue([
      { id: "a", status: "waiting" },
      { id: "c", status: "waiting" },
      { id: "z", status: "waiting" },
    ]);
    const results = await Promise.all([
      claimAll(client, ["a", "z"]),
      claimAll(client, ["c", "z"]),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    // The loser's own entry is released back to the queue
    const statuses = ["a", "c"].map((id) => table.get(id)!.status).sort();
    expect(statuses).toEqual(["matched", "waiting"]);
  });

  it("releases earlier claims and reports which entry was taken", async () => {
    const { client, table } = fakeQueue([
      { id: "a", status: "waiting" },
      { id: "b", status: "matched" },
    ]);
    await expect(claimAll(client, ["a", "b"])).resolves.toEqual({
      ok: false,
      failedId: "b",
    });
    expect(table.get("a")!.status).toBe("waiting");
  });
});
