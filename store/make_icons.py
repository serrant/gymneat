"""Builds the app icon in every size Android and Google Play need, from one drawing in code.

    python3 store/make_icons.py

Needs Python 3 and Playwright, like make.py:
    pip install playwright && playwright install chromium
    (set CHROME_PATH to use an installed Chrome instead)

The icon: a dumbbell (the gym) with a tick above the bar (neat, a set done), white on the app's accent blue.
Geometry is in the 108 x 108 grid of Android adaptive icons: the launcher shows the middle 72 x 72
(18..90) and masks it to a circle, squircle etc.; everything important stays inside the 66 dp safe circle.

Writes:
  android/app/src/main/res/mipmap-*/ic_launcher_foreground.png   adaptive foreground (also the themed/monochrome icon)
  android/app/src/main/res/mipmap-*/ic_launcher.png, _round.png  legacy icons (Android 7.x)
  android/app/src/main/res/drawable-*/ic_stat_gymneat.png        notification icon (white silhouette)
  android/app/src/main/res/drawable-*/splash_icon.png            splash screen icon (Android 11 and older)
  store/icon.png                                                 Play Store icon, 512 x 512
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "android/app/src/main/res"
BLUE = "#1f45d1"  # --accent in css/styles.css; also @color/ic_launcher_background
DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}

# The mark, in the 108 grid: the bar (drawn first, running under the plates so the joins show no seam),
# then outer plate, inner plate, inner plate, outer plate; and the tick.
RECTS = [(38, 51, 32, 6), (24, 43, 7, 22), (33, 37, 9, 34), (66, 37, 9, 34), (77, 43, 7, 22)]
RADIUS = {7: 3, 9: 3}  # plates are rounded; the bar is square
TICK = "48,42 52,46 60,38"


def mark(color):
    rects = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{RADIUS.get(w, 0)}"/>' for x, y, w, h in RECTS)
    return (f'<g fill="{color}">{rects}</g><polyline points="{TICK}" fill="none" stroke="{color}" '
            f'stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>')


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
        browser.close()
    print(f"{len(ICONS) * len(DENSITIES)} Android icons + store/icon.png")


if __name__ == "__main__":
    main()
