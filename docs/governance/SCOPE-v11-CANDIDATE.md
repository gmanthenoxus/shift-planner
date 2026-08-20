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

## What v11 is, and what it is not (D7)

**v11 is the model rebuild plus install. It is publicly usable, but it does not learn.**

| Feature | Version |
|---|---|
| 1. Storage schema v6 and migration | **v11** |
| 2. Empty state and guided onboarding | **v11** |
| 3. Employers with rate cards | **v11** |
| 4. Outgoings: type, hard date, optional rate | **v11** |
| 5. Second-currency obligations | v12 |
| 6. Protected time and the real ceiling | v12 |
| 7. The headline: extra hours needed this week | **v11** |
| 8. Shift logging | **v11** |
| 9. Bank the week and coverage | **v11** |
| 10. PWA: installable, offline, returnable | **v11** |
| 11. Local stats and the feedback route | v12 |
| 12. Compliance surface | **split — see below** |
| 13. Copy pass | **v11** (v12 gets its own) |

**Feature 12 does not move as a block, and the reason matters.** The privacy notice, ICO
registration and s.164A complaints route exist *because a feedback inbox makes you a data
controller*. Feature 11 is deferred, so that trigger does not fire in v11, and those three items
defer with it. But three obligations are triggered by the activity rather than by data, and
**ship in v11**:

- the not-debt-advice statement with a pointer to free regulated debt advice (it must ship
  alongside feature 4's credit-commitment typing, not after it);
- the "simplified effective-rate estimates" tax disclaimer, kept accurate;
- WCAG 2.2 AA conformance, per the Equality Act duty, which applies to any public service
  regardless of whether it collects anything.

**Consequence to accept knowingly:** v11 can be handed to anyone, but it has no instrument. The
four questions in `PROJECT.md` stay open until v12, and learning happens by asking people directly.
Do not publish an in-app contact route in v11 — an informal conversation with a colleague is not
the app collecting data; a published feedback channel wired into the app is.

**Sizing note:** the split brings v11 to nine features plus a migration. Still large. `PROMPTS.md`
§6's warning about the middle third of a rebuild still applies.

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
| D7 | **Scope split.** v11 = model work + PWA. v12 = FX, protected time, feedback route, controller-triggered compliance | 19 Aug |
| D8 | Rate deletion solved by **snapshotting rate name and value onto each shift at log time**. History never points at the rate card | 19 Aug |
| D9 | "Hours already committed" = **shifts logged, including ones dated later this week** | 19 Aug |
| D10 | Visual style: **Guide**, not Engineer | 19 Aug |

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
- Criteria: **each logged shift stores the rate name and value it was paid at, snapshotted at log time** (D8). Historical shifts never reference the rate card.
- Criteria: consequently, deleting or editing a rate has no effect on any shift already logged. Verified by deleting a rate that historical shifts were paid at and confirming their computed pay is unchanged.
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
- Criteria: **"committed" means shifts logged for the current week, including shifts dated later in that week** (D9). A shift agreed for Friday and logged on Tuesday counts on Tuesday.
- Criteria: a shift dated later this week contributes to committed hours but not to earnings actually banked. The two must not be conflated.
- Criteria: the breakdown is visible — baseline to cover life, dated obligations falling in range, against the ceiling.
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

**Resolved (D10): Guide.** Both directions were rendered as the headline screen and compared.
Engineer fits more on screen and uses borders as landmarks; Guide gives one number and gets out of
the way, which matches the actual moment of use — checking one figure to answer one question, not
auditing finances. `SPEC-v11-TARGET.html` was drafted in Engineer tokens and is now a layout
reference only, **not a token source**. Its palette does not carry forward.

Guide's constraints, per the design system: 3-4 warm tones plus a soft neutral background · 1-2
human-scale typefaces · medium-high whitespace · gentle motion · voice plain and never patronising ·
build the component library first, with the minimal deliverable being onboarding card, empty state
and error state done right. That last point lines up exactly with feature 2.

**One open deviation to record rather than drift into:** Guide specifies warm earth tones. Emma's
calm comes partly from a *cool* palette. If the cool accent is wanted, it is a deliberate,
documented deviation from the style file, decided in the architect pass and written into
`ARCHITECTURE.md`'s decisions log with its reason. It is not a thing to quietly nudge.

A design token document must be produced from the `noxus-design-system` Guide reference before the
architect pass, per that skill's own default deliverable. It does not exist yet.

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

Resolved on 19 Aug and recorded as D7-D10: rate deletion (snapshot-on-log), committed hours
(logged including future-dated), visual style (Guide), and sizing (the v11/v12 split). Features 5
and 6 move to v12, so their open questions move with them.

Still open:

1. **Warm or cool accent** within Guide. See "Visual direction" — a cool accent is a documented
   deviation, not a nudge. Architect pass, recorded with its reason.
2. **A Guide design token document does not exist.** It is the `noxus-design-system` skill's
   default deliverable and the architect pass needs it as an input. Produce before, not during.
3. **Feature 2:** validation rules are unstated — minimum employer count to leave onboarding,
   whether goals can be skipped, what an empty outgoings list does. The Builder must not invent
   these (standing order 2).
4. **Feature 9:** with second currency deferred to v12, does coverage need any change in v11 at
   all beyond the dated-obligation horizon? Possibly a smaller feature than drafted.
5. **Carried and still unanswered:** `PROJECT.md` acceptance, `REQUIREMENTS.md` acceptance,
   amending `CLAUDE.md`'s read-only list to name both, amending `CLAUDE.md` order 11 to name
   `shift-planner-copywriter`, and appending the missing v10 line to `SCOPE-HISTORY.md`.

## Freeze

NOT FROZEN. No build may begin against this file.

`FROZEN: <date>` to be added by the human, in `SCOPE.md`.

## Changelog

<!-- None. -->
