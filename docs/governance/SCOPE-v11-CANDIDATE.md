# SCOPE CANDIDATE: Shift Planner v11 — end-to-end rebuild

Date: 2026-08-19
Status: **CANDIDATE. NOT FROZEN.**

<!-- The Builder does not own SCOPE.md and has not touched it. Standing order 4. To freeze:
     read this, cut what you don't want, copy into SCOPE.md, append a freeze line, append a
     line to SCOPE-HISTORY.md, commit. No code before that. Checkpoint 1, never routed around.

     Sources merged here: SCOPE.md v10 (frozen 2026-07-06, six features), SPEC-v11-TARGET.html
     (design target, 18 Aug), PROMPTS.md §2 (human decisions D1-D5, 18 Aug), REQUIREMENTS.md
     (legal trigger map, 15 Aug), and the human's Emma reference (19 Aug). -->

---

## Problem

v10 is frozen but was deliberately superseded (decision D1). Modelling a real multi-rate agency
worker with a dated foreign-currency obligation and an expiring 0% promo showed the shipped data
model cannot represent the situation at all — not awkwardly, at all. A rate card becomes four fake
jobs, a naira obligation cannot be entered, a promo cliff is indistinguishable from a flat bill,
and the headline shows total hours needed rather than hours beyond what is already committed,
which is the only figure that answers "should I take this shift?"

v11 rebuilds the model end to end, from cold open to banked week, and adds the install, feedback
and compliance surfaces that let it go into a stranger's hands lawfully.

**Honest sizing note for the human before freezing:** this is thirteen features and a data
migration. That is a rebuild, not a version. `PROMPTS.md` §6 already flags that the middle third
of a rebuild typically takes longer than the first and last combined. Cutting features 5, 6 or 9
to a v12 is the obvious relief valve and would not damage the rest.

---

## Decisions carried in, not reopened

| # | Decision | Made |
|---|---|---|
| D1 | v10 freeze superseded by a v11 re-freeze, features carried forward not dropped | 18 Aug |
| D2 | Seed data replaced by empty state + guided onboarding | 18 Aug |
| D3 | Analytics cut | 18 Aug |
| D4 | ICO registration identity — research first (`ICO-DECISION.md`, prompt 1a) | 18 Aug |
| D5 | Feedback goes to a dedicated project email, not a personal number | 18 Aug |
| D6 | Visual direction: minimal and calm, Emma-informed. See §"Visual direction" | 19 Aug |

---

## The permanent constraint (not a feature, applies to every feature)

**The app never reorders, ranks, recommends or evaluates the merits of paying one obligation over
another.** Ordering is always the user's. Stating a shortfall is a computed fact and is fine.
Suggesting what to do about it is debt counselling under art. 39E RAO, per FCA PERG 17, and is a
regulated activity this project is not authorised for. [`REQUIREMENTS.md` §3.6, 65% confidence,
unreviewed by a solicitor.]

This must be recorded in `ARCHITECTURE.md`'s decisions log **with its reason**, so a future session
cannot helpfully improve the app into a regulated activity. Architect's file, architect's job.

---

## Features — this version ONLY

Ordered so that anything changing the shape of stored data comes before anything reading it.

### 1. Storage schema v6 and migration

- Criteria: a real `shiftPlanner.v5` blob migrates to v6 and loses nothing. Every field is either carried, transformed with a stated rule, or explicitly dropped with a comment saying why.
- Criteria: a v5 single-rate job migrates to an employer holding exactly one rate, named after the old role.
- Criteria: a blob declaring a version higher than the app understands does not crash and does not silently destroy data.
- Criteria: malformed, truncated, empty-string, null and hand-edited values all fail safe without a crash (standing order 9).
- Criteria: export/import round-trips at v6, and importing a v5 export still works.
- Criteria: every migration step carries a one-line comment stating WHY.

### 2. Empty state and guided onboarding

- Criteria: a cold open shows no jobs, no bills, no goals and no fabricated stats. The seed data is gone (D2).
- Criteria: onboarding order is country/currency → employers → outgoings → working ceiling → goals.
- Criteria: each step commits to state as it completes, so closing the tab mid-flow resumes rather than loses.
- Criteria: a returning user with data never sees onboarding.
- Criteria: a route back into onboarding exists from the profile.
- Criteria: an "I have a backup file" path on the cold open goes straight to import.
- Criteria: zero-row states for employers and outgoings show a message, not a silent blank grid (the gap `TECH-PACK.md` §4 found and v9 did not fix; it becomes reachable for every new user once seed data goes).

### 3. Employers with rate cards

- Criteria: an employer holds one or more named rates, e.g. "Events & Stadiums L2 — £14.25".
- Criteria: rates can be added, edited and removed.
- Criteria: removing a rate referenced by historical shifts does not corrupt those shifts. **Behaviour on removal is an open question — see below. Do not invent it.**
- Criteria: the blended rate is a weighted average of shifts actually worked, not of declared typical hours, and the working is visible to the user.
- Criteria: pension % stays per employer.
- Criteria: for a single-rate employer, tax output is identical before and after this change. Verified, not assumed.

### 4. Outgoings: type, hard date, optional rate

- Criteria: an outgoing can be typed as a credit commitment (carried intact from frozen v10 feature 6). Optional; no behaviour change when unset.
- Criteria: an outgoing can carry an optional hard date, so "0% until 18 Feb 2027" is representable.
- Criteria: an outgoing can carry an optional rate, so a promo expiry is distinguishable from a flat cost.
- Criteria: a dated outgoing does not become a goal — the two remain distinct in the model and in the UI.
- Criteria: nothing about credit typing changes ordering, ranking or presentation priority. The permanent constraint applies at full force.

### 5. Second-currency obligations

- Criteria: an obligation can be denominated in a currency other than the pay currency.
- Criteria: the FX rate is entered manually by the user. **No network call for FX, ever** — the core loop must run fully offline.
- Criteria: the app stamps the date the rate was entered and displays it wherever the converted figure appears.
- Criteria: a rate older than a threshold defined in `ARCHITECTURE.md` shows a staleness warning.
- Criteria: converted figures never display more precision than the entered rate justifies.

### 6. Protected time and the real ceiling

- Criteria: the user can mark recurring blocks as never available, plus a count of sessions to reserve per week.
- Criteria: the real ceiling is max days × max hours minus what the blocks remove.
- Criteria: every downstream verdict computes against the real ceiling, not the raw one.
- Criteria: the reality bar shows protected blocks as a distinct region.
- Criteria: zero blocks reproduces current behaviour exactly. Verified.
- Criteria: a ceiling reduced to zero renders no `Infinity` and no `NaN`. This is a fresh division-by-zero surface and needs an explicit guard.

### 7. The headline: extra hours needed this week

- Criteria: the headline figure is **hours needed to meet the target minus hours already committed this week**, not total hours needed.
- Criteria: the breakdown is visible — baseline to cover life, dated obligations falling in range, against the real ceiling after blocks.
- Criteria: when extra hours exceed the remaining real ceiling, the app states that as a fact and says nothing about what to do.
- Criteria: no combination of inputs — no employer, no rate, no outgoings, zero ceiling — renders `Infinity`, `NaN`, or a fabricated figure.
- Criteria: the formula is written as a comment and confirmed by the human before implementation.

### 8. Shift logging

- Criteria: logging a shift selects which named rate applied.
- Criteria: an existing shift can be duplicated (parked 6 Jul).
- Criteria: overnight maths stays correct — 18:00→02:00 with a 30-minute break, across a month boundary, and across the October clock change. This was verified clean once and is now a regression risk.
- Criteria: remaining blocking `alert()` calls are gone.
- Criteria: all icon-only tap targets meet 44×44px.

### 9. Bank the week and coverage

- Criteria: coverage states which obligations the earnings reached, in the user's own order, as computed fact.
- Criteria: dated obligations falling due inside the horizon appear in coverage; ones that do not, do not.
- Criteria: second-currency obligations show both the foreign amount and the converted figure, with the FX date visible.
- Criteria: no string on this screen suggests, ranks, or evaluates. This is where a helpful suggestion is most tempting and most expensive.

### 10. PWA: installable, offline, returnable

- Criteria: valid manifest — name, short name, theme colour, background colour, complete icon set.
- Criteria: install prompt on Android/Chrome, Add to Home Screen on iOS Safari.
- Criteria: launched from the home screen it runs standalone, no browser chrome.
- Criteria: service worker caches the app shell; the full core loop works with no network.
- Criteria: **the stale-cache update strategy specified in `ARCHITECTURE.md` is implemented as specified, not improvised.** A returning user receives an updated version without clearing site data. This is the highest technical risk in the project — a user pinned to superseded tax maths with no way to know is the worst failure this app has.
- Criteria: existing stored data survives installation.
- Criteria: icons come from one library (design system global icon rule). No emoji, no keyboard glyphs. Clears the Unicode-glyph finding parked 6 Jul.

### 11. Local stats and the feedback route

- Criteria: stats are computed on device from existing state — weeks used, distinct weeks banked, shifts logged, whether a second week was ever banked, days since first run, number of employers, whether any goal completed. No new collection.
- Criteria: stats are visible to the user in plain language. Not hidden telemetry.
- Criteria: first run degrades honestly. No fabricated streaks, no celebration.
- Criteria: a persistent, findable feedback control composes a message pre-filled with the stats plus fixed questions covering: what would you change, have you ever lost your data, would you pay for anything here.
- Criteria: it hands off to the user's own email client, addressed to the dedicated project email (D5). **The app transmits nothing itself.**
- Criteria: the user sees exactly what will be sent, before it is sent, and can edit or delete any of it.
- Criteria: works with no network.

### 12. Compliance surface

- Criteria: a published privacy notice covering lawful basis, what the feedback route collects, retention and rights. **Analytics is cut (D3) — the notice must not describe a tool that isn't there.**
- Criteria: a data-protection complaints route satisfying s.164A DPA 2018 (in force 19 June 2026): direct complaints accepted, acknowledged within 30 days, responded to without undue delay.
- Criteria: the ICO registration reference is recorded per `ICO-DECISION.md`, **before** the feedback route is publicised.
- Criteria: an honest 18+ statement at the point of use (Children's Code mitigation, `REQUIREMENTS.md` §3.10).
- Criteria: a plain not-debt-advice statement with a pointer to free regulated debt advice.
- Criteria: the "simplified effective-rate estimates" tax disclaimer stays accurate to what is actually simplified.

### 13. Copy pass

- Criteria: every `<!-- COPY: shift-planner-copywriter -->` placeholder carries real text, written by the `shift-planner-copywriter` skill, not the Builder (standing order 11).
- Criteria: every user-facing string passes that skill's Rule 0 check. Failures are reported as legal findings, not style notes.
- Criteria: the three-tier verdict no longer uses "brutal" or any other judgement about the user's life.
- Criteria: no em-dash, no emoji, no exclamation mark anywhere in visitor-facing copy.

---

## Visual direction (D6)

The human's reference is Emma: minimal, calm, generous whitespace, one accent colour, large clear
numbers, simple label-and-value rows, few borders, big touch targets.

**Take:** the restraint and the spacing. Light background, white cards, generous padding, one
accent, numbers large and unornamented, one idea per card.

**Do not take, and the distinction matters:** Emma's cancellation flow uses a teddy-bear emoji and
makes "No, let me try" the primary button over "Yes, I am sure" — a dark pattern. Its home screen
carries loan promotions and credit-score gamification, and its profile screen carries a VPN
affiliate. **That monetisation is a s21 FSMA financial promotion, which is a criminal offence for
an unauthorised person** (`REQUIREMENTS.md` §3.7). The surface you like and the business model that
funds it are separable, and only one of them is available to you.

**Open:** the existing spec was drafted in the design system's **Engineer** style (dense, bordered,
utilitarian). Emma is closer to **Guide** (calm, spacious, consumer). These are deliberately
incompatible and the design system says switching mid-build means restarting the architecture, not
nudging values. Pick one before the architect pass, not during it.

---

## NOT doing (this version)

- **Accounts, sync, any backend.** Gated on 20 real users with week-two return.
- **Analytics.** Cut (D3). Re-add above ~100 users if ever.
- **Live FX rates.** Breaks offline-first. Revisit only if a backend exists, which is itself gated.
- **Push notifications, weekly email.** Need a server or a list; neither exists.
- **Any ranking or recommendation between obligations.** Permanently out, not a version decision.
- **Open Banking, earned wage access, bill switching, community forum.** Permanently out (`REQUIREMENTS.md` §4.G).
- **Overtime / night / weekend premium rules.** Real and wanted, but v11 is already oversized. v12 candidate.
- **Payslip reconciliation, break-rule automation, trend/sparkline history.** v12 candidates.

---

## Open questions — must be answered before freeze

1. **Feature 3:** what happens when a rate referenced by historical shifts is deleted? Options: block deletion, soft-delete and keep the historical reference, or snapshot the rate onto each shift at log time. Recommended default is snapshot-on-log, because it makes history immutable and removes the problem permanently — but this is a data-model decision, not a Builder call.
2. **Feature 5:** which currencies, and does the second currency apply to goals as well as outgoings?
3. **Feature 6:** are protected blocks named slots (Mon eve, Fri night) or a generic count of reserved sessions? The spec shows both.
4. **Feature 7:** "hours already committed this week" — does that mean shifts logged, shifts rostered but not yet worked, or both? The headline is wrong if this is wrong.
5. **Visual direction:** Engineer or Guide. See above.
6. **Sizing:** does anything get cut to v12 before freezing? Recommended cuts if you want one: features 5 and 6.
7. **Carried and still unanswered:** `PROJECT.md` acceptance, `REQUIREMENTS.md` acceptance, and amending `CLAUDE.md`'s read-only list to name both.

## Freeze

NOT FROZEN. No build may begin against this file.

`FROZEN: <date>` to be added by the human, in `SCOPE.md`.

## Changelog

<!-- None. -->
