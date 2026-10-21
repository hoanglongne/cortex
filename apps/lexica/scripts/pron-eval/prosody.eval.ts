/**
 * Level 3 on the recording kit (docs/LEXICA_PRONUNCIATION_RECORDING.md): the
 * final-consonant measure on words whose wrong take drops it, and the stress
 * measure on the two stress words. Prints a table per measure; not part of CI.
 *
 *   PRON_EVAL_DIR=folder-with-unzipped-kits npx vitest run --config scripts/pron-eval/vitest.config.mts
 *
 * The folder holds one sub-folder per zip (manifest.csv + WAVs), or one kit directly.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { it } from 'vitest';
import { analyze, finalConsonant, finalKind, stressCheck } from '../../app/lib/pronunciation/prosody';

const dir = process.env.PRON_EVAL_DIR;

function wav(file: string): Float32Array {
    const b = readFileSync(file);
    const data = b.indexOf('data') + 8;
    return Float32Array.from({ length: (b.length - data) / 2 }, (_, i) => b.readInt16LE(data + i * 2) / 32768);
}

function kits(root: string): string[] {
    if (existsSync(path.join(root, 'manifest.csv'))) return [root];
    return readdirSync(root)
        .map((d) => path.join(root, d))
        .filter((d) => statSync(d).isDirectory() && existsSync(path.join(d, 'manifest.csv')));
}

it.skipIf(!dir)('level 3 on the recording kit', () => {
    const finals: string[] = [];
    const stress: string[] = [];
    const tally = { final: { right: 0, wrong: 0, none: 0 }, stress: { right: 0, wrong: 0, none: 0 } };
    for (const kit of kits(dir!)) {
        const [head, ...rows] = readFileSync(path.join(kit, 'manifest.csv'), 'utf8').trim().split('\n').map((l) => l.split(','));
        const col = (r: string[], name: string) => r[head.indexOf(name)];
        for (const r of rows) {
            const phones = col(r, 'am_mau').split(' ');
            const take = col(r, 'luot');
            const group = col(r, 'nhom_loi');
            const f = analyze(wav(path.join(kit, col(r, 'file'))));
            if (group === 'stress') {
                const s = stressCheck(f, phones)!;
                // The wrong take stresses the first syllable.
                const want = take === 'dung' ? 'ok' : 'off';
                const t = s.verdict === null ? 'none' : s.verdict === want ? 'right' : 'wrong';
                tally.stress[t]++;
                stress.push(`${col(r, 'nguoi_ghi')}\t${col(r, 'file')}\t${s.verdict ?? '–'}\tnhấn âm ${s.said ?? '?'} (đúng là ${s.expected})\t${t}`);
                continue;
            }
            const kind = finalKind(phones);
            // Only words whose wrong take drops the final consonant.
            if (!kind || !['final_consonant', 'ending'].includes(group)) continue;
            const c = finalConsonant(f, kind);
            const want = take === 'dung' ? 'clear' : 'weak';
            const t = c.verdict === null ? 'none' : c.verdict === want ? 'right' : 'wrong';
            tally.final[t]++;
            finals.push(`${col(r, 'nguoi_ghi')}\t${col(r, 'file')}\t${kind}\t${c.db ?? '–'} dB\t${c.verdict ?? '–'}\t${t}`);
        }
    }
    const share = (t: { right: number; wrong: number; none: number }) => {
        const n = t.right + t.wrong + t.none;
        return `đúng ${t.right}/${t.right + t.wrong} lần có kết luận (${Math.round((100 * t.right) / Math.max(1, t.right + t.wrong))}%), không kết luận ${t.none}/${n} (${Math.round((100 * t.none) / Math.max(1, n))}%)`;
    };
    process.stdout.write(['ÂM CUỐI', ...finals, share(tally.final), '', 'TRỌNG ÂM', ...stress, share(tally.stress)].join('\n') + '\n');
});
