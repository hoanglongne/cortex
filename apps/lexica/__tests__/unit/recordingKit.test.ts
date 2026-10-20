import { describe, expect, it } from 'vitest';
import { KIT_WORDS } from '../../app/data/recordingKit';
import { crc32, fileName, manifestCsv, takesOf, testerCode, zip } from '../../app/lib/pronunciation/recordingKit';

const ARPABET = /^(AA|AE|AH|AO|AW|AY|EH|ER|EY|IH|IY|OW|OY|UH|UW)[012]$|^(B|CH|D|DH|F|G|HH|JH|K|L|M|N|NG|P|R|S|SH|T|TH|V|W|Y|Z|ZH)$/;

describe('recording kit', () => {
    it('has 20 words with valid phones and wrong-take positions', () => {
        expect(KIT_WORDS).toHaveLength(20);
        for (const w of KIT_WORDS) {
            for (const p of w.phones) expect(p).toMatch(ARPABET);
            for (const i of w.wrong.wrongAt) expect(i).toBeLessThan(w.phones.length);
            if (w.group !== 'stress') expect(w.wrong.wrongAt.length).toBeGreaterThan(0);
        }
    });

    it('reads each word right, then wrong, with stable file names', () => {
        const takes = takesOf(KIT_WORDS);
        expect(takes).toHaveLength(40);
        expect(takes.slice(0, 2).map(fileName)).toEqual(['01-light-dung.wav', '02-light-sai.wav']);
        expect(fileName(takes[39])).toBe('40-develop-sai.wav');
    });

    it('keeps tester codes safe for file names', () => {
        expect(testerCode('Nguyễn Thị Đào')).toBe('nguyenthidao');
        expect(testerCode('  ')).toBe('nguoighi');
    });

    it('writes the answer key', () => {
        const takes = takesOf(KIT_WORDS).slice(0, 2);
        const csv = manifestCsv(takes, { tester: 'lan', device: 'dien-thoai', headset: false, date: '2026-10-20' }).trim().split('\n');
        expect(csv[0]).toBe('file,tu,luot,am_mau,nhom_loi,doc_thanh,loi_o_am,nguoi_ghi,thiet_bi,tai_nghe,ngay');
        expect(csv[1]).toBe('01-light-dung.wav,light,dung,L AY1 T,final_consonant,light,,lan,dien-thoai,khong,2026-10-20');
        expect(csv[2]).toBe('02-light-sai.wav,light,sai,L AY1 T,final_consonant,lie,2,lan,dien-thoai,khong,2026-10-20');
    });

    it('builds a zip any tool can read', () => {
        expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
        const a = new Uint8Array([1, 2, 3]);
        const out = zip([{ name: 'a.bin', data: a }, { name: 'tên.csv', data: new TextEncoder().encode('x') }]);
        const v = new DataView(out.buffer);
        expect(v.getUint32(0, true)).toBe(0x04034b50);
        expect([...out.slice(30 + 5, 30 + 5 + 3)]).toEqual([1, 2, 3]);
        const end = out.length - 22;
        expect(v.getUint32(end, true)).toBe(0x06054b50);
        expect(v.getUint16(end + 10, true)).toBe(2);
        const dirAt = v.getUint32(end + 16, true);
        expect(v.getUint32(dirAt, true)).toBe(0x02014b50);
    });
});
