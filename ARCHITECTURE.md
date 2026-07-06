# ARCHITECTURE: Shift Planner

<!-- RETROACTIVE. Shift Planner v8 already shipped and is live at
     gmanthenoxus.github.io/shift-planner before this document existed. This is not a forward
     design — it documents the real, existing shape of the app, extracted directly from
     index.html, so the Build Org's governance can wrap around a working product. Where the code
     embeds a decision that isn't the only reasonable choice, it's flagged below and in the
     Handover for the human to confirm was intentional, not silently ratified. -->

## 1. Design tokens (verbatim, extracted from index.html `:root`)

No separate design-token doc exists for this project (it predates the noxus-design-system
skill). These are the actual custom properties in the shipped file, copied as-is:

```css
:root{
  --bg:#0b0e13; --panel:#12161f; --panel2:#1a1f2b; --line:#272e3c;
  --ink:#eaeff6; --sub:#8392a6; --accent:#5eead4; --accent2:#2dd4bf;
  --warn:#fb7185; --amber:#fbbf24; --blue:#60a5fa; --violet:#a78bfa;
  --r:14px;
  /* category colours */
  --c-bills:#60a5fa; --c-save:#5eead4; --c-repay:#fbbf24; --c-spend:#a78bfa; --c-tax:#fb7185;
}
```

Type: `Inter, system-ui, -apple-system, sans-serif` for UI text; `ui-monospace, 'SF Mono', Menlo,
monospace` (class `.mono`, `font-variant-numeric: tabular-nums`) for every numeric/data value
(money, hours, rates). Border radius `14px` (`--r`, used on `.card`), `10px` on inputs/stats.
Category-to-colour mapping: bills → blue, savings → teal (`--accent`), repayments → amber,
spending → violet, tax/deductions → red (`--warn`). This reads closest to the noxus-design-system's
"Engineer" archetype (function-first, data-dense, professional dark UI) — noted for reference only;
not re-derived, not up for re-decision here.

## 2. Pages

One page. `index.html` is the entire app — a single scrolling document, no routing, no separate
screens. Every section maps to a SCOPE.md feature:

| Section (scroll order) | SCOPE feature(s) |
|---|---|
| Header + toolbar (export/import/reset) | 8 |
| Country/currency picker | 2 |
| Jobs panel | 1 |
| Working ceiling panel | 4 |
| Other income | 3 |
| Monthly outgoings | 3 |
| One-off goals | 3 |
| Take-home summary (gross/deductions/net per hour) | 2 |
| Headline / feasibility verdict | 4 |
| Hour-breakdown donut ("where every hour goes") | 5 |
| Baseline panel | 3, 4 |
| Goals panel | 3, 4 |
| Reality bar | 4 |
| Shift log + pace panel | 6 |
| Week-history panel | 7 |

## 3. Components

Real functional blocks as they exist in the code (function names in parens where the code names
them). One line each: what it renders, what data it reads.

- **Header toolbar** — export/import/reset buttons; reads/writes the whole `S` object.
- **Country/currency picker** — `<select>` of 8 countries + "Flat % (custom)"; toggles the custom
  rate input; reads/writes `S.settings.country`, `S.settings.customRate`.
- **Job list** (`renderJobs`) — one card per job: label, rate/hr, typical hrs/wk, pension %, delete;
  reads/writes `S.jobs[]`.
- **Working ceiling panel** — max days/week, max hours/day inputs, computed ceiling display; reads
  `S.settings.maxDays`, `S.settings.hoursPerDay`.
- **Other income input** — single currency field; reads/writes `S.settings.otherMo`.
- **Monthly outgoings list** (`renderBills`) — one row per item (label, category select, amount,
  delete), running total, per-category chip totals; reads/writes `S.bills[]`.
- **One-off goals list** (`renderGoals`) — one row per goal (label, amount, weeks, delete); reads/
  writes `S.goals[]`.
- **Take-home summary** — blended gross/hr, per-hour deduction breakdown list, net take-home/hr;
  reads the computed `model()` output.
- **Headline/feasibility panel** — hero number (total hrs/week + days/week), baseline-vs-goals
  pills, colour-coded verdict text (sustainable/heavy/brutal/over-ceiling); reads `model()`.
- **Hour-breakdown donut** (`renderClock`) — inline SVG donut + legend; slices one hour of gross
  pay into deduction components then spend categories by proportional monthly share; reads
  `model().perHrComps` and `S.bills` category totals.
- **Baseline panel** — net/gross/hours needed per month and per week; reads `model()`.
- **Goals panel** (`goalRows`) — one row per goal with its extra hrs/week; reads
  `model().goalCalc`.
- **Reality bar** — stacked bar (baseline hours + goal hours vs ceiling) with headroom/over text;
  reads `model()`.
- **Shift log** (`renderShifts`) — one card per logged shift (job select, start, end, break
  minutes, computed hours + net pay, delete), "+ Shift" and "New week" buttons; reads/writes
  `S.shifts[]`, reads `S.jobs` for rate lookup.
- **Pace panel** — earned-this-week / needed-this-week / hours-worked stats, ahead/short verdict,
  this-week's coverage waterfall bar + legend; computed live from `S.shifts` and `model()`.
- **Week-history panel** (`renderHistory`) — last 6 banked weeks, each with its own stored coverage
  bar and legend; reads `S.history[]` (each entry carries a frozen `coverage` snapshot taken at
  bank time, per the "history is read-only" NOT-doing item in SCOPE).

## 4. File layout

Literal, current, root of the `shift-planner` repo:

```
Shift Planner/
├── index.html       # entire app: HTML + <style> (all CSS) + <script> (all JS), one file
├── README.md        # user-facing description, live-demo link, quick start
├── SCOPE.md         # frozen scope
└── ARCHITECTURE.md  # this file
```

Stack: HTML/CSS/vanilla JS (no React, no framework — the approved stack's HTML/CSS/React option is
available but this predates that default and the app has no state complexity that would benefit
from it), localStorage-first persistence, GitHub Pages deployment (static file served directly
from the repo root — no `.github/workflows` build step exists or is needed, since there is nothing
to build). Why no build step: at ~500 lines total, a bundler or component framework would add
tooling weight the project doesn't need; a static file GitHub Pages serves as-is is the boring,
correct answer here.

**State model.** A single mutable object `S` holds all app state, re-rendered wholesale by
`calc()` after every mutation, and persisted to `localStorage` under the key `"shiftPlanner.v5"` on
every `calc()` call (not debounced, no explicit save button — matches SCOPE's "persists
automatically").

`S` shape (seeded from `DEFAULT` on first load or corrupt storage):
```
{
  jobMode: "x",
  jobs:     [{ id, label, wage, hours, pension }],
  bills:    [{ id, label, amount, cat }],   // cat ∈ bills|save|repay|spend
  goals:    [{ id, label, amount, weeks }],
  shifts:   [{ id, jobId, start, end, brk }],
  history:  [{ date, hours, net, coverage }], // coverage snapshot frozen at "New week" time
  settings: { country, customRate, maxDays, hoursPerDay, otherMo }
}
```
`load()` wraps `localStorage.getItem` + `JSON.parse` in try/catch and falls back to a deep clone of
`DEFAULT` on any read/parse failure — malformed storage degrades to seed data rather than crashing.

## 5. Decisions log

Every call embedded in the shipped code that wasn't forced by SCOPE.md or the approved stack.
Written as documentation of what's there, not a re-litigation of it — flagged items need the
human's confirmation that they were intentional (see Handover).

1. **Single HTML file, no build step, no framework.** Why: ~500 lines total; a bundler/framework
   adds ceremony disproportionate to the app's size and change frequency. Reasonable at this
   scale; would need revisiting only if the app grows substantially.
2. **`localStorage` key `"shiftPlanner.v5"` is versioned independently of the product's feature
   version (currently v8).** Why: the trailing number tracks *storage schema* compatibility, not
   shipped features — bump it only when the stored shape changes in a way old data can't survive,
   not on every release. Three feature versions (v6/7/8) have shipped on top of the same schema
   version (v5) without a key bump, confirming the shape has stayed stable.
3. **Tax brackets/rates for all 8 countries are hardcoded as inline JS closures inside the
   `COUNTRIES` object**, not in a separate data file. Why: no build step means no separate
   data-import mechanism; keeping them inline preserves the single-file property. Tradeoff:
   updating a bracket means editing code directly — a real, disclosed maintenance cost (the
   footer already tells users these are "simplified effective-rate estimates").
4. **Effective tax rate is computed against annualized income at the user's full working ceiling**
   (`maxDays × hoursPerDay × 52`), not against the sum of each job's entered "typical hours/week."
   Why (inferred): keeps the feasibility model self-consistent — the resulting net/hr rate feeds
   back into "how many hours are needed," so the rate is calculated as if the person could work up
   to the ceiling. **Flagged for confirmation** — this is a non-obvious modeling choice with real
   effect on the numbers shown (a country with progressive tax brackets will show a materially
   different net/hr depending on whether it's based on ceiling hours vs. typical hours).
5. **`DEFAULT` seed data is realistic personal-looking data** (two named jobs, real-shaped bills, a
   "Visa extension" goal) rather than neutral placeholders. Why (inferred): makes a first-run
   screen feel like a lived-in example rather than a blank form. **Flagged for confirmation** — a
   neutral seed ("Job 1", "Rent") is the more common convention; worth confirming this was
   deliberate and not just leftover test data.
6. **A goal's weekly-hours contribution never expires automatically** — `weeks` is only used to
   divide the amount into a flat per-week figure; there's no date tracked, so a goal keeps adding
   hours indefinitely until the user manually deletes it. This is narrower than the UI's own hint
   text ("Adds extra hours on top, only while it runs"), which implies automatic expiry. **Flagged
   for confirmation** — possible documentation/behavior mismatch, not a SCOPE violation (SCOPE
   itself doesn't require auto-expiry), but worth the human confirming the hint copy or the
   behavior is the one to fix.
7. **Import validates only that the file parses as JSON**, not that the parsed object has the
   expected shape. A parseable-but-malformed file (e.g. `{}`) loads without error and could break
   rendering on the next `calc()`. This satisfies SCOPE's literal wording ("user-facing error on
   an unparseable file") but is narrower than "never crash on bad import." Recorded as a known
   risk, not a scope gap.
8. **No calendar-based weekly rollover.** "This week" is whatever's in `S.shifts` until the user
   clicks "New week" — there's no wall-clock check of which day a week starts or timezone
   handling. Why: keeps the model simple and user-driven rather than making assumptions about week
   boundaries for a self-reported log.

---

## Handover

**Done:** ARCHITECTURE.md written at `/Users/noxus/Builds/Shift Planner/ARCHITECTURE.md`,
documenting the shipped v8 app's real structure: design tokens extracted verbatim from
`index.html`'s `:root`, one-page section map against SCOPE.md's 8 features, 16 functional
components, literal file layout (single `index.html`, no build step), the `S` state object and
`localStorage` key convention, and an 8-item decisions log.

**Assumed:** This is reverse-engineered intent from code that was never explicitly architected up
front, not confirmed design. Specifically assumed (all need human confirmation): (1) the tax-rate
calc's use of ceiling-hours rather than typical-hours as the annualizing basis was a deliberate
consistency choice, not an oversight; (2) the realistic-looking `DEFAULT` seed data (named jobs,
"Visa extension" goal) was a deliberate first-run choice rather than leftover personal test data
that should be neutralized; (3) the "Engineer" design-archetype label is my read of the palette
and layout, not a claim the human ever ran or intended to run the noxus-design-system decision
tree for this project; (4) the goal-never-auto-expires behavior versus the UI's "only while it
runs" copy is an actual mismatch I noticed, not something already known and accepted.

**Risky:** (1) Tax bracket constants are hardcoded per-country with specific thresholds (e.g. UK
personal allowance, US federal brackets) that will drift out of date over calendar years, with no
update mechanism beyond direct code edits. (2) Import only guards against unparseable JSON, not
malformed-but-valid JSON — a corrupt-but-well-formed export could load and then break rendering.
(3) There's a small dead-code duplication in the country `input` handler (`sym=...` assigned
twice in a row) — harmless, but worth a cleanup pass whenever the file is next touched, noted here
so it isn't mistaken for a hidden behavior. (4) Because everything lives in one 500-line file with
no tests, any future edit risks silent regressions in the tax-model math or the coverage waterfall
that wouldn't surface until a user notices wrong numbers.

**Open:** (1) Confirm whether the ceiling-based tax-rate basis (decision #4 above) is intentional
or should instead use typical/actual hours. (2) Confirm whether `DEFAULT` seed data should stay
personal-flavored or be neutralized. (3) Confirm whether the goal-expiry mismatch (decision #6)
should be fixed in copy (drop "only while it runs") or in behavior (add real expiry), or left as
is. (4) Confirm the repo/hosting setup this document describes (separate `shift-planner` repo,
Pages serving from root, no Actions workflow) matches what's actually configured on GitHub, since
I could only verify it from the local checkout and the README's live-demo link.

**Touched:** `/Users/noxus/Builds/Shift Planner/ARCHITECTURE.md` (created). No other files were
modified — `SCOPE.md` and `index.html` were read-only inputs.
