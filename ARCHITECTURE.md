# ARCHITECTURE: Shift Planner

<!-- RETROACTIVE, ORIGINALLY. Shift Planner v8 already shipped and was live at
     gmanthenoxus.github.io/shift-planner before this document existed. The base document was not
     a forward design — it documented the real, existing shape of the app, extracted directly from
     index.html, so the Build Org's governance could wrap around a working product.

     REVISED FOR v9 (2026-07-06). SCOPE.md v9 froze six fix-only features (tax corrections,
     tax-basis change, Infinity/empty-state fix, goal auto-expiry, import hardening, a11y/touch
     fixes) against TAX-ACCURACY-AUDIT.md and the human's own resolutions of the two forks v8's
     scoping had left open (tax-rate basis, goal-expiry behavior). This revision updates the
     sections those six features touch and resolves the two decisions-log entries v9 settles.
     Everything else below is unchanged from the shipped v8 structure — v9 adds no pages, no
     components, and no new files; it corrects behavior inside what already exists. Where a v9 call
     isn't forced by SCOPE's wording, it's flagged below and in the Handover for the human to
     confirm before the Builder proceeds, same discipline as the original document. -->

## 1. Design tokens (verbatim, extracted from index.html `:root`)

No separate design-token doc exists for this project (it predates the noxus-design-system
skill). These are the actual custom properties in the shipped file, copied as-is. Unchanged by
v9 — no visual redesign in scope.

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

**v9 addition to the token vocabulary (reused, not new):** the existing `--warn` (errors,
over-ceiling states) and the existing `.pill` component pattern (small rounded label chips, already
used for the Baseline/Goals headline pills) are the two visual primitives v9's new states borrow —
the expired-goal indicator and the bad-import message both reuse these rather than introducing new
colours or components. See Decisions log items 6 and 7.

## 2. Pages

One page. `index.html` is the entire app — a single scrolling document, no routing, no separate
screens. v9 adds no sections and removes none; it's a fix-only version (confirmed by SCOPE's own
NOT-doing list), so every row below is pre-existing structure. The right column now shows which
v9 feature (if any) changes that section's behavior — a blank means v9 doesn't touch it.

| Section (scroll order) | v9 feature(s) touched |
|---|---|
| Header + toolbar (export/import/reset) | 5 (import validation + inline error), 6 (export/import icon + aria-label) |
| Country/currency picker | 1 (corrected per-country brackets), 2 (annualizing basis) |
| Jobs panel | 2 (typical-hours basis), 6 (role field label, delete-icon a11y) |
| Working ceiling panel | — (still the feasibility ceiling; explicitly *not* the tax-basis input as of v9 — see feature 2) |
| Other income | — |
| Monthly outgoings | 6 (delete-icon a11y) |
| One-off goals | 4 (auto-expiry), 6 (delete-icon a11y) |
| Take-home summary (gross/deductions/net per hour) | 1, 2, 3 (empty state when net/hr is 0) |
| Headline / feasibility verdict | 3 (Infinity/NaN guard + empty state) |
| Hour-breakdown donut ("where every hour goes") | 1, 2 (feeds off corrected `perHrComps`) |
| Baseline panel | 3 (Infinity display guard) |
| Goals panel | 4 (expired goals shown, not silently zeroed) |
| Reality bar | 3 (Infinity/NaN guard) |
| Shift log + pace panel | 5 (no-shifts message becomes a no-op, not `alert()`), 6 (icon buttons, touch targets, focus states) |
| Week-history panel | — |

## 3. Components

Real functional blocks as they exist in the code (function names in parens where the code names
them). One line each: what it renders, what data it reads. Lines marked **[v9]** describe the
post-fix behavior; everything else is unchanged from v8.

- **Header toolbar** — export/import/reset buttons; reads/writes the whole `S` object. **[v9]**
  Export/Import buttons keep their visible text label but the arrow glyph becomes a real SVG icon
  (see Decisions log item 9); both get an explicit `aria-label` regardless of the visible text
  (SCOPE's literal criterion). A new inline message element sits under the toolbar, shown only when
  an import is rejected (see import-hardening notes on the Header toolbar and Decisions log item
  6).
- **Country/currency picker** — `<select>` of 9 countries + "Flat % (custom)"; toggles the custom
  rate input; reads/writes `S.settings.country`, `S.settings.customRate`. **[v9]** Feeds corrected
  per-country brackets (feature 1) and the new typical-hours annualizing basis (feature 2); no
  structural change to the component itself.
- **Job list** (`renderJobs`) — one card per job: label, rate/hr, typical hrs/wk, pension %, delete;
  reads/writes `S.jobs[]`. **[v9]** The "Role" (label) field gets a visible `<label class="label">`
  matching its siblings (currently only a placeholder, no label — the a11y gap feature 6 calls
  out). Delete button becomes a real SVG icon with `aria-label="Delete job"` (job-specific, not a
  generic "Delete"), sized to at least 44×44px.
- **Working ceiling panel** — max days/week, max hours/day inputs, computed ceiling display; reads
  `S.settings.maxDays`, `S.settings.hoursPerDay`. Unchanged — still the feasibility ceiling used by
  the reality bar/headline, unrelated to the tax-rate annualizing basis after feature 2 (see
  Decisions log item 4).
- **Other income input** — single currency field; reads/writes `S.settings.otherMo`. Unchanged.
- **Monthly outgoings list** (`renderBills`) — one row per item (label, category select, amount,
  delete), running total, per-category chip totals; reads/writes `S.bills[]`. **[v9]** Delete
  button becomes a real SVG icon with `aria-label="Delete outgoing"`, sized to at least 44×44px.
- **One-off goals list** (`renderGoals`) — one row per goal (label, amount, weeks, delete); reads/
  writes `S.goals[]`. **[v9]** Goal objects gain an `addedAt` field (see section 4's state shape).
  An expired goal (elapsed weeks since `addedAt` ≥ its `weeks`) renders with a muted/greyed row
  style plus an "Expired" `.pill` (reusing the existing pill component, `--warn`-coloured) instead
  of its normal appearance — it is not removed from the list, stays editable and deletable, exactly
  per SCOPE's criterion. Delete button becomes a real SVG icon with `aria-label="Delete goal"`,
  sized to at least 44×44px.
- **Take-home summary** — blended gross/hr, per-hour deduction breakdown list, net take-home/hr;
  reads the computed `model()` output. **[v9]** Reflects corrected brackets (feature 1) and the
  typical-hours annualizing basis (feature 2); when net/hr is 0 (no job with both a rate and hours
  entered), this panel and the headline/reality-bar area show the feature-3 empty state instead of
  a broken number.
- **Headline/feasibility panel** — hero number (total hrs/week + days/week), baseline-vs-goals
  pills, colour-coded verdict text (sustainable/heavy/brutal/over-ceiling); reads `model()`. **[v9]**
  No path in `model()`'s hour math may render the literal strings "Infinity" or "NaN" — every
  divide-by-zero case (net = 0, maxWeekly = 0, hpd = 0) must resolve to the existing empty-state
  message, not a raw computed value.
- **Hour-breakdown donut** (`renderClock`) — inline SVG donut + legend; slices one hour of gross
  pay into deduction components then spend categories by proportional monthly share; reads
  `model().perHrComps` and `S.bills` category totals. Already guards `gross<=0` with an empty
  state; unchanged structurally, benefits from corrected upstream numbers.
- **Baseline panel** — net/gross/hours needed per month and per week; reads `model()`. **[v9]** Same
  Infinity/NaN guard as the headline panel.
- **Goals panel** (`goalRows`) — one row per goal with its extra hrs/week; reads
  `model().goalCalc`. **[v9]** An expired goal's row shows the same "Expired" pill treatment as the
  goals list and its hours contribution reads as `0` (or "—"), not a stale computed figure, since
  expired goals no longer feed `goalHrsWkNow`.
- **Reality bar** — stacked bar (baseline hours + goal hours vs ceiling) with headroom/over text;
  reads `model()`. **[v9]** Same Infinity/NaN guard.
- **Shift log** (`renderShifts`) — one card per logged shift (job select, start, end, break
  minutes, computed hours + net pay, delete), "+ Shift" and "New week" buttons; reads/writes
  `S.shifts[]`, reads `S.jobs` for rate lookup. **[v9]** Delete button becomes a real SVG icon with
  `aria-label="Delete shift"`, sized to at least 44×44px. The "New week" button's `alert()` on zero
  shifts is removed outright, not replaced with a new message — this component already renders "No
  shifts logged this week." inline whenever `S.shifts` is empty, so the click becomes a no-op and
  the pre-existing empty state is the message (see Decisions log item 6). Its own icon (↻) becomes
  a real SVG with `aria-label="Bank this week and start a new one"`.
- **Pace panel** — earned-this-week / needed-this-week / hours-worked stats, ahead/short verdict,
  this-week's coverage waterfall bar + legend; computed live from `S.shifts` and `model()`. **[v9]**
  Expired goals drop out of the coverage waterfall's items too (an expired goal isn't "running," so
  it shouldn't still claim weekly coverage priority — see `weekCoverage()` note in section 4).
- **Week-history panel** (`renderHistory`) — last 6 banked weeks, each with its own stored coverage
  bar and legend; reads `S.history[]` (each entry carries a frozen `coverage` snapshot taken at
  bank time, per the "history is read-only" NOT-doing item in SCOPE). Unchanged.

## 4. File layout

Literal, current, root of the `shift-planner` repo. Unchanged by v9 — no new files, no build step
introduced:

```
Shift Planner/
├── index.html               # entire app: HTML + <style> (all CSS) + <script> (all JS), one file
├── README.md                # user-facing description, live-demo link, quick start
├── SCOPE.md                 # frozen scope (v9)
├── TAX-ACCURACY-AUDIT.md     # source of truth for feature 1's corrected per-country figures
└── ARCHITECTURE.md           # this file
```

Stack: HTML/CSS/vanilla JS (no React, no framework — the approved stack's HTML/CSS/React option is
available but this predates that default and the app has no state complexity that would benefit
from it), localStorage-first persistence, GitHub Pages deployment (static file served directly
from the repo root — no `.github/workflows` build step exists or is needed, since there is nothing
to build). Why no build step: at ~500 lines total, a bundler or component framework would add
tooling weight the project doesn't need; a static file GitHub Pages serves as-is is the boring,
correct answer here. **This constraint is directly in tension with feature 6's icon-library
requirement — see Decisions log item 9, an open question the human needs to confirm before the
Builder starts on that feature.**

**State model.** A single mutable object `S` holds all app state, re-rendered wholesale by
`calc()` after every mutation, and persisted to `localStorage` under the key `"shiftPlanner.v5"` on
every `calc()` call (not debounced, no explicit save button — matches SCOPE's "persists
automatically"). **v9 does not bump this key** — see Decisions log item 10.

`S` shape (seeded from `DEFAULT` on first load or corrupt storage). **v9 change: goals gain an
`addedAt` field**, marked below:
```
{
  jobMode: "x",
  jobs:     [{ id, label, wage, hours, pension }],
  bills:    [{ id, label, amount, cat }],   // cat ∈ bills|save|repay|spend
  goals:    [{ id, label, amount, weeks, addedAt }],   // [v9] addedAt: epoch ms, set at creation
  shifts:   [{ id, jobId, start, end, brk }],
  history:  [{ date, hours, net, coverage }], // coverage snapshot frozen at "New week" time
  settings: { country, customRate, maxDays, hoursPerDay, otherMo }
}
```
`load()` wraps `localStorage.getItem` + `JSON.parse` in try/catch and falls back to a deep clone of
`DEFAULT` on any read/parse failure — malformed storage degrades to seed data rather than crashing.
**[v9]** After `load()` (and after a successful import), any goal missing `addedAt` is backfilled
with the current time, treating pre-v9 data (or a v9 export from before this field existed) as
"just added" rather than instantly expired — see Decisions log item 10.

**Goal expiry computation [v9, feature 4].** No new library, just arithmetic against the new field:
elapsed weeks since a goal was added = (current time − `addedAt`) ÷ (one week in milliseconds). A
goal is expired once its elapsed weeks is greater than or equal to its stored `weeks` value.
Expired goals: (a) contribute zero to `goalHrsWkNow` (the total extra hours goals add on top of
baseline) rather than their normal `hrsWk` figure, and (b) are excluded from `weekCoverage()`'s
waterfall items (an expired goal isn't "running," so it shouldn't still claim a weekly coverage
slot in the pace panel or a banked week's history) — but the goal object itself stays in
`S.goals[]` untouched until the user deletes it.

**Tax-rate annualizing basis [v9, feature 2].** Two existing computations inside `model()` move
from the working-ceiling basis to the typical-hours basis, and must move together to stay
internally consistent:
- The `annual` gross figure (currently `blended × maxWeekly × 52`, where `maxWeekly` is the working
  ceiling `maxDays × hoursPerDay`) is recomputed as `blended × totH × 52`, where `totH` is the sum
  of every job's entered "typical hrs/wk" — a value `model()` already computes earlier for the
  blended-rate calculation, so no new input or field is needed.
- The `annualHours` divisor (currently `maxWeekly × 52`, used to convert each country's computed
  annual deduction back into a per-hour figure for the deduction-breakdown and hour-clock displays)
  must move to the same basis (`totH × 52`). If only the first line moved, the resulting tax total
  would be computed against typical-hours income but then divided back out over ceiling hours,
  producing a self-contradictory per-hour breakdown — this is a two-line change, not a one-line
  change, precisely because both figures have to share one basis.
- `maxWeekly` keeps its separate, unrelated role everywhere else (working-ceiling display, the
  reality bar's headroom/over-ceiling math, the headline's feasibility verdict) — those are
  unaffected by this change and stay ceiling-based, since they're answering a different question
  ("how many hours could this person work") than the tax basis is ("what income are they actually
  being taxed on").
- Net effect: net/hr for countries with progressive brackets changes whenever a person's summed
  typical hours differ from their working ceiling — which is the common case, and is SCOPE's
  explicit, confirmed intent (feature 2's criteria), not a side effect to guard against.

**Import validation [v9, feature 5].** "Expected shape" means a concrete, cheap top-level check
before any assignment to `S`: the parsed result must be a non-null object, and `jobs`, `bills`,
`goals`, `shifts`, `history` must each be present and be Arrays; `settings` must be present and be
a plain object. (Per-item/per-field validation inside each array is not added — SCOPE's wording
asks for shape rejection, not statutory-level validation, and every existing reader already coerces
individual fields defensively, e.g. `+j.wage||0`; the actual crash risk was always the top-level
shape, since `renderJobs`/`renderBills`/etc. call `.forEach` directly on these fields and would
throw immediately if one were missing or the wrong type.) On any check failing: the import is
rejected outright, `S` is left completely untouched (no partial merge), and an inline message
communicates this — reusing the app's existing muted/centered small-text empty-state visual
pattern (see Decisions log item 6 for exactly where that message lives).

## 5. Decisions log

Every call embedded in the shipped code (or newly made for v9) that wasn't forced by SCOPE.md or
the approved stack. Items 1, 2, 3, 5, 8 are unchanged from v8. Items 4, 6, 7 were flagged open in
the v8 version of this document and are now resolved by SCOPE v9 — entries rewritten below to
record the resolution, not left as open flags. Items 9 and 10 are new for v9.

1. **Single HTML file, no build step, no framework.** Why: ~500 lines total; a bundler/framework
   adds ceremony disproportionate to the app's size and change frequency. Reasonable at this
   scale; would need revisiting only if the app grows substantially. **v9 note:** this decision is
   now in direct tension with feature 6's icon-library requirement — see item 9.
2. **`localStorage` key `"shiftPlanner.v5"` is versioned independently of the product's feature
   version (currently v9).** Why: the trailing number tracks *storage schema* compatibility, not
   shipped features — bump it only when the stored shape changes in a way old data can't survive,
   not on every release. Four feature versions (v6/7/8/9) have now shipped on top of the same
   schema version (v5) without a key bump; v9's `addedAt` addition keeps that streak because it's
   designed to be backfill-safe (see item 10) rather than requiring a hard migration.
3. **Tax brackets/rates for all 9 countries are hardcoded as inline JS closures inside the
   `COUNTRIES` object**, not in a separate data file. Why: no build step means no separate
   data-import mechanism; keeping them inline preserves the single-file property. Tradeoff:
   updating a bracket means editing code directly — a real, disclosed maintenance cost (the
   footer already tells users these are "simplified effective-rate estimates"). **v9 note:** this
   is exactly the pattern feature 1's corrections apply against (edit the inline figures to match
   `TAX-ACCURACY-AUDIT.md`) and the pattern item 9 recommends reusing for icon markup.
4. **RESOLVED in v9 (feature 2). Tax-rate annualizing basis changes from the working ceiling to
   summed typical hours.** v8's version of this entry flagged the ceiling-based basis
   (`maxDays × hoursPerDay × 52`) as an unconfirmed modeling choice needing human sign-off. SCOPE
   v9 explicitly settles it: the basis is now each job's own entered "typical hrs/wk," summed
   across jobs (`totH`) — not the working ceiling. See section 4's "Tax-rate annualizing basis"
   note for exactly which two computations in `model()` move and why they must move together. This
   is now a confirmed, deliberate change per SCOPE's own criteria wording ("expected and correct"),
   not an open flag.
5. **`DEFAULT` seed data is realistic personal-looking data** (two named jobs, real-shaped bills, a
   "Visa extension" goal) rather than neutral placeholders. Why (inferred): makes a first-run
   screen feel like a lived-in example rather than a blank form. Still flagged for confirmation —
   SCOPE v9 doesn't address this (it's explicitly listed as a NOT-doing item, "a content decision...
   needs your call independent of this fix-focused version"), so it carries forward unresolved,
   on purpose, not by oversight.
6. **RESOLVED in v9 (feature 4). Goals now auto-expire for real, closing the gap with the UI's
   "only while it runs" hint text.** v8's version of this entry recorded a mismatch: `weeks` was
   only used to divide a goal's amount into a flat per-week figure, with no expiry tracking, so a
   goal contributed hours indefinitely — narrower than what the hint text promised. SCOPE v9
   requires real expiry rather than a copy fix. Implementation approach: add `addedAt` to the goal
   object (see section 4's state shape and expiry-computation notes) and compute elapsed weeks from
   it; an expired goal stops contributing extra hours (both to `goalHrsWkNow` and to
   `weekCoverage()`'s waterfall) but stays visible, shown with a muted row style plus an "Expired"
   `.pill` (reusing the app's existing pill component and `--warn` colour token — no new visual
   component invented) rather than vanishing, so the user knows it ran out and can delete or
   re-add it, per SCOPE's explicit criterion. The hint copy itself ("only while it runs") no longer
   needs changing — it's now accurate.
7. **RESOLVED/expanded in v9 (feature 5). Import now validates top-level shape, not just JSON
   parseability, and both blocking `alert()`s are gone.** v8's version of this entry recorded that
   import only guarded against unparseable JSON, leaving a parseable-but-malformed file
   (e.g. `{}`) free to load and break rendering — a known risk, not a scope gap, at the time.
   SCOPE v9 requires the shape itself be checked. See section 4's "Import validation" note for the
   concrete top-level key/type checks and the reject-and-leave-`S`-untouched behavior. The "bad
   import" message and the "no shifts logged" message (previously both `alert()` calls) are handled
   two different ways, deliberately not identically: the bad-import message is genuinely new
   information at an unpredictable moment (file picked, then rejected), so it gets one small new
   inline element near the import control, using the app's existing muted-small-text empty-state
   visual language (not a new modal/toast pattern). The no-shifts-logged case already has a
   permanently-visible inline message — `renderShifts()` shows "No shifts logged this week." inline
   whenever `S.shifts` is empty — so its `alert()` is simply removed and the "New week" click
   becomes a silent no-op; the pre-existing empty state already answers "why is there nothing to
   bank," and adding a second, separate message next to it would duplicate what's already on
   screen rather than fixing anything.
8. **No calendar-based weekly rollover.** "This week" is whatever's in `S.shifts` until the user
   clicks "New week" — there's no wall-clock check of which day a week starts or timezone
   handling. Why: keeps the model simple and user-driven rather than making assumptions about week
   boundaries for a self-reported log. Unaffected by v9 — goal expiry (item 6) uses real elapsed
   time against `addedAt`, which is a different clock than the shift-log's user-driven "week."
9. **NEW, v9 (feature 6). OPEN — flagged for human confirmation before the Builder starts this
   feature.** How to bring "one real icon library" into a single-file, zero-dependency,
   no-build-step app. The approved stack already sanctions using one proper icon library (Lucide or
   Phosphor); what it doesn't settle is the delivery mechanism, and every standard mechanism costs
   something this project has explicitly avoided: an `npm install` + bundler pipeline directly
   contradicts item 1 (no build step); a CDN `<script src>` tag would be the app's first-ever
   external network dependency (it currently makes zero network calls and works fully offline,
   true since v6). **Recommended approach:** inline the small, fixed set of icons v9 actually
   needs (delete/trash, export/download, import/upload, new-week/refresh — four icons, all four
   already named in SCOPE's own criteria) as literal SVG `<path>` markup, copied directly from
   Lucide's real, MIT-licensed source icons, into the existing render functions' template strings —
   the same "inline, no separate data file" convention the app already uses for the `COUNTRIES` tax
   data (item 3), applied to icon markup instead of tax brackets. This satisfies "one library" (every
   path traces to a single named, real icon set, not an ad hoc mix) while adding zero dependencies,
   zero network calls, and zero build tooling. This is a genuine structural call, not one SCOPE's
   wording forces a single answer to — confirm with the human before any icon markup is written.
10. **NEW, v9 (feature 4/state model). Goals missing `addedAt` are backfilled with "now," not
    treated as expired, and this does not bump the storage key.** Why: per item 2's own
    convention, the key bumps only when old data "can't survive" the new shape. A goal saved before
    v9 (or exported from a pre-v9 session and imported later) has no `addedAt`, but stamping it with
    the current time on load makes it behave exactly like a freshly-added goal rather than
    appearing expired the instant the user opens v9 — deliberately generous to existing users, and
    consistent with the "shape stayed forward-compatible across v6-v8" precedent item 2 already
    documents.

---

## Handover

**Done:** Revised `ARCHITECTURE.md` at `/Users/noxus/Builds/Shift Planner/ARCHITECTURE.md` for
SCOPE v9 (frozen 2026-07-06), against `TAX-ACCURACY-AUDIT.md` and the current `index.html`. Kept
the design-tokens, file-tree, and most component descriptions from the v8 version (still accurate,
v9 adds no pages/files). Edited: the Pages table (now shows which v9 feature touches each existing
section, since v9 is fixes-only and adds nothing new); the Components list (v9-tagged behavior
changes on ~9 of 15 components); the state-shape block (added `goals[].addedAt`); a new
"Tax-rate annualizing basis" note documenting precisely which two `model()` computations
(`annual` and `annualHours`) move from the ceiling (`maxWeekly`) to summed typical hours (`totH`)
and why both must move together; a new "Goal expiry computation" note (elapsed-weeks formula
against `addedAt`, what "expired" excludes it from); a new "Import validation" note (concrete
top-level key/type checks, reject-and-leave-untouched behavior); and the Decisions log — items 4,
6, and 7 rewritten from open flags to resolved entries citing the specific SCOPE v9 feature that
resolved them, plus two new items (9: the icon-library delivery mechanism, left genuinely open; 10:
the `addedAt` backfill convention, resolved and documented).

**Assumed:** (1) `addedAt` should be an epoch-millisecond timestamp (`Date.now()`-style), not an
ISO date string — functionally equivalent for the elapsed-weeks arithmetic, epoch ms is simpler to
diff; flagging in case the human prefers a human-readable stored value for easier manual
inspection/debugging of exported JSON. (2) Delete buttons should use a trash/delete icon rather than
a bare "X" — more semantically correct for "permanently remove this item" than a close/dismiss
icon, but the app's current visual language uses a plain "✕" glyph everywhere, so this is a small
upgrade beyond the literal ask, not a forced reading of SCOPE. (3) Expired goals get a `.pill`-style
"Expired" badge specifically (reusing the existing pill component) rather than some other visual
treatment — chosen because it's the closest existing pattern to "small state label," not because
SCOPE specifies pill-shaped UI. (4) Bad-import rejection discards the entire import and leaves `S`
untouched (no partial/best-effort merge of the valid-looking parts) — the more conservative, more
predictable reading of "rejected... not a silent load that can break rendering." (5) The
"no-shifts-logged" fix is a no-op click plus reliance on the pre-existing empty state, not a new
message element — read as the more literal application of "reuse the existing empty-state pattern"
instruction, but flagging since a stricter reading of SCOPE's "both display inline" wording could
be read as wanting an equally new, equally explicit message in both cases. (6) Top-level import
validation checks only the five array fields and `settings`'s presence/type, not `jobMode` (present
in `DEFAULT` but never read or written anywhere else in the code — appears to be vestigial) — not
validating a dead field seemed correct rather than a gap.

**Risky:** (1) The tax-basis change (feature 2) is documented as a two-line `model()` edit
(`annual` and `annualHours` moving together) based on tracing the current code; if the Builder
finds a third place that silently assumes the ceiling-basis annual figure, that needs to surface
back here, not get silently patched around. (2) Feature 1's corrected figures are extensive (all
9 countries, several structural bracket-loop fixes per `TAX-ACCURACY-AUDIT.md`) — this document
doesn't re-derive or re-verify those figures, it points at the audit as the source of truth; a
transcription error going from audit to code is a real risk the Breaker should specifically check
line-by-line against the audit, not just spot-check. (3) Goal-expiry migration: an old export
missing `addedAt`, imported into a v9 session, gets backfilled to "now" — meaning a genuinely old,
long-running goal that should already be expired will incorrectly get a fresh clock. This is a
one-time, edge-case cost of choosing the generous backfill in item 10 over a stricter "assume
already expired" default; worth the human's awareness even though it's not being flagged as an
open question (the generous default seems clearly better for anyone with in-progress goals). (4)
The icon-inlining approach in item 9, if approved, adds a small ongoing maintenance surface (hand-
copied SVG path data with no package-manager-driven update path) — acceptable at 4 icons, would
need re-thinking if the icon count grows materially in a future version.

**Open:** (1) ~~Icon-library delivery mechanism~~ — **CONFIRMED by human 2026-07-06: inline
Lucide-sourced SVG paths**, no dependency, no build step, per Decisions log item 9's recommendation.
(2) ~~`addedAt` stored format~~ — **CONFIRMED: epoch milliseconds.** (3) ~~"Expired" pill /
trash-icon-for-delete choices~~ — **accepted as reasonable defaults, no objection raised.** (4)
~~Reject-entire-import vs. partial merge~~ — **CONFIRMED: reject entirely, leave existing data
untouched**, per Decisions log item 7's conservative reading. (5) `DEFAULT` seed data (item 5) and
the noxus-design-system archetype label remain open from the v8 version of this document, unrelated
to v9 — carried forward, not re-raised as new, no action needed before the Builder starts.

**Touched:** `/Users/noxus/Builds/Shift Planner/ARCHITECTURE.md` (revised in place). No other files
modified — `SCOPE.md`, `TAX-ACCURACY-AUDIT.md`, and `index.html` were read-only inputs.
