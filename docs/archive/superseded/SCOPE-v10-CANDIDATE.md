# SCOPE CANDIDATE: Shift Planner v10 — "Put it in hands, learn something"

Date: 2026-08-15
Status: **CANDIDATE. NOT FROZEN. NOT APPROVED.**

<!-- The Builder does not own SCOPE.md and has not touched it. This is a draft for the human to
     accept, edit, cut or reject, and then freeze into SCOPE.md themselves. No code gets written
     against this file. Per CLAUDE.md's two checkpoints: no build before a freeze line exists in
     SCOPE.md, no deploy without the human pressing it.

     Derived from REQUIREMENTS.md §7 phase 1, plus the human's decisions of 2026-08-15:
     PWA yes · local stats AND cookieless analytics ("Both") · four decisions to serve. -->

---

## Problem

Shift Planner is a working, QA-passed product with one verified external user, and no mechanism for
a second one to stay. [Observed — `PROJECT.md` §0.] It lives in a browser tab, which is not where a
tool "checked mid-shift on a phone" belongs; it has no way to bring anyone back; and it produces no
evidence about whether it is worth continuing.

v10 does not add planning features. It makes the app **installable, returnable, and legible** — and
builds the smallest honest instrument that can answer four open questions. It is a learning
version, not a capability version.

## The four questions this version exists to answer

Stated up front because every feature below is justified by one of them, and features that serve
none don't belong.

| Q | Question | Instrument | Answerable by telemetry? |
|---|---|---|---|
| Q1 | Is it worth continuing at all? | Return rate, week-two banking | **Partly.** The only one analytics touches |
| Q2 | Which feature next? | Feedback prompt, free text | No — qualitative only |
| Q3 | Should the backend be built? | Feedback prompt, direct question about data loss | No — must be asked |
| Q4 | Will anyone pay? | Feedback prompt, direct question | **No.** Unmeasurable by usage data, full stop |

**Three of four are answered by asking, not by measuring.** Feature 3 is therefore the most
important thing in this version, and the easiest to under-build.

---

## Features — this version ONLY

### 1. PWA: installable, offline, on the home screen

- Criteria: a valid web app manifest with name, short name, theme colour, background colour, and a
  complete icon set renders an install prompt on Android/Chrome and "Add to Home Screen" on iOS Safari.
- Criteria: launched from the home screen the app opens standalone, with no browser chrome and no
  address bar.
- Criteria: a service worker caches the app shell so it opens and functions fully with no network
  connection. All planning maths already runs client-side; nothing in the core loop may require network.
- Criteria: **a stale-cache strategy exists and is documented.** A single-file app behind a service
  worker can pin a user to an old version indefinitely; a returning user must receive an updated
  version without clearing site data. This is the highest technical risk in the version.
- Criteria: existing `localStorage` data under key `"shiftPlanner.v5"` survives installation. A user
  who installs after using the tab keeps everything.

### 2. Local usage stats, computed on device, shown to the user

- Criteria: the app computes from existing local state — weeks used, distinct weeks banked, shifts
  logged, whether a second week was ever banked, days since first run, number of jobs, whether any
  goal was completed. No new data is collected to do this; it is derived from what `S` already holds.
- Criteria: these stats are **visible to the user** in a plain-language panel. This is not hidden
  telemetry; the user sees exactly what the feedback button would send, before it sends.
- Criteria: no stat leaves the device except via feature 3, which is user-initiated.
- Criteria: the panel degrades honestly on first run — no fabricated streaks, no "1 week!" celebration.

### 3. Feedback route (the actual instrument — build this properly)

- Criteria: a persistent, findable "Send feedback" control.
- Criteria: pressing it composes a message pre-filled with (a) the feature-2 stats and (b) a short
  fixed set of questions, then hands off to the user's own WhatsApp or email client. The app sends
  nothing itself; the user reviews and presses send in their own app.
- Criteria: the pre-filled questions must cover Q2, Q3 and Q4 directly and in plain language:
  what would you change, have you ever lost your data, would you pay for anything here. Exact
  wording is **visitor-facing copy and routes through `noxus-copywriter`, not the Builder.**
- Criteria: the control makes clear what is about to be shared before it is shared, and the user
  can edit or delete any of it in their own client. Nothing is transmitted without that step.
- Criteria: works with no network (composes into the client; the client handles delivery).

### 4. Cookieless analytics

- Criteria: a cookieless, no-persistent-identifier analytics tool (Plausible or equivalent) records
  page loads, PWA installs, and return visits. **No cookies, no localStorage writes, no device
  fingerprinting** — this is what keeps it outside PECR reg 6 and off a consent banner.
- Criteria: no financial figure, job title, bill label, goal name or entered value is ever sent.
  Only whole-app events. If a custom event could carry a user-entered string, it doesn't ship.
- Criteria: the privacy notice (feature 5) names the tool, what it records, and what it cannot see.
- Criteria: **verified by inspection** — network traffic captured during a full session and checked
  for personal or financial data, as part of the QA pass, not the Builder's own say-so.

### 5. Compliance surface (legally required before real users, not optional)

- Criteria: a published privacy notice covering lawful basis, what is collected via each route
  (analytics vs. feedback), retention, and rights.
- Criteria: a data-protection complaints route with a stated contact and acknowledgement commitment,
  satisfying s.164A DPA 2018 (in force 19 June 2026): direct complaints accepted, acknowledged within
  30 days, responded to without undue delay. [Observed — `REQUIREMENTS.md` §3.1.]
- Criteria: ICO registration completed and the reference recorded **before** feature 3 is publicised.
- Criteria: an honest 18+ statement at the point of use, as the cheapest Children's Code mitigation
  given 16–17-year-olds work shifts. [Observed — `REQUIREMENTS.md` §3.10.]
- Criteria: the existing "simplified effective-rate estimates" disclaimer stays accurate.

### 6. Credit-agreement bill typing and the not-debt-advice boundary

<!-- The leverage point from REQUIREMENTS.md §7. Cheap now, expensive to retrofit, and the exposure
     grows the moment more than one person uses it. Human may cut this from v10 — but should cut it
     knowingly, not by omission. -->

- Criteria: an outgoing can be marked as a credit commitment (credit card, loan, BNPL, car finance,
  overdraft, catalogue). Optional field, no behaviour change if unset.
- Criteria: **the app never reorders, ranks, recommends or evaluates the merits of paying one
  obligation over another.** Ordering is the user's, always. Coverage reporting states which
  obligations the earnings reached, in the user's own order, as a computed fact.
- Criteria: where any obligation is marked as a credit commitment, the app does not generate any
  message that could read as steering — no "pay this first," no "consider reducing," no
  "prioritise." Stating a shortfall is fine; suggesting what to do about it is not.
- Criteria: a plain, visible statement that this is a planning tool and not debt advice, with a
  pointer to free regulated debt advice. Copy routes through `noxus-copywriter`.
- Criteria: this constraint is recorded in `ARCHITECTURE.md`'s decisions log **with the reason**
  (art. 39E RAO / PERG 17, per `REQUIREMENTS.md` §3.6), so a future session cannot helpfully
  "improve" the app into a regulated activity. ARCHITECTURE.md is the architect's file, not the
  Builder's — this criterion is a request to the architect, not a Builder task.

---

## NOT doing (this version)

- **Accounts, sync, any backend.** Gated on Q1 returning a positive answer. [`REQUIREMENTS.md` §7.]
- **Push notifications.** Wants a server or push service; wait for the gate.
- **Weekly email summary.** PECR consent, list management, and nobody to send it to yet.
- **Overtime / night / weekend premium rules.** Real and wanted (`REQUIREMENTS.md` §2), but it is a
  planning-maths change and this version is deliberately not one.
- **Date-aware model, payday marking, cash-flow gap view.** Same reasoning — v11 candidate.
- **Payslip reconciliation, break deduction, shift duplication, trend view.** Same.
- **Open Banking, earned wage access, bill switching, community forum.** Rejected permanently,
  `REQUIREMENTS.md` §4.G.
- **Seed data personal-vs-neutral.** Still an open human decision carried from v9 and 2026-08-12.
  **It arguably blocks this version** — every new installer's first screen is currently somebody
  else's financial life, and v10 exists to put the app in strangers' hands. Flagged, not scoped.

---

## Open questions for the human before freeze

1. **Does feature 6 stay in v10, or move out?** It is the identified leverage point and it is cheap
   today. It is also not what you asked for. Your call, made knowingly either way.
2. **Seed data.** If v10 ships to strangers with the current seed data, feature 1 and 3 are
   undermined by the front door. Decide before freeze, not after.
3. **Analytics: still worth it?** It answers part of Q1 and none of Q2–Q4, and it is the only thing
   in this version pulling you toward controller obligations you'd otherwise carry lightly. Keeping
   it is defensible if you expect to pass 100 users. Below that it is mostly ceremony.
4. **Who is the ICO registration in the name of** — you personally, or a Noxus entity? Affects the
   privacy notice and the complaints contact.
5. **What is the feedback destination?** A personal WhatsApp number and personal email in a public
   privacy notice is a real-world exposure decision, not a technical one.

## Freeze

NOT FROZEN. No build may begin against this file.

`FROZEN: <date>` to be added by the human, in `SCOPE.md`, after editing.

## Changelog

<!-- None. -->
