# SCOPE History: Shift Planner
<!-- Append-only. One line per frozen version. Retrofitted 2026-07-06 -- the convention itself
     didn't exist yet when v8 and v9 were frozen, so both lines below were added after the fact,
     from real git log entries, not reconstructed from memory. -->

[2026-07-06] v8 — retroactive onboarding baseline: captured what the already-shipped app actually does — commit 77c4788
[2026-07-06] v9 — correctness/accuracy fixes: tax law corrections (incl. two independently-caught structural bugs), tax-basis change, Infinity/NaN fix, goal auto-expiry, import hardening, a11y/touch fixes — commit c83aee1

[2026-08-18] v10 — learning version: PWA/installable/offline, on-device usage stats, user-initiated feedback route, cookieless analytics, compliance surface, credit-agreement bill typing + the not-debt-advice boundary — commit e2418a7
<!-- Recorded retroactively 2026-08-19. The v10 freeze line was written on 18 Aug but sat uncommitted in the working tree and was never entered here; e2418a7 is the commit that first captured it, not a purpose-made freeze commit. v10 was superseded by v11 before any code was built against it (decision D1) — it is a frozen scope with no build behind it, which is why no QA-REPORT exists for it. -->
[2026-08-19] v11 — the model rebuild: v6 schema + migration, empty state + guided onboarding (kills the 6 Jul seed-data item), employers with rate cards and snapshot-on-log, dated obligations split into amortising lump sums and switch-on-date rate changes, the extra-hours headline, shift logging with rate picker + duplication, coverage frozen on banking, PWA, the activity-triggered compliance subset, copy pass via shift-planner-copywriter — commit 229505d

[2026-08-19] 2.0 — ANSWER FIRST, full restart. v11 archived unbuilt: it demanded a nine-field model before answering anything, and the human rejected the finished UI on sight. Two questions (hourly rate, monthly cost) produce the number; everything else is a refinement offered with a stated reason. Screens Now/Earn/Outgoings/Weeks, country inferred, one word "job" throughout. Tax tables and schema v6 ported from the archive, not retyped. Eight features — commit 0efd1b6
