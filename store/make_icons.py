"""Builds the app icon in every size Android, Google Play and the web version need, from one drawing in code.

    python3 store/make_icons.py

Needs Python 3 and Playwright, like make_listing.py:
    pip install playwright && playwright install chromium
    (set CHROME_PATH to use an installed Chrome instead)

The icon: a loaded dumbbell seen from the side, plates growing towards the middle, white on the app's accent blue.
Geometry is in the 108 x 108 grid of Android adaptive icons: the launcher shows the middle 72 x 72
(18..90) and masks it to a circle, squircle etc.; everything important stays inside the 66 dp safe circle.

Writes:
  android/app/src/main/res/mipmap-*/ic_launcher_foreground.png   adaptive foreground (also the themed/monochrome icon)
  android/app/src/main/res/mipmap-*/ic_launcher.png, _round.png  legacy icons (Android 7.x)
  android/app/src/main/res/drawable-*/ic_stat_gymneat.png        notification icon (white silhouette)
  android/app/src/main/res/drawable-*/splash_icon.png            splash screen icon (Android 11 and older)
  store/icon.png                                                 Play Store icon, 512 x 512
  icons/icon.svg, icon-*.png, apple-touch-icon.png               browser tab and home screen of the web version
                                                                 (index.html and manifest.json point at these)
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "android/app/src/main/res"
BLUE = "#1f45d1"  # --accent in css/styles.css; also @color/ic_launcher_background
DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}

# The mark, in the 108 grid, left to right: end cap, three plates of growing size, collar, bar.
# Drawn at its natural size it spans 23..85 across and 32..76 down, centred on (54, 54); the 2 dp
# gaps between the plates are part of the drawing. (x, y, width, height, corner radius)
RECTS = [(23.0, 51.5, 7.0, 5.0, 2.0), (28.0, 44.0, 8.0, 20.0, 2.4), (38.0, 39.0, 9.5, 30.0, 2.8),
         (49.5, 32.0, 11.5, 44.0, 3.2), (63.0, 47.5, 4.5, 13.0, 1.6), (66.0, 51.5, 19.0, 5.0, 2.5)]
# The mark is scaled about the centre to suit where it is shown. Anything the system crops (launcher
# shape, notification canvas, maskable web icon) uses MASK_SCALE: at 0.9 the mark spans 26.1..81.9,
# about 6 dp clear of the 66 dp safe circle, where the bare 1.0 size very nearly touches it. An icon
# that keeps its own rounded square (browser tab, home screen) uses the roomier WEB_SCALE.
MASK_SCALE = 0.9
WEB_SCALE = 1.25


def mark(color, scale=MASK_SCALE):
    rects = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/>' for x, y, w, h, r in RECTS)
    return f'<g fill="{color}" transform="translate(54 54) scale({scale}) translate(-54 -54)">{rects}</g>'


def svg(px, view, body):
    return (f'<!doctype html><style>html,body{{margin:0;background:transparent}}</style>'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{px}" height="{px}" viewBox="{view}">{body}</svg>')


VISIBLE = "18 18 72 72"
ICONS = {  # name: (size in dp, viewBox, drawing)
    "foreground": (108, "0 0 108 108", mark("#fff")),
    "legacy": (48, VISIBLE, f'<rect x="20" y="20" width="68" height="68" rx="15" fill="{BLUE}"/>{mark("#fff")}'),
    "round": (48, VISIBLE, f'<circle cx="54" cy="54" r="34" fill="{BLUE}"/>{mark("#fff")}'),
    "stat": (24, VISIBLE, mark("#fff")),
    "splash": (128, VISIBLE, f'<circle cx="54" cy="54" r="36" fill="{BLUE}"/>{mark("#fff")}'),
}
FILES = {"foreground": "mipmap-{d}/ic_launcher_foreground.png", "legacy": "mipmap-{d}/ic_launcher.png",
         "round": "mipmap-{d}/ic_launcher_round.png", "stat": "drawable-{d}/ic_stat_gymneat.png",
         "splash": "drawable-{d}/splash_icon.png"}

# The web version's icons, in icons/. The rounded square is the icon's own shape, so those keep their
# corners; the maskable one is filled to the edges because the system crops it to its own shape, and so
# is the Apple one, which is shown without transparency.
FULL = "0 0 108 108"
ROUNDED = f'<rect width="108" height="108" rx="24" fill="{BLUE}"/>{mark("#fff", WEB_SCALE)}'
FILLED = f'<rect width="108" height="108" fill="{BLUE}"/>'
WEB_DIR = ROOT / "icons"
WEB = {  # file name: (size in px, drawing)
    "icon-192.png": (192, ROUNDED),
    "icon-512.png": (512, ROUNDED),
    "icon-maskable-512.png": (512, FILLED + mark("#fff")),
    "apple-touch-icon.png": (180, FILLED + mark("#fff", WEB_SCALE)),
}


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get("CHROME_PATH"))
        page = browser.new_page()

        def render(path, px, view, body):
            page.set_viewport_size({"width": px, "height": px})
            page.set_content(svg(px, view, body))
            path.parent.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(path), omit_background=True)

        for name, (dp, view, body) in ICONS.items():
            for d, scale in DENSITIES.items():
                render(RES / FILES[name].format(d=d), round(dp * scale), view, body)
        render(ROOT / "store/icon.png", 512, VISIBLE, f'<rect width="108" height="108" fill="{BLUE}"/>{mark("#fff")}')
        for name, (px, body) in WEB.items():
            render(WEB_DIR / name, px, FULL, body)
        browser.close()
    # The browser tab icon is the drawing itself, so it needs no rendering.
    WEB_DIR.mkdir(parents=True, exist_ok=True)
    (WEB_DIR / "icon.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{FULL}">{ROUNDED}</svg>', encoding="utf-8")
    print(f"{len(ICONS) * len(DENSITIES)} Android icons + store/icon.png + {len(WEB) + 1} in icons/")


if __name__ == "__main__":
    main()
