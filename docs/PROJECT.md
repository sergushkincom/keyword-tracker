# Keyword Tracker — project passport

Keyword Tracker is a clickable front-end prototype of a keyword rank tracker, live at [https://keyword-tracker-nine.vercel.app](https://keyword-tracker-nine.vercel.app).

**One-line promise:** the table is the chart. Days that share a rank join into one cell, so a flat run reads as a wide block and a jumpy run reads as a row of narrow cells.

Prototype only. The ranks, events, and product are mocked in TypeScript. There is no backend, and nothing is stored.

## Who it is for

Someone looking at a product's search ranks who needs to see, in one glance, which keywords held a position and which ones moved. The page is a design prototype of that glance, not a tool that pulls live ranks.

## What the screen does

One product, ten keywords, and two events, over 4–24 September 2026. The newest day is on the left. 24 September is marked today. Weekend headers are quieter. The first four columns stay fixed while the days scroll.

Rank is a single-hue ramp from light to dark, because rank is ordered. A missing rank is a hatch. `toRuns` in `src/lib/runs.ts` joins consecutive equal values into one cell, after `displayOrder` puts the newest day first, so a run is consecutive days on screen.

The date field switches the window:

| Choice | Days on screen |
| --- | --- |
| Last 7d | 18–24 September |
| Last 2w | 11–24 September |
| Last 3w | 4–24 September, the default |

The day columns, merged runs, averages, and event bars follow that window. An event that falls outside the window becomes an empty hatch. The choice, a new event, and the theme last for this visit. Reloading restores the three-week window, the two seeded events, and the light theme.

The README still and GIF are that screen. `docs/hero.png` is the default window. `docs/period.gif` is the date field switching it. Both sit at the top of the README and link to the live demo. `scripts/capture.mjs` records them from the running app with Playwright and ffmpeg. It is not an npm script and it is not in CI.

## Data

- `src/data/keywords.ts` — ten keywords. Ranks are chronological, oldest first, one value per day of the full 21-day series. Empty days are `null`. Average rank is the mean of the days in the current window that have a rank, to one decimal.
- `src/data/events.ts` — two seeded events.
- `src/lib/dates.ts` — the September axis, the three windows, and clipping an event bar to the visible days.
- `src/lib/rankColor.ts` — six rank steps. `RAMP` is `'sequential'`.

## Stack, scripts, and checks

React 19 · TypeScript · Vite · Tailwind CSS 4.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run lint
npm run build
```

`npm test` runs the unit tests in `src/lib/*.test.ts` (merged runs, the six rank bands, and the time windows). `npm run lint` runs oxlint. CI installs with `npm ci` on Node 22, then runs typecheck, lint, test, and the production build.

## Status

Shipped and live at [https://keyword-tracker-nine.vercel.app](https://keyword-tracker-nine.vercel.app):

- The merged-cell rank table, event bars, and the new-event drawer.
- Light and dark for this visit.
- The date field switches the window.
- README still and GIF of that table.
- Unit tests and a CI gate for typecheck, lint, test, and the production build.

## Known gaps

These controls are visible and do not change the keywords, the ranks, or the events: search, the product and location fields, position type, the D and W marks, export, fullscreen, Add → New keyword, the icon rail, and the selection-bar actions other than select and deselect.

The legend popup's timeframe line still reads "Timeframe: 1 week". It does not follow the date field.

The page `<head>` still names a second demo host. The README uses [keyword-tracker-nine.vercel.app](https://keyword-tracker-nine.vercel.app) only. That split is open issue #9.

When the window changes, the rank numbers jump. They do not roll. That idea is open issue #12.

## Rules

- The license is MIT (`LICENSE`, copyright 2026 sergushkin.com). Keep it.
- Do not add real company names in code, docs, commits, or pull request text.
- The owner merges. Open the pull request and stop.
