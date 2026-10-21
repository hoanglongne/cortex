"""The on-device scoring pack (docs/LEXICA_PRONUNCIATION_DESIGN.md, 5.2) and the
fixtures the app's unit tests compare against.

    python build.py <whisper-phoneme folder> <whisper5_int8.onnx> <out folder> [utterance.wav PHONES...]

Writes to <out folder>:
  pron-model-v1.onnx   the int8 model, 5 s context (from export.py in ../pronunciation-spike)
  pron-gbm-v1.json     the GOP regressor as plain trees, for lib/pronunciation/model/gbm.ts
  pack.json            file names, sizes and sha256, to paste into lib/pronunciation/model/pack.ts
and, with an utterance, ../../__tests__/unit/fixtures/pron-*.json for the tests.
"""
import hashlib, json, shutil, sys
from pathlib import Path
import numpy as np

src, onnx_file, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(src))
import joblib  # noqa: E402

FEATURES = ['gop', 'logp_target', 'logp_competitor', 'logp_target_min', 'n_frames']
reg = joblib.load(src / 'gop_regressor.joblib')
trees = []
for (pred,) in reg._predictors:
    nodes = []
    for n in pred.nodes:
        if n['is_leaf']:
            nodes.append([-1, round(float(n['value']), 6)])
        else:
            nodes.append([int(n['feature_idx']), round(float(n['num_threshold']), 6), int(n['left']), int(n['right']), int(n['missing_go_to_left'])])
    trees.append(nodes)
gbm = {'baseline': float(np.ravel(reg._baseline_prediction)[0]), 'features': FEATURES, 'classes': 87, 'trees': trees}
(out / 'pron-gbm-v1.json').write_text(json.dumps(gbm, separators=(',', ':')))
shutil.copyfile(onnx_file, out / 'pron-model-v1.onnx')

def info(p):
    b = p.read_bytes()
    return {'file': p.name, 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}
pack = {'version': 'v1', 'model': info(out / 'pron-model-v1.onnx'), 'regressor': info(out / 'pron-gbm-v1.json')}
(out / 'pack.json').write_text(json.dumps(pack, indent=2))
print(json.dumps(pack, indent=2))

fixtures = Path(__file__).resolve().parents[2] / '__tests__' / 'unit' / 'fixtures'

# The regressor on 100 feature rows: the JS trees must give the same scores.
rng = np.random.default_rng(3)
rows = np.zeros((100, 5 + 87), dtype=np.float32)
rows[:, 0] = rng.normal(-2, 4, 100); rows[:, 1] = rng.normal(-3, 3, 100); rows[:, 2] = rng.normal(-6, 3, 100)
rows[:, 3] = rows[:, 1] - np.abs(rng.normal(2, 2, 100)); rows[:, 4] = rng.integers(1, 20, 100)
rows[np.arange(100), 5 + rng.integers(2, 87, 100)] = 1
(fixtures / 'pron-gbm.json').write_text(json.dumps({'rows': rows.round(4).tolist(), 'scores': reg.predict(rows.round(4)).round(6).tolist()}))

if len(sys.argv) > 5:
    import soundfile as sf, torch, whisper, onnxruntime as ort, torchaudio
    import modeling_whisper_phoneme as mw
    m = mw.load(str(src), 'cpu')
    wav_file, phones = sys.argv[4], sys.argv[5:]
    a, sr = sf.read(wav_file, dtype='float32')
    assert sr == 16000
    audio = torch.as_tensor(a)
    mel = whisper.log_mel_spectrogram(whisper.pad_or_trim(audio, 80000), n_mels=80)
    sess = ort.InferenceSession(str(onnx_file))
    lp = torch.from_numpy(sess.run(None, {'mel': mel.unsqueeze(0).numpy()})[0])
    ids = [m.phone_to_id[p] for p in phones]
    frames = min(mw.valid_frames_for(len(a) / 16000, len(ids), 250), lp.shape[1])
    lp = lp[:, :frames]
    tokens, fs = torchaudio.functional.forced_align(lp, torch.tensor([ids], dtype=torch.int32), torch.tensor([frames], dtype=torch.int32), torch.tensor([len(ids)], dtype=torch.int32), blank=0)
    spans = torchaudio.functional.merge_tokens(tokens[0], fs[0], blank=0)
    feats = []
    for sp in spans:
        seg = lp[0, sp.start:sp.end]; comp = seg.clone(); comp[:, [0, sp.token]] = float('-inf')
        bc = comp.max(-1).values; tg = seg[:, sp.token]
        feats.append({'phone_id': sp.token, 'start': sp.start, 'end': sp.end, 'gop': float((tg - bc).mean()), 'logp_target': float(tg.mean()), 'logp_competitor': float(bc.mean()), 'logp_target_min': float(tg.min()), 'n_frames': sp.end - sp.start})
    scores = m.regressor.predict(mw.features_to_matrix(feats, 87))
    flat = mel.numpy().ravel()
    pick = list(range(0, flat.size, 97))
    (fixtures / 'pron-utterance.json').write_text(json.dumps({
        'phones': phones, 'samples': len(a), 'frames': frames,
        'mel': {'every': 97, 'values': flat[pick].round(5).tolist(), 'max': float(flat.max()), 'mean': float(flat.mean())},
        'logp': lp[0].numpy().round(4).tolist(),
        'spans': [[f['start'], f['end']] for f in feats],
        'features': [[round(f[k], 5) for k in FEATURES] for f in feats],
        'scores': scores.round(5).tolist(),
    }))
    shutil.copyfile(wav_file, fixtures / 'pron-utterance.wav')
