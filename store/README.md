# Store images

Play Store listing images, made from the real app by `make_listing.py`.

| File | Size | Use |
|---|---|---|
| `1-main.png` … `6-weight.png` | 1080 × 1920 | phone screenshots, in this order |
| `feature-graphic.png` | 1024 × 500 | feature graphic |
| `icon.png` | 512 × 512 | app icon (made by `make_icons.py`) |

Each image has a `-dark` twin made with `--theme dark`.

## App icon

`make_icons.py` draws the icon in code — a loaded dumbbell seen from the side, plates growing towards the middle, white on the accent blue — and writes every size from that one drawing:

| Where | What |
|---|---|
| `android/app/src/main/res/` | launcher, themed (monochrome), notification and splash icons, five densities each |
| `store/icon.png` | the Play Store icon, 512 × 512 |
| `icons/` | the web version's browser tab and home-screen icons (`index.html` and `manifest.json` point at them) |

```sh
python3 store/make_icons.py
```

All of these are generated: change `RECTS` in the script and run it again, never edit an icon by hand. The mark is scaled about the centre to suit where it is shown — `MASK_SCALE` wherever the system crops it to its own shape (launcher, notification, the maskable web icon), `WEB_SCALE` where the icon keeps its own rounded square (browser tab, home screen).

## Regenerate

After any interface change:

```sh
pip install playwright && playwright install chromium
python3 store/make_listing.py        
python3 store/make_listing.py --theme dark
```

The script serves the repository locally, opens the app with example data on a fixed date (Sunday 22 Nov 2026), takes six screenshots and frames them. It makes no requests to other servers. Playwright is only needed here; the app itself still has no dependencies.

## Change them

Everything is in `make_listing.py`:

- **Headlines and order:** `BOARDS`
- **Line under the first headline:** `DIFF`
- **Colours:** `THEMES` (copied from `css/styles.css`; keep them in step)
- **Which screen and its state:** `capture()`
- **Example data:** `example_data()`
- **Layout:** `store_board()` and `feature_board()`
