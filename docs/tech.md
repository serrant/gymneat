# Technologies

Gymneat is one web app that runs in two places: in a browser (local server or GitHub Pages) and as an Android app. The Android app is the same code inside a thin native shell.

## The app

| Technology | Used for |
|---|---|
| HTML, CSS, JavaScript modules | The whole app, at the project root (`index.html`, `css/`, `js/`). No bundler, no framework, no build step. |
| `localStorage` | Saving all data on the device (key `gymneat.v1`; see `docs/data.md`). |
| SVG, drawn in code | Charts, exercise figures and icons, in the app's own colours. |
| Barlow and Barlow Condensed fonts | Typography. Shipped in `fonts/` (SIL Open Font License), so the app never contacts a font server. |
| Web Audio, Vibration, Screen Wake Lock APIs | The beep at the end of a rest, vibration in browsers, keeping the screen on during a session. |

## Android

| Technology | Used for |
|---|---|
| [Capacitor](https://capacitorjs.com) 8 (MIT) | Wraps the web app in a native Android app. It serves the files from inside the app (`https://localhost`), so the app works offline and makes no network requests, and it lets JavaScript call Android features. |
| `@capacitor/app` | The Android back button; knowing when the app leaves or returns to the screen. |
| `@capacitor/local-notifications` | The "Rest over" notification while you're in another app. |
| `@capacitor/haptics` | Vibration at the end of a rest. |
| `@capacitor/filesystem`, `@capacitor/share` | Export: saving the JSON file and opening Android's share menu. |
| AndroidX, Kotlin (Apache 2.0) | Android libraries that Capacitor and its plugins depend on. |

All Android-only calls are in `js/native.js`. It reaches the plugins through Capacitor's core script (`capacitor.js`, added to the app by `scripts/copy-web.js`), so no bundler is needed. In a browser Capacitor is missing and `native.js` does nothing.

## Build tools (on the developer's computer, not in the app)

| Tool | Used for |
|---|---|
| Node and npm | Installing Capacitor and its plugins (`npm install`, versions pinned in `package.json`); running `npm run sync`, `npm run open` and the tests. |
| Node's test runner | Unit tests in `tests/` (`npm test`). |
| Android Studio and the Android SDK | Building, running and signing the Android app. Targets Android 16 (API level 36), as Google Play requires. |
| Gradle 9.5.1 | Android's build system. Pinned: Gradle 8 can't run on Android Studio's Java 25, and Capacitor's Android plugin breaks on Gradle 9.6+. |
| Java 21 | Required by the Capacitor plugins. Gradle downloads it (toolchain resolver in `android/settings.gradle`). |
| Python and Playwright | Generating the Play Store images (`store/make_listing.py`) and the app icon in every size (`store/make_icons.py`). |
| Python's `http.server` | Previewing the web app locally (`npm start`). |

## How the pieces connect

1. Edit the app at the project root.
2. `npm run sync` copies it into `www/` (adding `capacitor.js`), then Capacitor copies `www/` into `android/app/src/main/assets/public/`.
3. Gradle builds the APK from `android/`.

`www/` and `android/app/src/main/assets/public/` are generated: never edit them.

## Licences

The app is GPL-3.0 (`LICENSE.txt`). The open-source parts it ships (Capacitor, AndroidX, Kotlin) are listed with their licences in `THIRD-PARTY-NOTICES.txt`; the fonts' licence is `fonts/OFL.txt`. In the app, *GPL-3.0* under *Data* in Trends shows all of these.
