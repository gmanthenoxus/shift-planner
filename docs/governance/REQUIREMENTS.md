# REQUIREMENTS: Evenweek as a Full Application

Date: 2026-08-15
Status: **PRE-SCOPE. Candidate input, not a decision.** Human-owned once accepted.

<!-- This document answers "if Evenweek were a full application, what would have to be in it?"
     It is deliberately upstream of SCOPE.md. Nothing here is approved, frozen, or buildable.
     The Builder does not act on this file; the human cuts a scope out of it, and only then does
     the architect take over.

     Evidence labels match PROJECT.md and COMPETITION-UK.md convention and are load-bearing:
     [Observed] traceable to a cited source or the shipped code.
     [Inference] reasoned from observed facts.
     [Speculation] plausible, unverified.
     [Unknown] cannot currently be determined. Do not strip them.

     LEGAL DISCLAIMER: I am not a lawyer. Every regulatory claim below is sourced and labelled,
     but sourced is not the same as advised. The FCA perimeter items in §3 are the ones where
     being wrong is expensive, and they are the ones to put in front of an actual solicitor
     before any line of code is written. -->

---

## 0. Attacking the premise first

Three assumptions sit inside "let's spec the full application." Two are shaky.

**1. Assumption: the constraint is feature completeness.**
False, and this repo already says so. `PROJECT.md` §0 states the binding constraint is one verified
external user, and that any strategy answering "what should we build next" before "who is arriving
and from where" is solving the wrong problem competently. [Observed.] Nothing has changed since
2026-08-12. This document does not move that number.

**2. Assumption: "full application" is a bigger version of the current thing.**
False. It is a *different legal entity*. The moment there is a server holding another person's
income, bills and debts, you stop being someone with a useful web page and become a UK data
controller with statutory duties, an ICO registration, and — depending on exactly which features
get picked — potentially an FCA perimeter problem. [Observed, §3.] The current app has zero of
these obligations precisely because it has no server. That is not an accident of the architecture,
it is the architecture's main product.

**3. The variable being ignored: legal exposure is triggered per-feature, not per-application.**
This is the useful finding in the whole document. There is no single "compliance cost" of going
full-app. There is a set of switches, and each feature you pick flips specific ones. Bank
connection flips FCA. A forum flips Ofcom. Ranking a credit-card payment flips the debt-counselling
perimeter. Picking features is therefore identical to picking your regulator. [Inference from §3.]

**So the correct output of this document is not a feature list. It is a trigger map** — §3 — and a
cut-line drawn against it. §7 is the recommendation.

---

## 1. What already exists

Baseline, so the gap is honest. Sourced from `TECH-PACK.md` §1 and `SCOPE.md` v9.

| # | Feature | Notes |
|---|---|---|
| 1 | Country/currency picker, 9 countries | Tax model per country; flat-% custom option |
| 2 | Multi-job with per-job rate, typical hrs, pension % | Blended into one weighted effective rate |
| 3 | Progressive tax applied at hourly level | Effective-rate approximation, audited in `TAX-ACCURACY-AUDIT.md` |
| 4 | Working-ceiling feasibility check | Max days × max hours, stated out loud |
| 5 | Other-income field | Single input |
| 6 | Outgoings with category + running total | Priority-ordered |
| 7 | One-off goals with auto-expiry | Weeks-based, expired state visible |
| 8 | Take-home summary + deduction breakdown | Gross/hr → net/hr |
| 9 | Headline hours/week + 3-tier feasibility verdict | Sustainable / heavy / brutal |
| 10 | "Where every hour goes" donut | Deduction slices + category slices |
| 11 | Reality bar (baseline + goal segments) | Stacked, with headroom vs over-ceiling |
| 12 | Shift log with per-shift computed net pay | Weekly |
| 13 | Pace panel (ahead/short vs target) | Coverage bar |
| 14 | Banked week history with frozen coverage | "Reached N of M obligations" |
| 15 | Export / import / reset (JSON) | Hardened import, inline errors |
| 16 | Accessibility pass | aria-labels, 44×44 targets, focus states |

**What it has zero of:** accounts, sync, notifications, mobile install, any server, any second device,
any way to know a user exists.

---

## 2. Best-of-competitor: what's genuinely worth taking

From `COMPETITION-UK.md`. Filtered hard — most competitor features are table stakes or traps.

| Take | From | Why it's worth taking | Why it isn't already here |
|---|---|---|---|
| **Overtime / night / weekend premium rules** | Tier A trackers (Shift Hours Logger, Work Hours & Pay Calculator) | Door supervision pays night and weekend premiums. Without this the net/hr is wrong for the actual audience, which undermines the one number the app exists to produce | Never scoped; `SCOPE.md` v9 was corrective only |
| **Per-shift pay verification against payslip** | ShiftPay, Work Shift Calendar & Payslip | "Did they pay me right" is a sharper, more frequent pain than "how many hours do I need" and the app already computes both sides | Not the founding question |
| **Payday marking on a calendar** | Shift Calendar & Work Schedule | Bills are due on dates; pay arrives on dates; the gap between them is the actual cash-flow problem the current app abstracts away | Current model is per-week, dateless |
| **Bill-amount anomaly flagging** | Snoop | "This bill is higher than usual" is the only genuinely proactive competitor feature found | Needs history the app doesn't retain across devices |
| **Push / re-engagement** | Every competitor | Universal, and the single largest structural gap | Impossible without a server or PWA |
| **Multi-platform earnings view** | Rodeo | Only if the audience widens to delivery riders | Out of current audience per `PROJECT.md` §3 |

**Deliberately NOT taking:**

- **Open Banking / bank sync** (Emma, Snoop, Wagestream) — breaks the trust proposition, triggers FCA
  registration, and puts you on a funded competitor's ground with no budget. See §3.5 and §6.
- **Earned wage access** (Wagestream) — requires employer contracts and moving real money. Not a
  feature, a business.
- **Bill switching / provider recommendations** (Snoop) — this is a financial promotion. See §3.7.
- **Employer rota import** (Deputy, Planday) — no standard API across employers; per-vendor
  integration work with no leverage. [Inference.]

---

## 3. The trigger map — what law each feature switches on

**This is the core of the document.** Read it as: pick a row, accept its obligations.

### 3.1 Any personal data on a server → UK GDPR / DPA 2018

Triggered by: accounts, sync, backups, email, analytics. Anything that leaves the device.

| Obligation | Detail |
|---|---|
| ICO registration + annual fee | Tier 1: **£52/yr** (£47 by direct debit) for micro-orgs ≤10 staff or ≤£632k turnover [Observed — secondary sources, consistent across several; ICO's own fee page is JavaScript-rendered and the figure could not be read directly this pass. Confirm on ico.org.uk before relying on the exact number] |
| Lawful basis + privacy notice | Must be identified and published before collection |
| **Complaints process** | **Already mandatory.** DUAA 2025 inserted s.164A DPA 2018, in force **19 June 2026** — controllers must accept complaints directly, acknowledge within 30 days, respond without undue delay. No exceptions, no size threshold. [Observed] |
| Breach notification | ICO within 72 hours; data subjects if high risk |
| DSAR / erasure / portability | One month to respond, free |
| Security | Appropriate technical measures — encryption at rest and in transit, given financial data |
| DPIA | Likely required: financial data + potential under-18 users, see 3.10 |

Cost: low in money, **permanent in attention**. This is the obligation that never ends.

### 3.2 Cookies, analytics, marketing email → PECR

Triggered by: any non-essential cookie, any analytics, any newsletter.
Consent banner required for non-essential storage; soft opt-in rules for email. Avoidable entirely
by using no analytics — which is also `PROJECT.md` §4.3's stated position. [Observed.]

### 3.3 Public availability → Equality Act 2010

Triggered by: existing already.
Service providers owe a reasonable-adjustments duty to disabled users. The Act doesn't name WCAG,
but **WCAG 2.2 Level AA is the accepted way to evidence compliance**. Damages are uncapped;
injury-to-feelings awards reach ~£62,900 in the upper band. [Observed.]
v9's accessibility work is a genuine down-payment here, not a nice-to-have.

### 3.4 Showing tax figures → not regulated, but not free either

Not an FCA activity. Tax calculation isn't a regulated activity and this isn't tax agency work.
[Inference — no regulated activity in the RAO covers it.] But under the Consumer Rights Act 2015 a
service must be performed with reasonable care and skill, so the accuracy work in
`TAX-ACCURACY-AUDIT.md` and the honest "simplified effective-rate estimates" disclaimer are the
mitigation. **Keep the disclaimer accurate as features grow** — `SCOPE.md` v9 feature 1's last
criterion already says this. [Observed.]

### 3.5 Bank connection → FCA registration as an AISP, or agency

Triggered by: any Open Banking data feed.
Account information services are a **regulated activity**. You must be FCA-authorised under reg 6
or registered under reg 17 of the PSRs. [Observed.]

Two routes:

| Route | Time | Notes |
|---|---|---|
| Direct FCA registration (RAISP) | ~3–6 months | No initial capital required if AIS-only, but **professional indemnity insurance is mandatory** [Observed] |
| **Agent of an existing AISP** (TrueLayer, Plaid) | ~4–6 weeks | The AISP registers you as its agent on the FCA register. Faster, cheaper, and the normal startup route [Observed] |

Even the agent route means an FCA register entry, PII, and a commercial contract with a TPP.
**This is the single most expensive switch on the board.**

### 3.6 Ranking or advising on bill payment where any bill is a credit agreement → debt counselling

**The trap most likely to catch this specific app, and it is not obvious.**

Debt counselling is a regulated activity under **article 39E of the Regulated Activities Order**:
advice to a borrower about the *liquidation of a debt due under a credit agreement*. [Observed —
FCA PERG 17.] Four findings that matter here:

1. **"Liquidation" is wide** — it includes simply "paying off the debt in full and in time," not
   just insolvency or rescheduling. [Observed — PERG 17.3 Q3.1.]
2. **Not limited to overdue debts.** It covers "present obligations to make payments in the future."
   [Observed — Q3.2.] A credit card sitting in your outgoings list qualifies.
3. **Contamination rule.** If advice covers a mix of debts and *some* are credit-agreement debts,
   the advice on *all of them* is likely debt counselling. [Observed — Q3.3.] So a priority list
   containing rent, phone AND a car-finance payment is assessed as a whole.
4. **Advice ≠ information, and the line is low.** "Any element of evaluation, value judgment or
   persuasion is likely to mean that advice is being given." [Observed — Q5.2.] Scripted
   questioning and decision trees are explicitly in scope; the escape is that the process must be
   "limited to, and likely to be perceived by the debtor as, assisting the debtor to make his own
   choice," with no judgement on the suitability of any course of action. [Observed — Q5.5.]

**What this means concretely for Evenweek:**

| Behaviour | Verdict |
|---|---|
| User orders their own bills; app shows which their earnings reached | **Likely outside.** Factual, user-ordered, no evaluation [Inference] |
| App computes hours needed to cover a stated list | **Likely outside.** Arithmetic on user-supplied figures [Inference] |
| App reorders bills for the user, or says "pay this one first" | **Likely inside** if any bill is a credit agreement [Inference from Q5.2 + Q3.3] |
| App suggests reducing, delaying or rescheduling a payment | **Inside.** Squarely "liquidation" [Inference from Q3.1] |
| App says "you can't cover everything this week" and stops there | **Likely outside.** Stating a computed fact [Inference] |
| App says "you can't cover everything — here's what to do" | **Inside** [Inference] |

**Design rule that falls out of this: the app computes, the user decides ordering, and the app
never evaluates the merits of one payment over another.** That rule is free today and expensive to
retrofit. It should go into ARCHITECTURE.md as a constraint, not a preference.

Confidence in this reading: **65%.** PERG is guidance, not law, and the "mere information"
boundary is fact-sensitive. This is the item for a solicitor.

### 3.7 Recommending or linking to financial products → s21 FSMA financial promotion

Triggered by: Snoop-style bill switching, affiliate links, "cheaper provider" suggestions,
any partner monetisation of the Rodeo type.

An unauthorised person may not communicate an inducement to engage in investment activity unless
the content is approved by an authorised firm with the financial-promotions permission — and since
2024 that approval sits behind a specific FCA gateway. **Breach of s21 is a criminal offence under
s25 FSMA: up to two years' imprisonment, unlimited fine, or both.** [Observed.]

This alone kills affiliate monetisation of financial products for a solo operator, which
`PROJECT.md` §5 had already rejected on trust grounds. [Observed.] Two independent reasons to say
no is a settled question.

### 3.8 Earned wage access → currently outside consumer credit, not outside everything

The FCA reviewed EWA in 2022 and concluded that access to already-earned wages is **not** consumer
credit. [Observed.] But it still requires moving money (payment services perimeter), employer
contracts, and the FCA has said poorly-designed products producing credit-like harms will attract
attention. A CIPP Code of Practice exists; the Fair Work Agency launching April 2026 may bring
further guidance. [Observed.]
**Verdict: not a feature. A different company.** Out of scope at any version.

### 3.9 Community, forum, comments, shift-swapping between users → Online Safety Act 2023

Triggered by: any user-to-user content. Rodeo's rider forum is the competitor asset
`COMPETITION-UK.md` §10 identifies as the one Evenweek most lacks — and it is also the most
legally expensive thing to copy.

All providers of regulated user-to-user services owe duties on illegal-content risk assessment,
illegal content, content reporting, complaints procedures, freedom of expression and privacy, and
record-keeping. **These base duties apply regardless of size** — categorisation affects the
*additional* duties, not the core ones. [Observed.]

**Verdict: the highest effort-to-value ratio on the board.** Community is the right instinct and
the wrong build. Do it in a WhatsApp group or a subreddit you don't operate. [Inference.]

### 3.10 Users who might be under 18 → ICO Children's Code

Triggered by: existing, arguably, the moment there are accounts.
The Code applies to any online service **likely to be accessed** by an under-18 in the UK, whether
or not it targets them. [Observed.] 16- and 17-year-olds work retail, hospitality and warehouse
shifts — the app's own stated audience. [Observed — `PROJECT.md` §3.] So "likely to be accessed" is
a live question, not a theoretical one.

Consequences: DPIA, high-privacy defaults, data minimisation, age-appropriate transparency,
no nudge techniques toward lower privacy.
**Cheapest mitigation: a genuine 18+ requirement at signup, applied honestly.** [Inference.]

### 3.11 Charging money → consumer contract law

Triggered by: any paid tier.
Consumer Rights Act 2015, Consumer Contracts Regulations (14-day cancellation right for digital
services, with the standard waiver), clear terms, and the subscription regime under the Digital
Markets, Competition and Consumers Act 2024. [Observed at framework level; specific DMCCA
subscription commencement — [Unknown], verify before pricing.]
Plus payment processing (Stripe) with its own KYC.

---

## 4. Full-application feature map

Grouped by domain. **Tier** = what it costs you legally, from §3.
🟩 no new legal trigger · 🟨 data-protection only · 🟥 FCA / Ofcom / criminal perimeter

### A. Identity and data
| # | Feature | Tier | Trigger | Status |
|---|---|---|---|---|
| A1 | Email + password account | 🟨 | 3.1 | New |
| A2 | Cross-device sync | 🟨 | 3.1 | New |
| A3 | Server-side backup / restore | 🟨 | 3.1 | New |
| A4 | Local-only mode retained as a first-class option | 🟩 | — | Exists (would become a choice) |
| A5 | Export / import JSON | 🟩 | — | Exists |
| A6 | Account deletion, full erasure | 🟨 | 3.1 mandatory | New — **legally required if A1** |
| A7 | Data-protection complaints route | 🟨 | 3.1 mandatory | New — **legally required, in force now** |
| A8 | Privacy notice + lawful basis | 🟨 | 3.1 mandatory | New — **legally required if A1** |
| A9 | 18+ gate at signup | 🟨 | 3.10 | New — cheapest Children's Code mitigation |

### B. Core planning (the differentiator — protect this)
| # | Feature | Tier | Status |
|---|---|---|---|
| B1 | Monthly obligations → weekly hours target | 🟩 | Exists |
| B2 | Tax-adjusted net hourly rate, 9 countries | 🟩 | Exists |
| B3 | Multi-job blended effective rate | 🟩 | Exists |
| B4 | Per-job pension contribution | 🟩 | Exists |
| B5 | Working-ceiling feasibility check | 🟩 | Exists |
| B6 | One-off goals with auto-expiry | 🟩 | Exists |
| B7 | "Where every hour goes" breakdown | 🟩 | Exists |
| B8 | **Bills flagged as credit agreements, handled separately and never ranked by the app** | 🟩 | **New — this is a compliance feature disguised as a data-model change (§3.6)** |
| B9 | Date-aware model: bills due on dates, pay arriving on dates | 🟩 | New — from Tier A payday marking |
| B10 | Cash-flow gap view (bill due before payday) | 🟩 | New — must stay descriptive, not prescriptive (§3.6) |

### C. Shift tracking
| # | Feature | Tier | Status |
|---|---|---|---|
| C1 | Shift log with computed net pay | 🟩 | Exists |
| C2 | Week banking + history | 🟩 | Exists |
| C3 | Overtime / night / weekend premium rules | 🟩 | New — best-of, §2 |
| C4 | Shift duplication | 🟩 | Parked (`SCOPE.md` v9 "NOT doing") |
| C5 | Break deduction | 🟩 | New — universal in Tier A |
| C6 | Expected vs actual pay reconciliation ("check my payslip") | 🟩 | New — best-of, §2 |
| C7 | Trend / sparkline history | 🟩 | Parked |
| C8 | Calendar (.ics) export of planned shifts | 🟩 | New — cheap, no trigger |

### D. Engagement (the structural gap)
| # | Feature | Tier | Status |
|---|---|---|---|
| D1 | PWA / add-to-homescreen | 🟩 | Parked — `PROJECT.md` §4.5 ranks this above all new features |
| D2 | Offline capability | 🟩 | New |
| D3 | Web push ("you're 6 hours short with 2 days left") | 🟨 | New — needs server or push service |
| D4 | Weekly email summary | 🟨 | New — PECR consent (3.2) |
| D5 | Bill-amount anomaly flag | 🟩 | New — best-of; must state the fact, not advise |

### E. Trust and compliance surface
| # | Feature | Tier | Status |
|---|---|---|---|
| E1 | WCAG 2.2 AA conformance | 🟩 | Partial — v9 did the down-payment (3.3) |
| E2 | Accurate simplified-estimate disclaimer | 🟩 | Exists — keep accurate (3.4) |
| E3 | Explicit "this is not debt advice" boundary in copy | 🟩 | New — routes through `noxus-copywriter` |
| E4 | Terms of service | 🟩/🟨 | New if accounts or payment |
| E5 | Security: encryption at rest + in transit, rate limiting, session handling | 🟨 | New if backend |

### F. Commercial
| # | Feature | Tier | Status |
|---|---|---|---|
| F1 | Voluntary support link (Ko-fi) | 🟩 | New — preserves every design commitment |
| F2 | Paid sync tier | 🟨 | New — 3.11 |
| F3 | Financial-product affiliates | 🟥 | **Rejected — §3.7, criminal offence risk** |

### G. Rejected outright
| Feature | Why |
|---|---|
| Open Banking sync | 🟥 §3.5 — FCA registration or agency, PII insurance, breaks the trust proposition |
| Earned wage access | 🟥 §3.8 — a different company |
| Bill switching / provider recommendations | 🟥 §3.7 — financial promotion, criminal liability |
| Community forum / shift swapping | 🟥 §3.9 — Online Safety Act duties apply at any size |
| App-decided bill prioritisation | 🟥 §3.6 — debt counselling perimeter |

---

## 5. Connections map

| Connection | Purpose | Feature deps | Legal trigger | Recommendation |
|---|---|---|---|---|
| **Backend + database** (Supabase already connected to this workspace) | Accounts, sync | A1–A3 | 3.1 | Only if §7's gate is passed. Row-level security is non-negotiable |
| **Auth provider** (Supabase Auth) | Login | A1 | 3.1 | Bundled with the above; don't hand-roll auth |
| **Web Push** (VAPID, native browser API) | D3 | D1, backend | 3.1 | Free, no third party, needs PWA first |
| **Transactional email** (Resend / Postmark) | D4, A6, A7 | Backend | 3.1, 3.2 | Required for account recovery even without marketing |
| **Stripe** | F2 | Accounts | 3.11 | Only at proven demand |
| **Error monitoring** (Sentry, self-hostable) | Reliability | Backend | 3.1 — scrub PII | Configure to strip financial fields |
| **Analytics** | Usage | — | 3.2 | **Recommend none.** `PROJECT.md` §4.3 already chose conversation over instrumentation |
| **Open Banking TPP** (TrueLayer / Plaid, agency model) | Bank sync | — | 3.5 | **No.** Documented for completeness |
| **Employer rota APIs** (Deputy, Planday) | Rota import | — | 3.1 | **No.** Per-vendor work, no leverage, and most employers use neither |
| **Calendar export (.ics)** | C8 | — | None | Yes — pure client-side, zero trigger |

**The shape of this table is the finding:** everything above the Stripe line is one backend and one
email provider. Everything below is either a regulator or wasted effort.

---

## 6. Hidden tradeoffs

| What going full-app buys | What it costs |
|---|---|
| Sync — survives a cleared browser, which is the real retention killer for localStorage | The no-server promise, which is currently the trust proposition and the reason someone types their real income in |
| Notifications — the only re-engagement mechanism that exists | Permanent controller status: ICO fee, complaints process, breach clock, DSARs, forever |
| A user count, therefore actual evidence | An attack surface holding other people's financial positions, defended by one person with a day job |
| A revenue path with a real ceiling | Consumer contract obligations and a support burden that arrives on someone else's schedule, not around 12–1am shift ends |
| Overtime/night rules — a *correct* net rate for the actual audience | Model complexity in the one part of the app that must never be wrong |
| Legal clarity from doing §3 now | Constraints in ARCHITECTURE.md that will feel arbitrary in eight months when nobody remembers PERG 17 |

---

## 7. The recommendation, and the cut-line

**Uncomfortable conclusion first: do not build the full application. Build the compliance-shaped
constraints into the current one, and gate the backend on evidence you do not yet have.**

Three phases. The gate between 1 and 2 is a number, not a feeling.

**Phase 1 — no new legal exposure. Buildable now.**
B8 (credit-agreement flagging), B9/B10 (date-aware model), C3, C5, C6, C8, D1, D2, D5, E1, E3, F1.
Every one is 🟩. This is a materially better product that stays outside every perimeter in §3 and
keeps `PROJECT.md`'s design commitments intact. **B8 and E3 are the ones to do first** — they are
cheap now and expensive to retrofit.

**Gate: 20 real users, of whom a meaningful share return in week two.**
`PROJECT.md` §4 already set this number. It has not moved. Nothing in phase 2 is justified until it does.

**Phase 2 — data-protection exposure only, gated.**
A1–A3, A6–A9, D3, D4, E4, E5, plus the backend and email connections. Accept controller status
deliberately. Register with the ICO before the first account exists, not after.

**Phase 3 — commercial, gated on phase 2 retention.**
F2 and Stripe. Voluntary support (F1) can happen in phase 1 and costs nothing.

**Never:** everything in §4.G.

**The single highest-leverage action** is not in any phase: it is **B8 plus E3** — modelling
credit-agreement bills as a distinct type the app refuses to rank, and saying plainly in the copy
that this is not debt advice. It costs a few hours today, it is the difference between a design
choice and a retrofit under pressure, and it is the only item here where being late is genuinely
expensive.

---

## 8. Second-order effects

Accounts fix the retention problem (cleared browser destroys everything) → which creates a support
obligation → which lands on someone finishing shifts at 12–1am → which means either slow responses
that breach the s.164A 30-day acknowledgement duty, or a systems answer built before the first
user. [Inference.] The systems answer is templated responses and an inbox routine, and it needs to
exist *before* phase 2, not after the first complaint.

Overtime and night rules make the net/hr genuinely correct → which makes the app more accurate than
the payslip the user is checking → which makes "your employer underpaid you" a claim the app is
implicitly making. [Inference.] That is a reputational and CRA 2015 exposure the current
conservative framing avoids, and C6 should be worded as "expected vs actual, check with your
employer," never as a verdict.

Anything that makes the app better at handling debts pulls it toward the §3.6 perimeter. The
features users will most plausibly ask for — "which bill should I pay first" — are the exact ones
that are regulated. [Inference.] **Expect the most-requested feature to be the illegal one.**

---

## 9. What would change my mind

- **On "don't build the backend":** twenty users arriving and churning specifically over lost data
  after clearing a browser. That converts sync from speculation to a named, observed cause of churn.
- **On the debt-counselling reading (§3.6):** a solicitor's opinion, or an FCA-authorised firm
  confirming that arithmetic on a user-ordered list is outside art. 39E. My 65% is a reading of
  guidance, not advice.
- **On rejecting Open Banking:** users saying unprompted that manual bill entry is the reason they
  stopped. That would make the FCA cost a price rather than a waste.
- **On rejecting community:** if the second and third users arrive *through* a shift-worker
  community rather than through you personally, the distribution value might outweigh the Ofcom
  duties — though hosting it yourself would still be the wrong way to capture it.
- **On the whole document:** a real user asking for something not on this list. That single event
  would be worth more than the whole of §4.

---

## 10. Decision score — "build the full application now"

| Dimension | Score | Reasoning |
|---|---|---|
| Evidence quality | **2/10** | One verified user. Every feature judgement is inference from competitor listings and the builder's own occupation |
| Reversibility | **3/10** | Phase 1 is fully reversible. Phase 2 is not — accounts holding financial data cannot be quietly undone, per `PROJECT.md` §7 |
| Expected payoff | **3/10** | 15% confidence of meaningful revenue in 12 months, unchanged from `PROJECT.md` §5 |
| Risk | **7/10 (high)** | Perimeter risk is manageable if §7's cut-line holds; it becomes serious the moment a "helpful" prioritisation feature ships without anyone remembering §3.6 |

**Phase 1 alone** scores very differently: reversibility 9/10, risk 2/10, payoff 5/10. That gap is
the recommendation.

**Base rate worth naming:** most solo-built consumer finance apps with one user do not reach twenty.
[Speculation — no data gathered, but the shape of it is not controversial.] Planning the full
application is a more comfortable activity than recruiting user two, and it feels like progress.

**Opportunity cost:** every hour on this document and its successors is an hour not spent on
`PROJECT.md` §4.2 — ten hand-recruited conversations with colleagues on shift. That is the actual
bottleneck, and it does not get less true for being repeated.

---

## 11. Confidence

**Overall: medium (60%).**
- Data protection (§3.1–3.2): **high (85%)** — well-documented, consistently sourced, s.164A date verified across multiple independent sources.
- Accessibility (§3.3): **high (80%)**.
- FCA perimeter (§3.5, 3.7, 3.8): **medium-high (75%)** — sourced to FCA and PERG directly.
- Debt counselling (§3.6): **medium (65%)** — PERG is guidance; the information/advice line is fact-sensitive and I am not a lawyer.
- Feature judgements (§2, §4): **medium-low (50%)** — inherits `COMPETITION-UK.md`'s own admission that Tier A is vendor-description-deep, with nobody having installed a single competitor.
- DMCCA subscription commencement detail (§3.11): **[Unknown]**.

---

## 12. What we're most likely wrong about

**Most likely wrong: that a complete map helps.** This document is 🟩/🟨/🟥-coded, phased, and
scored, and all of that is a more satisfying activity than the one thing `PROJECT.md` has said twice
is the constraint. A thorough requirements document is exactly what building looks like when you'd
rather not be recruiting. The map is real; the impulse to draw it is worth being suspicious of.

**Second: the legal analysis may be over-cautious in the direction that happens to be convenient.**
Every §3 finding points at "stay small, stay local, don't add the backend" — which is also the
cheapest, most comfortable answer and the one the current architecture already implements. That
convergence is suspicious. A solicitor might well say the debt-counselling risk is negligible for a
tool that never mentions credit, and that Open Banking via the agency model is a four-week,
few-thousand-pound problem rather than a wall. I have not tested that, and the analysis is
structured so that not testing it looks prudent.

**Third: §2's "best-of" list is a guess about what users want, made without asking one.** Overtime
rules are top of that list because door supervisors get night premiums and the builder is a door
supervisor — a genuine advantage, and a sample of one.

---

## Sources

**FCA / regulatory perimeter**
- [FCA Handbook — PERG 17: Consumer credit debt counselling](https://handbook.fca.org.uk/handbook/perg17)
- [FCA Handbook — PERG 1: Introduction to the Perimeter Guidance manual](https://handbook.fca.org.uk/handbook/perg1)
- [FCA — Debt management activity and authorisation](https://www.fca.org.uk/firms/authorisation/process/debt-managers)
- [FCA Handbook — CONC 8: Debt advice](https://handbook.fca.org.uk/handbook/conc8)
- [FCA Handbook — debt counsellor (glossary)](https://www.handbook.fca.org.uk/handbook/glossary/G3319.html)
- [Money Advice Hub — FCA debt advice regulation](https://www.moneyadvicehub.org.uk/debtipedia/your-money/financial-strain/getting-help-with-debt/fca-debt-advice-regulation)
- [FCA — Advice Guidance Boundary Review](https://www.fca.org.uk/firms/advice-guidance-boundary-review)

**Open Banking / AISP**
- [TrueLayer — Open banking regulation in the UK](https://truelayer.com/reports/open-banking-guide/open-banking-regulation-in-the-uk/)
- [TrueLayer — Customers and the data chain: agents](https://truelayer.com/blog/open-banking/data-chain-agents/)
- [Plaid — FCA registration and how Plaid can help](https://plaid.com/blog/fca-registration-and-how-plaid-can-help/)
- [K2 Regulatory — Open Banking AIS, PISP & RAISP authorisation](https://www.k2regconsultants.com/open-banking-ais-pisp-raisp-authori)
- [Bratby Law — FCA open banking regulation: the 2026 position](https://bratby.law/fca-open-banking-regulation/)

**Financial promotions**
- [FCA — Approving financial promotions](https://www.fca.org.uk/firms/financial-promotions-and-adverts/approving-financial-promotions)
- [FCA — Applying to approve financial promotions for unauthorised persons](https://www.fca.org.uk/firms/financial-promotions-adverts/applying-approve-unauthorised-persons)
- [LexisNexis — The financial promotion regime essentials](https://www.lexisnexis.com/en-gb/legal/guidance/the-financial-promotion-regime-essentials)

**Earned wage access**
- [CIPP — Earned Wage Access Code of Practice](https://www.cipp.org.uk/best-practice/ewa-code.html)
- [Responsible Credit — Employer salary access schemes](https://www.responsible-credit.org.uk/posts/employer-salary-access-schemes-financial-friend-or-foe)

**Data protection**
- [ICO — Registration FAQs and data protection fee](https://ico.org.uk/for-organisations/data-protection-fee/faqs-data-protection-fee-payment-and-online-registration/)
- [CMS — DUAA 2025: new statutory rules on handling data protection complaints from 19 June 2026](https://cms.law/en/gbr/legal-updates/data-use-and-access-act-2025-new-statutory-rules-on-handling-data-protection-complaints-from-19th-june-2026)
- [DLA Piper Privacy Matters — New complaints handling rules under DUAA take effect 19 June 2026](https://privacymatters.dlapiper.com/2026/06/uk-new-complaints-handling-rules-under-duaa-take-effect-on-19-june-2026-are-you-ready/)
- [Mayer Brown — Preparing for the DUAA 2025 complaints procedure requirement](https://www.mayerbrown.com/en/insights/publications/2026/02/preparing-for-the-data-use-and-access-act-2025-upcoming-complaints-procedure-requirement)
- [ICO — Introduction to the Age Appropriate Design Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-code/)

**Accessibility**
- [Level Access — Equality Act 2010: UK website accessibility guide](https://www.levelaccess.com/blog/united-kingdom-accessibility-requirements/)
- [GOV.UK — Understanding accessibility requirements for public sector bodies](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps)

**Online Safety Act**
- [Online Safety Act 2023 — legislation.gov.uk](https://www.legislation.gov.uk/ukpga/2023/50/part/3/chapter/2/2023-10-26?view=plain)
- [Kingsley Napley — Implementing the Online Safety Act: Ofcom's new requirements](https://www.kingsleynapley.co.uk/our-insights/articles/the-implementation-of-the-online-safety-act-understanding-ofcoms-new-requirements/)
- [Open Rights Group — Online Safety Act: a guide for organisations](https://www.openrightsgroup.org/publications/online-safety-act-a-guide-for-organisations-working-with-the-act/)

**Internal**
- `COMPETITION-UK.md` (2026-08-13) · `PROJECT.md` (2026-08-12) · `SCOPE.md` v9 (frozen 2026-07-06) · `TECH-PACK.md` · `TAX-ACCURACY-AUDIT.md` · `PARKING.md`
