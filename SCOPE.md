# SCOPE: Shift Planner v9
<!-- Approved and frozen by the human 2026-07-06. Supersedes v8's SCOPE.md, preserved in git
     history at commit 77c4788. Two forks left open in the original draft (tax-rate basis,
     goal-expiry behavior) were resolved by the human before freeze — see Features 2 and 4. -->

## Problem

v8 shipped with real accuracy and usability defects that undermine trust in its numbers: two structural tax-calculation bugs (not just stale rates), a literal "Infinity" string reaching a real user, and a handful of accessibility/interaction gaps on a tool meant to be checked mid-shift on a phone. v9 fixes what's broken before anything new gets added — a coherent "make it trustworthy" version, not a grab-bag.

## Features — this version ONLY

1. **Correct all 9 countries' tax calculations per `TAX-ACCURACY-AUDIT.md`**
   - Criteria: France's bracket loop no longer under-counts (verified against the audit's €100k gross example: should compute ~€25,229, not €11,188).
   - Criteria: US, Canada, and Australia each include their top 1-2 previously-missing brackets (37%/33%/45% respectively).
   - Criteria: Germany's income tax uses a multi-band effective-rate approximation, not a flat 30%.
   - Criteria: Netherlands includes the arbeidskorting labour credit.
   - Criteria: all remaining stale thresholds/rates (UK, Ireland, US deduction, Canada BPA, Australia Medicare threshold, France bands, Spain SS ceiling) match the audit's corrected figures.
   - Criteria: the footer's existing "simplified effective-rate estimates" disclaimer stays accurate to what's actually simplified (no per-credit/allowance precision claimed).

2. **Change the tax-rate annualizing basis to typical entered hours**
   - Criteria: the effective tax rate is computed against each job's entered "typical hrs/wk" (annualized), not against the working ceiling (max days × max hours). This changes the net/hr shown for progressive-bracket countries — expected and correct.
   - Criteria: `ARCHITECTURE.md`'s decisions log records this as a confirmed, deliberate change, not an open flag.

3. **Fix the "Infinity" display bug and add a real empty state**
   - Criteria: no numeric display anywhere in the app can render the literal string "Infinity" or "NaN" under any input combination, including net take-home of 0.
   - Criteria: when take-home/hr is 0 (no job with a rate entered), the headline/reality-bar area shows a helpful empty-state message instead of any hours/feasibility numbers.

4. **Add real auto-expiry to one-off goals**
   - Criteria: a goal stops contributing extra hours once its week count has elapsed since it was added, matching what the existing hint text ("only while it runs") already promises.
   - Criteria: an expired goal is visually distinguished (not silently vanished) so the user knows it ran out rather than wondering where it went, and can delete or re-add it.

5. **Harden import and replace blocking alerts**
   - Criteria: importing a parseable-but-wrong-shaped JSON file is rejected with a clear inline message, not a silent load that can break rendering.
   - Criteria: the "bad import" and "no shifts logged" messages both display inline (matching the app's existing empty-state pattern), not via `alert()`.

6. **Accessibility and touch-target fixes**
   - Criteria: every icon-only button (delete, export, import, new week) uses a real SVG icon (one library, per the design system's global icon rule) and has an `aria-label`.
   - Criteria: delete buttons and other icon-only tap targets measure at least 44×44px.
   - Criteria: `.btn` and `.x` buttons show a visible focus state on keyboard tab, not just `:active`.
   - Criteria: the per-job role input has a visible label, matching its sibling fields.

## NOT doing (this version)

- Multi-currency decoupled from tax model — real, valid request, but a structural redesign of the `COUNTRIES` object, not a v9-sized fix. Candidate for v10.
- Occupation dropdown — needs its own scoping pass (how long a list, which roles) before it's buildable. Candidate for v10.
- Shift duplication — real usability win, but additive not corrective; keeping v9 to fixes only. Candidate for v10.
- History trend/sparkline view — same reasoning, additive. Candidate for v10.
- Personal vs. neutral seed data — a content decision, not a defect; needs your call independent of this fix-focused version.
- PWA/add-to-homescreen support — additive, bigger than a v9 fix. Candidate for v10.

## Freeze

FROZEN: 2026-07-06

## Changelog

<!-- None yet. -->
