# SCOPE: Shift Planner
<!-- Retroactive: written to onboard an already-shipped v8 into the Build Org, not a forward
     speculative scope. Captures what the live app actually, observably does today. -->

## Problem

Gig and multi-job workers (shift work, varied hourly rates across more than one job) don't have an easy way to translate "what I owe every month" into "how many hours I actually need to work" — tax-adjusted, across jobs, with one-off goals layered on top. Shift Planner answers "how many hours does your life cost?": enter jobs, outgoings, and goals, get the weekly hours needed, then log real shifts against that target.

## Features — this version (v8, as shipped)

1. **Multi-job earnings input**
   - Criteria: user can add/remove jobs, each with a label, hourly rate, typical hours/week, and pension %; the app computes a single hours-weighted blended rate across all jobs.

2. **Country tax model + real take-home**
   - Criteria: user picks from 8 countries (UK, IE, DE, FR, NL, ES, US, CA, AU) or a custom flat deduction rate; the app shows blended gross/hr, a per-hour deduction breakdown (tax/social components + pension), and net take-home/hr.

3. **Monthly outgoings & one-off goals**
   - Criteria: user can add/remove monthly outgoing items, each with a label, amount, and category (bills/savings/repayments/spending); total monthly need and per-category totals display. User can add one-off goals (label, amount, deadline in weeks); each goal's extra hours/week (on top of baseline) is computed and shown.

4. **Working ceiling & feasibility reality check**
   - Criteria: user sets max days/week and max hours/day, producing a weekly hour ceiling. The app shows total hours/week needed (baseline + active goals) against that ceiling, with a stacked reality bar and a written verdict (sustainable / heavy / brutal / over-ceiling), color-coded.

5. **"Where every hour goes" visualization**
   - Criteria: a donut chart slices one hour of gross pay into deduction components and spending categories (by proportional monthly share), with a legend showing minutes-per-slice.

6. **Shift logging & weekly pace tracking**
   - Criteria: user can log shifts (job, start time, end time, break minutes) for the current week; hours and net pay per shift compute automatically. A pace panel shows earned-this-week vs needed-this-week, hours worked, and an ahead/short verdict with the shortfall in hours if behind.

7. **Coverage-in-priority-order tracking**
   - Criteria: current week's earnings (logged or historical) are allocated across outgoings and goals in their listed order as a "waterfall"; a coverage bar and legend show which obligations are fully covered, partially covered, or unreached. "New week" banks the current week (date, hours, net, coverage snapshot) into history and clears the shift log; the last 6 banked weeks display with their own coverage bar and legend.

8. **Data portability & persistence**
   - Criteria: all state persists to localStorage automatically. Export downloads the full state as a JSON file. Import loads state from a previously exported JSON file, with a user-facing error (not a crash) on an unparseable file. Reset clears all state back to seed defaults after an explicit confirmation.

## NOT doing (this version)

- Multi-device sync or accounts — single-browser localStorage only, by design (no backend in the approved stack).
- Bill due-dates or scheduling — the app's own footer discloses this: "doesn't track when bills are due," it plans average hours only.
- Notifications/reminders of any kind.
- Editing a past (banked) week's history entry after the fact — history is a read-only log once a week is banked.
- Multiple countries/currencies active simultaneously — one tax model applies at a time.
- Precise statutory tax accuracy — the app's own footer discloses this: "simplified effective-rate estimates," ignoring allowances, credits, student loans, overtime rules.

## Freeze

FROZEN: 2026-07-06
<!-- Retroactive freeze: this documents the shipped v8 baseline, onboarding it into the org's
     governance. Future changes (a v9) get their own SCOPE.md cycle, scoped and frozen fresh —
     this file is not amended to add v9 features; a new one supersedes it at the next freeze. -->

## Changelog

<!-- None yet. First real entry will be whatever v9 becomes, as its own SCOPE.md — see the org's
     "one sitting" rule: a version's scope doesn't grow after freeze, a new version starts fresh. -->
