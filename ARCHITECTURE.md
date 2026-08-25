# ARCHITECTURE: Shift Planner 2.0

Architect pass, 2026-08-19, against `SCOPE.md` 2.0 (FROZEN 2026-08-19, 8 features) and
`docs/design/DESIGN-TOKENS.md` (Guide, warm).

<!-- Read-only to everyone except the architect at the next retro. Builder and Breaker consume it.
     If either thinks it is wrong, they say so and STOP, they do not edit it.
     The v11 version is archived at docs/archive/v11/ARCHITECTURE.md.
     NO EM-DASHES ANYWHERE IN THIS REPO'S DOCS: two frozen scopes arrived truncated at one. -->

---

## 1. Design tokens, verbatim

Contrast-verified at 4.5:1 or better on every foreground against every surface in both modes; the
category ramp is verified against simulated protanopia, deuteranopia and tritanopia.

**`DESIGN-TOKENS.md` IS AUTHORITATIVE. This is a copy and a copy drifts** (it did once, within
hours). `docs/process/RELEASE-CHECKLIST.md` carries the re-sync rule.

```css
:root{
  color-scheme:light;
  --bg:#F4F0E9; --panel:#FFFDFA; --panel2:#EDE7DD; --line:#E3DACE; --line-strong:#CFC3B2;
  --ink:#2A241F; --sub:#6D6458;
  --accent:#A84E29; --accent2:#8E4222; --accent-ink:#FFFDFA; --accent-soft:#F2E4DA;
  --warn:#8A5B0E; --warn-soft:#F7EBD5;
  --error:#93342A; --error-soft:#F7E3DF;
  --covered:#47663F; --covered-soft:#E4EADF;
  --c-bills:#5C2410; --c-save:#3A5A31; --c-repay:#8A5B0E; --c-spend:#8E6A60; --c-tax:#4A443C;
  --r:16px; --r-control:12px;
}
:root[data-theme="dark"]{ /* values below */ }
@media (prefers-color-scheme:dark){ :root[data-theme="auto"]{
  --bg:#16120E; --panel:#211C17; --panel2:#2C251E; --line:#322A22; --line-strong:#443A2F;
  --ink:#F4F0E9; --sub:#9B8F80;
  --accent:#E2825A; --accent2:#C96A44; --accent-ink:#16120E; --accent-soft:#33231A;
  --warn:#E0AC4E; --warn-soft:#302516;
  --error:#E89184; --error-soft:#33201C;
  --covered:#9DBE93; --covered-soft:#222A1E;
  --c-bills:#DD7C55; --c-save:#A3C79A; --c-repay:#D19B3B; --c-spend:#D8C2BA; --c-tax:#8E8578;
}}
@media (prefers-reduced-motion:reduce){ *{animation:none!important;transition:none!important} }
```

System font stack, weights 400 and 500 only. 12px hard floor. Cards: `--panel`, `--r`, 20px
padding, no border in light, 1px `--line` in dark. Max column 720px. Every tap target 44x44px.
**Light is the default and explicit** (`<html data-theme="light">`); dark is chosen in Settings.

**Colour rule that binds the Builder:** covered = `--covered`, short = `--warn`, not reached = no
colour at all, `--error` = app faults only and never a user's financial position. See decision 8.

---

## 2. Storage: schema v6, ported

**Ported from `docs/archive/v11/index.html`, not rewritten.** SCOPE feature 8. It is tested (26
assertions) and it protects data already on the user's device. Everything else in the app is new.

Key `shiftPlanner.v6`. Read order: v6, else migrate v5, else empty. The v5 blob survives migration
as the rollback path. A blob declaring a higher schema is refused and left untouched, never
downgraded.

```
{ schema:6,
  jobs:      [{ id, name, pension, typicalHours, rates:[{id,name,value}] }],
  outgoings: [{ id, label, amount, cat, credit:bool, dated:null }],
  goals:     [{ id, label, amount, weeks, addedAt }],
  shifts:    [{ id, date:"YYYY-MM-DD", jobId, jobName, rateId, rateName, rateValue,
                start, end, brk }],
  history:   [{ id, weekStartISO, dateLabel, hours, net, coverage[] }],
  settings:  { country, customRate, maxDays, hoursPerDay, otherMo, theme, protectedBlocks:[] },
  meta:      { firstRunISO, appVersion, taxDataVersion, onboarded:bool } }
```

**Two changes from the ported v6.** `employers` is renamed `jobs` and `employerId`/`employerName`
become `jobId`/`jobName`, because SCOPE D3 makes "job" the only word and a data model that says
"employer" leaks into strings eventually. `meta.onboarded` is new: the two-question flow needs to
know whether it has run, and inferring it from "are there any jobs" breaks for a user who deletes
their only job. Both are renames or additions inside the same schema number, so **no migration step
is added and the v5 path is unchanged**.

**The two-question start writes a normal record, not a special one.** Question 1 creates a job named
"Job" with one rate named "Standard". Question 2 creates one outgoing labelled "Everything" in the
`bills` category. Refinements then edit ordinary records. Nothing in the model knows onboarding
happened. This is what makes "refinements are offered, not required" cheap: there is no simple mode
to graduate out of.

---

## 3. Computation

### Country inference (SCOPE f1, D4)
`Intl.DateTimeFormat().resolvedOptions().timeZone`, mapped through a small timezone-to-country table
covering only the nine supported countries; else the region subtag of `navigator.language`; else
`UK`. A timezone maps to a country more reliably than a language tag: `en-GB` on a US phone is
common, `Europe/London` is not. **Written to `settings.country` on first run and never re-inferred**,
so a user who corrects it does not get overruled on their next visit.

### The number (SCOPE f2)
```
netPerHour = blendedRate * (1 - effectiveRate)     // effectiveRate = tax + pension
monthlyNeed = sum(outgoings.amount) - settings.otherMo
hoursPerWeek = monthlyNeed / netPerHour / 4.345
```
`blendedRate` = weighted average of the current week's logged shifts if any exist, else weighted
average of each job's rates by `typicalHours`. **With more than one rate and no shifts logged, it is
the mean of that job's rates, not the first one.** v11 used the first rate and silently ignored the
rest, which was visible and wrong on the human's own screen.

Tax annualises on declared `typicalHours`, not logged hours: annualising a light week drops the
figure into a lower bracket and raises the net rate, so working less would make each hour look worth
more.

**Guards, all of which are SCOPE f2 criteria.** `netPerHour <= 0`, no job, no rate, or no outgoings
each produce a **named empty state saying what is missing**, never a figure. `monthlyNeed <= 0` with
inputs present is a real zero and says so differently. No path renders `Infinity` or `NaN`.

### Coverage (SCOPE f5)
Waterfall over `outgoings` **in stored order, never re-sorted**. Banking snapshots the result into
the history row so later edits cannot rewrite a banked week.

---

## 4. Screens and components

Four tabs plus a Settings surface reached from the header. Tab labels are words, not icons.
`Outgoings` is nine characters in a four-column bar: **the Builder must verify it does not wrap at
320px** (SCOPE Navigation).

| Screen | Holds | SCOPE |
|---|---|---|
| Cold open | One line, "Start", "I have a backup file" | 1 |
| Ask | Two questions, one per screen, progress, Continue | 1 |
| **Now** | The number, refinements list, log a shift, this week's shifts | 2, 3, 4 |
| **Earn** | Jobs and rates, typical hours, pension, your limit, what an hour pays | 3 |
| **Outgoings** | Monthly items, goals, where the hours go | 3 |
| **Weeks** | Banked weeks, coverage | 5 |
| Settings | Country, appearance, export, import, reset, compliance, version | 6 |

Components, one line each:

- `AskStep` (step index, draft value) renders one question, input, progress, Continue.
- `AnswerCard` (model) the figure, its unit, and one plain restatement line. Nothing else.
- `RefineList` (state) one row per available refinement, each with what it buys. Hides a refinement once taken.
- `EmptyState` (message) one muted sentence naming the single action that fills it. Used everywhere, including Weeks.
- `JobCard` (job) name, rate rows, add rate, typical hours, pension.
- `RateRow` (rate) name, value, delete.
- `OutgoingRow` (outgoing) label, category, amount, delete.
- `GoalRow` (goal) label, amount, weeks, expired pill, delete.
- `ShiftRow` (shift, jobs) date, job and rate picker, start, end, break, computed pay, delete.
- `WeekRow` (historyRow) date, hours, earned, frozen coverage bar.
- `HourDonut` (model) slices plus a **labelled** legend; colour is never the only channel.
- `TabBar` (activeTab) four buttons, ARIA tablist, arrow and Home/End keys, focus stays on the button.
- `AppearanceControl` (theme) light, dark, match device.

---

## 5. File layout

```
/
  index.html                  the whole app. One file.
  CLAUDE.md  README.md  SCOPE.md  ARCHITECTURE.md  PARKING.md  HANDOVER.md
  .gitignore
  icons/                      RETAINED, unused in 2.0. PWA is out of scope; see decision 9
  docs/                       see docs/FILING.md
```

**Back to one file.** v11 needed three because a service worker cannot be inlined. 2.0 has no PWA
(SCOPE NOT-doing), so the original single-file rule holds again with no exception. No build step, no
framework, GitHub Pages from `main:/`, all unchanged from the approved stack.

---

## 6. Build order

Each step reads the one before. **Steps 1 to 3 are the whole product for a first-time user and
should go in front of the human before step 4 starts.**

1. Storage v6 ported, plus country inference. No UI.
2. Cold open and the two questions (f1).
3. The number and its empty states (f2).
4. Refinements (f3).
5. Earn and Outgoings screens (f3).
6. Log a shift (f4).
7. Weeks and coverage (f5).
8. Settings and compliance (f6).
9. Copy pass (f7), by `shift-planner-copywriter`, never the Builder.

---

## 7. Decisions log

1. **One file again.** No PWA in 2.0, so no service worker, so no reason for three.
2. **`employers` renamed `jobs` in the data model.** SCOPE D3 makes "job" the only word; a model that says "employer" leaks into strings eventually. Same schema number, no migration step.
3. **`meta.onboarded` added.** Inferring "has this user been onboarded" from "are there any jobs" breaks the moment someone deletes their only job.
4. **Onboarding writes ordinary records.** A job called "Job" with a rate called "Standard", and one outgoing called "Everything". No simple mode, therefore no graduation, therefore refinements are cheap.
5. **Blended rate with several rates and no shifts is the mean of the rates**, not the first. v11 took the first and silently dropped the rest; it was visibly wrong on the human's own Work screen and had been flagged as an open assumption in three handovers before it shipped.
6. **Country inferred once and never re-inferred.** A user who corrects a wrong guess must not be overruled on their next visit.
7. **Timezone before language for inference.** `en-GB` on a US phone is common; `Europe/London` on one is not.
8. **The no-ranking constraint, with its reason.** The app never reorders, ranks, recommends or evaluates the merits of paying one obligation over another. Ordering is always the user's. **Why: advising a borrower on the liquidation of a debt due under a credit agreement is a regulated activity under article 39E of the Regulated Activities Order.** Per FCA PERG 17, "liquidation" includes paying a debt off in full and on time, it covers future obligations not just overdue ones, a mixed list containing any credit-agreement debt is caught in whole, and "any element of evaluation, value judgment or persuasion is likely to mean that advice is being given." Shift Planner is not FCA authorised. This binds sorting, defaults, copy **and colour**. Sourced to PERG at 65% confidence, not solicitor-reviewed (`REQUIREMENTS.md` §3.6). **A future session that finds this inconvenient escalates to the human, it does not soften it.**
9. **`icons/` retained though unused.** PWA returns in v2.1; deleting and regenerating four PNGs is churn.
10. **No em-dashes in any repo document.** Two frozen `SCOPE.md` files arrived truncated at one. Mechanical, not stylistic.

---

## Handover

**Done:** Architect pass for 2.0 against the frozen scope and the token doc. Covers tokens verbatim, the ported v6 schema with its two renames, country inference, the number and its guards, seven screens mapped to features, thirteen named components, the literal file layout, a nine-step build order, and ten decisions including the art. 39E / PERG 17 constraint recorded with its reason.

**Assumed:** (1) That renaming `employers` to `jobs` inside schema v6 needs no migration step, because a fresh 2.0 build reads its own writes and the v5 path is untouched. **A v6 blob written by v11 would carry `employers` and would not be read correctly.** That blob only exists if the human ran v11 against their real data, which they did. See Risky 1. (2) That the two-question flow writing ordinary records is right rather than a distinct "simple" state. (3) That the mean of a job's rates is the right no-shift fallback; it is defensible and it is a choice, not a derivation. (4) That country is inferred once. (5) That `Outgoings` fits a four-column bar at 320px, unverified.

**Risky:** (1) **THE HUMAN HAS A v6 BLOB WRITTEN BY v11, CONTAINING `employers`, NOT `jobs`.** They used the app today. Under this architecture 2.0 will read that blob, find no `jobs` array, and treat them as a new user while their v5 blob also still exists. That is a data-loss-shaped bug on the only real user, and it is the first thing step 1 must handle: either accept `employers` as an alias on read, or bump to schema 7 with a real migration. **I have not resolved it because it changes the schema decision and the human should choose.** (2) The whole product now rests on a two-question flow that will give the human personally a wrong number, since they work multiple rates at different pay. They are the only real user. (3) Eight features is fewer than v11's ten and still not small; steps 1 to 3 being reviewable independently is the mitigation. (4) The legal reading is unchanged at 65% and still unreviewed. (5) Nothing here has been seen rendered; that has caught real faults twice.

**Open:** (1) **Resolve Risky 1 before any code.** Alias `employers` on read, or schema 7 with a migration. (2) Confirm the mean-of-rates fallback. (3) `Outgoings` at 320px. (4) `PROJECT.md` was not archived and still reads true; confirm. (5) The port-not-rewrite deviation from the human's "reset all code" instruction stands unanswered.

**Touched:** `ARCHITECTURE.md` (new, 2.0). Read-only inputs: `SCOPE.md`, `docs/design/DESIGN-TOKENS.md`, `docs/design/COPY-DECK.md`, `docs/archive/v11/`. No code written.
