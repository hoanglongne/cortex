"""
"Giọng bạn" V0 (issue #145): convert the app's model-voice clips into one
learner's voice with kNN-VC (MIT, github.com/bshall/knn-vc).

    python knnvc_convert.py --repo <knn-vc checkout> --ckpt <dir with WavLM-Large.pt,
        prematch_g_02500000.pt> --sample <learner.wav> --refs <dir of model clips> --out <dir>

Runs on CPU. Prints seconds per clip so the cost can be estimated.
"""
import argparse
import sys
import time
from pathlib import Path

import soundfile as sf
import torch
import torchaudio


def _load(path, normalize=True, **_):
    data, sr = sf.read(str(path), dtype='float32', always_2d=True)
    return torch.from_numpy(data.T.copy()), sr


def _save(path, wav, sr, **_):
    sf.write(str(path), wav.squeeze(0).cpu().numpy(), sr)


# torchaudio 2.9+ reads and writes through torchcodec; soundfile is enough here.
torchaudio.load = _load
torchaudio.save = _save


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo', required=True)
    ap.add_argument('--ckpt', required=True)
    ap.add_argument('--sample', required=True, nargs='+')
    ap.add_argument('--refs', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--topk', type=int, default=4)
    a = ap.parse_args()

    sys.path.insert(0, a.repo)
    from hifigan.models import Generator  # type: ignore
    from hifigan.utils import AttrDict  # type: ignore
    from matcher import KNeighborsVC  # type: ignore
    from wavlm.WavLM import WavLM, WavLMConfig  # type: ignore
    import json

    ckpt = Path(a.ckpt)
    device = 'cpu'
    cp = torch.load(ckpt / 'WavLM-Large.pt', map_location=device)
    wavlm = WavLM(WavLMConfig(cp['cfg']))
    wavlm.load_state_dict(cp['model'])
    wavlm.eval()
    with open(Path(a.repo) / 'hifigan' / 'config_v1_wavlm.json') as f:
        h = AttrDict(json.load(f))
    hifigan = Generator(h)
    hifigan.load_state_dict(torch.load(ckpt / 'prematch_g_02500000.pt', map_location=device)['generator'])
    hifigan.eval()
    hifigan.remove_weight_norm()
    knn = KNeighborsVC(wavlm, hifigan, h, device)

    t0 = time.time()
    matching = knn.get_matching_set([str(p) for p in a.sample])
    print(f'matching set: {matching.shape[0]} frames in {time.time() - t0:.1f}s')

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for ref in sorted(Path(a.refs).glob('*.wav')):
        t = time.time()
        query = knn.get_features(str(ref))
        wav = knn.match(query, matching, topk=a.topk)
        torchaudio.save(str(out / ref.name), wav[None], 16000)
        print(f'{ref.name}: {time.time() - t:.1f}s')


if __name__ == '__main__':
    main()
