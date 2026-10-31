"""Compare live and CLI PNGs; requires Pillow and NumPy in the test environment."""
import argparse
from pathlib import Path
import numpy as np
from PIL import Image
parser = argparse.ArgumentParser()
parser.add_argument('cases', type=Path)
args = parser.parse_args()
for case in sorted(path for path in args.cases.iterdir() if path.is_dir()):
    for frame in (60, 75, 90):
        live = np.asarray(Image.open(case / f'preview-{frame}.png').convert('RGBA'), dtype=np.int16)
        exported = np.asarray(Image.open(case / f'cli-{frame}' / f'frame-{frame:06}.png').convert('RGBA'), dtype=np.int16)
        if live.shape != exported.shape:
            raise AssertionError(f'{case.name} {frame}: dimensions differ')
        delta = np.abs(live - exported)
        print(f'{case.name} {frame}: max={delta.max()} mean={delta.mean():.6f} changed={np.any(delta,axis=2).sum()}')
        if delta.max() > 1:
            raise AssertionError(f'{case.name} {frame}: delta exceeds 1')
