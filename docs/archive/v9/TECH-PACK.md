# TECH-PACK: Shift Planner v9

<!-- RETROACTIVE. This seat (Design Translator) did not exist when v8 or v9 shipped -- v9 shipped
     without a human ever seeing it rendered, and the pre-build UI/UX skills ran once, before the
     build, never against the finished result. This document is written now, for the record, to
     match what would have been produced BEFORE the v9 build, reconstructed from SCOPE.md (frozen
     v9, 6 features), ARCHITECTURE.md's verbatim token extraction (§1) and Pages table (§2), and a
     direct read of the shipped index.html -- same retroactive convention ARCHITECTURE.md already
     uses for its own base sections. It is not a forward spec; nothing here should be read as
     "build this," it documents what a Tech Pack would have said had it existed first. -->

## 0. Inputs consumed (not duplicated here)

- `SCOPE.md` (frozen 2026-07-06, 6 features) -- feature numbers below refer to it directly.
- `ARCHITECTURE.md` §1 (design tokens, verbatim from `index.html :root`), §2 (Pages table, which
  v9 feature touches each section), §4 (state shape, file layout). This document adds the
  layout/arrangement and state-by-state visual detail ARCHITECTURE.md doesn't cover; it does not
  re-list `S`'s data shape, `model()`'s math, or the file tree -- see ARCHITECTURE.md for those.
- No separate design-token doc exists (predates the noxus-design-system skill) -- tokens are
  taken as extracted in ARCHITECTURE.md §1, not re-derived or re-picked here.

## 1. Layout, per section (scroll order) -- and which SCOPE feature it serves

Single scrolling page, `.wrap` max-width 980px. Two responsive breakpoints: `.cols` (the two-column
earn/spend grid) collapses to one column under 760px; `.two` and `.goalgrid` collapse under 480px.
All panels are `.card` (`--panel` bg, `--r` 14px radius, 1px `--line` border, 18px padding).

| # | Section | Arrangement | Feature(s) |
|---|---|---|---|
|1| Header | Eyebrow + H1 + lede, left-aligned; toolbar row below (Export / Import / Reset, Reset pushed right via `margin-left:auto`); inline import-error slot beneath, collapsed by default | 5, 6 |
|2| Country/currency picker | Full-width card, label + `<select>` left, conditional "Flat rate %" field right (only when country = "Flat % (custom)") | 1, 2 |
|3| Two-column grid: **left stack** = Jobs, Working ceiling, Other income; **right stack** = Outgoings, Goals, Take-home summary | Each stack is `.stack` (14px gap) of full-width `.card`s, one column on mobile | see rows 4-9 |
|4| Jobs panel | Header row (label + "+ Job" button) then one card per job: role field + trash icon on one row, rate/hrs/pension as a 3-col grid below | 2, 6 |
|5| Working ceiling panel | 2-col grid (max days / max hrs) + computed ceiling line below | -- |
|6| Other income panel | Single currency input | -- |
|7| Outgoings panel | Header row + "+ Item" then one row per bill (label / category select / amount / trash), running total, category chips below | 6 |
|8| Goals panel | Header row + "+ Goal" then one row per goal (label / amount / weeks / trash) in a 4-col grid | 4, 6 |
|9| Take-home summary | Gross/hr row, deduction-breakdown list (bordered top+bottom), net/hr row emphasized (accent colour, larger size) | 1, 2, 3 |
|10| Headline / feasibility panel | Full-width card, label, large `.hero-num` figure, two-pill breakdown (Baseline / Goals), one-line coloured verdict | 3 |
|11| Hour-breakdown donut ("where every hour goes") | Full-width card, inline SVG donut + legend list side-by-side (stacks vertically, centered, under 480px) | 1, 2 |
|12| Baseline + Goals, two-column | Left: 4 stat rows + emphasized hours/week row. Right: one row per goal with its hrs/wk contribution | 1-4 |
|13| Reality bar | Full-width card, single stacked horizontal bar (baseline segment + goal segment) + legend/percentage line below | 3 |
|14| Shift log | Header row ("This week's shifts" + New-week/+Shift buttons) → pace stats block → shift cards → banked-week history, all nested in one card | 4, 5, 6 |
|15| Footer disclaimer | Centered small muted text, fixed copy | 1 |

## 2. States

This app has no async data fetching (localStorage only, read synchronously on load) -- **no
component in this app has a genuine "loading" state**; that column is intentionally omitted below
rather than invented. Every component below has real Empty and/or Error states beyond its happy
path; anything not listed has exactly one visual state (e.g. Working ceiling, Other income).

| Component | Empty | Error | Normal/success |
|---|---|---|---|
| Import toolbar | inline slot hidden (`display:none`) | inline `--warn`-coloured text: "Couldn't read that file: it isn't valid JSON." / "That file doesn't look like a Shift Planner export. Nothing was changed." (feature 5) | slot stays hidden, no confirmation toast (a successful import is silent, re-render is the confirmation) |
| Reset | -- | -- | native `confirm()` dialog gate (only non-inline confirmation pattern in the app -- flagged, see Assumed) |
| Country picker | -- | -- | custom-rate field hidden unless country = "Flat %", else shown |
| Jobs list | **gap**: zero jobs renders an empty grid with no message (no "add your first job" empty state exists) -- see Risky | -- | one card per job |
| Outgoings list | **gap**: same as jobs -- zero bills renders nothing, no message | -- | one row per item + running total + category chips |
| Goals list | "No one-off goals." centered muted text (feature 4 area, pre-existing) | -- | one row per goal; **expired sub-state**: row opacity 0.6 + "Expired" `.pill` (`--warn`-tinted bg/text), reusing existing pill primitive, feature 4 |
| Take-home summary | "No deductions" muted text when `perHrComps` is empty | -- | deduction list + emphasized net/hr figure |
| Headline panel | **net<=0**: neutral flat background, muted "Add a job with an hourly rate to see your numbers.", no hours/verdict shown at all (feature 3's empty-state fix) | (Infinity/NaN guarded, not a visible error state -- prevented from ever rendering, feature 3) | 3-tier verdict by hours/week: sustainable (teal/`--accent`), heavy (`--amber`), brutal/over-ceiling (`--warn`), each with matching card background tint |
| Hour-breakdown donut | **gross<=0**: empty SVG, muted "Add a job with an hourly rate to see the breakdown." | -- | donut + legend, deduction slices first then category slices |
| Baseline panel | **net<=0**: all four stat values show "—" | -- | 4 stat rows + emphasized hrs/week |
| Goals panel (`goalRows`) | **net<=0**: "Add a job with an hourly rate to see goal hours." / **no goals**: "No goals, baseline is your whole number." | -- | one row per goal, hrs/wk contribution; expired rows show the same pill + 0.6 opacity + "0.0 h/wk" (feature 4) |
| Reality bar | **net<=0**: "Nothing to check yet. Add a job with an hourly rate." | -- | stacked bar, headroom text (muted) vs over-ceiling text (`--warn`, bold) |
| Shift log | "No shifts logged this week." centered muted text (feature 5: `alert()` removed, this pre-existing message is the answer) | -- | one card per shift, computed hrs + net pay per card |
| Pace panel | hidden entirely when no shifts logged | -- | **net<=0 with shifts logged**: "Add a job with an hourly rate to see your pace." / normal: 3 stats + ahead (`--accent`) / short (`--warn`) verdict + coverage bar |
| Week-history panel | renders nothing (no message) when `S.history` is empty | -- | one card per banked week, frozen coverage bar + legend + "reached N of M obligations" line |

## 3. Forking decisions flagged (not resolved here)

Per this agent's own non-responsibilities: a design-translator seat existing pre-build would have
flagged these as multi-prototype forks rather than letting the Builder settle them alone. Both were
in fact settled solo (no seat existed) -- named here for the record, not re-opened:

1. **Expired-goal visual treatment** (feature 4). Landed as: 60%-opacity row + reused `.pill`
   component in `--warn`. Reasonable, but genuinely one of several directions (strikethrough,
   separate "expired" sub-list, a dedicated banner) -- ARCHITECTURE.md's own Decisions log item 6
   already flags this as "closest existing pattern," not a forced reading of SCOPE. This is exactly
   a `noxus-design-prototypes` candidate.
2. **Delete-icon choice, trash vs. plain X** (feature 6). Landed as: trash icon (Lucide-sourced
   inline SVG). A reasonable, narrow call, but still a style pick beyond SCOPE's literal wording
   (ARCHITECTURE.md Assumed item 2) -- lower-stakes than #1, still a fork in principle.

## 4. Gaps found relative to what a pre-build Tech Pack should have required

Two true empty states are missing from the shipped build and were never called out because no
Tech Pack existed to name them as required deliverables: **Jobs list with zero jobs**, and
**Outgoings list with zero items** both render silently blank rather than a message (contrast with
Goals list and Shift log, which do have one). Neither maps to any of SCOPE v9's six features, so
this is not a v9 defect to send back to the Builder -- it's a pre-existing v8-era gap this
retroactive pass surfaces for a future version's scope, not something to act on now.

---

## Handover

**Done:** Reconstructed `TECH-PACK.md` at `/Users/noxus/Builds/Shift Planner/TECH-PACK.md`,
retroactively, from frozen `SCOPE.md` v9, `ARCHITECTURE.md` (tokens §1, Pages table §2), and a full
read of the shipped `index.html`. Covers all 15 scroll-order sections, states for every component
that has more than one, SCOPE-feature mapping per section, two forking decisions flagged (expired-
goal treatment, delete-icon choice) that should have gone through `noxus-design-prototypes` had this
seat existed pre-build, and two pre-existing empty-state gaps (Jobs/Outgoings with zero rows) found
while cataloguing states, out of v9's scope.

**Assumed:** (1) The Reset button's native `confirm()` dialog is the app's only non-inline
confirmation pattern; documented as a state but not flagged as a defect since SCOPE v9's criteria
only call out `alert()` for bad-import and no-shifts, not `confirm()` for destructive reset -- worth
the human's awareness, not treated as in-scope. (2) "Loading" states are genuinely inapplicable
(no async fetch anywhere) rather than an oversight on my part -- confirmed by reading `load()`
(synchronous `localStorage.getItem` + `JSON.parse`) directly. (3) Read `index.html` as the
ground truth for realized layout over ARCHITECTURE.md's prose where the two could be read slightly
differently (e.g. exact grid column counts) -- ARCHITECTURE.md is data/behavior-focused and wasn't
trying to be a layout spec, so no conflict, just a different lens.

**Risky:** (1) Jobs-list and Outgoings-list zero-state gap: cosmetic today (a near-empty grid, not
a crash), but if a future version's scope ever removes `DEFAULT`'s seed data (ARCHITECTURE.md
Decisions log item 5, still open) a genuinely empty state becomes reachable on first load for every
new user, not just an edge case -- worth surfacing before that decision is made, not after. (2)
This document is written after the fact against a codebase that already reflects the "post-build"
outcome; because there was no independent pre-build layout intent to check the shipped result
against, this Tech Pack cannot by itself catch a mismatch between "what was designed" and "what
shipped" the way it would on a forward project -- it can only document what shipped and flag gaps
found along the way, which is a materially weaker guarantee than the seat's normal pre/post pairing
provides.

**Open:** (1) Whether the two flagged forking decisions (expired-goal treatment, delete-icon
choice) are worth a retroactive multi-prototype pass now, or simply carried forward as documented
precedent for v10 -- human's call. (2) Whether the Jobs/Outgoings zero-row gap should be added to
v10's candidate list (alongside the items already in SCOPE v9's "NOT doing" section) or left as
documented-but-unscheduled. (3) This retroactive Tech Pack has not been walked through with the
human against the live build (that's the post-build role's job, gated on a SHIP-READY
`QA-REPORT.md`, which does not yet exist for v9 in this workspace) -- no design sign-off has been
sought or obtained here; this document is the pre-build half only.

**Touched:** `/Users/noxus/Builds/Shift Planner/TECH-PACK.md` (created). Read-only inputs:
`/Users/noxus/Builds/Shift Planner/SCOPE.md`, `/Users/noxus/Builds/Shift Planner/ARCHITECTURE.md`,
`/Users/noxus/Builds/Shift Planner/index.html`. No code modified.
