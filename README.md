# Evenweek

**How many hours a week do you need?**

A single-page web app for shift workers and multi-job earners. Enter what you earn an hour and
what your month costs, and it works out the hours, after tax.

**Live:** https://gmanthenoxus.github.io/shift-planner

<!-- The repo is still named shift-planner on purpose. Renaming it would break the live URL and
     every link already shared. See docs/design/BRANDING.md. -->

## What it does

Two questions produce the number. Everything after that is optional.

- **Hours a week**, solved after tax and pension, not before
- **What you keep an hour**, which is rarely what the rate says
- **Several jobs at several rates**, blended by the hours you actually work
- **Goals with a deadline**, folded into the weekly figure rather than reported beside it
- **Shift logging**, with the rate snapshotted at log time so editing a rate never rewrites old pay
- **Banked weeks**, showing what each week's earnings reached, in the order you listed them

Tax models cover the UK, Ireland, Germany, France, Netherlands, Spain, US, Canada and Australia,
or a flat custom rate.

## Your data

Stays in your browser. There is no account, no server and no analytics: the app makes no network
requests at all. Export and import as JSON whenever you want.

## What it is not

It is not advice. It does not tell you what to pay first, rank your outgoings, or judge your
position. It does arithmetic you asked for and stops. Tax figures are simplified effective-rate
estimates and ignore allowances, credits, student loans and overtime rules.

## Project documentation

Root holds only what a session reads every time: `CLAUDE.md` (standing orders), `SCOPE.md` (frozen
scope), `ARCHITECTURE.md`, `PARKING.md`, `HANDOVER.md`.

Everything else is under `docs/`, split by what it is for: `governance/`, `process/`, `research/`,
`design/`, `archive/`. See `docs/FILING.md` for the rule and the full index.

## Browser support

Modern browsers with ES6 and localStorage. Works offline once loaded.

## Licence

MIT
