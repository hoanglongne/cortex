"""
"Giọng bạn" V0 (issue #145): convert the app's model-voice clips into one
learner's voice with the OpenVoice v2 tone colour converter (MIT,
github.com/myshell-ai/OpenVoice, weights huggingface.co/myshell-ai/OpenVoiceV2).

    python openvoice_convert.py --repo <OpenVoice checkout> --ckpt <converter dir with
        config.json, checkpoint.pth> --sample <learner.wav> --refs <dir of model clips> --out <dir>

Only the converter is used (no TTS), so the text front end is stubbed out.
No watermark: these clips stay on the tester's machine.
"""
import argparse
import sys
import time
import types
from pathlib import Path


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo', required=True)
    ap.add_argument('--ckpt', required=True)
    ap.add_argument('--sample', required=True, nargs='+')
    ap.add_argument('--refs', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--tau', type=float, default=0.3)
    a = ap.parse_args()

    sys.path.insert(0, a.repo)
    # The converter never turns text into phonemes; skip the Chinese/English text stack.
    stub = types.ModuleType('openvoice.text')
    stub.text_to_sequence = lambda *args, **kwargs: []  # type: ignore[attr-defined]
    sys.modules['openvoice.text'] = stub
    from openvoice import api  # type: ignore
    from openvoice.api import ToneColorConverter  # type: ignore

    # Upstream passes enable_watermark on to the base class, which does not take it.
    base_init = api.OpenVoiceBaseClass.__init__
    api.OpenVoiceBaseClass.__init__ = lambda self, config_path, device='cpu', **_: base_init(self, config_path, device)

    ckpt = Path(a.ckpt)
    conv = ToneColorConverter(str(ckpt / 'config.json'), device='cpu', enable_watermark=False)
    conv.load_ckpt(str(ckpt / 'checkpoint.pth'))

    t0 = time.time()
    target = conv.extract_se([str(p) for p in a.sample])
    refs = sorted(Path(a.refs).glob('*.wav'))
    # The model voice's own tone colour, from all the reference clips together.
    source = conv.extract_se([str(p) for p in refs])
    print(f'tone colours in {time.time() - t0:.1f}s')

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for ref in refs:
        t = time.time()
        conv.convert(audio_src_path=str(ref), src_se=source, tgt_se=target, output_path=str(out / ref.name), tau=a.tau)
        print(f'{ref.name}: {time.time() - t:.1f}s')


if __name__ == '__main__':
    main()
