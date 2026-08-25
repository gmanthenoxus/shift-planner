# ARCHITECTURE: Shift Planner v11

Architect pass, 2026-08-19, against `SCOPE.md` v11 (FROZEN 2026-08-19, 10 features) and
`docs/design/DESIGN-TOKENS.md` (Guide, warm).

<!-- Read-only to everyone except the architect at the next retro. Builder and Breaker consume it.
     If either thinks it is wrong, they say so and STOP — they do not edit it.
     Supersedes the v8/v9 version of this document, preserved in git history at 3b1a9bf. -->

---

## 1. Design tokens — verbatim

Copied in full from `docs/design/DESIGN-TOKENS.md` so the Builder never opens a second file.
Every pair is contrast-verified at 4.5:1 or better in both modes, and the category ramp is verified
against simulated protanopia, deuteranopia and tritanopia.

**`DESIGN-TOKENS.md` IS AUTHORITATIVE. This is a copy, and a copy drifts.** It already did once,
within hours: `--muted` changed twice for AA failures and this block kept the stale value. The
architect seat requires the verbatim copy so the Builder never opens two files, so the duplication
stays, and `docs/process/RELEASE-CHECKLIST.md` now carries a re-sync item as the mitigation. Any
token change means editing both, in the same commit.

```css
:root {
  color-scheme: light;
  --bg:#F4F0E9; --surface:#FFFDFA; --surface-2:#EDE7DD;
  --text:#2A241F; --text-2:#5E5449; --muted:#6D6458;
  --line:#E3DACE; --line-strong:#CFC3B2;
  --accent:#A84E29; --accent-ink:#FFFDFA; --accent-soft:#F2E4DA;
  --covered:#47663F; --covered-soft:#E4EADF;
  --attention:#8A5B0E; --attention-soft:#F7EBD5;
  --error:#93342A; --error-soft:#F7E3DF;
  --c-bills:#5C2410; --c-save:#3A5A31; --c-repay:#8A5B0E; --c-spend:#8E6A60; --c-tax:#4A443C;
  --r-card:16px; --r-control:14px; --r-pill:999px;
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px;
  --s-5:20px; --s-6:28px; --s-7:40px; --s-8:56px;
  --pad-card:20px; --gap-card:12px; --gap-section:28px;
  --dur:200ms; --ease:cubic-bezier(.2,.6,.3,1);
}
:root[data-theme="dark"]{ /* same values */ }
@media (prefers-color-scheme:dark){ :root[data-theme="auto"]{
  color-scheme:dark;
  --bg:#16120E; --surface:#211C17; --surface-2:#2C251E;
  --text:#F4F0E9; --text-2:#C9BDAD; --muted:#9B8F80;
  --line:#322A22; --line-strong:#443A2F;
  --accent:#E2825A; --accent-ink:#16120E; --accent-soft:#33231A;
  --covered:#9DBE93; --covered-soft:#222A1E;
  --attention:#E0AC4E; --attention-soft:#302516;
  --error:#E89184; --error-soft:#33201C;
  --c-bills:#DD7C55; --c-save:#A3C79A; --c-repay:#D19B3B; --c-spend:#D8C2BA; --c-tax:#8E8578;
}}
@media (prefers-reduced-motion:reduce){ *{animation:none!important;transition:none!important} }
```

Type: system stack, weights 400/500 only. 44px headline · 20px section · 15px body · 13px label ·
**12px hard floor.** Cards: `--surface` fill, `--r-card`, `--pad-card`, **no border in light mode**,
`1px solid var(--line)` in dark. Icons: Lucide, 1.75px stroke, 20px inline, 44×44px tap target.
Max content width 720px.

**Theme: light by default and explicit** (`<html data-theme="light">`). Dark is opt-in via Settings;
the OS preference applies only under `data-theme="auto"`. Corrected 2026-08-19 after a silent
`prefers-color-scheme` override meant the approved light palette was never seen.

**Colour rule that binds the Builder:** covered = `--covered`, shortfall = `--attention`,
not-reached = **no colour, `--muted` text only**, `--error` = app faults exclusively and never a
user's financial position. See decision 14.

---

## 2. Storage: schema v6

### Key and read order

New key `shiftPlanner.v6`. On load: read v6 → if absent read v5 and migrate → if absent, **empty
state, no seed data** (SCOPE feature 2, D2).

**The v5 blob is not deleted after migration.** Why: it is the only rollback path if v6 has a bug
that reaches a real user, and it costs a few KB. Delete it in v12 once v11 has survived contact.

### Shape

```
{
  schema: 6,
  employers: [{ id, name, pension,                    // pension % is per employer, not per rate
                rates: [{ id, name, value }],
                typicalHours }],                      // fallback basis, see §3
  outgoings: [{ id, label, amount, cat,
                credit: bool,                         // SCOPE f4, D-v10-6
                dated: null | {
                  kind: "lump" | "rateChange",        // D11. Explicit, never inferred
                  date: "YYYY-MM-DD",
                  newAmount                           // rateChange only
                } }],
  goals:    [{ id, label, amount, weeks, addedAt }],   // unchanged from v5
  shifts:   [{ id, date: "YYYY-MM-DD",                 // NEW — v5 shifts had no date at all
                employerId, employerName,              // name snapshotted, D8 + default 4
                rateId, rateName, rateValue,           // snapshotted at log time, D8
                start, end, brk }],
  history:  [{ id, weekStartISO,                       // NEW — v5 stored a locale display string
                hours, net, coverage[] }],
  settings: { country, customRate, maxDays, hoursPerDay, otherMo,
              protectedBlocks: [] },                   // RESERVED, v12. See decision 12
  meta:     { firstRunISO, appVersion, taxDataVersion }
}
```

### Migration v5 → v6, field by field

| v5 | v6 | Rule |
|---|---|---|
| `jobs[]` | `employers[]` | Each job becomes an employer with exactly **one** rate, `name` = the old `label`, `value` = old `wage`. `pension` and `typicalHours` carry across from `hours`. |
| `bills[]` | `outgoings[]` | 1:1. `credit:false`, `dated:null` added. |
| `goals[]` | `goals[]` | Unchanged. Existing `addedAt` backfill logic is preserved. |
| `shifts[]` | `shifts[]` | **The hard case.** v5 shifts carry only `{jobId,start,end,brk}` — no date, no rate snapshot. Migration sets `date` = the Monday of the current week, and snapshots `employerName`/`rateName`/`rateValue` from the job the `jobId` points at, at migration time. |
| `history[]` | `history[]` | `date` was a locale display string (`"3 Aug"`) and is **not parseable**. Keep it as a display label; set `weekStartISO: null` for migrated rows and treat null as "legacy, do not date-sort". |
| `settings` | `settings` | 1:1 plus `protectedBlocks: []`. |

**Why the shift-date guess is acceptable:** v5 shifts are by definition the *current, unbanked*
week — `newWeek` empties the array — so "this week's Monday" is correct for every shift that can
exist in a v5 blob. Stated so the Breaker tests it rather than assuming it.

**Why history dates cannot be recovered:** `"3 Aug"` has no year and no locale guarantee. Parsing
it would invent data. Legacy rows keep their label and opt out of date logic. This is a real,
permanent scar from v5 and it is better than a silent wrong date in a financial record.

### Defensive read

`validShape()` extends to v6: `schema` is a number, the five arrays are arrays, `settings` and
`meta` are objects. A blob with `schema > 6` is **not** migrated and **not** discarded — the app
refuses to load it, keeps it untouched, and shows the import-error pattern. Silently downgrading a
future blob would destroy data the user cannot get back.

---

## 3. Computation

### Blended rate

**RESOLVED 2026-08-19 by the human: the window is the current week.** SCOPE feature 3's "shifts
actually worked" named no window; this closes it.

`Σ(shift.rateValue × shiftHours) / Σ(shiftHours)` over **shifts dated in the current week**,
including shifts dated later in that week (consistent with D9's definition of committed).

**With zero shifts in the week there is nothing to average.** Fallback: `Σ(rate.value ×
typicalHours)` weighted per employer, i.e. the v5 behaviour. This applies on first run, and again
at the start of every week before the first shift is logged.

**The consequence the Builder must handle, not hide:** the blended rate is declared-hours-based at
the start of a week and shift-based once a shift exists, so **the net hourly rate changes when the
first shift of the week is logged, without the user changing any rate.** With one shift logged, the
blended rate *is* that shift's rate. This is faithful to feature 3 and it is surprising. It gets a
plain explanatory line, not a hidden recalculation, and the line is
`shift-planner-copywriter`'s to write. Placement: adjacent to the take-home summary's net/hr
figure, shown only when the current week has between one and two shifts logged, since that is when
the swing is largest and least explicable.

### Tax basis

Unchanged from v9: annualise on **declared typical hours**, not the ceiling and not actual logged
hours. Why it must not follow the blended rate onto actual shifts: a light week would drop the
annualised figure into a lower bracket and *raise* the net hourly rate, so working less would make
each hour look worth more. That is backwards and would be invisible.

### Extra hours (feature 5, D9)

```
committed   = Σ shiftHours(s) for s in shifts where s.date is in the current week
                                (including dates later in the week)
baseline    = (Σ outgoing.effectiveAmount − otherMo) / net / WPM
datedWeekly = Σ lump.amount / max(1, whole weeks from today to lump.date)
goalWeekly  = existing goal logic, unchanged
extra       = max(0, baseline + datedWeekly + goalWeekly − committed)
```

`effectiveAmount` for an outgoing: `dated?.kind === "rateChange" && today >= dated.date`
→ `dated.newAmount`, else `amount`. A `rateChange` **never** contributes to `datedWeekly` — it is
part of the baseline before and after, at different amounts.

**Guards.** `net <= 0` → empty state, no figure. Ceiling of 0 → empty state. `whole weeks
remaining` floors at 1, never 0, so no division by zero. A `lump` with a past date contributes 0.
No path may render `Infinity` or `NaN` (feature 5 criterion, and the v9 bug this replaces).

### Coverage (feature 7)

Waterfall in **the user's stored order**, never re-sorted. A `lump` is measured against its
per-week contribution, not its total. Banking snapshots `coverage[]` into the history row so a
later edit cannot rewrite a banked week.

---

## 4. Service worker — the highest-risk decision

Three files: `index.html`, `sw.js`, `manifest.webmanifest`.

**Strategy: network-first for the document, cache-first for static assets, user-confirmed update.**

- Cache name `shift-planner-<APP_VERSION>`, where `APP_VERSION` is a literal string at the top of `sw.js`. Bumping it is the release action.
- `install`: precache `index.html`, `manifest.webmanifest`, icons. **No `skipWaiting()` here** — swapping assets under a page mid-session can leave a half-old, half-new app holding financial input.
- `activate`: delete every cache whose name is not the current one, then `clients.claim()`.
- `fetch`, navigation requests: **network first, 3s timeout, fall back to cache.** An online user always gets the current document. An offline user gets the last good one.
- `fetch`, other requests: cache-first.
- Update handshake: page registers the SW → `updatefound` → new worker reaches `installed` while `navigator.serviceWorker.controller` exists → app shows an inline, dismissible "New version ready. Reload" affordance (not a modal, not automatic) → on tap, `postMessage({type:"SKIP_WAITING"})` → SW calls `skipWaiting()` → `controllerchange` fires → `location.reload()`.

**Why network-first for the document rather than the usual cache-first:** cache-first is faster and is the standard PWA advice, and it is wrong here. This app's payload is tax arithmetic. A user pinned to a superseded bracket table gets confidently wrong numbers with no symptom. Trading ~200ms of load for "an online user is never stale" is the right trade for this product and would be the wrong trade for most.

**Belt and braces:** the footer renders `appVersion` and `taxDataVersion` from `meta`, always visible. If someone reports a wrong figure, the first question is answerable without guessing. `taxDataVersion` is bumped **only** when a bracket or rate changes, independently of `appVersion`, so a tax correction is legible as one.

---

## 5. Pages and components

One page, single scrolling document, plus a first-run flow that occupies the whole viewport.

| # | Screen / section | SCOPE feature |
|---|---|---|
| 0 | Cold open — empty, one sentence, "Set up" and "I have a backup file" | 2 |
| 1 | Onboarding, 5 steps: country → employers → outgoings → ceiling → goals | 2 |
| 2 | Headline: extra hours + breakdown | 5 |
| 3 | Employers panel with rate cards | 3 |
| 4 | Outgoings panel with type, dated kind, date | 4 |
| 5 | Goals panel | — (carried) |
| 6 | Working ceiling | — (carried) |
| 7 | Take-home summary + hour-breakdown donut | — (carried) |
| 8 | Shift log with rate picker and duplicate | 6 |
| 9 | Bank the week + coverage + history | 7 |
| 10 | Footer: version stamp, tax disclaimer, not-debt-advice statement | 9 |

Components, one line each:

- `OnboardingStep` — renders one question, a progress meter, Continue. Needs: step index, current draft state. Commits to storage on Continue.
- `EmptyState` — muted sentence + one action. Needs: message, action label. **One component, used everywhere.** Guide's minimal deliverable and the fix for the v8 silent-blank-grid gap.
- `EmployerCard` — name, pension, rate list. Needs: employer.
- `RateRow` — name, value, delete. Needs: rate.
- `OutgoingRow` — label, amount, category, credit toggle, dated control. Needs: outgoing.
- `DatedControl` — kind selector, date, and `newAmount` when kind is `rateChange`. Needs: outgoing.dated.
- `HeadlineFigure` — the number, unit, meter, breakdown rows. Needs: model output.
- `ShiftRow` — date, employer, rate picker, start, end, break, computed pay, duplicate, delete. Needs: shift, employers.
- `CoverageList` — obligation rows in stored order with state. Needs: coverage[].
- `UpdateBanner` — inline "New version ready. Reload". Needs: waiting-worker flag.
- `VersionStamp` — appVersion, taxDataVersion, build date.

---

## 6. File layout

```
/
  index.html                  app, single file, unchanged stack
  sw.js                       NEW — service worker
  manifest.webmanifest        NEW — PWA manifest
  icons/                      NEW
    icon-192.png  icon-512.png  icon-maskable-512.png  apple-touch-icon.png
  CLAUDE.md  README.md  SCOPE.md  ARCHITECTURE.md  PARKING.md  HANDOVER.md
  .gitignore
  docs/                       see docs/FILING.md
```

**The single-file rule is now three files, deliberately.** A service worker cannot be inlined —
it must be served from its own URL at the scope it controls. The manifest likewise. This is the
minimum possible departure and it does not introduce a build step. `index.html` stays one file.

GitHub Pages, branch-deploy from `main:/`, unchanged. Pages serves `sw.js` from the root, so
service-worker scope covers the whole app without a `Service-Worker-Allowed` header, which Pages
cannot set.

---

## 7. Build order

Strict, because each step reads the one before:

1. Schema v6 + migration, alone, with console assertions. **No UI.**
2. Empty state + onboarding (feature 2) — builds `EmptyState`, the Guide component proof.
3. Employers + rate cards (3).
4. Outgoings + dated (4).
5. Extra-hours headline (5).
6. Shift logging (6).
7. Bank + coverage (7).
8. PWA (8) — needs a stable `index.html` to precache.
9. Compliance subset (9), copy pass (10).

Steps 3 and 4 may swap. Nothing else may. 8 cannot move earlier.

---

## 8. Decisions log

Carried from v8/v9 and still true: single HTML file no build step (1) · storage key versioned
independently of feature version (2) · tax tables inline in `COUNTRIES` (3) · tax basis is declared
typical hours, confirmed in v9 (4) · goals expire via `addedAt` (6) · import validates shape (7).

Resolved and closed by v11: **(5) seed data** — killed by D2, replaced with empty state. Open since
6 July, now closed.

New for v11:

11. **Three files, not one.** A service worker cannot be inlined. Minimum departure from the single-file rule; no build step added.
12. **`settings.protectedBlocks: []` is reserved now though the feature is v12.** Why: adding it in v12 would need a v7 schema bump and a second migration for every user. An empty array costs nothing and buys a free upgrade path.
13. **Rate, rate name and employer name are snapshotted onto every shift** (D8, default 4). Why: history becomes immutable and independent of the rate card, so editing or deleting a rate can never rewrite what someone was paid. Costs a little duplication; removes an entire class of bug.
14. **The no-ranking constraint, with its reason.** The app never reorders, ranks, recommends or evaluates the merits of paying one obligation over another. Ordering is always the user's. **Why: advising a borrower on the liquidation of a debt due under a credit agreement is a regulated activity under article 39E of the Regulated Activities Order.** Per FCA PERG 17: "liquidation" includes paying a debt off in full and on time; it covers future obligations, not just overdue ones; where a mixed list contains any credit-agreement debt, advice on the whole list is caught; and "any element of evaluation, value judgment or persuasion is likely to mean that advice is being given." Shift Planner is not FCA authorised. This binds sorting, defaults, copy **and colour**. Legal reading is sourced to PERG at 65% confidence and is not solicitor-reviewed (`docs/governance/REQUIREMENTS.md` §3.6). **A future session that finds this constraint inconvenient must escalate to the human, not soften it.**
15. **Colour may not editorialise where copy may not.** "Not reached" gets no colour; `--error` is reserved for app faults. Why: a red row says *failure* about a person's life louder than any sentence, and decision 14 binds meaning, not just words.
16. **Network-first for the document.** Against standard PWA advice. Why: the payload is tax arithmetic and staleness is silent. See §4.
17. **The v5 blob survives migration.** Why: only rollback path if v6 reaches a user with a bug. Delete in v12.
18. **Legacy history rows keep an unparseable date label and opt out of date logic.** Why: `"3 Aug"` has no year. Parsing invents data; a wrong date in a financial record is worse than a missing one.

---

## 9. Checks the Breaker must add for v11

Beyond `breaker-protocol`'s standard menu. Listed here because they come from architectural calls
made in this document, and would otherwise be nobody's job.

1. **Colour-vision deficiency.** ~~Assumption~~ **MEASURED 2026-08-19** and the first ramp FAILED
   all three simulations. Rebuilt around lightness; worst-case separation now 0.0162 against a 0.01
   floor. Script: `docs/process/dst-and-colour-checks.js`. Breaker should re-run it, and extend it
   to the coverage list and headline verdict, which were not covered.
2. **Hairline is never the only signal.** `--line` and `--line-strong` measure under 3:1 and are
   documented as decorative. Verify no boundary or state is conveyed by a rule alone.
3. **Colour is never the only signal.** Every state using a semantic colour must also carry a text
   label. Decision 15 states it; nothing enforces it.
4. **DST.** ~~Not listed~~ **ADDED AND PASSING**: `mondayISO` verified at five times of day across
   both 2026 UK clock changes and the year boundary. Same script. It underpins the headline, the
   shift list and banking, so a bug there would have been three bugs.
5. **Service-worker update, on iOS Safari specifically.** Load, deploy a change, reload. iOS is
   where PWA behaviour diverges most and where much of this audience is.
6. **The rate swing.** Log the first shift of a week and confirm the net/hr change is accompanied
   by the C7 string, not silent.
7. **Schema refusal.** A blob with `schema: 7` must be refused, left untouched, and reported. It
   must not be migrated and must not be discarded.

---

## Handover

**Done:** Architect pass for v11 against frozen `SCOPE.md` and `DESIGN-TOKENS.md`. Produced: tokens verbatim; full v6 schema with a field-by-field v5 migration table; the blended-rate, tax-basis, extra-hours and coverage computations with their guards; the service-worker update strategy in implementable detail; screens mapped to SCOPE features; eleven named components; literal file layout; a strict build order; and eight new decisions-log entries including the no-ranking constraint recorded with its art. 39E / PERG 17 reason, which was a frozen criterion.

**Assumed:** (1) Blended rate averages over **the current week's** shifts. SCOPE says "shifts actually worked" without naming a window — see Open 1; I have written the architecture around current-week but have NOT resolved it. (2) Migrated v5 shifts get this week's Monday as their date, safe because v5 shifts are by definition the unbanked current week. (3) `typicalHours` stays on the employer rather than moving to the rate, because SCOPE only says pension stays per employer. If someone works mostly one rate, a per-rate typical would model them better. (4) The update affordance is inline and dismissible rather than modal — my call, not SCOPE's. (5) One `EmptyState` component serves every empty case.

**Risky:** (1) **The blended-rate window is a genuine SCOPE ambiguity and the whole downstream figure depends on it.** A one-shift week makes the blended rate that one shift's rate, which then feeds the net hourly rate and the headline. That may be correct or may be violently unstable; I could not tell from SCOPE and did not pick. (2) The zero-shifts fallback means a new user's blended rate comes from declared hours and their week-two rate comes from actual shifts — **the number moves for a reason the user never did anything to cause.** No copy currently explains that. (3) Network-first costs ~200ms per load on a slow connection, on a tool whose stated use case is a five-minute glance mid-shift. I judged staleness worse than latency; that is a judgement. (4) The service-worker update handshake is standard but has never been tested on iOS Safari in this project, where PWA behaviour diverges most. (5) `taxDataVersion` is only useful if someone remembers to bump it, and nothing enforces that.

**Open:** **None blocking.** All five opens from the first draft of this pass were closed on 2026-08-19: (1) blended-rate window resolved to **the current week** by the human, with the declared-typical-hours fallback and the rate-swing consequence now written into §3; (2) the rate swing **is** explained, string C7 in `COPY-DECK.md`, written by `shift-planner-copywriter`; (3) icon assets produced and committed to `icons/`; (4) `taxDataVersion` bumping is now a line item in `docs/process/RELEASE-CHECKLIST.md`; (5) the colour-vision and hairline checks are specified in §9 above, along with four others.

Remaining and **not** blocking the build: the legal reading behind decision 14 sits at 65% confidence and is not solicitor-reviewed. It constrains what gets built rather than gating it.

**Touched:** `ARCHITECTURE.md` (rewritten for v11; v8/v9 version preserved in git at 3b1a9bf). Read-only inputs: `SCOPE.md`, `docs/design/DESIGN-TOKENS.md`, `docs/design/COPY-DECK.md`, `index.html`. No code written. No dependencies added.
