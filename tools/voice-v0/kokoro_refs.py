"""
Make the model clips for the test sentences with Kokoro (Apache 2.0), the
engine the app pre-generates its clips with, in a chosen voice. Used to try a
source voice closer to the tester (e.g. a male voice for a male tester): voice
conversion keeps the source's rhythm and intonation, so a far source voice
(female → male) sounds less like the tester.

    python kokoro_refs.py --sentences sentences.json --voice am_michael --out ref_male
"""
import argparse
import json
from pathlib import Path

import numpy as np
import soundfile as sf


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--sentences', required=True)
    ap.add_argument('--voice', default='am_michael')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()

    from kokoro import KPipeline  # type: ignore

    pipe = KPipeline(lang_code='a' if a.voice.startswith('a') else 'b')
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for i, text in enumerate(json.load(open(a.sentences))):
        audio = np.concatenate([np.asarray(r.audio) for r in pipe(text, voice=a.voice)])
        sf.write(out / f'{i:02d}.wav', audio, 24000)
        print(f'{i:02d} {len(audio) / 24000:.1f}s')


if __name__ == '__main__':
    main()
