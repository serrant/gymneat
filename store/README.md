# Store images

Play Store listing images, made from the real app by `make.py`.

| File | Size | Use |
|---|---|---|
| `1-main.png` … `6-weight.png` | 1080 × 1920 | phone screenshots, in this order |
| `feature-graphic.png` | 1024 × 500 | feature graphic |
| `icon.png` | 512 × 512 | app icon (made by `make_icons.py`) |

Each image has a `-dark` twin made with `--theme dark`.

## App icon

`make_icons.py` draws the icon in code (a dumbbell with a tick above the bar, white on the accent blue) and writes every size Android needs into `android/app/src/main/res/`: launcher, themed (monochrome), notification and splash icons. It also writes `icon.png` for the Play Store.

```sh
python3 store/make_icons.py
```

## Regenerate

After any interface change:

```sh
pip install playwright && playwright install chromium
python3 store/make.py        
python3 store/make.py --theme dark
```

The script serves the repository locally, opens the app with example data on a fixed date (Sunday 22 Nov 2026), takes six screenshots and frames them. It makes no requests to other servers. Playwright is only needed here; the app itself still has no dependencies.

## Change them

Everything is in `make.py`:

- **Headlines and order:** `BOARDS`
- **Line under the first headline:** `DIFF`
- **Colours:** `THEMES` (copied from `css/styles.css`; keep them in step)
- **Which screen and its state:** `capture()`
- **Example data:** `example_data()`
- **Layout:** `store_board()` and `feature_board()`
