# QA Report: Shift Planner 2.0, 2026-08-19

Breaker pass against `SCOPE.md` 2.0 (FROZEN 2026-08-19, 8 features, plus two changelog amendments)
and `ARCHITECTURE.md` 2.0. Read-only on the build. Nothing was fixed.

Evidence: 134 behaviour tests (`docs/process/v2-tests.js`) plus a 21-check cruelty and security
pass (`docs/process/cruelty-pass.js`), both run this session against the committed `index.html`.

---

## Acceptance criteria

| # | Criterion | Verdict | Notes |
|---|---|---|---|
| 1.1 | Cold open shows one line and one button, no numbers, no seed data | PASS | Asserted no digits anywhere in the cold open |
| 1.2 | Q1 hourly rate, Q2 monthly cost as one number | PASS | |
| 1.3 | Country inferred, never asked, shown as changeable | PASS | Timezone first, language region fallback, UK floor. 5 inference cases tested |
| 1.4 | Inference visible where money appears, not hidden in Settings | PASS | Line sits under the answer |
| 1.5 | Answering both lands directly on the number, no confirmation step | PASS | |
| 1.6 | Each answer commits to storage as given, so a drop-out resumes | PASS | Verified the blob after Q1, before Q2 |
| 1.7 | "I have a backup file" goes straight to import | PASS | Wired to the file picker |
| 2.1 | One figure, hours a week, with the inputs restated in one plain line | PASS | |
| 2.2 | Missing input names what is missing, never `0.0` with a tick | PASS | Tested with no job, no rate, no outgoings |
| 2.3 | No jargon on this screen: no baseline, ceiling, blended | PASS | Grep clean |
| 2.4 | Never renders `Infinity`, `NaN`, or a fabricated number | PASS | Held through 19 hostile input values in every field |
| 3.1 | Refinements state what they buy, one tap, act on arrival | PASS | |
| 3.2 | Set covers rate, split cost, hours, goal, second job | PARTIAL, see BUG-2 | "Set a limit" was removed by changelog; the other five are present |
| 3.3 | Every refinement optional and reversible | PASS | App works with none |
| 3.4 | Adding one updates the number immediately | PASS | |
| 4.1 | ONE control to add a shift | PASS | Exactly one, asserted |
| 4.2 | Shift records date, job, rate, start, end, break | PASS | |
| 4.3 | Rate and job name snapshotted at log time | PASS | Editing then deleting the rate left the shift's pay unchanged |
| 4.4 | Week's shifts show hours, pay per shift, and one total | PASS | |
| 4.5 | Overnight correct across a month boundary and the October clock change | PASS, with a caveat | Five wall-clock cases pass, including 18:00 to 02:00 and 00:30 to 08:30. **The clock-change case is passed by design, not by date arithmetic:** times are treated as wall clock, so a DST night is the hours the clock showed. That is a deliberate architectural choice, not a tested date computation |
| 5.1 | Banking freezes what the week covered | PASS | Editing an outgoing to 99999 afterwards did not alter the banked row |
| 5.2 | Rows newest first: date, hours, earned, what it reached in your order | PASS | Coverage order matched stored order exactly |
| 5.3 | An empty Weeks screen says so | PASS | The v11 defect is closed |
| 6.1 | Country, appearance, export, import, reset all in one place | PASS | |
| 6.2 | Tax disclaimer accurate to what is simplified | PASS | |
| 6.3 | Plain not-debt-advice statement with a pointer to free regulated advice | FAIL | See BUG-1 |
| 6.4 | WCAG 2.2 AA: 4.5:1 pairs, no colour-only state, visible keyboard focus | UNTESTABLE here | jsdom computes no layout or contrast. Token pairs were measured at design time; the built page has never been measured or seen |
| 7.1 | Every string written by `shift-planner-copywriter`, checked against Rule 0 | FAIL | See BUG-3 |
| 7.2 | One word for one thing across the app | PASS | "job" throughout, no "employer" in any visible string |
| 7.3 | Nothing appears twice on one screen | PASS | |
| 8.1 | New key and schema, nothing migrated | PASS | `shiftPlanner.2` at `v:1` |
| 8.2 | Old keys never read, written or deleted | PASS | Neither appears outside a comment |
| 8.3 | No reserved fields for deferred features | PASS | |
| 8.4 | Export and import round-trip | PASS | Own export validates and re-saves byte-identical |
| 8.5 | A higher-version blob is refused and left untouched | PASS | `v:99` refused, byte-identical after, and the user is told |
| NAV | "Outgoings" does not wrap at 320px | UNTESTABLE here | Needs a real viewport |

---

## Bugs

### BUG-1: Free-advice pointer is UK-only while the app supports nine countries [severity: major]
Steps to reproduce: 1) Complete onboarding. 2) Settings. 3) Read "What this is, and is not".
4) Change country to United States, Canada, Australia, Ireland, Germany, France, Netherlands or Spain.
Expected: a pointer to free regulated debt advice usable in the selected country.
Actual: MoneyHelper and Citizens Advice are named regardless. Both are UK-only services.
Why it matters: this sits in the compliance surface, which is the part of the app whose whole
purpose is to be accurate about what it is and is not. Eight of nine supported countries are given
a route that does not serve them.

### BUG-2: A refinement named in the frozen scope no longer exists [severity: minor]
Steps to reproduce: 1) Complete onboarding. 2) Read the refinement list.
Expected, per SCOPE f3: five refinements including "set a limit on your hours".
Actual: five refinements, none of which is the limit; it was removed along with the limit section.
Why it matters: the removal is recorded in SCOPE's changelog, so the build is correct and the
feature text is stale. Flagging it because the criterion and the changelog now disagree, and only
the human can decide which one is wrong.

### BUG-3: The copy pass has not run [severity: blocker]
Steps to reproduce: 1) Read any string in the app. 2) Check `HANDOVER.md` for a copywriter pass.
Expected, per SCOPE f7: every string written by `shift-planner-copywriter` and checked against Rule 0.
Actual: every string is Builder-written. The mechanical Rule 0 sweep (banned words, judgement words,
em-dashes, emoji, exclamation marks, first-person plural) is clean, but that checks vocabulary, not
tone, reading age, or whether a sentence helps. The seat that owns this has not run.
Why it matters: SCOPE f7 is a feature with zero implementation. It is a blocker by the rule that a
failed criterion is failed, not by any observed harm.

---

## Security checklist

| Check | Verdict | Detail |
|---|---|---|
| Every input validated for type, length, range before use | PASS | 19 hostile values into every field across three screens; all coerced, no errors |
| User content never injected unescaped into the DOM | PASS | `<img src=x onerror=...>` and `<b onclick>` in labels produced zero injected nodes on the item list and on the banked-week screen |
| No secrets, keys or tokens | PASS | Source grep clean |
| Stored data read defensively | PASS | Truncated, empty, null, array, missing arrays, wrong-typed version, null array, future version: eight cases, no crash, correct screen each time |
| Imported data cannot execute anything | PASS | Import validates shape then assigns; no `eval`, no `innerHTML` of a raw stored value |
| No network egress | PASS | No `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` or external `<script src>`. The "nothing leaves your browser" claim is structurally true |

---

## Deploy-infra readiness

| Check | Verdict | Detail |
|---|---|---|
| Pages `build_type` is correct for this stack | UNTESTABLE here | `gh` is not available in this sandbox and the network is restricted. **The human must run `gh api repos/gmanthenoxus/shift-planner/pages` before shipping.** For this project legacy branch-deploy from `main:/` is the CORRECT mode, per ARCHITECTURE section 5: there is no build step, so a workflow build would be ceremony. The check is to confirm it is serving `main:/`, not to convert it |
| Deploy workflow builds from the right directory | PASS, by absence | No `.github/workflows`. Nothing can build the wrong folder |
| The thing Pages would serve exists at the root | PASS | `index.html` is the only HTML file at root |
| No external references that could 404 | PASS | The file has zero `src` or `href` attributes. Fully self-contained |
| 31 commits are unpushed | NOTED | `origin/main` is 31 behind. Nothing is live yet regardless of Pages config |

---

## Drift flags

- **Blended rate deviates from `ARCHITECTURE.md` section 3, deliberately and declared.** The
  architecture says the blended rate becomes the weighted average of the current week's logged
  shifts when any exist. The build does not do this: stated rates are what you are paid, logged
  shifts are what you earned. The Builder flagged it in the handover and asked for a ruling. **It
  is still unruled.** The architect must correct section 3 or overrule the build.
- `ARCHITECTURE.md` section 4 still lists "your limit" under the Earn screen. Removed by SCOPE
  changelog. Same class as BUG-2.
- No unjustified dependencies. `jsdom` is dev-only, not referenced by the app, not committed.
- No duplicated functionality found. `renderTakehome` and `renderOutTotal` were split out of
  larger renders deliberately, and each has one caller path.

---

## Verdict: NOT READY

Blocking:

1. **BUG-3, the copy pass has not run.** SCOPE f7 has no implementation.
2. **BUG-1, the free-advice pointer is wrong for eight of nine countries**, in the compliance
   surface.

Also required before the human's ship decision, neither of which I can perform:

3. **Someone must look at the built page.** 2.0 has never been rendered by a human or a browser.
   WCAG 2.2 AA (criterion 6.4) and the 320px navigation check are UNTESTABLE from here, and this
   project has twice shipped faults that only became visible on screen.
4. **Confirm the Pages source.** Read-only check, one command, listed above.

Not blocking, but the human owns them: BUG-2 and the two drift flags are all cases where a
document and the build disagree, and only the human can say which is wrong.

---

# Re-test, 2026-08-19

Fix cycle. Per the re-test rule, only previously failed items plus what the fix touched.

| Item | Verdict | Evidence |
|---|---|---|
| BUG-1, UK-only advice pointer | **FIXED** | New check at `docs/process/bug1-advice-pointer.js`: all nine countries plus the flat-rate mode verified. No UK-only service is named outside the UK; the generic line appears everywhere else; the not-debt-advice statement and "will not tell you what to pay or when" survive every country; no steering language |
| BUG-3, copy pass | **RUN** | `shift-planner-copywriter` seat ran over every visitor-facing string. Two decisions recorded as COPY-DECK C10 and C11 |
| Criterion 6.3, free advice pointer | PASS | Was FAIL |
| Criterion 7.1, copy written by the seat | PASS | Was FAIL |
| Deploy-infra: Pages source | PASS | `gh api` returned `build_type: legacy`, `source: main:/`, `https_enforced: true`, `status: built`. Legacy is CORRECT for this project: no build step, so a workflow build would ship the same file through more machinery |
| Regression: full suite | PASS | 134 behaviour tests, 21 cruelty and security checks, 6 advice-pointer checks. All green |

**A regression the fix caused and a test caught:** the copy pass shortened the tax disclaimer from
"a simplified estimate" to "an estimate". That is weaker, and SCOPE f6 requires the disclaimer be
accurate to what is *actually* simplified. Restored, and recorded as COPY-DECK C11 so it is not
shortened again.

## Revised verdict: SHIP-READY, with two things the human is shipping knowingly

Both blockers are cleared and the deploy target is confirmed. Two items remain UNTESTABLE from
here and are **not** waived, they are simply outside what this seat can execute:

1. **Criterion 6.4, WCAG 2.2 AA on the built page.** Token pairs were measured at design time.
   The rendered page has never been measured, and jsdom computes no layout or contrast.
2. **The 320px navigation check**, same reason.

Neither has been observed to fail. Neither has been observed at all.

