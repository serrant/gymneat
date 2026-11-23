"""Builds the store images in this folder from the real app.

    python3 store/make_listing.py                 # light theme (default)
    python3 store/make_listing.py --theme dark

Needs Python 3 and Playwright, used only by this script, not by the app:
    pip install playwright && playwright install chromium

What it does:
  1. serves the repository on a free local port,
  2. opens the app in a phone-sized browser with example data and a fixed clock,
  3. screenshots six screens,
  4. puts each screenshot in a phone frame with a headline and saves a PNG.
Text, colours and layout are all in this file (TAGLINE, DIFF, BOARDS, THEMES, *_board()).
"""
import argparse, base64, datetime as dt, functools, http.server, json, os, random, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent

# Fixed date so every run gives the same pictures: Sunday, so the whole week has passed.
NOW = dt.datetime(2026, 11, 22, 18, 0)

# First screenshot and feature graphic: what the app is, and what sets it apart.
TAGLINE = "A minimal gym tracker"
DIFF = "No login. No ads. Your data stays on your phone."

# file name: (screen, headline line 1, line 2 in the accent colour, brand layout)
# The brand layout ignores the two lines and shows GYMNEAT, TAGLINE and DIFF instead.
BOARDS = {
    "1-main":     ("work",     "",          "",             True),
    "2-rest":     ("rest",     "Rest",      "On the clock", False),
    "3-plan":     ("plan",     "Plan",      "Your week",    False),
    "4-progress": ("trends",   "See your",  "Progress",     False),
    "5-logged":   ("training", "Every set", "Logged",       False),
    "6-weight":   ("weight",   "Track",     "Your weight",  False),
}

# The app's own colours (css/styles.css).
THEMES = {
    "light": {"bg": "#eceef2", "ink": "#12161b", "mute": "#646d79", "accent": "#1f45d1", "glow": "#1f45d133"},
    "dark":  {"bg": "#0e1114", "ink": "#e8ecf0", "mute": "#8b94a0", "accent": "#7d95ff", "glow": "#7d95ff55"},
}


def example_data():
    """Nine weeks of plausible training and body weight, ending the day before NOW."""
    random.seed(4)
    today = NOW.date()
    days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    mk = lambda ex, t, sets, reps, rest: {"ex": ex, "t": t, "sets": sets, "reps": reps, "rest": rest}
    plan = {k: [] for k in days}
    plan["mon"] = [mk("bench-press", "W", 4, 8, 120), mk("incline-dumbbell-press", "W", 3, 10, 90), mk("cable-fly", "W", 3, 12, 60), mk("treadmill-run", "C", 1, 20, 0)]
    plan["tue"] = [mk("lat-pulldown", "W", 4, 10, 90), mk("seated-cable-row", "W", 3, 10, 90), mk("pull-ups", "B", 3, 8, 90), mk("crunches", "B", 3, 20, 45), mk("barbell-curl", "W", 3, 10, 60)]
    plan["thu"] = [mk("squat", "W", 4, 6, 150), mk("leg-press", "W", 3, 10, 90), mk("plank", "S", 3, 45, 45)]
    base = {"bench-press": 70, "incline-dumbbell-press": 24, "cable-fly": 15, "lat-pulldown": 60, "seated-cable-row": 55, "barbell-curl": 30, "squat": 90, "leg-press": 140}
    start = today - dt.timedelta(days=63)
    sessions, day, n = {}, start, 0
    while day < today:
        key = days[day.weekday()]
        # the last two weeks are all done so the Training strip looks complete
        if plan[key] and (random.random() > 0.15 or (today - day).days <= 14):
            weeks = (day - start).days / 7
            items = []
            for it in plan[key]:
                b, log = base.get(it["ex"], 0), []
                for s in range(it["sets"]):
                    if it["t"] == "W":
                        kg = round(b * (1 + weeks * 0.025) / 2.5) * 2.5
                        log.append({"kg": kg, "reps": max(1, it["reps"] - s // 2 - (1 if it["ex"] == "barbell-curl" and weeks > 6 else 0)), "at": 0})
                    elif it["t"] == "B":
                        log.append({"reps": it["reps"] + int(weeks / 2) - s, "at": 0})
                    elif it["t"] == "S":
                        log.append({"sec": 45 + int(weeks * 3), "at": 0})
                    else:
                        log.append({"min": 20, "km": round(3.2 + weeks * 0.05 + random.random() * 0.2, 2), "at": 0})
                items.append(dict(it, name=it["ex"], log=log))
            ts = int(dt.datetime.combine(day, dt.time(18, 0)).timestamp() * 1000)
            sessions[f"s{n}"] = {"id": f"s{n}", "date": day.isoformat(), "planDay": key, "start": ts, "end": ts + 3600_000, "status": "done", "items": items, "cur": None}
            n += 1
        day += dt.timedelta(days=1)
    body, w, day = [], 80.6, start
    while day <= today:
        if random.random() < 0.45:
            w += random.uniform(-0.35, 0.22)
            body.append({"d": day.isoformat(), "kg": round(w, 1)})
        day += dt.timedelta(days=1)
    S = {"profile": {"plan": plan, "custom": []}, "body": {"entries": body},
         "sessions": sessions}
    return json.dumps(S)


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_port}"


def capture(browser, url, theme):
    """Screenshots of the app at 390 × 844, at 2× pixel density."""
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                              color_scheme=theme, reduced_motion="reduce", locale="en-GB", is_mobile=True, has_touch=True)
    ctx.add_init_script("if(!localStorage.getItem('seeded')){localStorage.setItem('gymneat.v1'," + json.dumps(example_data()) + ");localStorage.setItem('seeded','1')}")
    page = ctx.new_page()
    page.clock.install(time=NOW)
    page.goto(url + "/index.html#training")
    # room for the phone's status bar, so nothing sits under the frame's rounded corners
    page.add_style_tag(content="#app{padding-top:40px!important}.run{padding-top:34px!important}")
    page.clock.run_for(500)
    shots = {}
    def shot(name):
        page.clock.run_for(300)
        shots[name] = page.screenshot()
    def go(hash):
        page.evaluate(f"location.hash='{hash}'")
        page.clock.run_for(300)

    page.click("[data-a=trainday][data-i='1']"); shot("training")
    go("plan"); page.click("[data-a=pday][data-i='0']"); shot("plan")
    go("trends"); page.select_option("#tr-ex", "bench-press"); shot("trends")
    # the year view shows the whole climb, for the feature graphic
    page.click("[data-a=trr][data-k=Y]"); shot("trends-year")
    page.click("[data-a=trr][data-k=M]")
    go("weight"); shot("weight")
    # a live session on Monday's plan for the two session screens
    go("training"); page.click("[data-a=trainday][data-i='0']"); page.clock.run_for(100)
    page.click("[data-a=start]"); page.clock.run_for(300)
    page.clock.fast_forward("23:41")
    page.click("[data-a=setdone]")  # first set, with the values filled in from last time
    page.clock.fast_forward("00:36")
    shot("rest")
    page.click("[data-a=restskip]"); shot("work")
    ctx.close()
    return shots


def fonts(url):
    faces = [("Barlow", 400, "Barlow-Regular"), ("Barlow", 500, "Barlow-Medium"), ("Barlow", 600, "Barlow-SemiBold"),
             ("Barlow Condensed", 600, "BarlowCondensed-SemiBold"), ("Barlow Condensed", 700, "BarlowCondensed-Bold")]
    return "".join(f'@font-face{{font-family:"{f}";font-weight:{w};src:url("{url}/fonts/{n}.ttf")}}' for f, w, n in faces)


def phone(png, width, pad, border, radius, inner_radius, glow, extra=""):
    height = round(width * 844 / 390)
    src = "data:image/png;base64," + base64.b64encode(png).decode()
    return (f'<div style="flex:none;{extra}padding:{pad}px;border-radius:{radius}px;background:#000;'
            f'border:{border}px solid var(--accent);box-shadow:0 0 {glow}px var(--glow)">'
            f'<img src="{src}" style="display:block;width:{width}px;height:{height}px;border-radius:{inner_radius}px"></div>')


def headline(l1, l2, size):
    return (f'<h1 style="margin:0;font:700 {size}px/0.92 \'Barlow Condensed\',sans-serif;letter-spacing:.005em;'
            f'text-transform:uppercase;text-align:center"><span style="display:block;color:var(--ink)">{l1}</span>'
            f'<span style="display:block;color:var(--accent)">{l2}</span></h1>')


def page_html(url, theme, w, h, body):
    t = THEMES[theme]
    vars_ = ";".join(f"--{k}:{v}" for k, v in t.items())
    return (f'<!doctype html><meta charset="utf-8"><style>{fonts(url)}html,body{{margin:0}}'
            f'body{{{vars_};width:{w}px;height:{h}px;overflow:hidden;background:var(--bg);font-family:Barlow,sans-serif}}</style>{body}')


def brand_text(name_px, tag_px, diff_px, align):
    """GYMNEAT, the tagline in the accent colour, then DIFF."""
    return (f'<h1 style="margin:0;font:700 {name_px}px/0.92 \'Barlow Condensed\',sans-serif;letter-spacing:.005em;'
            f'text-transform:uppercase;color:var(--ink);text-align:{align}">Gymneat</h1>'
            f'<p style="margin:{round(tag_px * .25)}px 0 0;font:600 {tag_px}px/1 \'Barlow Condensed\',sans-serif;'
            f'text-transform:uppercase;color:var(--accent);text-align:{align}">{TAGLINE}</p>'
            f'<p style="margin:{round(diff_px * .65)}px 0 0;font-size:{diff_px}px;font-weight:500;line-height:1.2;'
            f'color:var(--mute);white-space:nowrap;text-align:{align}">{DIFF}</p>')


def store_board(png, l1, l2, brand):
    """Play Store phone screenshot, 1080 × 1920."""
    top = (f'<div style="display:flex;flex-direction:column;align-items:center">{brand_text(150, 58, 33, "center")}</div>'
           if brand else headline(l1, l2, 132))
    return (f'<div style="height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;'
            f'padding-top:{100 if brand else 150}px;gap:{58 if brand else 76}px">{top}'
            f'{phone(png, 624, 12, 4, 76, 60, 80)}</div>')


def feature_board(png):
    """Play Store feature graphic, 1024 × 500. The whole phone fits: 24 px clear above and below."""
    return (f'<div style="height:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:0 120px 0 88px">'
            f'<div style="display:flex;flex-direction:column">{brand_text(112, 40, 19, "left")}</div>'
            f'{phone(png, 200, 6, 3, 34, 26, 40)}</div>')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--theme", choices=THEMES, default="light")
    theme = ap.parse_args().theme
    srv, url = serve()
    with sync_playwright() as p:
        chrome = os.environ.get("CHROME_PATH")  # optional: use an installed Chrome instead of Playwright's
        # British English so the date field reads day/month/year; the page locale alone doesn't change it
        browser = p.chromium.launch(executable_path=chrome, args=["--lang=en-GB"], env={**os.environ, "LANG": "en_GB.UTF-8", "LANGUAGE": "en_GB"})
        shots = capture(browser, url, theme)
        page = browser.new_page()
        page.goto(url + "/store/")  # same origin as the fonts
        suffix = "" if theme == "light" else "-dark"
        jobs = [(n, 1080, 1920, store_board(shots[s], l1, l2, d)) for n, (s, l1, l2, d) in BOARDS.items()]
        jobs.append(("feature-graphic", 1024, 500, feature_board(shots["trends-year"])))
        for name, w, h, body in jobs:
            page.set_viewport_size({"width": w, "height": h})
            page.set_content(page_html(url, theme, w, h, body), wait_until="load")
            page.evaluate("document.fonts.ready")
            page.screenshot(path=str(OUT / f"{name}{suffix}.png"))
            print(f"store/{name}{suffix}.png")
        browser.close()
    srv.shutdown()


if __name__ == "__main__":
    main()
