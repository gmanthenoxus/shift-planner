# UK Competitive Landscape: Shift Planner

Date: 2026-08-13
Supersedes nothing. Extends `LANDSCAPE.md` (2026-07-06), which scanned Emma + four gig-finance tools.
This pass is UK-first, four-tier, and feature-level.

<!-- Evidence labels match PROJECT.md's convention and are load-bearing:
     [Observed] traceable to a cited source or the shipped code.
     [Inference] reasoned from observed facts.
     [Speculation] plausible, unverified.
     [Unknown] cannot currently be determined. Do not strip them. -->

---

## 0. Attacking the premise first

Before the tables, three assumptions in the question "who is my UK competition?" that are worth testing,
because if any of them is wrong the tables are decoration.

1. **Assumption: Shift Planner has competitors.**
   Most likely false in the strict sense. Across two research passes, no UK product was found that
   converts monthly obligations into a tax-adjusted weekly hours target. [Observed — nothing surfaced
   in either scan.] What exists is a ring of adjacent products that each own one piece of the job.
   **The implication is uncomfortable, not flattering:** an empty category is more often evidence of
   no demand than of no supply. [Inference.] Six shift-tracking apps exist because people search for
   shift tracking. Nobody has built bills-to-hours because [Speculation] very few people search for it.

2. **Assumption: competition means feature overlap.**
   False. Competition is for the same five minutes of the same person's attention. A door supervisor
   already has an employer rota app forced on them, possibly Wagestream because their employer bought
   it, and possibly Snoop because it was free. [Inference.] Shift Planner competes with *those already
   installed apps* and with *a note on their phone*, not with a product that shares its feature list.

3. **The variable being ignored: distribution, not features.**
   `PROJECT.md` §0 already establishes this — one verified external user. Every competitor in these
   tables has a distribution channel Shift Planner does not: app store search (the trackers), employer
   procurement (rostering, Wagestream), Open Banking marketplace listings and press (Emma, Snoop),
   or a rider community (Rodeo). [Observed.] A feature-gap analysis answers "what could we build."
   It does not answer the actual constraint.

**So read the tables as a map of where attention already sits, not as a list of rivals to out-build.**

---

## 1. The four tiers

| Tier | What it is | Who buys it | Threat to Shift Planner |
|---|---|---|---|
| **A. Worker-side shift & pay trackers** | Apps an individual downloads to log shifts and calculate what they earned | The worker | **Highest** — same user, same phone, same moment, overlapping features |
| **B. UK personal finance / budgeting** | Open Banking aggregators that categorise spending after the fact | The worker | **Medium** — same person, different question, far better funded |
| **C. Employer-side rostering** | Rota software the employer buys; worker gets a companion app | The employer | **Low direct, high incumbency** — already on the phone, worker never chose it |
| **D. Gig & shift-worker finance** | Earnings optimisation, earned-wage access, gig tax | Worker or employer | **Medium** — closest audience, adjacent problems |

---

## 2. Tier A — Worker-side shift & pay trackers (the real competition)

| App | Principal focus | Key features | Platform | Price | Region |
|---|---|---|---|---|---|
| **Work Shift Calendar & Payslip** | Shift calendar + payslip estimation | Custom shift types (day/night/split), breaks, work log, paycheck calculator with gross, net and overtime summaries | Android (Play, UK listing) | Free w/ IAP [Unknown — exact tiers] | Global |
| **Shift Hours Logger** | Clock in/out accuracy | Real-time clock in/out, break tracking, **multiple jobs each with own hourly + overtime rate**, automatic daily/weekly overtime thresholds, earnings breakdown into regular / overtime / tips / bonuses / deductions | Android | Free w/ IAP [Unknown] | Global |
| **Shift Work Hours & Pay Log (ShiftPay)** | Verifying your payslip | Clock shifts, auto-calculate earned, explicitly positioned as "check it against your paycheck" | Android | [Unknown] | Global |
| **Work Hours & Pay Calculator** | Forward hours/pay projection | Daily/weekly/monthly hours and pay, days off, breaks, night shifts, 24-hour shifts, overtime and double-time | iOS (UK App Store) | Free w/ IAP | Global |
| **Shift Calendar & Work Schedule** | Rota visualisation | Hourly rate per shift, automatic salary calculation, **payday marking on the calendar** | Android | Free w/ IAP | Global |
| **Timesheet: Work Hours Tracker** | Timesheet export | Hours tracking, timesheet generation | iOS | [Unknown] | Global |

**What the whole tier does:** looks **backward**. You worked, here's what you earned, check your payslip.

**What no app in this tier does:** starts from a bill. Not one of them takes "rent is £600" as an input.
[Observed across all six listings.]

---

## 3. Tier B — UK personal finance / budgeting

| App | Principal focus | Key features | Price | Standout | Known complaint |
|---|---|---|---|---|---|
| **Emma** | Open Banking aggregation | 50+ UK institutions in one dashboard, subscription cancellation, cashback, net worth, rent reporting to credit bureaus | Free (capped); Plus £4.99/mo (4 bank logins); Pro £9.99/mo (unlimited logins, net worth history, custom categories); Ultimate £14.99/mo (business accounts, Spaces) | Breadth of UK bank coverage | Features migrating from free to paid; billing/cancellation complaints [Observed — Trustpilot, orbitmoney.io] |
| **Snoop** | Bill vigilance | Open Banking spend tracking, **flags bills higher than usual and suggests cheaper providers**, auto-detects recurring subscriptions, category comparison month to month | Free core; Snoop Plus £5.99/mo or £47.99/yr (unlimited categories, spend alerts, refund tracking, custom reports, net worth) | Actively hunts for money you're wasting rather than just displaying it | [Unknown — no independent complaint surfaced this pass] |
| **Money Dashboard** | Multi-account aggregation | Account aggregation, budgeting, spend analysis | Free tier + paid [Unknown — current tiers] | Long-standing UK aggregator | [Unknown] |
| **Plum** | Automated saving | Auto-saves from your current account, bill alerts, investing | Free tier; paid tiers [Unknown — current pricing] | Removes the decision from saving | [Unknown] |

**What the whole tier does:** looks **backward from your bank account**. It requires the money to already
have moved. Its unit of work is a transaction.

**The structural mismatch:** every Tier B app assumes income is a known, mostly fixed number that arrives
on a known date. [Inference from their monthly-budget model.] For a door supervisor whose income depends
on how many shifts they accept, that assumption is the whole problem, not a given.

---

## 4. Tier C — Employer-side rostering

| Tool | Principal focus | Worker-facing features | Price (employer pays) |
|---|---|---|---|
| **Deputy** | Scheduling + time & attendance | Mobile app, GPS clock-in, shift notifications, shift swaps | From £3.50/user/mo (scheduling); £4.90/user/mo Premium |
| **Planday** | Scheduling for hospitality/retail | Employee app, availability, swaps | From £2.99/user/mo, 5-user minimum |
| **RotaCloud** | UK SME rotas | Rota view, leave requests, clock-in | From £10/mo up to 5 employees; T&A add-on flat £4.50/mo |
| **Findmyshift** | Cheapest unlimited-headcount rota | Rota view, notifications | £22/mo unlimited employees; free under 5 employees |
| **Shiftbase** | Scheduling + absence | Employee app, absence, payroll prep | Free up to 10 employees; paid from £30/mo |
| **Sling** | Scheduling + team comms | Free plan up to 30 users, messaging | Free tier; paid adds time tracking |

**Why this tier matters despite zero feature overlap:** it is the app already on the worker's phone,
opened weekly, that they did not choose and cannot delete. [Inference.] It owns the shift data Shift
Planner asks the user to type by hand. That is the incumbency problem, and it is a real one.

---

## 5. Tier D — Gig & shift-worker finance

| Tool | Principal focus | Key features | Price / model | Threat |
|---|---|---|---|---|
| **Wagestream (now Stream)** | Earned wage access | Track past/current/future shifts and pay per shift, see earnings accrued mid-pay-period, draw down a set % early, **budgeting tools with bank linking**, targets shift industries explicitly (retail, hospitality, healthcare, logistics) | Employer-purchased benefit; worker pays per withdrawal [Unknown — current fee] | **Highest in tier.** Same audience, employer-distributed, already has shift data, and is adding budgeting |
| **Rodeo** | Cross-platform gig earnings | Earnings across Deliveroo/Uber Eats/Just Eat/Stuart, best time/place/platform to work, rider forum. 20,000+ UK drivers, London-based, founded 2021, finalist in the Smart Data Challenge Prize | Free, ad/partner monetised | Owns a real UK community; adjacent problem |
| **GigTax** | UK gig self-assessment | Combines PAYE + multi-platform gig income into one tax figure | [Unknown] | Low — after-the-fact tax |
| **Hurdlr** | Freelancer income/expense/mileage | Running quarterly tax estimate | Free; Premium $9.99/mo | Low — US-primary |
| **ShiftTracker** | True hourly rate | Earnings after fuel/vehicle/tax, heatmap of best hours/zones | Free; Elite $12.99/mo | Low — US-primary |

**Wagestream deserves a paragraph, not a row.** It is the only product found that already holds the
worker's real shift data, already targets UK shift industries by name, already reaches workers through
their employer, and is now moving into budgeting. [Observed — its own product pages.] If anything in
this document eventually eats Shift Planner's lunch, it is most likely this. [Speculation — no evidence
it intends to build hours-needed planning.]

---

## 6. Feature matrix

✅ has it · ⚠️ partial / adjacent · ❌ doesn't

| Feature | **Shift Planner** | Tier A trackers | Emma / Snoop | Deputy / Planday | Wagestream | Rodeo |
|---|---|---|---|---|---|---|
| Monthly bills → required weekly hours | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tax-adjusted **net** hourly rate | ✅ (9 countries) | ⚠️ flat deduction fields | ❌ | ❌ | ⚠️ actual payslip data | ❌ |
| Multi-job blended rate | ✅ | ⚠️ (some: per-job rates, not blended) | ❌ | ❌ | ⚠️ multi-employer | ⚠️ multi-platform |
| Per-job pension contribution | ✅ | ❌ | ❌ | ❌ | ⚠️ from payroll | ❌ |
| Working-ceiling feasibility check | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| One-off goals with auto-expiry | ✅ | ❌ | ⚠️ savings pots | ❌ | ⚠️ save-from-pay | ❌ |
| Priority-ordered bill coverage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| "Where one earned hour goes" breakdown | ✅ | ❌ | ⚠️ spend categories | ❌ | ❌ | ❌ |
| Shift logging with per-shift pay | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Week-over-week history | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Overtime / night / double-time rules | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Employer rota imported automatically | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Bank / Open Banking connection | ❌ (deliberate) | ❌ | ✅ | ❌ | ✅ | ❌ |
| Bill-price monitoring / switching | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Early access to earned pay | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Which platform pays best | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Push notifications / reminders | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Works with no account | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Data never leaves the device | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cost to the worker | £0 | Free w/ IAP | £0–£14.99/mo | £0 (employer pays) | Per-withdrawal fee | £0 |

---

## 7. Itemised: similarities

1. **Shift logging.** Everyone in Tiers A, C and D logs shifts. This is table stakes, not a
   differentiator, and Shift Planner's version is thinner (no overtime rules, no night premium).
2. **Hourly rate → pay maths.** Tier A does this well and in some cases with more nuance than Shift
   Planner (per-job overtime thresholds, tips, bonuses).
3. **Multi-job support.** Shift Hours Logger supports multiple jobs with individual rates. The
   *blending into one weighted effective rate* is still unique to Shift Planner, but "multi-job" alone
   is not a moat.
4. **Weekly/monthly history.** Universal.
5. **Category breakdown of money.** Emma and Snoop do this over transactions; Shift Planner does it
   over hours. Same visual grammar, different unit.
6. **Targeting shift workers by name.** Wagestream targets exactly the same occupational segment
   (`PROJECT.md` §3: security, hospitality, care, retail, delivery, warehouse).

## 8. Itemised: differences

1. **Direction of travel.** Every competitor computes *backward* from work already done or money
   already spent. Shift Planner computes *forward* from obligations not yet earned. This is the
   single genuine differentiator and everything else follows from it.
2. **The unit is an hour, not a pound.** Competitors answer "where did my money go." Shift Planner
   answers "how much of my week does this cost."
3. **Progressive tax applied at the hourly level, across 9 countries.** Tier A apps offer a flat
   deduction field at best. Nothing found models brackets against an hourly wage.
4. **Feasibility, stated out loud.** The working ceiling tells you when the number of hours you need
   exceeds the hours you're willing to work. No competitor tells a user their plan is impossible.
5. **Priority-ordered coverage.** "Your earnings covered rent and phone but not savings" — found
   nowhere else.
6. **No account, no server, no bank connection.** A deliberate constraint, not a missing feature. It
   is the trust proposition and simultaneously the reason there is no growth loop, no notifications
   and no cross-device sync. [Observed — `PROJECT.md` §2.]
7. **Zero cost, zero monetisation.** Every Tier B competitor has a £5–£15/mo ladder. Shift Planner has
   no revenue path that doesn't violate its own design commitments. [Observed — `PROJECT.md` §5.]
8. **Distribution.** Competitors are in app stores, employer benefit packages and rider forums.
   Shift Planner is a URL. [Observed.]

---

## 9. Hidden tradeoffs in the current position

| What Shift Planner buys | What it pays for it |
|---|---|
| Trust — "nothing leaves your browser" | No sync, no notifications, no growth loop, no re-engagement hook |
| No account friction | No user count, no email list, no way to tell a returning user from a new one |
| Uniqueness of bills-to-hours | Nobody is searching for it; no existing search demand to capture |
| Zero infrastructure cost | Zero revenue, therefore zero budget for distribution |
| 9-country tax engine | Nine countries of maintenance liability for an audience that is currently one person in the UK |

---

## 10. Threat ranking

1. **Wagestream/Stream** — same audience, employer-distributed, already holds shift data, moving into
   budgeting. Confidence it becomes a direct threat within 24 months: **25%.**
2. **Tier A trackers** — will not build bills-to-hours [Inference: their model is retrospective], but
   they already own the app-store search terms a Shift Planner user would type. Confidence they
   intercept the audience: **70%** (they already do).
3. **Snoop** — closest in spirit among Tier B (proactive about bills rather than passive about spend).
   Confidence it adds hours-needed: **5%.** It has no hourly-rate concept.
4. **Employer rostering** — no feature threat, permanent incumbency.
5. **Rodeo** — different problem, but the only one with a real UK worker community, which is the asset
   Shift Planner lacks most.

---

## 11. Second-order effects

If Shift Planner adds overtime rules and rota import to close the Tier A gap → it becomes a worse
version of six existing free apps that have app-store distribution → it loses the one thing that makes
it findable at all, which is being the only answer to a question nobody else answers. [Inference.]

If it adds bank sync to close the Tier B gap → it breaks the "nothing leaves your browser" commitment →
it takes on a funded competitor (Emma, £14.99/mo tier, 50+ institutions) on that competitor's own
ground with no budget. [Inference.]

**The competitive read is therefore not "close the gaps." It is "the gaps are the strategy."**

---

## 12. Leverage point

The single action with the largest expected improvement is not a feature. It is naming the product for
the question its users actually ask, then putting it where they ask it. [Inference from §0.3.] Nobody
searches "bills to hours." People do search "how many hours do I need to work to pay rent" and post it
in UK shift-work forums. That is a copy and placement problem, not a build problem.

Second-largest: getting user two and user three. `PROJECT.md` §3 puts confidence that UK shift workers
will use this given they find it at **45%**, on n=1. That number cannot move without more users, and no
amount of competitive analysis substitutes for it.

---

## 13. What would change my mind

- **On "there's no competitor":** finding a UK app that takes a bill amount as an input and outputs an
  hours target. One counterexample collapses the differentiation claim.
- **On "the empty category means no demand":** finding UK forum threads, search-volume data, or a
  waitlist where people describe the bills-to-hours problem unprompted. That would flip the empty
  category from "no demand" to "unserved demand," and those are opposite conclusions from identical
  evidence.
- **On "Wagestream is the top threat":** a Wagestream roadmap or release with forward hours planning
  would promote it from speculation to observed.
- **On "the gaps are the strategy":** two or three real users all asking for the same closed gap
  (most likely rota import or notifications) would mean the gap is costing more than it protects.

---

## 14. What we're most likely wrong about

**Most likely wrong: treating "unique" as "valuable."** This document, `LANDSCAPE.md`, and `PROJECT.md`
all converge on the same satisfying finding — nobody else does bills-to-hours. That is a narrative
trap. It is emotionally satisfying, it is repeated across three documents now, and it is entirely
compatible with the product being unique *because the thing isn't worth doing*. The evidence supports
"nobody does it." It does not support "and therefore someone should." Those are different claims and
this analysis cannot distinguish between them.

**Second: the Tier A survey is app-store-listing deep, not usage deep.** Feature claims come from store
descriptions written by the vendor. [Observed.] Nobody in this pass installed and used one. A tracker
that lists "paycheck calculator" may or may not handle UK tax at all.

**Third: no UK complaint mining was done this pass.** No Reddit, no Trustpilot sweep of the Tier A
apps, no UK shift-worker forums. Both prior passes have now inferred user pain rather than reading it.
That gap is starting to look structural rather than incidental.

---

## Confidence

**Overall: medium (60%).** Tier B and C pricing/features are well documented and consistently sourced.
Tier A is vendor-description-deep only. Tier D pricing for Wagestream and GigTax is unresolved. No
non-English-language or non-UK-listed apps were searched, so "nothing exists" means "nothing surfaced
in English UK-targeted search," which is a weaker claim than it reads.

## Sources

- [Work Shift Calendar & Payslip — Google Play (UK)](https://play.google.com/store/apps/details?id=com.shiftcalendar.shift.calendar.work.schedule&hl=en_GB)
- [Shift Hours Logger — Google Play](https://play.google.com/store/apps/details?id=com.ilyas.ilyasapps.shifthourslogger&hl=en_US)
- [Shift Work Hours & Pay Log — Google Play](https://play.google.com/store/apps/details?id=com.sidkyoussef.shiftpay&hl=en_US)
- [Work Hours & Pay Calculator — Apple App Store (UK)](https://apps.apple.com/gb/app/work-hours-pay-calculator/id1468530190)
- [Shift Calendar & Work Schedule — Google Play](https://play.google.com/store/apps/details?id=pro.shineapp.shiftschedule)
- [Emma — plan pricing](https://help.emma-app.com/en/article/how-much-does-emma-plusproultimate-cost-1ywhulq/)
- [Emma — Plus/Pro/Ultimate features](https://help.emma-app.com/en/article/what-are-the-features-of-emma-plus-pro-and-ultimate-678fjp/)
- [Which? — Best budgeting apps 2026](https://www.which.co.uk/money/banking/banking-security-and-payment-methods/open-banking-budgeting-and-saving-apps-aLl3e0g9I7Ft)
- [Snoop UK review 2026](https://getsmartsaver.co.uk/snoop-uk-review-2026/)
- [Snoop — Open Banking directory](https://www.openbanking.org.uk/apps/snoop/)
- [Wagestream — Shift & pay tracking](https://wagestream.com/en-us/solutions/shift-pay-tracking)
- [Stream (formerly Wagestream) — Shift & pay tracking](https://stream.co/en/products/shift-pay-tracking)
- [Wagestream review — Liverpool Herald](https://liverpoolherald.co.uk/wagestream/)
- [Rodeo — Google Play (UK)](https://play.google.com/store/apps/details/Rodeo?id=com.gorodeo.rodeo&hl=en_GB)
- [Rodeo — Data is power in the gig economy](https://www.gorodeo.app/blog/data-is-power-in-the-gig-economy)
- [Workforce.com — Best staff rota software UK 2026](https://www.workforce.com/uk/buyers-guides/best-staff-rota-software-in-the-uk-2026)
- [RotaCloud review UK 2026 — ExpertSure](https://www.expertsure.com/uk/time-attendance/rotacloud-review/)
- [TimeTally — Best rota software UK](https://www.timetally.uk/blog/best-rota-software-uk)
- [Shiftbase — Best employee time tracking software UK 2026](https://www.shiftbase.com/blog/best-employee-time-tracking-software-uk)
