"""Scores the zips from the recording kit (Lexica /ghi-am) with the on-device model
and prints whether it is good enough on Vietnamese voices.

    python evalvi.py lexica-ghiam-lan-2026-10-20.zip [more.zip ...] [--threshold 0.6]

Input: each zip holds manifest.csv (the answer key) and one WAV per take.
Output: a table per tester and in total, and ketqua.csv with one row per take.

For each take the model scores every phone of the word (0-2, as in
speechocean762). A phone is "flagged" when its score is below the threshold.
- right take ("dung"): any flagged phone is a false alarm;
- wrong take ("sai"): caught when one of the changed phones (loi_o_am) is flagged.
Stress words wait for level 3 and are skipped here.
Pass (docs/LEXICA_PRONUNCIATION_DESIGN.md, section 8): caught >= 60% and false alarms <= 20%.
"""
import argparse, csv, io, sys, zipfile
from collections import defaultdict
import numpy as np, soundfile as sf, torch

sys.path.insert(0, 'whisper-phoneme')
from modeling_whisper_phoneme import load  # noqa: E402
import whisper  # noqa: E402
import modeling_whisper_phoneme as mw  # noqa: E402

CTX_S = 5
VOWELS = {'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'}


def model_phones(phones):
    """Same rule as the app (lib/pronunciation/phones.ts, modelPhones): the model learned
    speechocean762's stress marks, where a one-syllable word's vowel is 0, while CMUdict
    writes 1. Feeding 1 there drops accuracy sharply."""
    vowels = [p for p in phones if p.rstrip('012') in VOWELS]
    if len(vowels) != 1:
        return phones
    return [p.rstrip('012') + '0' if p.rstrip('012') in VOWELS else p for p in phones]


def model_5s():
    m = load('whisper-phoneme', 'cpu')
    pe = m.encoder.positional_embedding
    m.encoder.register_buffer('positional_embedding', pe[: CTX_S * 50].clone(), persistent=False)
    m.max_frames = CTX_S * 50
    mw.whisper.pad_or_trim = (lambda f: (lambda a, length=CTX_S * 16000, **k: f(a, length=CTX_S * 16000, **k)))(whisper.pad_or_trim)
    return m


def trim(a, sr=16000, frame=320, floor=3.0):
    """Cut silence at both ends: frames quieter than `floor` x the quietest tenth."""
    if len(a) < frame * 4:
        return a
    rms = np.sqrt(np.convolve(a ** 2, np.ones(frame) / frame, mode='same'))
    loud = np.where(rms > max(np.quantile(rms, 0.1) * floor, 0.005))[0]
    if len(loud) == 0:
        return a
    pad = int(0.1 * sr)
    return a[max(0, loud[0] - pad): loud[-1] + pad]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('zips', nargs='+')
    ap.add_argument('--threshold', type=float, default=0.6)
    args = ap.parse_args()
    m = model_5s()
    rows, stats = [], defaultdict(lambda: {'dung': 0, 'oan': 0, 'sai': 0, 'bat': 0})
    for path in args.zips:
        z = zipfile.ZipFile(path)
        for r in csv.DictReader(io.TextIOWrapper(z.open('manifest.csv'), 'utf-8')):
            if r['nhom_loi'] == 'stress':
                continue
            a, sr = sf.read(io.BytesIO(z.read(r['file'])), dtype='float32')
            if a.ndim > 1:
                a = a.mean(1)
            a = trim(a)[: CTX_S * 16000]
            phones = model_phones(r['am_mau'].split())
            try:
                scores = [p['score'] for p in m.score_utterance(a, phones)]
            except ValueError as e:
                print(f"  bỏ qua {r['file']}: {e}")
                continue
            flagged = [i for i, s in enumerate(scores) if s < args.threshold]
            st = stats[r['nguoi_ghi']]
            if r['luot'] == 'dung':
                st['dung'] += 1
                st['oan'] += bool(flagged)
                ok = not flagged
            else:
                want = {int(i) for i in r['loi_o_am'].split()}
                st['sai'] += 1
                st['bat'] += bool(want & set(flagged))
                ok = bool(want & set(flagged))
            rows.append({**{k: r[k] for k in ('nguoi_ghi', 'file', 'tu', 'luot', 'nhom_loi', 'loi_o_am')},
                         'diem_tung_am': ' '.join(f'{p}:{s:.2f}' for p, s in zip(phones, scores)),
                         'am_bi_bao': ' '.join(str(i) for i in flagged), 'dat': 'co' if ok else 'khong'})
    with open('ketqua.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ['file'])
        w.writeheader()
        w.writerows(rows)
    total = {k: sum(s[k] for s in stats.values()) for k in ('dung', 'oan', 'sai', 'bat')}
    print(f"\nNgưỡng {args.threshold}. Một dòng mỗi người ghi, dòng cuối là tổng.")
    print(f"{'người ghi':<14}{'bắt đúng lỗi':>16}{'báo oan':>14}")
    for name, s in list(stats.items()) + [('TỔNG', total)]:
        caught = s['bat'] / max(1, s['sai'])
        false = s['oan'] / max(1, s['dung'])
        print(f"{name:<14}{s['bat']:>5}/{s['sai']:<3} {caught:>5.0%}{s['oan']:>6}/{s['dung']:<3} {false:>4.0%}")
    caught = total['bat'] / max(1, total['sai'])
    false = total['oan'] / max(1, total['dung'])
    verdict = 'ĐẠT' if caught >= 0.6 and false <= 0.2 else 'CHƯA ĐẠT'
    print(f"\nKết luận: {verdict} (cần bắt đúng ≥ 60% và báo oan ≤ 20%). Chi tiết từng lượt: ketqua.csv")


if __name__ == '__main__':
    main()
