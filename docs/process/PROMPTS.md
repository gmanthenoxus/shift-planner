# PROMPTS — Shift Planner v11 end-to-end rebuild

<!-- Written 2026-08-18. This file is a run-book, not a governance file. It contains no
     decisions of its own: every decision it encodes was made by the human on 2026-08-18
     and is listed in §2 so a future session can see exactly what was chosen and when. -->

## 1. How to use this

Open a Claude Code session in `/Users/noxus/Builds/Shift Planner/`. Run the prompts **in
order**. One prompt per session where possible — they are sized so that each ends at a
natural handover point.

Three rules that make this work:

- **Paste the Standing Preamble (§3) at the top of every session.** Every prompt below
  assumes it. Without it the session has no memory of why anything is the way it is.
- **Never run two prompts in one session without a handover between them.** The handover
  is the only memory this organization has.
- **A prompt that ends with unanswered Open items does not advance.** Answer them, then
  re-run the same prompt. Moving on with an unresolved Open is how the v10 freeze ended
  up carrying five of them.

Prompts 1 and 2 produce governance documents and are **human-signed**. Everything from 4
onward is Builder work against a frozen scope.

---

## 2. Decisions already made — do not re-litigate

Made by the human 2026-08-18. A session that reopens one of these is wasting the session.

| # | Decision | Choice | Consequence |
|---|---|---|---|
| D1 | v10 freeze | **Superseded by a v11 re-freeze**, not abandoned | The human asked for a full end-to-end rebuild. Governance is kept by re-freezing at the larger scope, not by building without a scope. v10's six features are carried forward into v11 intact, not dropped. |
| D2 | Seed data | **Empty state + guided onboarding** | Kills the oldest open item in `PARKING.md` (6 Jul). No stranger sees the builder's financial life. |
| D3 | Analytics | **Cut** | Answered part of one of the four questions and none of the other three. Feedback route only. Re-add above ~100 users. |
| D4 | ICO registration | **Research first, then decide** | Prompt 1a. The feedback inbox makes registration unavoidable either way; what is open is *whose name*. |
| D5 | Feedback destination | **A dedicated project email** | Personal WhatsApp number stays out of a public privacy notice. |

**D1 in plain terms:** the human explicitly chose to break the v10 freeze in favour of a
full end-to-end build. The re-freeze is how that is done without leaving the breaker with
nothing to test against. If a session finds itself building something that maps to no
numbered feature in `SCOPE.md` v11, it has drifted — stop and park it.

---

## 3. Standing Preamble — paste at the top of EVERY session

```
Read these before writing anything, in this order:
  HANDOVER.md (latest entry), SCOPE.md, ARCHITECTURE.md, CLAUDE.md, PROMPTS.md §2.

You are the Builder unless the prompt says otherwise. Standing orders in CLAUDE.md apply
in full. In particular:
  - Build only what SCOPE.md lists. Work that maps to no numbered feature does not get built.
  - Never invent a requirement. If a field, behaviour, edge case or validation rule is
    unstated, STOP and ask me. State your recommended default, but do not proceed on it.
  - Better ideas get parked via the scope-clerk agent, not built. Especially your good ideas.
  - You are read-only on SCOPE.md, ARCHITECTURE.md, PARKING.md and the design token doc.
  - Visitor-facing copy routes through shift-planner-copywriter, never you.
  - You never mark your own work done. Your strongest claim is "implemented and handed over."

Four decisions are already made and are not open: empty-state onboarding replaces seed
data; analytics is cut; feedback goes to a dedicated project email; the v10 freeze was
deliberately superseded by v11. See PROMPTS.md §2.

End the session with a HANDOVER.md entry: Done / Assumed / Risky / Open / Touched.
No field omitted. "Assumed: none" must be literally true, not unexamined.
```

---

## 4. The prompts

### Prompt 1a — ICO research (run first, it blocks the privacy notice)

> Act as the researcher, not the Builder. Do not touch code.
>
> I need to decide who registers with the ICO as data controller for Shift Planner: me
> personally as a sole trader, or a Noxus limited company that does not exist yet.
>
> Answer against primary sources (ico.org.uk first, then gov.uk):
> 1. What exactly appears on the ICO's public register of fee payers for a sole trader —
>    name, address, anything else? Can a home address be withheld, and by what process?
> 2. Current fee tiers and amounts, and which tier applies to a one-person app with a
>    feedback inbox.
> 3. Whether registering personally and later transferring to a company is straightforward
>    or messy.
> 4. What the privacy notice and the s.164A complaints route must name in each case.
>
> Give me a recommendation with the tradeoff stated both ways, label every claim
> [Observed] / [Inference] / [Unknown], and write the result to `ICO-DECISION.md`.
> Do not modify SCOPE.md, ARCHITECTURE.md, PARKING.md or CLAUDE.md.

---

### Prompt 1 — Re-freeze: draft SCOPE.md v11

> Act as the scope author. Do not write code this session.
>
> `SCOPE.md` v10 is frozen but I have deliberately superseded it: I want the full
> application built end to end, from cold open through onboarding, profile creation, the
> weekly planning loop and banking a week, to feedback and the compliance surface.
> Breaking a freeze without replacing it would leave the breaker nothing to test against,
> so we re-freeze at the larger scope instead.
>
> Draft `SCOPE-v11-CANDIDATE.md`. It must:
>
> - **Carry forward all six v10 features intact** — PWA/offline, local usage stats,
>   feedback route, compliance surface, credit-agreement bill typing and the
>   not-debt-advice boundary — minus analytics, which I have cut (decision D3).
> - **Add the end-to-end capability features**, each with acceptance criteria written so a
>   breaker can pass or fail them without asking me anything:
>   1. Empty state and guided onboarding replacing seed data (decision D2)
>   2. Jobs as employers with a **rate card** — several named rates per employer, a logged
>      shift selects which rate applied, blended rate becomes a weighted average of shifts
>      actually worked
>   3. Outgoings that carry an optional **hard date** and an optional **rate**, so a 0%
>      promo expiry and a dated land payment are both representable
>   4. Obligations denominated in a **second currency**, with a user-entered FX rate, a
>      date stamp, and a staleness warning — no network call, ever
>   5. Working ceiling extended with **protected time blocks** that reduce the real ceiling
>   6. A headline **"extra hours needed this week"** figure — hours beyond what is already
>      committed, not total hours needed
>   7. Shift duplication (parked 6 Jul) and a rate picker on the shift form
> - **State what is NOT in v11 and why**, with at minimum: accounts/sync/backend (gated on
>   20 real users with week-two return), live FX (breaks offline-first), analytics (cut),
>   and any ranking or recommendation between obligations (permanently out — art. 39E RAO
>   / PERG 17).
> - **List every open question that must be answered before freeze.** If there are none,
>   say so explicitly rather than leaving the section out.
>
> Ordering rule for the criteria: anything that changes the shape of stored data comes
> before anything that reads it.
>
> I will edit and freeze it myself. Do not write to `SCOPE.md`.

**Human step between 1 and 2:** read the candidate, cut what you do not want, copy it to
`SCOPE.md`, append the freeze line, append a line to `SCOPE-HISTORY.md`, commit. **No code
before this is done.**

---

### Prompt 2 — Architecture pass

> Act as the architect. `SCOPE.md` v11 is frozen. Do not write feature code this session.
>
> Update `ARCHITECTURE.md` to cover v11. Six things need architectural decisions, not
> Builder improvisation:
>
> 1. **Service worker update strategy.** This is the highest technical risk in the project.
>    A single-file app behind a service worker can pin a user to superseded tax maths with
>    no way to know and no way out short of clearing site data. Specify the strategy, the
>    version-check mechanism, and what the user sees when an update is available.
> 2. **Storage schema migration** `shiftPlanner.v5` → `v6`. Rate cards, dated outgoings,
>    second-currency obligations and protected blocks all change the shape of stored data.
>    Specify the migration, what happens to a v5 blob, and what happens to a blob from a
>    version that does not exist yet.
> 3. **Rate card data model** and how blended rate is derived from shifts actually worked
>    rather than from declared typical hours.
> 4. **Dated obligations** — how a hard date and an optional rate attach to an outgoing
>    without turning the outgoing into a goal.
> 5. **Second-currency obligations** — where the FX rate and its date stamp live, and how
>    staleness is defined.
> 6. **The no-ranking constraint, recorded with its reason** (art. 39E RAO / PERG 17, per
>    `REQUIREMENTS.md` §3.6) in the decisions log, so a future session cannot helpfully
>    improve the app into a regulated activity.
>
> Also state the build order for prompts 4–13 and say which pieces can be done in any
> order and which cannot.
>
> Flag explicitly if any frozen criterion cannot be met on the approved stack
> (single-file, vanilla JS, no build step). Do not quietly work around it — the
> no-framework choice was reasonable at ~500 lines and is not a permanent ceiling, but
> changing it needs my sign-off in writing.

---

### Prompt 3 — Storage schema and migration, alone

> Builder. Implement **only** the `shiftPlanner.v5` → `v6` schema and migration, exactly as
> `ARCHITECTURE.md` specifies. No UI. No features.
>
> This is deliberately a whole session on its own because everything downstream reads this
> shape, and a migration bug found in week three is a data-loss bug in a financial tool.
>
> Required:
> - A v5 blob migrates cleanly and loses nothing.
> - A blob with an unknown future version does not crash the app and does not silently
>   destroy data.
> - Malformed, truncated and hand-edited localStorage all fail safe (standing order 9).
> - Export/import round-trips at v6, and importing a v5 export still works.
> - Every migration step carries a one-line WHY comment.
>
> Write throwaway console assertions for each of those five cases and show me the output.
> Do not delete them until the breaker has run.

---

### Prompt 4 — Empty state and guided onboarding

> Builder. Implement the empty state and the guided onboarding flow, per `SCOPE.md` v11.
>
> - Cold open shows no jobs, no bills, no goals, and no fabricated stats. Decision D2 —
>   the seed data goes.
> - Onboarding order: country/currency → jobs → outgoings → working ceiling → goals.
> - **Each step commits to state as it is completed**, so closing the tab mid-flow is
>   resumable, not lost.
> - A returning user with data never sees onboarding.
> - There is a route back into onboarding from the profile for someone who wants to redo it.
> - An "I have a backup file" path on the cold open, straight into import.
>
> All visitor-facing copy is a placeholder marked `<!-- COPY: shift-planner-copywriter -->`.
> You are not drafting it (standing order 11).
>
> Ask me before inventing any validation rule — minimum job count, whether goals can be
> skipped, what happens on an empty outgoings list.

---

### Prompt 5 — Jobs as employers with rate cards

> Builder. Implement the rate card model in the UI, per `SCOPE.md` v11 and the model in
> `ARCHITECTURE.md`.
>
> - An employer holds one or more **named rates** (e.g. "Events & Stadiums L2 — £14.25").
> - Add, edit, remove a rate. Removing a rate that historical shifts reference must not
>   corrupt those shifts — ask me what should happen before you decide.
> - Blended rate is a **weighted average of shifts actually worked**, not of declared
>   typical hours. Show the working somewhere the user can see it.
> - Pension % stays per employer, not per rate, unless `ARCHITECTURE.md` says otherwise.
> - Migrating a v5 single-rate job produces an employer with exactly one rate named after
>   the old role.
>
> Regression watch: the tax model consumes the blended rate. Verify the tax output is
> unchanged for a single-rate employer before and after this change.

---

### Prompt 6 — Dated obligations and second-currency

> Builder. Implement outgoing types, hard dates and second-currency obligations.
>
> - An outgoing can be marked a **credit commitment** (frozen v10 feature 6 — carried
>   forward). Optional; no behaviour change if unset.
> - An outgoing can carry an optional **hard date** and an optional **rate**, so "0% until
>   18 Feb 2027" and "₦3,000,000 due 18 Feb 2027" are both representable.
> - An obligation can be denominated in a **second currency**. The user enters the FX rate
>   manually. The app stamps the date it was entered and warns when it is older than a
>   threshold `ARCHITECTURE.md` defines.
> - **No network call for FX, ever.** The core loop must run fully offline. If you find
>   yourself wanting an API, stop and tell me.
>
> Hard constraint, non-negotiable, from frozen v10 feature 6: **the app never reorders,
> ranks, recommends or evaluates the merits of paying one obligation over another.**
> Ordering is the user's. Stating a shortfall is a computed fact and is fine. Any string
> that could read as "pay this first", "consider reducing" or "prioritise" is a regulated
> activity and does not ship. If you are unsure whether a phrase crosses the line, it
> crosses the line — flag it for shift-planner-copywriter.

---

### Prompt 7 — Protected time and the real ceiling

> Builder. Extend the working ceiling with protected time blocks.
>
> - The user marks recurring blocks as never available (e.g. Monday evening, Friday night,
>   Saturday morning) plus a count of sessions to reserve per week.
> - The **real ceiling** is max days × max hours minus what the blocks remove.
> - Every downstream verdict — sustainable / heavy / over-ceiling — computes against the
>   real ceiling, not the raw one.
> - The reality bar shows the blocks as a distinct region so the user can see why headroom
>   shrank.
> - Zero blocks reproduces the current behaviour exactly. Verify this.
>
> The `Infinity hrs/week` bug was found and root-caused once already (parked 6 Jul, fixed
> in v9). A ceiling that can now reach zero is a fresh division-by-zero surface. Guard it
> and show me the guard.

---

### Prompt 8 — The headline number

> Builder. Implement the "extra hours needed this week" figure.
>
> This is the headline. It is the number that answers "should I take this shift?", and it
> is the reason the app exists.
>
> - **Extra hours = hours needed to meet the target, minus hours already committed this
>   week.** Not total hours needed. The current app shows the total and leaves the user to
>   do the subtraction by hand.
> - Break it down visibly: baseline to cover life, plus dated obligations falling in range,
>   against the real ceiling after protected blocks.
> - When extra hours exceed the remaining real ceiling, say so as a fact. Do not suggest
>   what to do about it.
> - Empty and degenerate states: no employer, no rate, no outgoings, zero ceiling. None of
>   them may render `Infinity`, `NaN` or a fabricated figure.
>
> Show me the formula in a comment before you implement it, and wait for me to confirm it.

---

### Prompt 9 — Shift logging

> Builder. Add the rate picker and shift duplication to the shift form.
>
> - Logging a shift selects which named rate applied.
> - Duplicate an existing shift (parked 6 Jul) for repeating patterns.
> - **Overnight shift maths was verified correct once already** (QA, 6 Jul — confirmed
>   clean, not a finding). It is now a regression risk. Prove it still works: 18:00→02:00
>   with a 30-minute break, across a month boundary, across a DST change.
> - Replace the blocking native `alert()` calls (parked 6 Jul) while you are in this code.
> - Delete buttons must meet the minimum touch target (parked 6 Jul).

---

### Prompt 10 — Bank the week and coverage

> Builder. Update the weekly banking and coverage reporting for the v11 model.
>
> - Coverage reports which obligations the earnings reached, **in the user's own order**,
>   as a computed fact.
> - Dated obligations that fall due inside the horizon appear in coverage; ones that do not,
>   do not.
> - Second-currency obligations show both the foreign amount and the converted figure, with
>   the FX date visible.
> - History gains nothing new this version beyond correctness — the trend view stays parked.
>
> The no-ranking constraint from prompt 6 applies with full force here. This is the screen
> where a helpful suggestion is most tempting and most expensive.

---

### Prompt 11 — PWA, offline, installable

> Builder. Implement frozen feature 1, exactly to the strategy in `ARCHITECTURE.md`.
>
> - Valid manifest: name, short name, theme colour, background colour, complete icon set.
> - Install prompt on Android/Chrome; Add to Home Screen on iOS Safari.
> - Launched from the home screen: standalone, no browser chrome, no address bar.
> - Service worker caches the app shell. The full core loop works with no network.
> - **The stale-cache update strategy from `ARCHITECTURE.md`, implemented as specified.**
>   Do not improvise this. If the spec is unclear, stop and ask — a user pinned to old tax
>   maths with no way to know is the worst failure this app has.
> - Existing `shiftPlanner.v5`/`v6` data survives installation.
>
> Icons: the design system's global icon rule applies — one proper library (Lucide,
> Phosphor, Heroicons or Tabler), never emoji or keyboard glyphs, stroke weight matched to
> the type. Unicode glyphs are parked as a finding from 6 Jul; if you are adding icons
> anyway, clear that item and say so in the handover.

---

### Prompt 12 — Local stats and the feedback route

> Builder. Implement frozen features 2 and 3.
>
> Feature 3 is **the most important thing in this version and the easiest to under-build.**
> Three of the four questions this whole version exists to answer are answered by asking,
> not by measuring. Build it properly.
>
> - Stats computed on device from existing state: weeks used, distinct weeks banked, shifts
>   logged, whether a second week was ever banked, days since first run, number of
>   employers, whether any goal completed. No new collection.
> - Stats are **visible to the user** in plain language, before anything is sent. Not hidden
>   telemetry.
> - First run degrades honestly — no fabricated streaks, no "1 week!" celebration.
> - A persistent, findable "Send feedback" control composes a message pre-filled with the
>   stats plus fixed questions covering: what would you change, have you ever lost your
>   data, would you pay for anything here.
> - It hands off to the user's own email client (decision D5 — dedicated project email, not
>   a personal number). **The app transmits nothing itself.**
> - Works with no network.
>
> All question wording and all stat labels are visitor-facing copy — placeholder them and
> route to shift-planner-copywriter.

---

### Prompt 13 — Compliance surface

> Builder. Implement frozen feature 5, adjusted for the decisions in `PROMPTS.md` §2.
>
> - Privacy notice: lawful basis, what is collected via the feedback route, retention,
>   rights. **Analytics is cut (D3) — the notice must not describe a tool that is not there.**
> - Data-protection complaints route satisfying s.164A DPA 2018: direct complaints accepted,
>   acknowledged within 30 days, responded to without undue delay.
> - ICO registration reference recorded, per whatever `ICO-DECISION.md` concluded, **before
>   the feedback route is publicised**.
> - Honest 18+ statement at the point of use.
> - The "simplified effective-rate estimates" tax disclaimer stays accurate.
> - A plain, visible not-debt-advice statement with a pointer to free regulated debt advice.
>
> Every word here is visitor-facing. You are placing the structure; shift-planner-copywriter writes
> the text. Do not draft legal copy inline.

---

### Prompt 14 — Copy pass

> Act as `shift-planner-copywriter`, not the Builder.
>
> Every `<!-- COPY: shift-planner-copywriter -->` placeholder in `index.html` needs real text.
> Read `PROJECT.md` for audience and voice first.
>
> The constraint that overrides voice: **no string may read as advice about which
> obligation to pay.** Shortfalls are stated as facts. "You are £38 short on financial
> targets" is fine. "Consider paying Capital One first" is a regulated activity. When a
> phrase is borderline, choose the flatter one.
>
> Second constraint: the feedback questions have to actually get answered by a stranger on
> a phone at the end of a shift. Short, direct, no preamble.
>
> List every string you changed and why.

---

### Prompt 15 — Breaker pass

> Act as the breaker. You did not build this and you owe it nothing.
>
> Run the `breaker-protocol` skill against `SCOPE.md` v11. Test every numbered acceptance
> criterion and write `QA-REPORT.md`.
>
> Beyond the standard cruel-inputs menu, these specifically:
> - **Migration:** a real v5 blob, a truncated blob, a hand-edited blob, a v7-from-the-future
>   blob, an empty string, and a blob with the key present but null.
> - **Service worker:** load, deploy a change, reload — does the user get the new version
>   without clearing site data? This is the highest-risk criterion in the version.
> - **Offline:** aeroplane mode through the entire core loop, including the feedback compose.
> - **Overnight and DST:** 18:00→02:00, across a month boundary, across the October clock change.
> - **Zero ceiling:** protected blocks that consume the whole week. No `Infinity`, no `NaN`.
> - **Rate card:** delete a rate that historical shifts reference.
> - **FX staleness:** an obligation with a rate entered six months ago.
> - **The no-ranking boundary:** grep every user-facing string for anything that could read
>   as steering. This one is a legal finding, not a UX finding.
> - **Feedback payload:** inspect what is actually composed. No figure, label, goal name or
>   entered value the user has not seen first.
>
> Findings only. Do not fix anything.

---

### Prompt 16 — Ship decision

> Act as the Builder. Do not deploy.
>
> Give me a ship recommendation:
> - Every `QA-REPORT.md` finding, severity-ordered, each marked fixed / not fixed / won't fix.
> - Every criterion in `SCOPE.md` v11 marked pass / fail.
> - Every assumption still sitting in `HANDOVER.md` unconfirmed by me.
> - The three most likely ways this breaks in a stranger's hands in week one.
> - Whether the compliance surface is complete enough that publicising the feedback route
>   is lawful — including whether the ICO reference is actually recorded.
>
> Then stop. I press ship. Standing order: no deploy without me pressing it. Ever.

---

## 5. Session close — paste at the end of every session

```
Write the HANDOVER.md entry now, before we run out of room:

## Session <YYYY-MM-DD>
Done:    <what actually completed — not what was attempted>
Assumed: <every assumption. "none" must be literally true, not unexamined>
Risky:   <weak points, uncertainty, what might bite>
Open:    <questions needing my answer before continuing>
Touched: <files created or modified>

Then commit. If anything got parked this session, confirm the scope-clerk actually wrote
it to PARKING.md — a parked idea that only exists in this conversation is a lost idea.
```

---

## 6. Where this run-book is most likely wrong

- **The prompt sequence assumes the architecture pass produces a workable service-worker
  strategy on a single-file, no-build-step stack.** If it does not, prompt 2 should surface
  that and prompts 3–13 need re-planning around a build step. That is the single most
  likely point where this run-book breaks.
- **Prompt granularity is a guess.** Prompts 5 through 10 might each be two sessions rather
  than one. If a session is running out of room mid-prompt, stop and hand over rather than
  rushing the ending — a half-finished feature with a good handover is recoverable; a
  finished feature with no handover is not.
- **Fourteen prompts of Builder work against a scope that has never been built end-to-end
  is optimistic.** The base rate for "rebuild the whole thing" projects is that the middle
  third takes longer than the first and last combined.
