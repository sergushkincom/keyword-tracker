# Keyword Tracker

A clickable front-end prototype of a keyword rank tracker. All data is mocked in TypeScript. There is no backend.

## Run

```
npm install
npm run dev
```

## Design

Merged runs join consecutive days with the same rank into one cell, so a long flat run reads as stability and a row of narrow cells reads as volatility.

Rank is drawn on a single-hue ramp from light to dark, because rank is an ordered quantity. A traffic-light ramp is in the code behind a constant if you want to compare.
