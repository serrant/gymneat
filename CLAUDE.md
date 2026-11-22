# CLAUDE.md

Guidance for AI assistants working on **Gymneat**, a minimal gym tracker. The app is plain HTML, CSS and JavaScript modules (no bundler, no framework). The same code runs in a browser (local preview or GitHub Pages) and, packed with Capacitor 8, as an Android app.

## Commands

```sh
npm test       # node --test on tests/*.test.js (Node 22+: the quoted pattern relies on Node's own glob support)
npm run sync   # copy the app into www/ and update the Android project; run after every change to the app
npm run open   # open android/ in Android Studio to build and run
npm start      # preview in a desktop browser at http://localhost:8000 (python3 -m http.server); Android-only features do nothing there
```

Before finishing any change: run `npm test`, then check the change at phone size (390 × 844) in the browser preview, and on a phone or emulator when it touches `js/native.js` or other Android behaviour. Test **every state a screen can be in**, not just the one you changed. For the Training screen that means each kind of day (done, missed, planned, rest) and a session left open with Back.

## Structure and its rules

What each file and folder is for: **read [docs/project-structure.md](docs/project-structure.md)** before adding, moving or renaming files, and keep it up to date.

- Dependencies point one way: `lib` and `data` know nothing about the app; `state` and `stats` know nothing about the UI; views only read state; `actions.js` is the only UI file that changes data.
- To trigger a redraw from outside `ui/`, call the hooks in `ui/hooks.js`, never import `render.js` (that creates import cycles).
- Views return HTML strings. Escape every user- or file-provided value with `esc()` from `lib/util.js`.
- Every data change ends with `saveLocal()` (state.js), which writes all data to the device at once. There is no server or account sync.
- Keep calculations in `stats.js` pure (data in as arguments) and add a test for any new rule there.
- Edit the app at the project root. Android-only behaviour goes through `js/native.js` and must do nothing when `isApp` is false, so the browser preview and the tests keep working. The app's code has no dependencies; Capacitor (in `node_modules/`) is only for the Android shell.

## Data compatibility: never break these

- Data is saved under the localStorage key `gymneat.v1`, and exports carry `"app": "gymneat"`, which import checks. Renaming either loses users' saved data or breaks importing their backups.
- Exercise ids (the slug of the name in `exercises.js`) are stored in plans and sessions. Never rename an existing one; add a new one instead.
- If the shape of stored data changes, add a conversion step for old data in `normalize()` (state.js) and update `docs/data.md`.

## Product decisions (intentional, don't "fix")

- **No requests to other servers** (no CDNs, web fonts, analytics, trackers, sync or remote config): the store listing promises the data stays on the phone. Fonts and every other asset ship in the app; the only `fetch` reads the licence files bundled with it (`loadLegal` in io.js). Data leaves the device only by the user's own action: *Export* (share menu), *Copy JSON*, or Android's backup to their Google account (`allowBackup` in the manifest). The Android manifest removes the `INTERNET` permission (`tools:node="remove"`, also against libraries adding it), so Android itself blocks any connection: never add it back.
- **Minimal UI:** no extra text, no motivational or "corny" phrases, no streaks or badges. Prefer icon buttons with an `aria-label` and `title` over text buttons for secondary actions.
- **The notice line in Trends → Data** is "Gymneat © 2026 serrant · GPL-3.0 · Privacy" (`views/data.js`). *GPL-3.0* opens the Licences sheet (`views/legal.js`: no-warranty statement, then the GPL text from `LICENSE.txt` without its repository header, then `THIRD-PARTY-NOTICES.txt`, which also carries the font licence; no file names shown to users): the GPL's on-screen notice (§5(d)) and the notices the MIT and Apache libraries require. *Privacy* opens `PRIVACY.md`, the privacy policy Google Play requires inside the app. Keep the line and both sheets, and keep those files in `scripts/copy-web.js` so they ship with the app. When the app's data handling changes, update `PRIVACY.md` (and its date) too.
- **Trends show the heaviest weight lifted** per session (with its reps), not an estimated 1RM. The 1RM and the Overview tab were removed at the owner's request.
- **The Training tab** (`views/training.js`, `#training`) was called Today before; the old `#today` address redirects to it.
- **A day counts as Done once any set is logged for it**, even if the session was never finished. A session started from an earlier day of the current week is saved on that day (`sessionDate` in `lib/dates.js`).
- **Training shows what was logged** on done days, and the plan under "Planned" (greyed out once past) on other days, so a plan is never mistaken for a log.
- **One rest time per exercise**, used between sets and before the next exercise.
- **Plan's week strip shows exercise counts, not dates**, because the plan repeats every week.
- **Exercise figures are drawn in code** (2D stick figures in the app's colours), not images: no licensing questions, consistent style, theme-aware. A new built-in exercise needs an entry in `EXERCISE_FIGURES` (a test enforces it); custom exercises use the generic figure. Figures hold still when the phone asks for reduced motion.
- **The app icon is drawn in code** in `store/make_icons.py`: a dumbbell with a tick above the bar, white on the accent blue. Change it there and run the script; it writes every launcher size, the themed (monochrome) icon, the notification icon, the splash icon and `store/icon.png`. Never put Capacitor's or any other project's images back.
- **Rest alerts:** leaving the app during a rest schedules a "Rest over" notification, cleared on return. The first session asks for notification permission, and the app offers once to allow exact alarms (Android 14+ has them off; without them an alert can be a minute late).

## Pitfalls already hit

- In `views/training.js`, the buttons are picked by one `if / else if / else` chain. Add extra buttons **after** the chain ends, never inside it. A line inserted mid-chain once hid Start on every non-done day.
- `localStorage` can throw or be full; saves are wrapped in try/catch. Don't let a storage error break a workout.
- Use `ask()` for confirmations, never `alert` or `confirm`, so dialogs look the same everywhere.
- In the Android app, Capacitor's local server answers any path without an extension with `index.html` (meant for web-app routes). A file the app fetches needs an extension: `LICENSE` once showed the app's own page in the Licences sheet, hence `LICENSE.txt`.
- Local notifications plugin: `cancel()` only stops pending alarms; a notification already shown needs `removeDeliveredNotifications()` (`cancelRestAlert` calls both). Asking for an exact notification without the exact-alarm permission makes the plugin open the system settings screen, so `restAlert` asks for exact only when it's allowed.
- `android/` builds with Android Studio's Java 25 only because its Gradle wrapper is pinned to 9.5.1 (Gradle 8 can't run on Java 25; AGP 8.13 breaks on Gradle 9.6+) and `android/settings.gradle` adds the toolchain resolver for the Java 21 the plugins require. Keep both when Capacitor regenerates files.

## Releasing

1. Bump `VERSION` in `js/version.js` (format `MAJOR.MINOR`, started at `1.0`: bump MINOR for every release, MAJOR for big changes). It is the only place the version is set: `android/app/build.gradle` reads it as `versionName` and derives `versionCode` as MAJOR × 1000 + MINOR, so every upload to Google Play needs a higher `VERSION`.
2. Update the README, `docs/data.md` or `docs/tech.md` if behaviour, the data format or the tools changed.
3. Run `npm run sync`, then build a signed bundle (`.aab`) in Android Studio.
4. Store images in `store/` show real screens; regenerate them with `store/make.py` when the interface changes.
