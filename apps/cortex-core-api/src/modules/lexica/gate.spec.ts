import { Gate } from './lexica.service';

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('Gate', () => {
  it('runs at most `max` jobs at once and the rest in turn', async () => {
    const gate = new Gate(2, 10);
    let active = 0;
    let peak = 0;
    const job = async () => {
      active++;
      peak = Math.max(peak, active);
      await tick();
      active--;
      return 1;
    };
    const results = await Promise.all(
      Array.from({ length: 6 }, () => gate.run(job)),
    );
    expect(results).toHaveLength(6);
    expect(peak).toBe(2);
  });

  it('refuses at once when too many are already waiting', async () => {
    const gate = new Gate(1, 1);
    let release: () => void = () => {};
    const first = gate.run(() => new Promise<void>((r) => (release = r)));
    const second = gate.run(() => Promise.resolve(2));
    await expect(gate.run(() => Promise.resolve(3))).rejects.toThrow('busy');
    release();
    await first;
    await expect(second).resolves.toBe(2);
  });
});
