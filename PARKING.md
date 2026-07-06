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
Source: architect (via retroactive ARCHITECTURE.md); CONFIRMED with specifics by real tax-law research
Verbatim: "Tax bracket constants are hardcoded per-country with specific thresholds... that will drift out of date over calendar years, with no update mechanism beyond direct code edits."
Confirmed and expanded: researched all 9 countries against current official tax sources. Full findings, corrected numbers, and citations in `TAX-ACCURACY-AUDIT.md`. Not just drift — real structural bugs found: France's bracket array is shifted by one row (~55% under-count at €100k gross), US/Canada/Australia are all missing their top 1-2 tax brackets entirely (not just stale thresholds), Germany's flat-30% approximation materially misrepresents the real progressive curve, and Netherlands omits the arbeidskorting labour credit entirely (overstating Dutch tax for exactly the employee use case this app serves).
ESCALATE: real-money-affecting logic in a tool people use to plan actual work hours — strong candidate for v9's first priority, not routine maintenance.

## [2026-07-06] No confirmation or undo on deleting a job/bill/goal/shift row
Source: builder (fresh product review); CONFIRMED + REFINED by UI/UX review (ui-ux-pro-max: `confirmation-dialogs`, `undo-support`)
Verbatim: "Reset all" is the only destructive action with a confirm dialog; deleting a single job, bill, goal, or shift row is instant and silent, with no undo — a stray tap loses real entered data.
UX refinement: don't add a `confirm()` dialog per row — that's excess friction for a low-stakes, frequent action. The framework's recommended pattern is an "Undo" toast after delete (3-5s auto-dismiss, matching `toast-dismiss`), not a blocking confirmation before it.

## [2026-07-06] No way to duplicate a shift for repeating patterns
Source: builder (fresh product review); UX refinement added
Verbatim: shift work is often patterned (same start/end most weeks); every shift is currently entered from scratch with no "duplicate last shift" or template shortcut.
UX refinement: concrete pattern is a small "duplicate" affordance on each shift row (copy icon, not text) that clones job/start/end/break into a new row for the user to adjust — cheaper to build and more discoverable than a separate "template" concept.

## [2026-07-06] History has no trend view across weeks
Source: builder (fresh product review); CONFIRMED by UI/UX review (ui-ux-pro-max Charts & Data: `trend-emphasis`, `chart-type`)
Verbatim: the last 6 weeks show as individual cards with their own coverage bar; there's no at-a-glance line/trend of net earnings or hours worked over time, which is the kind of thing "am I actually getting ahead" needs.
UX refinement: the framework's own chart-type rule confirms this — a trend is a line-chart job, not another donut/bar. A small sparkline of net-per-week alongside the existing history cards (not replacing them) is the correct addition.

## [2026-07-06] Personal seed data ships to every first-time visitor
Source: builder (fresh product review)
Verbatim: `DEFAULT` seed data is Moses' own real-shaped jobs ("Door supervisor", "Security guard") and a "Visa extension" goal — the README frames this as a public tool for any gig/multi-job worker, so a stranger's first-run screen currently shows what reads like someone else's real financial situation. Worth a decision: keep as a lived-in demo (fine if intentional) or neutralize for public use.

## [2026-07-06] No PWA/add-to-homescreen support
Source: builder (fresh product review)
Verbatim: this is a tool meant to be checked mid-shift on a phone; there's no manifest/add-to-homescreen affordance, so it only ever lives as a browser tab, not an app-like icon.

## [2026-07-06] Confirmed clean, not a finding: contrast and overnight-shift math
Source: builder (fresh product review)
Verbatim: ran real WCAG contrast ratios on every token pair (all pass AA, several pass AAA) and verified the overnight-shift time math (`if(m<0)m+=1440`) already correctly handles shifts crossing midnight. Logged here so a future retro doesn't re-check the same things from scratch.

## [2026-07-06] Support multiple currencies, not one currency tied to the selected tax model
Source: user (Moses, relaying feedback)
Verbatim: "You need to have different currencies"
ESCALATE: currently one `COUNTRIES` entry bundles a currency symbol AND a tax model together (SCOPE NOT-doing item: "one tax model applies at a time"); real request is to decouple currency choice from tax-model choice, which is a bigger structural change than a bug fix — needs its own design pass, not a quick patch.

## [2026-07-06] Occupation/job title should be a dropdown of common occupations, not free text
Source: user (Moses, relaying feedback)
Verbatim: "for the occupations You should use a drop down menu As opposed to just typing it So if we're using drop downs then you'll need to have a lot of occupations"
ESCALATE: implies maintaining a real, reasonably long occupations list — worth scoping how long (a few dozen common shift/gig roles vs. an exhaustive list) before committing, since "a lot of occupations" is a real content-authoring cost, not just a UI change.

## [2026-07-06] Icon glyphs should be real SVG icons, not Unicode characters
Source: builder (UI/UX review, ui-ux-pro-max: Style Selection `no-emoji-icons`/consistent icon set, and the org's own noxus-design-system Global Icon Rule)
Verbatim: delete buttons use a bare "✕" character; toolbar buttons use "↓" (export), "↑" (import), "↻" (new week) as literal Unicode glyphs, not icons from a proper library. This isn't emoji, but it's the same underlying problem the org's global icon rule exists to prevent: font-dependent glyphs render inconsistently across devices and read as unpolished. All icon-only buttons also have no `aria-label`, so a screen reader gets the bare character or nothing meaningful.
Fix: swap to a real icon library (Lucide, matching what the rest of the org already standardized on) and add `aria-label` to every icon-only button (delete, export, import, new week).

## [2026-07-06] Delete buttons are under the minimum touch target size
Source: builder (UI/UX review, ui-ux-pro-max: Touch & Interaction `touch-target-size`, CRITICAL priority)
Verbatim: `.x` (delete) buttons are `font-size:18px` glyph + `padding:8px`, roughly ~34×34px tappable area — under the 44×44px minimum, and this is explicitly "a tool meant to be checked mid-shift on a phone" per the existing PWA parking entry, so this isn't a desktop-only nitpick.
Fix: increase padding or add explicit min-width/min-height:44px on `.x` and any other icon-only tap target.

## [2026-07-06] No visible keyboard focus state on buttons
Source: builder (UI/UX review, ui-ux-pro-max: Accessibility `focus-states`, CRITICAL priority)
Verbatim: `input,select` get a focus style (`border-color:var(--accent2)`), but `.btn`/`.x` buttons only define an `:active` state, not `:focus` — a keyboard user tabbing through toolbar/delete/add buttons gets no visible indicator of where focus is.
Fix: add a visible `:focus-visible` style (outline or border color) to `.btn` and `.x`, matching the existing input focus treatment.

## [2026-07-06] Blocking native alert() used for two error/empty states
Source: builder (UI/UX review, ui-ux-pro-max: Forms & Feedback `error-clarity`, `empty-states`)
Verbatim: bad import shows `alert("Couldn't read that file.")`; clicking "New week" with no shifts logged shows `alert("No shifts logged this week yet.")` — both block the whole page with a native browser dialog, which is inconsistent with the app's otherwise-good inline empty-state pattern used everywhere else (e.g. the goals list's own "No one-off goals." message).
Fix: replace both alerts with the same inline-message pattern already used elsewhere in the app — no new UI language needed, just applying the existing pattern consistently.

## [2026-07-06] Per-job "Role" input has no visible label
Source: builder (UI/UX review, ui-ux-pro-max: Forms & Feedback `input-labels`, placeholder-only anti-pattern)
Verbatim: the job-row role input only has `placeholder="Role"`, no visible `<label>`, unlike the rate/hours/pension sub-fields in the same row which all have proper small labels.
Fix: minor — add the same small label style already used for the other three sub-fields in that row.

## [2026-07-06] "Infinity hrs/week over the line" — confirmed real bug, root cause found
Source: user (Marlene Asare, real end-user via WhatsApp, relayed by Moses, 2026-06-23)
Verbatim: "what does infinity hrs/week over the line mean ?" — followed by her own walkthrough: "went on the Website then added job title then added the hours which I added the max on how much days I worked" / "It said other income but I didn't have any plus monthly outgoing didn't have it either" / "Then I did monthly goal and that's it"
Builder note (root cause, verified in code, not guessed): when `net` (take-home/hr) is 0 — e.g. a job with no rate entered, or fields swapped between the per-job "typical hrs/wk" field and the global "max days/week" ceiling field, matching her own description of what she did — `baseHrsMo` and each goal's `hrsTotal` become `Infinity` (`net>0?...:Infinity` in `model()`). The main headline already guards this correctly (`isFinite(m.totalWk)?...:"—"` shows an em-dash). The reality-bar "over the line" message does NOT guard it: `${(m.totalWk-m.maxWeekly).toFixed(1)} hrs/week over the line` calls `.toFixed(1)` on `Infinity`, which literally renders the string "Infinity" — that's the exact text she saw. This is a real, reproducible bug (inconsistent guarding of the same non-finite state across UI locations), not a copy/explanation gap — the whole reality-bar block (`baseHrsWk`, `totalWk`, and the over/headroom line) needs the same `isFinite` guard the headline already has, not a tooltip explaining what "Infinity" means.
ESCALATE: blocker-tier from a real user's actual confusion, not a nice-to-have — a first-time user hit a raw JS artifact on her first real session and didn't know what to do next.
UX refinement (ui-ux-pro-max: `empty-states`): guarding the display isn't the whole fix. When `net` is genuinely 0 (no job rate entered yet), the better pattern isn't just falling back to an em-dash the way the headline does — it's a proactive empty-state message ("Add a job with an hourly rate to see your numbers") in place of the whole headline/reality-bar block, matching the same helpful-empty-state pattern the app already uses well elsewhere (goals list, shifts list).

## [2026-07-07] Jobs and Outgoings lists render blank with zero rows, unlike Goals/Shifts
Source: design-translator (via retroactive TECH-PACK.md)
Verbatim: "renderJobs()/renderBills() render nothing (an empty container) when S.jobs/S.bills is an empty array — unlike renderGoals()/renderShifts(), which both show an explicit 'No goals'/'No shifts logged this week' message in that case."
ESCALATE: cosmetic today only because `DEFAULT` always seeds non-empty jobs/bills, so a real user can't currently reach an empty Jobs/Outgoings list through normal use — but this becomes reachable the moment the still-open seed-data decision (personal vs. neutral, or a "start from scratch" option) resolves either way. Worth fixing alongside whichever seed-data decision lands, not independently before then.
