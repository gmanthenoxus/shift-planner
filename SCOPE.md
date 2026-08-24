# SCOPE: Shift Planner v11 — the model rebuild

Date: 2026-08-19

---

## Problem

v10 froze a learning version: install it, use it, tell me if it's worth continuing. Then modelling
a real multi-rate agency worker against the shipped data model showed it cannot represent that
person at all. Not awkwardly. At all. A rate card becomes four fake jobs. A dated obligation has
nowhere to go. And the headline shows total hours needed rather than hours beyond what is already
committed, which is the only figure that answers *should I take this shift?*

An instrument attached to a tool that can't model its one real user measures nothing. So v11
rebuilds the model first and defers the instrument.

**v11 is publicly usable and does not learn.** It can be handed to anyone. It collects nothing, so
it triggers no controller obligations. What it lacks is a feedback route, which is why the four
questions in `PROJECT.md` stay open until v12.

## Decisions carried in — not reopened

| # | Decision | Date |
|---|---|---|
| D1 | v10 superseded by a v11 re-freeze; features carried forward, not dropped | 18 Aug |
| D2 | Seed data replaced by empty state + guided onboarding | 18 Aug |
| D3 | Analytics cut entirely | 18 Aug |
| D4 | ICO registration identity — research first. Now deferred to v12 with the feedback route | 18 Aug |
| D5 | Feedback goes to a dedicated project email | 18 Aug (applies in v12) |
| D6 | Visual direction minimal and calm, Emma-informed | 19 Aug |
| D7 | Scope split: v11 = model + PWA; v12 = FX, protected time, feedback, controller compliance | 19 Aug |
| D8 | Rate deletion solved by snapshotting rate name and value onto each shift at log time | 19 Aug |
| D9 | "Hours already committed" = shifts logged for the current week, including future-dated ones | 19 Aug |
| D10 | Visual style: Guide, warm accent. Tokens in `DESIGN-TOKENS.md` | 19 Aug |
| D11 | Dated obligations split into two kinds: **dated lump sum** amortises across weeks remaining, **dated rate change** switches on the date. No horizon cutoff | 19 Aug |

## The permanent constraint

**The app never reorders, ranks, recommends or evaluates the merits of paying one obligation over
another.** Ordering is always the user's. Stating a shortfall is a computed fact and is fine.
Suggesting what to do about it is debt counselling under art. 39E RAO per FCA PERG 17, and is a
regulated activity this project is not authorised for.

This is not a v11 decision. It is permanent, it binds every future version, and it binds colour as
well as words — see `DESIGN-TOKENS.md`, "the rule that overrides taste". It must be recorded in
`ARCHITECTURE.md`'s decisions log **with its reason**, so a future session cannot helpfully improve
the app into a regulated activity.

Confidence in the legal reading: 65%, sourced to PERG but unreviewed by a solicitor
(`REQUIREMENTS.md` §3.6).

---

## Features — v11 ONLY

Ordered so anything changing the shape of stored data precedes anything reading it.

### 1. Storage schema v6 and migration

- A real `shiftPlanner.v5` blob migrates to v6 and loses nothing. Every field is carried, transformed with a stated rule, or dropped with a comment saying why.
- A v5 single-rate job migrates to an employer holding exactly one rate, named after the old role, at the old value.
- A blob declaring a version higher than the app understands does not crash and does not destroy data.
- Malformed, truncated, empty-string, null and hand-edited values all fail safe without a crash.
- Export/import round-trips at v6. Importing a v5 export still works.
- Every migration step carries a one-line comment stating WHY.
- Throwaway console assertions cover all six cases and are shown to the human before the breaker runs.

### 2. Empty state and guided onboarding

- Cold open shows no employers, no outgoings, no goals, and no fabricated stats. The seed data is gone (D2).
- Onboarding order: country/currency → employers → outgoings → working ceiling → goals.
- Each step commits to state as it completes. Closing the tab mid-flow resumes; it does not lose.
- A returning user with data never sees onboarding.
- A route back into onboarding exists from the profile.
- An "I have a backup file" path on the cold open goes straight to import.
- Zero-row states for employers and outgoings show a message, not a silent blank grid. This gap has existed since v8 and becomes reachable for every new user once seed data goes.
- Per Guide's integration rule, the onboarding card, empty state and error state are the first components built and the ones the token document is proven against.

### 3. Employers with rate cards

- An employer holds one or more named rates, e.g. "Events & Stadiums L2 — £14.25".
- Rates can be added, edited and removed.
- **Each logged shift stores the rate name and value it was paid at, snapshotted at log time** (D8). Shifts never reference the rate card.
- Consequently, deleting or editing a rate has no effect on any shift already logged. Verified by deleting a rate that historical shifts were paid at and confirming their computed pay is unchanged.
- The blended rate is a weighted average of shifts actually worked, not of declared typical hours, and the working is visible to the user.
- Pension % stays per employer, not per rate.
- For a single-rate employer, tax output is identical before and after this change. Verified, not assumed.

### 4. Outgoings: type, hard date, optional rate

- An outgoing can be typed as a **credit commitment** (credit card, loan, BNPL, car finance, overdraft, catalogue). Optional; no behaviour change when unset. Carried intact from frozen v10 feature 6.
- An outgoing can carry an optional **hard date**, and where it does, it is one of exactly two kinds (D11). The kind is an explicit field, never inferred.
  - **Dated lump sum** — a one-off amount with a deadline, e.g. "₦3,000,000 due 18 Feb 2027". It **amortises across the whole number of weeks remaining until its date**, from the moment it is entered. £3,000 due in 20 weeks contributes £150/wk in week one, and the per-week figure is recomputed as the date approaches. It never appears as a cliff.
  - **Dated rate change** — an existing recurring cost whose amount changes on a date, e.g. "0% until 18 Feb 2027". It **does not amortise**. The outgoing carries its current amount until the date, then switches to the new amount. Charging for it early would bill the user for money not yet owed.
- Both kinds show their date, and a lump sum shows its current per-week contribution, so the user can see why the weekly figure moved.
- A dated lump sum whose date has passed stops contributing and is visually marked, reusing the expired-goal treatment rather than inventing a second one.
- A dated lump sum with a date in the past at entry time is rejected inline, not silently accepted.
- **There is no horizon cutoff.** A dated obligation contributes from the moment it exists, however far away its date is. The horizon was cut deliberately: it recreated the cliff this feature exists to remove.
- A dated outgoing does not become a goal. A goal is a target the user chose with a duration they chose; a dated lump sum is an obligation with an external deadline. They stay distinct in the model and in the UI even though both amortise.
- Nothing about credit typing changes ordering, ranking or presentation priority. The permanent constraint applies at full force.
- The not-debt-advice statement (feature 9) ships in the same version as this feature, not after it.

### 5. The headline: extra hours needed this week

- The figure is **hours needed to meet the target minus hours already committed this week**, not total hours needed.
- **"Committed" means shifts logged for the current week, including shifts dated later in that week** (D9). A shift agreed for Friday and logged on Tuesday counts on Tuesday.
- A future-dated shift contributes to committed hours but not to earnings actually banked. The two must not be conflated anywhere.
- The breakdown is visible: baseline to cover life, the combined per-week contribution of dated lump sums (D11), and the ceiling.
- A dated rate change contributes nothing extra before its date. On and after the date, its new amount is simply part of the baseline. It never appears as a separate line.
- When extra hours exceed the remaining ceiling, the app states that as a fact and says nothing about what to do.
- No combination of inputs renders `Infinity`, `NaN`, or a fabricated figure. Including: no employer, no rate, no outgoings, zero ceiling, all shifts deleted mid-week.
- The formula is written as a comment and confirmed by the human before implementation.

### 6. Shift logging

- Logging a shift selects which named rate applied, and snapshots it (feature 3).
- A shift can be dated later in the current week.
- An existing shift can be duplicated (parked 6 Jul).
- Overnight maths stays correct: 18:00→02:00 with a 30-minute break, across a month boundary, and across the October clock change. Verified clean once already, now a regression risk.
- Remaining blocking `alert()` calls are gone.
- All icon-only tap targets meet 44×44px.

### 7. Bank the week and coverage

- Coverage states which obligations the earnings reached, **in the user's own order**, as computed fact.
- A dated lump sum appears in coverage as its per-week contribution for that week, not its full amount. Reaching £150 of a £3,000 obligation is covered for that week; it is not "£2,850 short".
- Banking a week freezes its coverage. A later edit to an obligation does not rewrite history.
- No string on this screen suggests, ranks, or evaluates. This is where a helpful suggestion is most tempting and most expensive.
- Colour follows `DESIGN-TOKENS.md`: covered is sage, a shortfall is ochre, not-reached carries no colour at all, and rust red never appears for a financial position.

### 8. PWA: installable, offline, returnable

- Valid manifest: name, short name, theme colour, background colour, complete icon set.
- Install prompt on Android/Chrome; Add to Home Screen on iOS Safari.
- Launched from the home screen it runs standalone, with no browser chrome.
- Service worker caches the app shell. The full core loop works with no network.
- **The stale-cache update strategy specified in `ARCHITECTURE.md` is implemented exactly as specified, not improvised.** A returning user receives an updated version without clearing site data. This is the highest technical risk in the project: a user pinned to superseded tax maths, with no way to know and no way out, is the worst failure this app has.
- Existing stored data survives installation.
- Icons from one library (Lucide, per `DESIGN-TOKENS.md`). No emoji, no keyboard glyphs. Clears the Unicode-glyph finding parked 6 Jul.

### 9. Compliance — the activity-triggered subset

- A plain, visible **not-debt-advice statement** with a pointer to free regulated debt advice. Ships alongside feature 4, not after it.
- The **tax disclaimer** stays accurate to what is actually simplified. No per-credit or per-allowance precision claimed.
- **WCAG 2.2 AA conformance**, per the Equality Act duty (`REQUIREMENTS.md` §3.3). Specifically: every token pair meets 4.5:1 as measured in `DESIGN-TOKENS.md`; no state is conveyed by colour alone; every coloured state also carries a text label; hairlines are never the sole means of conveying a boundary; keyboard focus is visible throughout.

### 10. Copy pass

- Every `<!-- COPY: shift-planner-copywriter -->` placeholder carries real text, written by that skill, not the Builder (standing order 11).
- Every user-facing string passes the skill's Rule 0 check. Failures are reported as legal findings, not style notes.
- The three-tier verdict no longer uses "brutal" or any other judgement about the user's life (`COPY-DECK.md` C4).
- No em-dash, no emoji, no exclamation mark, no "we", anywhere in visitor-facing copy.
- Any decision made during the pass is written back to `COPY-DECK.md`, not left in a chat reply.

---

## Deferred to v12, with the reason

| Item | Why it waits |
|---|---|
| Second-currency obligations | Split (D7). Needs the v6 schema settled first |
| Protected time and the real ceiling | Split (D7). Fresh division-by-zero surface, wants its own version |
| Local stats and the feedback route | Split (D7). The instrument follows the model |
| Privacy notice, ICO registration, s.164A complaints route | Triggered by collection. Nothing collects in v11 |
| 18+ statement | Children's Code bites on processing personal data. Nothing is processed in v11 |

## Not doing — permanently

- **Accounts, sync, any backend.** Gated on 20 real users with week-two return.
- **Any ranking or recommendation between obligations.** Regulated activity. Not a version decision.
- **Live FX rates.** Breaks offline-first.
- **Analytics.** Cut (D3).
- **Open Banking, earned wage access, bill switching, community forum.** `REQUIREMENTS.md` §4.G.
- **Overtime, night and weekend premium rules.** Real and wanted. v12 or later; v11 is already large.

---

## Defaults — answered 2026-08-19

All six resolved. Recorded here because the reasoning matters more than the answers.

1. **Minimum to leave onboarding:** one employer with at least one rate. Outgoings and goals may both be empty. ✅ *The app can compute a net hourly rate from one employer alone, so anything more is a barrier at the front door v11 exists to fix.*
2. **Goals in onboarding:** skippable, with an obvious route to add later. ✅
3. **Empty outgoings list after onboarding:** allowed. The headline shows feature 5's empty state, not a zero. ✅
4. **Deleting an employer with logged shifts:** shifts remain and keep their snapshotted rate, pay and employer name. ✅ *Consistent with D8. History is immutable.*
5. **Typeface:** system font stack, no webfont. ✅ *A webfont is a network request and the core loop must work offline. A self-hosted precached webfont remains an architect decision if ever wanted.*
6. **Dated-obligation horizon: WITHDRAWN, replaced by D11.** ❌ *The original default proposed a 4-week cutoff. It was wrong twice over: a cutoff recreates the exact cliff the feature exists to remove, and it conflated two different things. See feature 4 for the resolved model.*

**Why 6 was withdrawn, kept because it is the most instructive item in this document:** the question
was drafted by the Builder as "how many weeks", with a number picked so the breaker had something
to test. Accepting it would have shipped a headline that stays silent about a large obligation
until it is four weeks away, then demands impossible hours. The spec's own gap table already said
the app "cannot distinguish a cliff from a steady cost" — the proposed default reintroduced that
defect while appearing to fix it. **A default with a rationale attached is not the same as a
default that is right.**

## Freeze

FROZEN: 2026-08-19

## Changelog

<!-- Additions made AFTER the freeze. Each one is a scope change, recorded rather than absorbed. -->

**[2026-08-19] Guide palette applied app-wide.** Feature 2 named only the onboarding card, empty
state and error state as the Guide proof, leaving the rest of the app in the v9 dark palette. That
would have shipped an app half in each. Authorised by the human 2026-08-19. Carried with it, because
they were found while in the file rather than sought:

- `--warn` was doing double duty for "over your ceiling" and "the import failed". Split: ochre for
  facts about the user's position, rust reserved for app faults (ARCHITECTURE.md decision 15).
- The headline card tinted **red** when the plan did not fit. Now ochre. Colour may not pass
  judgement on a financial position where the copy is forbidden to.
- All four headline verdict strings replaced. One was a **Rule 0 violation shipping in production**:
  "Cut outgoings, extend goal deadlines, or lift the ceiling" is advice about what to do about a
  shortfall, a regulated activity under art. 39E RAO. The other three judged the user's life
  ("brutal", "heavy but workable", "sustainable"). Recorded as COPY-DECK C4 and C8.
- The category colour ramp failed a simulated colour-vision-deficiency check and was rebuilt around
  lightness separation. Two AA contrast failures found and fixed in the same sweep.

None of this adds a feature. It corrects the app's colour and copy to the standards ARCHITECTURE.md
and COPY-DECK.md already set, and closes a legal exposure that predates v11.
