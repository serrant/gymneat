# Data

## Stored on the device

Everything is saved on the device, in `localStorage`: on Android in the app's private storage, on the web in that browser for that site. Nothing is sent to a server.

| Key | Contents |
|---|---|
| `gymneat.v1` | All your data, as one JSON object (fields below) |
| `gymneat.exactAlarmAsked` | Android only: `"1"` once the app has offered exact alarms. A device setting, not part of your data or exports. |

The object, `S` in `js/state.js`:

| Field | Contents |
|---|---|
| `profile.plan` | The weekly plan: `mon` … `sun`, each a list of plan items |
| `profile.custom` | Your own exercises |
| `body.entries` | Body weight, one entry per date |
| `sessions` | Every session, keyed by its id |

**When it saves:** immediately, on every change: each change ends with `saveLocal()` (`js/state.js`), which writes the whole object. A set is saved the moment you tap *Set done*, so a session survives the app closing: it reopens on the next start if it began less than 6 hours earlier. If storage is full or unavailable, the save is skipped instead of interrupting the workout.

**How long it lasts:**

- **Android:** survives restarts, phone reboots and app updates. Uninstalling the app or *Settings → Apps → Gymneat → Clear storage* deletes it. With Android's backup on (`allowBackup` in the manifest) and the user's Google backup enabled, Android can include it in that backup and restore it on a new phone.
- **Web:** only in that browser, on that device. The browser can clear it: iPhone Safari does after 7 days unused, unless the app is on the home screen.

Back up with *Export* (Android: share menu) or *Copy JSON* under *Data* in Trends.

## How progress is measured

- **Weighted exercises** are tracked by the heaviest weight lifted in a session, shown with the most reps done at that weight (e.g. `100 kg × 8`).
- **Trends** plot the best value per day for each exercise, and the best value per week in the year view. Body weight plots each entry (one per date), and the weekly average in the year view.
- **Past days:** a session started from an earlier day of the current week is saved on that day, so it plots where it belongs.

## Export format

The export holds the same data as `S`, with clearer names: `plan` (`profile.plan`), `customExercises` (`profile.custom`), `bodyWeight` (`body.entries`) and `sessions` (a list, oldest first). Its `"app"` value, `"gymneat"`, marks the file as a Gymneat export; import refuses other files. Importing replaces all data.

```json
{
  "app": "gymneat",
  "version": 1,
  "exported": "2026-11-21T16:00:00.000Z",
  "plan": { "mon": [ { "ex": "bench-press", "t": "W", "sets": 4, "reps": 8, "rest": 120 } ], "tue": [] },
  "customExercises": [ { "id": "c-abc123", "name": "Landmine press", "g": "Shoulders", "t": "W" } ],
  "bodyWeight": [ { "d": "2026-11-20", "kg": 77.7 } ],
  "sessions": [
    {
      "id": "s…", "date": "2026-11-16", "planDay": "mon", "start": 1763308800000, "end": 1763312400000, "status": "done",
      "items": [ { "ex": "bench-press", "t": "W", "name": "Bench press", "sets": 4, "reps": 8, "rest": 120,
                   "log": [ { "kg": 75, "reps": 8, "at": 1763308900000 } ] } ]
    }
  ]
}
```

| Type `t` | Meaning | `reps` in the plan | Log entry |
|---|---|---|---|
| `W` | Weight × reps | reps | `{ kg, reps, at }` |
| `B` | Bodyweight reps | reps | `{ reps, at }` |
| `S` | Timed hold | seconds | `{ sec, at }` |
| `C` | Cardio | minutes | `{ min, km, at }` (`km` may be `null`) |

- `at` is when the set was logged.
- A session still running has `"status": "active"`, `"end": null` and `cur`: where it is (exercise `i`, set `s`, `phase` `"work"` or `"rest"`, `restEnd`, `restLen`). That lets it resume after a restart. Importing turns active sessions into `done`.
- `rest` is in seconds. Times are Unix milliseconds. Dates are local `YYYY-MM-DD`.
- Exercise ids are stored in your data, so never rename an existing one in `js/data/exercises.js`.
