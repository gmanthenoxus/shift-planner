# Parking Lot — ideas wait here for next version
<!-- Append-only. Written by scope-clerk (or manually if the clerk isn't running).
     Reviewed by the human at retro ONLY. Nothing in here is a commitment. -->

<!-- Entry format:
## [YYYY-MM-DD] <one-line title>
Source: <user | builder | other agent>
Verbatim: "<the idea exactly as stated>"
(optional) ESCALATE: build may be blocked without this
-->

## [2026-07-06] Fix or clarify the goal-expiry / hint-copy mismatch
Source: architect (via retroactive ARCHITECTURE.md)
Verbatim: "A goal's weekly-hours contribution never expires automatically... narrower than the UI's own hint text ('Adds extra hours on top, only while it runs'), which implies automatic expiry."
ESCALATE: this is a real correctness-vs-copy mismatch, not just polish — worth resolving one way or the other (add real expiry, or fix the copy) before v9 ships anything else.

## [2026-07-06] Confirm or change the tax-rate annualizing basis
Source: architect (via retroactive ARCHITECTURE.md)
Verbatim: "Effective tax rate is computed against annualized income at the user's full working ceiling... not against the sum of each job's entered 'typical hours/week.'"
ESCALATE: materially changes the net/hr number shown for progressive-bracket countries depending on which basis is intended — needs a decision, not just a note.

## [2026-07-06] Harden import validation beyond "does it parse"
Source: architect (via retroactive ARCHITECTURE.md)
Verbatim: "Import validates only that the file parses as JSON, not that the parsed object has the expected shape. A parseable-but-malformed file... loads without error and could break rendering."

## [2026-07-06] Tax bracket constants will drift out of date with no update mechanism
Source: architect (via retroactive ARCHITECTURE.md)
Verbatim: "Tax bracket constants are hardcoded per-country with specific thresholds... that will drift out of date over calendar years, with no update mechanism beyond direct code edits."

## [2026-07-06] No confirmation or undo on deleting a job/bill/goal/shift row
Source: builder (fresh product review, not architect)
Verbatim: "Reset all" is the only destructive action with a confirm dialog; deleting a single job, bill, goal, or shift row is instant and silent, with no undo — a stray tap loses real entered data.

## [2026-07-06] No way to duplicate a shift for repeating patterns
Source: builder (fresh product review)
Verbatim: shift work is often patterned (same start/end most weeks); every shift is currently entered from scratch with no "duplicate last shift" or template shortcut.

## [2026-07-06] History has no trend view across weeks
Source: builder (fresh product review)
Verbatim: the last 6 weeks show as individual cards with their own coverage bar; there's no at-a-glance line/trend of net earnings or hours worked over time, which is the kind of thing "am I actually getting ahead" needs.

## [2026-07-06] Personal seed data ships to every first-time visitor
Source: builder (fresh product review)
Verbatim: `DEFAULT` seed data is Moses' own real-shaped jobs ("Door supervisor", "Security guard") and a "Visa extension" goal — the README frames this as a public tool for any gig/multi-job worker, so a stranger's first-run screen currently shows what reads like someone else's real financial situation. Worth a decision: keep as a lived-in demo (fine if intentional) or neutralize for public use.

## [2026-07-06] No PWA/add-to-homescreen support
Source: builder (fresh product review)
Verbatim: this is a tool meant to be checked mid-shift on a phone; there's no manifest/add-to-homescreen affordance, so it only ever lives as a browser tab, not an app-like icon.

## [2026-07-06] Confirmed clean, not a finding: contrast and overnight-shift math
Source: builder (fresh product review)
Verbatim: ran real WCAG contrast ratios on every token pair (all pass AA, several pass AAA) and verified the overnight-shift time math (`if(m<0)m+=1440`) already correctly handles shifts crossing midnight. Logged here so a future retro doesn't re-check the same things from scratch.
