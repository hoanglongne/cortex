"""Spike: on-device candidates for phone-level mispronunciation detection, scored on
speechocean762 test. For every canonical phone: a GOP score from CTC forced alignment
(higher = better pronounced), and for free recognisers, whether greedy decoding
substituted/deleted it. Label: human phone accuracy < 1 means wrong."""
import io, json, sys, time, re, random
import numpy as np, pandas as pd, soundfile as sf, librosa, torch
import torchaudio.functional as F
from sklearn.metrics import roc_auc_score, average_precision_score, f1_score

N = int(sys.argv[2]) if len(sys.argv) > 2 else 400
WHICH = sys.argv[1]
torch.set_num_threads(4)

d = pd.read_parquet('test.parquet')
import os
idx = list(range(len(d))); random.Random(7).shuffle(idx)
if os.environ.get('SHORT'):
    idx = [i for i in idx if sf.info(io.BytesIO(d.iloc[i]['audio']['bytes'])).duration <= 4.8]
idx = idx[:N]

def audio(r):
    a, sr = sf.read(io.BytesIO(r['audio']['bytes']), dtype='float32')
    if a.ndim > 1: a = a.mean(1)
    return librosa.resample(a, orig_sr=sr, target_sr=16000) if sr != 16000 else a

strip = lambda p: re.sub(r'\d', '', p)

# ARPAbet 39 -> IPA tokens for IPA-vocab models (first that exists in the vocab wins)
A2I = {'AA': ['ɑ', 'ɑː', 'a'], 'AE': ['æ'], 'AH': ['ʌ', 'ə', 'ɐ'], 'AO': ['ɔ', 'ɔː', 'ɑ'], 'AW': ['aʊ'], 'AY': ['aɪ'], 'B': ['b'], 'CH': ['ʧ', 'tʃ'],
       'D': ['d'], 'DH': ['ð'], 'EH': ['ɛ', 'e'], 'ER': ['ɝ', 'ɚ', 'ɜː'], 'EY': ['eɪ', 'e'], 'F': ['f'], 'G': ['g', 'ɡ'], 'HH': ['h'], 'IH': ['ɪ'],
       'IY': ['i', 'iː'], 'JH': ['ʤ', 'dʒ'], 'K': ['k'], 'L': ['l'], 'M': ['m'], 'N': ['n'], 'NG': ['ŋ'], 'OW': ['oʊ', 'o'], 'OY': ['ɔɪ'], 'P': ['p'],
       'R': ['ɹ', 'r'], 'S': ['s'], 'SH': ['ʃ'], 'T': ['t'], 'TH': ['θ'], 'UH': ['ʊ'], 'UW': ['u', 'uː'], 'V': ['v'], 'W': ['w'], 'Y': ['j'], 'Z': ['z'], 'ZH': ['ʒ']}

def ctc_runner(name, kind='w2v'):
    from transformers import AutoModelForCTC, AutoFeatureExtractor
    import json as js
    from huggingface_hub import hf_hub_download
    m = AutoModelForCTC.from_pretrained(name).eval()
    fe = AutoFeatureExtractor.from_pretrained(name)
    vocab = js.load(open(hf_hub_download(name, 'vocab.json')))
    if isinstance(next(iter(vocab.values())), dict): vocab = next(iter(vocab.values()))
    inv = {v: k for k, v in vocab.items()}
    blank = vocab.get('[PAD]', vocab.get('<pad>', 0))
    skip = {k for k in vocab if k in ('ˈ', '|', ' ', '[UNK]', '<unk>', '[PAD]', '<pad>', '<s>', '</s>', 'ˌ', '͡')}
    def tok(arpa):
        if arpa in vocab: return vocab[arpa]
        for c in A2I[arpa]:
            if c in vocab: return vocab[c]
        return None
    # recognised IPA token -> ARPA (for the free-recognition check)
    back = {}
    for a, cs in A2I.items():
        for c in cs: back.setdefault(c, a)
    def run(wav, canon):
        x = fe(wav, sampling_rate=16000, return_tensors='pt').input_values
        with torch.no_grad(): lp = torch.log_softmax(m(x).logits, -1)[0]
        ids = [tok(p) for p in canon]
        return lp, ids, blank, lambda t: (t if t in A2I else back.get(t)) if t not in skip else None, inv
    return run

def whisper_runner():
    sys.path.insert(0, 'whisper-phoneme')
    from modeling_whisper_phoneme import load
    import whisper
    m = load('whisper-phoneme', 'cpu')
    CTX = {'whisper10': 10, 'whisper5': 5}.get(WHICH)
    if CTX:
        # shorter context: cut the positional table and pad to CTX s instead of 30 s
        import modeling_whisper_phoneme as mw
        pe = m.encoder.positional_embedding
        m.encoder.register_buffer('positional_embedding', pe[:CTX * 50].clone(), persistent=False)
        m.max_frames = CTX * 50
        mw.whisper.pad_or_trim = (lambda f: (lambda a, length=CTX * 16000, **k: f(a, length=CTX * 16000, **k)))(whisper.pad_or_trim)
    def run(wav, canon_stress):
        # uses its own stress-marked vocab; we only need features + regressor
        if WHICH == 'whisper5-onnx':
            import onnxruntime as ort, modeling_whisper_phoneme as mw
            global SESS
            if 'SESS' not in globals():
                o = ort.SessionOptions(); o.intra_op_num_threads = 4
                SESS = ort.InferenceSession('onnx/whisper5_int8.onnx', o)
            a = torch.as_tensor(wav, dtype=torch.float32)
            mel = whisper.log_mel_spectrogram(whisper.pad_or_trim(a, 80000), n_mels=m.n_mels)
            lp = torch.from_numpy(SESS.run(None, {'mel': mel.unsqueeze(0).numpy()})[0])
            ids = [m.phone_to_id[p] for p in canon_stress]
            frames = min(mw.valid_frames_for(len(a) / 16000, len(ids), 250), lp.shape[1])
            lp = lp[:, :frames]
            tokens, fs = F.forced_align(lp, torch.tensor([ids], dtype=torch.int32), torch.tensor([frames], dtype=torch.int32), torch.tensor([len(ids)], dtype=torch.int32), blank=m.blank_id)
            rows = []
            for sp in F.merge_tokens(tokens[0], fs[0], blank=m.blank_id):
                seg = lp[0, sp.start:sp.end]; comp = seg.clone(); comp[:, [m.blank_id, sp.token]] = float('-inf')
                bc = comp.max(-1).values; tg = seg[:, sp.token]
                rows.append({'phone_id': sp.token, 'gop': float((tg - bc).mean()), 'logp_target': float(tg.mean()), 'logp_competitor': float(bc.mean()), 'logp_target_min': float(tg.min()), 'n_frames': sp.end - sp.start})
            sc = m.regressor.predict(mw.features_to_matrix(rows, m.output_dim))
            return [{'score': float(x)} for x in sc]
        if WHICH == 'whisper-raw':
            a = torch.as_tensor(wav, dtype=torch.float32)
            mel = whisper.log_mel_spectrogram(whisper.pad_or_trim(a), n_mels=m.n_mels)
            rows = m.forced_align_and_gop(mel.unsqueeze(0), [m.phone_to_id[p] for p in canon_stress], len(a) / 16000)
            return [{'score': r['gop']} for r in rows]
        res = m.score_utterance(wav, canon_stress)
        return res
    return run, m

def gop(lp, ids, blank):
    T = lp.shape[0]
    if any(i is None for i in ids) or len(ids) >= T: return None
    tokens, scores = F.forced_align(lp.unsqueeze(0).float(), torch.tensor([ids], dtype=torch.int32), torch.tensor([T], dtype=torch.int32), torch.tensor([len(ids)], dtype=torch.int32), blank=blank)
    spans = F.merge_tokens(tokens[0], scores[0], blank=blank)
    if len(spans) != len(ids): return None
    out = []
    for s in spans:
        seg = lp[s.start:s.end].clone()
        tgt = seg[:, s.token].clone()
        seg[:, [blank, s.token]] = float('-inf')
        v = float(torch.nan_to_num(tgt - seg.max(-1).values, posinf=30.0, neginf=-30.0).clamp(-30, 30).mean())
        out.append(v)
    return out

def greedy_wrong(lp, blank, tomap, inv, canon):
    ids = lp.argmax(-1).tolist()
    seq, prev = [], None
    for i in ids:
        if i != prev and i != blank:
            a = tomap(inv[i])
            if a: seq.append(a)
        prev = i
    # Levenshtein alignment canon vs seq; canonical phone wrong if not matched
    n, k = len(canon), len(seq)
    D = np.zeros((n + 1, k + 1)); D[:, 0] = range(n + 1); D[0, :] = range(k + 1)
    for i in range(1, n + 1):
        for j in range(1, k + 1):
            D[i, j] = min(D[i-1, j] + 1, D[i, j-1] + 1, D[i-1, j-1] + (canon[i-1] != seq[j-1]))
    wrong = [1] * n; i, j = n, k
    while i > 0 and j > 0:
        if D[i, j] == D[i-1, j-1] + (canon[i-1] != seq[j-1]):
            wrong[i-1] = int(canon[i-1] != seq[j-1]); i -= 1; j -= 1
        elif D[i, j] == D[i-1, j] + 1: i -= 1
        else: j -= 1
    return wrong, seq

hum, y, score, pred, finals_y, finals_s, secs, aud = [], [], [], [], [], [], 0.0, 0.0
skipped = 0
if WHICH.startswith('whisper'):
    run, _ = whisper_runner()
else:
    run = ctc_runner(WHICH)
for n, i in enumerate(idx):
    r = d.iloc[i]
    phones = [(p, s, k == len(w['phones']) - 1) for w in r['words'] for k, (p, s) in enumerate(zip(w['phones'], w['phones-accuracy']))]
    if not phones: continue
    wav = audio(r); aud += len(wav) / 16000
    t0 = time.time()
    try:
        if WHICH.startswith('whisper'):
            res = run(wav, [p for p, _, _ in phones]); g = [x['score'] for x in res]; wr = None
        else:
            canon = [strip(p) for p, _, _ in phones]
            lp, ids, blank, tomap, inv = run(wav, canon)
            g = gop(lp, ids, blank)
            wr, _ = greedy_wrong(lp, blank, tomap, inv, canon)
            if g is None: raise ValueError('align')
    except Exception as e:
        skipped += 1; continue
    secs += time.time() - t0
    for (p, s, last), gs, k in zip(phones, g, range(len(g))):
        lab = int(s < 1); hum.append(float(s))
        y.append(lab); score.append(-gs)
        if wr is not None: pred.append(wr[k])
        cons = strip(p) not in ('AA','AE','AH','AO','AW','AY','EH','ER','EY','IH','IY','OW','OY','UH','UW')
        if last and cons: finals_y.append(lab); finals_s.append(-gs)
y = np.array(y); score = np.array(score)
np.savez(f"scores_{WHICH}.npz", y=y, score=score, hum=np.array(hum))
out = {'model': WHICH + (' (<=4.8s)' if os.environ.get('SHORT') else ''), 'utts': N - skipped, 'skipped': skipped, 'phones': int(len(y)), 'wrong_rate': round(float(y.mean()), 3),
       'gop_auc': round(roc_auc_score(y, score), 3), 'gop_ap': round(average_precision_score(y, score), 3),
       'final_cons_auc': round(roc_auc_score(finals_y, finals_s), 3),
       'cpu_rtf_4threads': round(secs / aud, 3), 'pcc': round(float(np.corrcoef(-score, hum)[0, 1]), 3), 'any_issue_auc': round(roc_auc_score((np.array(hum) < 2).astype(int), score), 3)}
if pred:
    out['greedy_f1'] = round(f1_score(y, pred), 3)
    tp = int(((np.array(pred) == 1) & (y == 1)).sum()); out['greedy_precision'] = round(tp / max(1, sum(pred)), 3); out['greedy_recall'] = round(tp / max(1, y.sum()), 3)
# best-F1 over thresholds for the GOP score
ths = np.quantile(score, np.linspace(0.5, 0.99, 50)); out['gop_best_f1'] = round(max(f1_score(y, score >= t) for t in ths), 3)
print(json.dumps(out, ensure_ascii=False))
open('results.jsonl', 'a').write(json.dumps(out, ensure_ascii=False) + '\n')
