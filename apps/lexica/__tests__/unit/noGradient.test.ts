import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Direction B is flat 2D: no CSS or Tailwind gradients anywhere in the app (docs/LEXICA_UI_B_ROLLOUT.md §6). */
const ROOT = join(__dirname, '../../app');
const PATTERN = /(linear|radial|conic)-gradient\(|bg-gradient-|\bfrom-[a-z]+(-\d+|\/)|\bvia-[a-z]+(-\d+|\/)/;

function files(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) return name === 'dev' ? [] : files(p);
        return /\.(tsx?|css)$/.test(name) ? [p] : [];
    });
}

describe('no gradients', () => {
    it('app/ has none', () => {
        const hits = files(ROOT).flatMap((f) =>
            readFileSync(f, 'utf8')
                .split('\n')
                .map((line, i) => ({ line, at: `${f.slice(ROOT.length + 1)}:${i + 1}` }))
                .filter(({ line }) => PATTERN.test(line))
                .map(({ at }) => at),
        );
        expect(hits).toEqual([]);
    });
});
