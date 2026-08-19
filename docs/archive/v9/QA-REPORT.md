# QA Report: Shift Planner v9 — 2026-07-06

Tested the live app as a running page: served `index.html` via `python3 -m http.server`, drove it
with headless Chrome (v150) over the Chrome DevTools Protocol (real navigation, real DOM events,
real Tab-key input events, real Accessibility-tree queries, real `DOM.setFileInputFiles` for import
tests) — not static source reading. Independently hand-computed tax figures against
`TAX-ACCURACY-AUDIT.md`'s stated rates/thresholds rather than trusting the Handover's own claim of
verification.

> **RE-TEST ADDENDUM (2026-07-06, fix cycle against commit `144b4c1` "Fix cycle: breaker's 3
> blockers + BUG-4 resolved"):** Per the breaker-protocol re-test rule, only the 3 blockers, BUG-4,
> and criterion 3.1 (the criterion BUG-1 violated) were re-verified — the rest of this original
> table/bug list is left as originally recorded and was NOT re-run. Re-tested live: served
> `index.html` via `python3 -m http.server` on a fresh port, drove it with headless Chrome via
> Puppeteer-over-CDP (real navigation, real `input`/`change` events dispatched on live DOM nodes,
> real `localStorage` manipulation, real file-upload import, `pageerror` listener for uncaught
> exceptions) — not source reading. Findings recorded inline below at each affected row/bug/checklist
> item, prefixed "RE-TEST:". Deploy-infra readiness was spot-checked (not fully re-run) since the
> Verdict below now turns on it: confirmed local `main` and `origin/main` both sit at `144b4c1`, and
> `curl`'d the live URL to confirm it already serves this exact commit (found both the new Pace
> empty-state string and the `esc()` function body live) — the fix-cycle build is live, not just
> committed.

## Acceptance criteria

| # | Criterion | PASS/FAIL/UNTESTABLE | Notes |
|---|---|---|---|
| 1.1 | France's bracket loop no longer under-counts | PASS | Hand-computed FR income tax on €100,000 gross using the audit's corrected 2026 thresholds (0/11,600/29,579/84,577/181,917 at 0/11/30/41/45%) = €24,800.52. App returns `24800.519999999997`. Exact match. |
| 1.2 | US, Canada, Australia include previously-missing top brackets (37%/33%/45%) | PASS | US: hand-traced $120,000 gross → $17,570 federal tax, app matches exactly. CA: hand-traced $90,000 → $11,606.06 federal tax (includes 29%/33% bands + CPP2), app matches exactly. AU: hand-traced $100,000 → $20,520 income tax (includes 45% top band, and the leading `[0,0]` fix for the shifted-row bug), app matches exactly. |
| 1.3 | Germany multi-band effective-rate approximation, not flat 30% | PASS | Hand-traced €50,000 gross against the code's own 4-band table (12,348/40,000/69,878/277,825 at 0/20/28/38/45%) = €8,330.40 income tax. App returns `8330.400000000001`. Exact match; confirmed not a flat 30%. |
| 1.4 | Netherlands includes arbeidskorting | PASS | Present in code and reduces tax (confirmed `laborCredit` term is subtracted). Hand-traced €60,000 gross ≈ €16,307.20 vs app's €16,307.19 (difference is manual-arithmetic rounding, not a code discrepancy). |
| 1.5 | Remaining stale thresholds/rates match the audit (UK, Ireland, US deduction, Canada BPA, Australia Medicare threshold, France bands, Spain SS ceiling) | PASS | UK: hand-traced £80,000 → £19,432 income tax + £3,610.60 NI, and £200,000 → £71,175 + £6,010.60 (confirms the added 45% additional-rate band above £125,140), both exact matches. Ireland: hand-traced €55,000 → €9,200 income tax (std cutoff €44,000, credit €4,000) + €1,182.82 USC (using audit's corrected 2026 USC bands) + €2,310 PRSI (4.2%), exact match. Spain: hand-traced €70,000 → €22,401.50 IRPF (includes new 47% band) + €3,960.57 SS (ceiling €61,214.40, rate 6.47%), exact match. |
| 1.6 | Footer disclaimer stays accurate to what's simplified | PASS | Reads "Tax models are simplified effective-rate estimates and ignore many personal factors (allowances, credits, student loans, overtime rules)" — makes no per-credit/allowance precision claim. |
| 2.1 | Effective tax rate derives from summed typical hrs/wk, not the working ceiling | PASS | Live DOM test: changing a job's "Typ. hrs/wk" from 24→60 moved net/hr from £11.89 → £10.98. Reverting hours and instead changing the ceiling (max days 6→2, hours/day 10→4, then 7×16) left net/hr at £11.89 in both cases — ceiling has zero effect on tax basis, only job hours do. |
| 2.2 | ARCHITECTURE.md records this as confirmed decision, not open flag | PASS | Decisions log item 4 is written as "RESOLVED in v9," not an open flag. |
| 3.1 | No numeric display anywhere can render "Infinity" or "NaN" under any input combination | **PASS (re-tested, was FAIL)** | RE-TEST: reproduced the original BUG-1 steps exactly (default jobs, `+ Shift`, then (a) delete both jobs via their delete buttons one at a time re-querying live DOM, and (b) separately, zero both jobs' "Rate /hr" via a real `input` event) — in both scenarios `document.body.innerText` contains neither "NaN" nor "Infinity", and the Pace panel now renders `Add a job with an hourly rate to see your pace.` instead of the stat grid. Also swept 5 additional combinations not in the original repro (bare default state; `maxDays=0`+`hoursPerDay=0` with a shift logged; both jobs deleted with a shift **and** a goal present, exercising the goalRows path; a job's hours set to `-20`; a goal's weeks set to `0`) — none rendered "NaN"/"Infinity". No uncaught exceptions in any scenario. |
| 3.2 | When take-home/hr is 0, headline/reality-bar area shows an empty-state message instead of hours/feasibility numbers | PASS | Confirmed: headline shows "Add a job with an hourly rate to see your numbers.", baseline panel shows "—" for all four stats, goal rows show a placeholder line, reality bar shows "Nothing to check yet…". (Note: this guard does not extend to the Pace panel — see 3.1/BUG-1 — nor to the Take-home summary's own gross/hr and net/hr fields, which continue to render a raw `£0.00`/negative figure rather than an empty-state message; SCOPE's literal wording names only "headline/reality-bar area," so this narrower reading is technically met even though ARCHITECTURE.md's component description implies broader coverage — flagged under Drift.) RE-TEST NOTE: Pace panel's own empty-state message is now covered per 3.1 above; the Take-home summary gap noted here is unchanged by this fix cycle (not touched, not claimed fixed) — see BUG-4 re-test below for how that specific negative-figure case now behaves post-clamp. |
| 4.1 | A goal stops contributing extra hours once its week count has elapsed | PASS | Set a 12-week goal's `addedAt` to exactly 12 weeks ago: `expired=true`, `hrsWk=0`, `goalHrsWkNow=0`. Set to (12 weeks − 1 second) ago: `expired=false`, `hrsWk=17.52`. Boundary (`elapsedWks >= wks`) behaves exactly as documented. |
| 4.2 | Expired goal is visually distinguished, not silently vanished, stays editable/deletable | PASS | Confirmed via fresh page load with a pre-expired goal in storage: row renders at `opacity:0.6` with an "Expired" pill; the label/amount/weeks inputs and delete button are all still present and functional. |
| 5.1 | Wrong-shaped-but-parseable JSON is rejected with a clear inline message, not a silent load | PASS | Imported `{}` → inline message "That file doesn't look like a Shift Planner export — nothing was changed."; app state provably unchanged (`JSON.stringify(S)` identical before/after). No `alert()` fired. |
| 5.2 | Bad-import and no-shifts messages both display inline, not via `alert()` | PASS | Confirmed no `alert()` call (instrumented `window.alert` and clicked "New week" with zero shifts — not called). Confirmed non-JSON file, `{}`, and a 0-byte file all produce the inline `#importMsg` text, never a blocking dialog. |
| 6.1 | Every icon-only button uses a real SVG icon + `aria-label` | PASS | Confirmed via the Accessibility tree (`Accessibility.getFullAXTree`, not just HTML source): every button node's exposed accessible name is a real label ("Delete job", "Delete outgoing", "Delete goal", "Delete shift", "Export data", "Import data", "Reset all data", "Bank this week and start a new one"). |
| 6.2 | Delete buttons and icon-only tap targets ≥ 44×44px | PASS | Measured via `getBoundingClientRect()` on every rendered `.x` button (jobs, bills, goals, shifts): all exactly 44×44px. |
| 6.3 | `.btn`/`.x` show a visible focus state on keyboard Tab, not just `:active` | PASS | Dispatched real Tab keydown/keyup via CDP `Input.dispatchKeyEvent` (not scripted `.focus()`, which does not trigger `:focus-visible` in Chrome). Landed on `exportBtn` (a `.btn`) and a job-delete `.x` button; both showed `matches(':focus-visible')===true` with a real rendered `outline: 2px solid rgb(45,212,191)` (the `--accent2` token), not the browser default. |
| 6.4 | Per-job role input has a visible label matching siblings | PASS | `<label class="label">Role</label>` present, same markup pattern as "Rate /hr", "Typ. hrs/wk", "Pension". |

**Regression-class re-test (event-delegation fix, per Handover's specific request):** all four delete
handlers (jobs, bills, goals, shifts) were tested by dispatching the click directly on a nested SVG
child (`svg path`, bare `svg`, `svg line`) rather than the button itself — the exact failure mode
the Handover describes finding and fixing. All four correctly deleted the intended item via
`closest()`. No regression found.

**RE-TEST regression spot-check (2026-07-06 fix cycle):** this fix cycle's BUG-2 escaping touched
`renderJobs`/`renderBills`/`renderGoals`/`renderShifts` (the same render functions the prior
delete-button/SVG-click fix lives in). Re-clicked a nested `svg path` inside a job delete button
directly (`MouseEvent('click', {bubbles:true})` dispatched on the `<path>` itself): job row count
went from 2 to 1. No regression from the `esc()` addition.

## Bugs

### BUG-1: "NaN" renders in the Pace panel when net take-home is 0 and a shift is logged [severity: blocker]

**RE-TEST (2026-07-06, commit `144b4c1`): FIXED, verified live.** Reproduced both original repro
paths exactly:
- (a) default jobs → `+ Shift` → delete both jobs one at a time (re-querying the live DOM between
  clicks, since the first delete's re-render detaches stale button references — a lesson from a
  self-inflicted false-positive in this re-test's first script pass, not an app behavior): Pace
  panel now renders `Add a job with an hourly rate to see your pace.`; `document.body.innerText`
  contains neither "NaN" nor "Infinity".
- (b) default jobs → `+ Shift` → both jobs' "Rate /hr" set to `0` via a real `input` event: same
  result, same empty-state message, no "NaN"/"Infinity" anywhere on the page.

Root cause fix confirmed in the diff and live: the Pace block in `calc()` is now gated
`if(m.net>0&&S.shifts.length){...}else if(S.shifts.length){/* empty-state message */}else p.innerHTML="";`
— matches the Handover's described fix exactly, and the live behavior matches the description.

Original steps to reproduce (from a fresh/cleared app state), preserved for record:
1. Load the app with its default two jobs (do not touch anything else).
2. Click "+ Shift" once (adds a shift against the first job).
3. Either (a) delete both jobs via their delete buttons, or (b) set both jobs' "Rate /hr" to 0.
4. Observe the "This week's shifts" → Pace panel (the three-stat block above the shift list).

Expected: per SCOPE feature 3, no numeric display anywhere in the app renders "Infinity" or "NaN"
under any input combination, including net take-home of 0.
Actual (original, pre-fix): Pace panel shows `NEEDED THIS WK` as `£NaN`, and the status line reads
`⚠ £NaN short — about NaN more hours.` `document.body.innerText.includes('NaN')` is `true` in this
state.
Root cause (confirmed by reading the code, original finding): `calc()`'s Pace block computes
`need = m.net * m.totalWk`. When `net<=0`, `model()` leaves `baseHrsWk` (and therefore `totalWk`)
as `Infinity` (only the headline/baseline/goalRows/reality-bar rendering is gated behind
`if(m.net<=0){...}else{...}`; the Pace block is a separate, ungated `if(S.shifts.length){...}`
lower in `calc()`). `0 * Infinity = NaN`, and `fmt()`/the template string render it as the literal
string "NaN". This is exactly the class of bug SCOPE feature 3 targeted — it was fixed for the
headline/baseline/goalRows/reality bar but the Pace panel was missed.

### BUG-2: Job/bill/goal label fields allow HTML/script injection into the DOM (stored XSS) [severity: blocker]

**RE-TEST (2026-07-06, commit `144b4c1`): FIXED, verified live.** Re-tested both attack surfaces
plus the normal-label regression the human specifically asked about:
- **Import path:** re-crafted the exact export-shaped JSON with the same bill-label payload
  (`"><img src=x onerror=window.__xss=true>`) and imported it via the file input. `window.__xss`
  never became `true`; the bills container's rendered HTML contains no raw `<img` tag, only the
  escaped entity form. The imported label's `.value` on the resulting input round-trips back to
  the exact original payload string (confirmed via `JSON.stringify` comparison) — i.e. escaping is
  reversible/correct, not lossy.
- **Direct typing:** typed the same payload into a job's Role field via a real `input` event,
  checked immediately, after a forced re-render (switching country), and after a full page reload
  (the payload persists to `localStorage` on every `calc()`, so this is the specific "re-fires
  every time" claim from the original bug). `window.__xss` stayed `false` in all three checks;
  rendered HTML contained only the escaped form, never a raw `<img`.
- **Normal-label regression check (asked specifically):** set a bill label to `Rent & bills` and a
  goal label to `Mum's birthday` via real `input` events. Both round-trip through `localStorage`
  and back through a page reload with the exact original string (`"Rent & bills"`, `"Mum's
  birthday"`) — confirmed by reading `input.value` (which the browser decodes back from the HTML
  entity form) and by inspecting the raw stored JSON directly. No visible `&amp;`/`&lt;`/`&gt;`
  artifact anywhere in rendered output, and no double-escaping (checked for `&amp;amp;`/`&amp;#39;`
  specifically — neither present). Escaping does not break normal punctuation.

Original steps to reproduce, preserved for record:
1. Craft a JSON file matching the export shape, with a bill entry:
   `{"id":"b1","label":"\"><img src=x onerror=window.__xss=true>","amount":100,"cat":"bills"}`
   (jobs/goals/shifts/history/settings present and valid per `validShape()`).
2. Import this file via the Import button.
3. Observe: the broken `<img>` tag renders as a real DOM element in the Monthly Outgoings list, and
   its `onerror` handler fires (confirmed: `window.__xss` becomes `true`).

Expected: per the mandatory security checklist ("no unescaped user content in DOM") and the
Builder Standing Orders ("never inject user content into the DOM unescaped"), user-controlled
strings must never be able to execute as HTML/script.
Actual (original, pre-fix): `renderJobs`, `renderBills`, and `renderGoals` all build their markup
via unescaped template-string interpolation (e.g. `` `<input value="${b.label}" ...>` ``) assigned
through `.innerHTML`. Any label containing a `"` followed by a tag breaks out of the `value`
attribute and becomes live markup. Confirmed exploitable via a crafted import file and via direct
typing, and persistent across reloads.

### BUG-3: Malformed (valid-JSON, wrong-shape) localStorage data crashes the entire app on load [severity: blocker]

**RE-TEST (2026-07-06, commit `144b4c1`): FIXED, verified live.**
`localStorage.setItem('shiftPlanner.v5','{}')` followed by a reload: zero uncaught page errors
(`pageerror` listener empty), Jobs renders 2 rows, Outgoings renders 4 rows, country select shows
`UK` — all matching `DEFAULT` seed data, not a broken empty shell. `S` (checked via `eval` in-page)
matches `DEFAULT` exactly, including a valid, freshly-stamped `addedAt` on the seed goal, and this
recovered state is written back to `localStorage` (not just held in memory) — confirmed by reading
`localStorage.getItem('shiftPlanner.v5')` after reload and finding the seed JSON there, not the
original `{}`.

**Specific interaction check asked for (validShape + backfillGoals):** constructed a
separate valid-shape payload (passes `validShape()`: all five arrays present, `settings` object
present) with a goal object that has no `addedAt` field at all, simulating pre-v9 stored data that
predates the field — distinct from the `{}` case, which falls all the way back to `DEFAULT` (whose
goal already carries an `addedAt` from construction, so that scenario alone wouldn't have exercised
this interaction). Set this as `localStorage`, reloaded: zero uncaught errors, and the goal in the
resulting `S` (and in what got saved back to `localStorage`) has a real, freshly-stamped `addedAt`
epoch-ms value. Confirms `load()`'s new `validShape()` gate returns the actual parsed object (not
falling back to `DEFAULT`) when the shape is valid, and `backfillGoals()` (called on `load()`'s
return value at top-level `let S=backfillGoals(load())`) still runs afterward and correctly fills
in the missing field — the two fixes compose correctly, neither short-circuits the other.

Original steps to reproduce, preserved for record:
1. `localStorage.setItem('shiftPlanner.v5', '{}')` (simulating any real-world corruption that
   preserves valid JSON syntax but not the expected shape — a partial write, a bug in some other
   version, a manual edit, browser sync merge, etc.)
2. Reload the page.

Expected: per the mandatory security checklist ("stored data read defensively — malformed data
cannot crash the app") and ARCHITECTURE.md's own stated guarantee ("`load()` wraps
`localStorage.getItem` + `JSON.parse` in try/catch and falls back to a deep clone of `DEFAULT` on
any read/parse failure — malformed storage degrades to seed data rather than crashing"), the app
should recover to seed data.
Actual (original, pre-fix): the app threw an uncaught `TypeError: Cannot read properties of
undefined (reading 'country')` at `index.html:286:23` (`csel.value=S.settings.country;`), which
aborted the rest of the initial script before any of
`renderJobs()/renderBills()/renderGoals()/renderShifts()/calc()` ran — a broken shell, not a
graceful reset.

### BUG-4: Numeric inputs accept negative/absurd values with no range validation [severity: major]

**RE-TEST (2026-07-06, commit `144b4c1`): FIXED, verified live.**
- Set job 1's "Rate /hr" to `-50` (job 2 left at its normal rate, both jobs' hours unchanged) via a
  real `input` event: "Blended gross/hr" and "Take-home/hr" both read `£4.40` — a positive,
  internally-consistent figure matching hand-calculation of the weighted average with job 1's wage
  clamped to `0` (`(0×24 + 13.20×12)/36 = £4.40`), not a negative figure. (One false-positive
  surfaced in this re-test: a page-wide regex for a bare `£-`/`-£` pattern matched — traced it to
  the *tax component breakdown* rows, "Income tax `-£0.00/hr`" and "National Insurance
  `-£0.00/hr`", which are the app's existing, intentional convention for displaying a deduction as
  a negative delta and unrelated to BUG-4; not a bug.)
- Set the same field to `1000000000`: "Blended gross/hr" reads `£6671.07`, "Take-home/hr" reads
  `£3544.65` — confirmed by hand as the exact result of clamping job 1's wage to the `10000` cap
  before averaging (`(10000×24 + 13.20×12)/36 = £6671.07`, matching exactly), not the unclamped
  absurd figure the original bug reported. Confirmed the raw stored value in `S.jobs[0].wage` is
  left un-clamped (`1000000000`, as designed — clamping happens at read time in `model()`/`jobRate()`,
  not by rewriting the input's own stored/displayed value, per the Handover's stated design choice).

Original steps to reproduce, preserved for record:
1. Set a job's "Rate /hr" to `-50` (with a second job at a normal rate).
2. Observe "Blended gross/hr" and "Take-home/hr" both show a negative currency figure (e.g.
   `£-28.93`), while the headline panel simultaneously shows the "add a job" empty state — an
   internally inconsistent read on the same underlying state.
3. Separately, setting a wage to `1,000,000,000` produces a take-home/hr of `£353,333,344.65` with
   no rejection or warning.

Expected: per the mandatory security checklist ("input validation at entry... type, length,
range") and Builder Standing Orders #9, user-facing numeric inputs should be validated for range
before use.
Actual (original, pre-fix): every numeric field only guarded against non-numeric garbage via
`+x||0` coercion but applied no range check — negative and absurd values were silently accepted
and produced nonsensical but non-crashing output.

## Security checklist

| Check | PASS/FAIL | Detail |
|---|---|---|
| Input validation at entry (type, length, range) | **PASS (re-tested, was FAIL)** | RE-TEST: `clamp()` now applied at every numeric read site in `model()`/`jobRate()`/`weekCoverage()`. Verified live: negative wage clamps to 0 (no negative output), absurd wage (1e9) clamps to the 10000 cap (output matches hand-calculation of the clamped figure, not the raw absurd one). See BUG-4 re-test. |
| No unescaped user content in DOM | **PASS (re-tested, was FAIL)** | RE-TEST: `esc()` applied at every label-interpolation site. Verified live via crafted import AND direct typing — neither executes; `window.__xss` never fires. Verified normal labels with `&`/`'` round-trip and render correctly with no visible entity artifacts and no double-escaping. See BUG-2 re-test. |
| No secrets, keys, or tokens in code | PASS | Grepped `index.html` for key/secret/password/token/bearer/private-key patterns — no matches. (Not re-run this cycle; fix cycle did not touch this area.) |
| Stored data (localStorage) read defensively | **PASS (re-tested, was FAIL)** | RE-TEST: `load()` now runs the same `validShape()` check used for imports. Verified live: `localStorage.setItem('shiftPlanner.v5','{}')` + reload recovers cleanly to seed data with zero uncaught errors, and the recovered state is persisted back to storage. See BUG-3 re-test. |
| Export/import can't execute arbitrary content | **PASS (re-tested, was FAIL)** | RE-TEST: same `esc()` fix covers the import path — crafted import with an XSS-payload bill label imports cleanly with no script execution. See BUG-2 re-test. |

## Deploy-infra readiness

| Check | PASS/FAIL | Detail |
|---|---|---|
| Pages build source matches the project's actual (no-build-step) stack | PASS | `gh api repos/gmanthenoxus/shift-planner/pages` → `"build_type":"legacy"`, `"source":{"branch":"main","path":"/"}`. This is the *correct* config for this project (unlike the org's first project, where legacy mode was wrong) — ARCHITECTURE.md explicitly documents there is no build step and no `.github/workflows`, confirmed no such directory exists in this repo. Legacy branch-deploy serving `index.html` directly from `main:/` is the right mechanism here. (Re-checked this cycle: config unchanged, still `legacy`/`main:/`.) |
| Live URL serves the current (v9) build | **PASS (re-checked against the fix-cycle commit)** | Original check: `git status` clean, local `main` matched `origin/main` at commit `669abd7` ("Build v9..."). RE-TEST: local `main` and `origin/main` now both sit at `144b4c1` ("Fix cycle: breaker's 3 blockers + BUG-4 resolved"). `curl`'d `https://gmanthenoxus.github.io/shift-planner/` and found both `Add a job with an hourly rate to see your pace` (the new BUG-1 fix's exact empty-state string) and `function esc(s)` (the new BUG-2 escaping helper) present in the live response — the fix-cycle build is genuinely live, not just committed locally. |

## Drift flags

- ARCHITECTURE.md's File-layout section states `load()` "falls back to a deep clone of DEFAULT on
  any read/parse failure — malformed storage degrades to seed data rather than crashing." This
  documented guarantee was factually incorrect for shape-malformed (but syntactically valid) data —
  see BUG-3. **RE-TEST: the shipped code now actually matches this documented guarantee** (BUG-3
  fixed and verified live); flagging that ARCHITECTURE.md itself was not amended this fix cycle
  (Handover's Touched field lists only `index.html`/`HANDOVER.md`) — the doc was accidentally
  correct in advance of the code, worth a human note but not a new drift.
- ARCHITECTURE.md's Pages table (section 2) does not list feature 3 (Infinity/NaN guard) against
  the "Shift log + pace panel" row, even though SCOPE's own criterion wording is unscoped ("no
  numeric display anywhere in the app"). This gap in the architecture's own per-section breakdown
  tracked exactly with where the guard was actually missed (BUG-1) — a whole-app, cross-cutting
  criterion wasn't carried into every row of a component-by-component plan. **RE-TEST: the
  underlying code gap (BUG-1) is now fixed; this specific ARCHITECTURE.md documentation gap was not
  addressed this fix cycle (not in Touched) and technically still stands as a documentation
  omission, though it no longer tracks a live bug.**
- ARCHITECTURE.md's Take-home summary component description implies this panel also gets the
  feature-3 empty-state treatment ("this panel and the headline/reality-bar area show the
  feature-3 empty state"). In the shipped code, the Take-home summary's gross/hr and net/hr
  fields are unconditional (`$("grossHr").textContent=...`/`$("netHr").textContent=...` run before
  any `net<=0` branch) and simply show `£0.00` (or previously a negative figure — see BUG-4,
  now clamped) rather than an empty-state message. Doesn't fail SCOPE's literal criterion wording
  (which names only the "headline/reality-bar area"), but is a minor mismatch against
  ARCHITECTURE.md's own description. **RE-TEST: unchanged by this fix cycle** — BUG-4's clamp fix
  means this panel no longer shows a negative/absurd figure, but it still shows a raw `£0.00`-style
  number instead of an empty-state message when net≤0; not part of this fix cycle's mandate and not
  re-scored here.
- No unjustified dependencies found: confirmed zero `<script src>`/network calls in `index.html`;
  icons are inline SVG strings exactly as ARCHITECTURE.md's Decisions log item 9 and the Handover
  describe. No new files beyond the documented file layout. (Not re-run this cycle — fix cycle
  added no dependencies per its own Handover, and this re-test's `git diff` review confirms no new
  `<script src>`/imports were introduced.)
- Design tokens, page structure, and per-component behavior otherwise match ARCHITECTURE.md's v9
  revision closely — no unplanned structural additions, no duplicated functionality found.

## Verdict: SHIP-READY

All three blockers from the previous pass (BUG-1, BUG-2, BUG-3) and the one major issue (BUG-4) were
re-tested live against commit `144b4c1` and are confirmed fixed:

1. BUG-1 — Pace panel no longer renders "NaN"/"Infinity" under either original repro path, nor
   under 5 additional swept combinations. Criterion 3.1 now PASS.
2. BUG-2 — stored XSS via job/bill/goal labels is blocked via both the import path and direct
   typing, persists correctly across reload with no execution, and normal-punctuation labels
   (`&`, `'`) are unaffected — no visible entity artifacts, no double-escaping.
3. BUG-3 — shape-malformed (valid JSON, wrong shape) `localStorage` now recovers cleanly to seed
   data with zero uncaught errors, and the `validShape()`/`backfillGoals()` interaction was
   specifically checked and composes correctly.
4. BUG-4 — negative and absurd numeric inputs are now clamped at read time; verified the clamped
   output matches hand-calculation exactly in both the negative-wage and absurd-wage cases.

Deploy-infra readiness re-checked against the new commit specifically (not assumed unchanged): the
fix-cycle commit is confirmed live at the production URL, not just committed locally.

Two pre-existing, non-blocking drift/documentation notes remain open (unchanged by this fix cycle,
not part of its mandate): ARCHITECTURE.md's Pages-table gap for the pace-panel guard, and the
Take-home summary's gross/hr and net/hr fields still not showing an empty-state message when
net≤0 (they now show a clamped, sane `£0.00`-class figure instead of a negative/absurd one, but not
the same empty-state pattern used elsewhere). Neither is a SCOPE criterion failure; both are
carried forward as documentation/consistency notes for a human decision, not blockers.

Everything else in the original pass (all 9 countries' tax corrections, the tax-basis change, goal
auto-expiry including the exact week-boundary, import shape-hardening, the `alert()` removals, and
all Feature 6 accessibility/touch-target items) was not re-run this cycle per the re-test rule, and
stands as previously recorded: PASS.
