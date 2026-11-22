"""
Direction A: read the test sentences in the tester's voice with Chatterbox
(MIT, github.com/resemble-ai/chatterbox), a TTS that clones a voice from a
sample. Risk to check by ear and with the scorer: it may carry the tester's
accent into the "standard" clip.

    python chatterbox_tts.py --sentences sentences.json --sample giong.wav --out out_cb
"""
import argparse
import json
import time
from pathlib import Path

import soundfile as sf


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--sentences', required=True)
    ap.add_argument('--sample', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--exaggeration', type=float, default=0.4)
    a = ap.parse_args()

    from chatterbox.tts import ChatterboxTTS  # type: ignore

    model = ChatterboxTTS.from_pretrained(device='cpu')
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for i, text in enumerate(json.load(open(a.sentences))):
        t = time.time()
        wav = model.generate(text, audio_prompt_path=a.sample, exaggeration=a.exaggeration, cfg_weight=0.5)
        sf.write(out / f'{i:02d}.wav', wav.squeeze(0).cpu().numpy(), model.sr)
        print(f'{i:02d}: {time.time() - t:.1f}s')


if __name__ == '__main__':
    main()
