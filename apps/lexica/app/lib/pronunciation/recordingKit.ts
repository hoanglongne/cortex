/**
 * The recording kit (docs/LEXICA_PRONUNCIATION_RECORDING.md): the list of
 * takes, file names, the manifest and the zip a tester sends back. Pure,
 * unit tested; the page is app/ghi-am.
 */
import type { KitWord } from '../../data/recordingKit';

export type TakeKind = 'dung' | 'sai';

export interface Take {
    /** 1-based, in reading order. */
    n: number;
    word: KitWord;
    kind: TakeKind;
}

/** Each word right, then wrong on purpose. */
export function takesOf(words: readonly KitWord[]): Take[] {
    return words.flatMap((word, i) => (['dung', 'sai'] as const).map((kind, k) => ({ n: i * 2 + k + 1, word, kind })));
}

export const fileName = (t: Take) => `${String(t.n).padStart(2, '0')}-${t.word.word}-${t.kind}.wav`;

/** Short code for the tester: letters and digits only, so file names stay safe. */
export const testerCode = (name: string) =>
    name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/gi, 'd')
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase()
        .slice(0, 20) || 'nguoighi';

export interface Meta {
    tester: string;
    device: string;
    headset: boolean;
    date: string;
}

const csvCell = (v: string | number | boolean) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * manifest.csv: one row per recorded take; the answer key the scoring
 * script reads. `loi_o_am` lists the phone indexes the wrong take changes.
 */
export function manifestCsv(takes: readonly Take[], meta: Meta): string {
    const head = ['file', 'tu', 'luot', 'am_mau', 'nhom_loi', 'doc_thanh', 'loi_o_am', 'nguoi_ghi', 'thiet_bi', 'tai_nghe', 'ngay'];
    const rows = takes.map((t) => [
        fileName(t),
        t.word.word,
        t.kind,
        t.word.phones.join(' '),
        t.word.group,
        t.kind === 'sai' ? t.word.wrong.say : t.word.word,
        t.kind === 'sai' ? t.word.wrong.wrongAt.join(' ') : '',
        meta.tester,
        meta.device,
        meta.headset ? 'co' : 'khong',
        meta.date,
    ]);
    return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}

// ----------------------------------------------------------------- zip

const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

export function crc32(data: Uint8Array): number {
    let c = 0xffffffff;
    for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

/** A zip without compression (WAV barely compresses): enough for any unzip tool, no dependency. */
export function zip(files: readonly { name: string; data: Uint8Array }[]): Uint8Array {
    const enc = new TextEncoder();
    const parts: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;
    for (const f of files) {
        const name = enc.encode(f.name);
        const crc = crc32(f.data);
        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, 0x04034b50, true);
        local.setUint16(4, 20, true);
        local.setUint16(6, 0x0800, true); // UTF-8 names
        local.setUint32(14, crc, true);
        local.setUint32(18, f.data.length, true);
        local.setUint32(22, f.data.length, true);
        local.setUint16(26, name.length, true);
        parts.push(new Uint8Array(local.buffer), name, f.data);

        const dir = new DataView(new ArrayBuffer(46));
        dir.setUint32(0, 0x02014b50, true);
        dir.setUint16(4, 20, true);
        dir.setUint16(6, 20, true);
        dir.setUint16(8, 0x0800, true);
        dir.setUint32(16, crc, true);
        dir.setUint32(20, f.data.length, true);
        dir.setUint32(24, f.data.length, true);
        dir.setUint16(28, name.length, true);
        dir.setUint32(42, offset, true);
        central.push(new Uint8Array(dir.buffer), name);
        offset += 30 + name.length + f.data.length;
    }
    const dirSize = central.reduce((n, p) => n + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, dirSize, true);
    end.setUint32(16, offset, true);
    const all = [...parts, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
    let at = 0;
    for (const p of all) {
        out.set(p, at);
        at += p.length;
    }
    return out;
}
