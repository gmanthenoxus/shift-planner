# PROJECT: Shift Planner

<!-- Foundational definition. Version-independent: SCOPE.md defines what a given version builds,
     this file defines what the project IS and why it exists. Drafted by the Builder 2026-08-12
     at the human's request, grounded only in what the repo already records (SCOPE.md, LANDSCAPE.md,
     PARKING.md, QA-REPORT.md, README.md, index.html). HUMAN-OWNED once accepted: the Builder does
     not edit this after acceptance, same rule as SCOPE.md and ARCHITECTURE.md.

     Evidence labels used throughout: [Observed] traceable to a repo doc or shipped code.
     [Inference] reasoned from observed facts. [Speculation] plausible, unverified. [Unknown]
     cannot currently be determined. The labels are load-bearing, do not strip them. -->

## 0. The uncomfortable part, first

Shift Planner is a working, QA-passed, publicly deployed product with **one verified external user**.
[Observed — PARKING.md logs exactly one real end-user, Marlene Asare, via WhatsApp 2026-06-23; no
other external user appears in any repo document.] Every other signal in this repo, nine countries of
tax modelling, a 291-line QA report, a competitive landscape scan, twenty parked improvements, is
build-side. None of it is demand-side.

The project's constraint is therefore **not** feature completeness, correctness, or design. Those are
in good shape. The constraint is that almost nobody knows it exists. Any strategy that answers "what
should we build next" before answering "who is arriving and from where" is solving the wrong problem
competently.

## 1. The problem

**For a person paid hourly with variable shifts, the question "how much do I need to work this week?"
has no easy answer, and getting it wrong is expensive in both directions.**

The specific difficulty, decomposed:

1. **Obligations are monthly, income is hourly.** Rent is a number per month. Pay is a number per
   hour. Converting between them is arithmetic nobody wants to do repeatedly, and it changes every
   time a bill, a rate, or a goal changes. [Observed — this is the conversion the app performs,
   README.md "What it does".]
2. **Tax breaks the intuition.** Gross hourly rate is not the number that pays rent. Under a
   progressive system, the *marginal* hour is worth less than the average hour, so "I need £X, my
   rate is £Y, so X/Y hours" is wrong, and wrong in the direction of undershooting.
   [Observed — the app's entire deduction model exists for this; TAX-ACCURACY-AUDIT.md documents how
   badly the maths misleads when the model itself is off.]
3. **Multiple jobs compound it.** Two rates, two pension rates, one tax position. There is no single
   "my hourly rate" to divide by. [Observed — multi-job blending is a shipped feature.]
4. **The feedback loop is weak.** You work the week, money arrives, and you rarely learn whether you
   actually cleared the obligations you were working for, or which ones you missed.
   [Observed — priority-order coverage tracking exists to close this loop.]

**Who has this problem, in order of how sharply they feel it:** hourly workers with variable shifts →
plus a second job → plus an irregular one-off financial target (visa fee, deposit, debt, trip) →
plus tight enough margins that the answer actually changes behaviour. Every added condition sharpens
the pain and shrinks the population.

**The counter-case, stated fairly:** most people in this situation already cope. They use a rough
mental number, a notes app, or they simply work whatever hours are offered because the shifts aren't
really optional. A tool that computes the precise answer is only valuable to someone who has *choice
over hours* and *finds the estimate unreliable*. [Inference.] That intersection is the real audience,
and it is narrower than "hourly workers."

## 2. The solution

**Shift Planner converts a list of monthly obligations into a tax-adjusted weekly hours target across
however many jobs you work, then tracks whether the hours you actually logged covered them.**

Four things it does that, per the landscape scan, nothing else found does together:

- **Bills to hours, forward.** Starts from money not yet earned and projects the hours needed, rather
  than categorising transactions already in the bank. [Observed — LANDSCAPE.md §"Gap", the explicit
  contrast drawn against Emma.]
- **Tax-adjusted at the hourly level.** Applies a per-country progressive model to an hourly wage,
  across nine countries. [Observed.]
- **Blended across named jobs**, each with its own rate and pension contribution. [Observed.]
- **Priority-ordered coverage tracking** week over week: which specific bills your earnings actually
  reached. [Observed.]

**Design commitments that define the product** (change any of these and it becomes a different
product, not a better one):

- **No account, no server, no bank connection.** Data lives in the browser. [Observed — shipped
  behaviour and the footer copy, "Nothing leaves your browser, ever."] This is the trust proposition
  for someone entering their real financial position, and it is also the single biggest constraint on
  monetisation, see §5.
- **Planning guidance, not a payslip.** The tax models are simplified effective-rate estimates.
  [Observed — footer disclaimer, TAX-ACCURACY-AUDIT.md.] The honest framing is deliberate and should
  survive any growth pressure to overclaim.
- **Checkable mid-shift on a phone.** The use case is a five-minute glance, not a budgeting session.
  [Observed — the stated rationale behind the touch-target and PWA entries in PARKING.md.]

**What it is not:** not a budgeting app, not a bank aggregator, not a tax-filing tool, not an
earnings-optimiser telling you which platform pays best. Those are Emma, GigTax/Hurdlr, and Rodeo
respectively. [Observed — LANDSCAPE.md.] Drifting toward any of them means competing with a funded
company on its own ground.

## 3. Audience

**Primary: UK shift and gig workers.** Security and door supervision, hospitality, care, retail,
delivery, warehouse. Hourly, variable, frequently multi-job.

Chosen for one reason worth stating plainly: it is the segment the builder lives inside, and the
only segment where he can tell a real complaint from a plausible-sounding one without a research
budget. [Observed — the builder's own occupation; the app's default seed data is literally "Door
supervisor" and "Security guard", PARKING.md 2026-07-06.] That is a genuine and rare advantage. It is
not a market-size argument, and should not be mistaken for one.

**Secondary, later: hourly workers in the other eight modelled countries.** The tax engine already
supports them, so the product is technically ready and the audience is unreachable, which is exactly
the wrong way round. [Inference.] Expansion is a distribution problem, not a build problem, and
attempting it before the UK segment shows traction spreads a zero across nine countries.

**Explicitly not the audience:** salaried workers with predictable pay (nothing to solve), people
wanting spend tracking (Emma does it better with bank sync), and self-employed contractors needing
self-assessment figures (GigTax/Hurdlr's job, and a legal-accuracy burden this project should not
take on).

**Confidence that UK shift workers will use this given they find it: 45%.** Low, and low for a
specific reason, the evidence is one user, and her first session surfaced a bug rather than a
retention signal. [Observed — PARKING.md, the "Infinity hrs/week" entry.] The number rises sharply
with the second and third real user, whoever they are.

## 4. Strategy

**The one thing that matters: get twenty real users and watch what they do.** Not two hundred, not a
launch. Twenty is enough to distinguish "people use this weekly" from "people open it once and
leave", and it is reachable through people the builder already knows.

Ordered, with the reasoning attached:

1. **Fix the first-run experience for a stranger.** The app currently seeds a first-time visitor with
   the builder's own real-shaped jobs and a "Visa extension" goal. [Observed — PARKING.md
   2026-07-06.] Every new user's first screen is somebody else's financial life. This is the cheapest
   high-leverage fix in the repo and it gates everything downstream, there is no point driving
   traffic to a confusing front door.
2. **Recruit from inside the trade, by hand.** Colleagues on shift, the security and hospitality
   staff already in reach. Ten conversations, not a post. The goal is watching someone use it, not
   registering a signup. [Inference — this is the only acquisition channel available at zero budget
   with a credibility advantage attached.]
3. **Instrument nothing, ask directly.** No analytics is consistent with the no-server promise, so
   learning has to come from conversation. That is slower and higher-fidelity, and it is the correct
   trade at n=20. It stops being correct at n=200.
4. **Build only what a real user asked for.** PARKING.md holds twenty-odd improvements, almost all
   builder- or agent-sourced. [Observed.] Exactly two entries trace to a real external user. The
   ratio should invert before v10 is scoped.
5. **PWA / add-to-homescreen before any new feature.** The stated use case is mid-shift on a phone;
   a browser tab is not that. [Observed — PARKING.md.] It is the difference between a link someone
   was sent once and a thing on their home screen.

**What this buys:** genuine evidence about whether the problem is felt sharply enough to change
behaviour, at near-zero cost, in a segment where the builder can read the answer accurately.

**What it costs:** speed and reach. Twenty hand-recruited users takes weeks and will not produce
revenue. It forecloses the alternative of a public launch that might, with low probability, find an
audience faster. It also means the nine-country tax engine sits idle, an already-paid cost earning
nothing for now.

**Second-order effect worth naming:** if the twenty users confirm weekly use, the correct next move
is almost certainly *accounts and sync*, because the retention problem for a localStorage app is that
a cleared browser destroys everything the user built. That is a backend, which contradicts the
current architecture and the no-server promise. Success creates that tension, it does not avoid it.
Better to see it coming than to meet it as a surprise.

## 5. Money

**Position: free now, revenue plausible later, and the current architecture actively blocks the
obvious paths.** Stated as a constraint rather than a plan, because a plan here would be fiction.

A single-file, no-account, no-server app has no natural paywall. There is no login to gate, no
server-side feature to withhold, and the source is served as plain HTML to every visitor.
[Observed — approved stack, CLAUDE.md.] Every standard route (subscription, freemium tier, usage
limits) requires accounts and a backend, which is the same structural change §4's second-order
effect predicts. [Inference.]

Routes that exist, ranked by how much they cost the product:

- **Stays free, earns indirectly as a Noxus credibility asset.** Costs nothing, changes nothing,
  earns nothing directly. Currently the default by inaction.
- **Voluntary support** (Ko-fi / "buy me a coffee" link). Preserves every design commitment. Realistic
  ceiling is small. [Speculation — no data on conversion for a tool of this size.]
- **Paid tier behind accounts and sync.** The only route with a real ceiling, and it requires a
  backend, which breaks the no-server promise that is currently part of the trust proposition. Not a
  decision to make before §4 produces evidence.
- **Ads or affiliate financial products.** Rodeo's model. [Observed — LANDSCAPE.md.] Rejected here:
  serving financial-product ads to someone who just entered their real financial position is a
  trust trade this product cannot afford, and Emma's own recurring complaint is monetisation
  pressure eroding user goodwill. [Observed — LANDSCAPE.md complaint column.]

**Confidence this project earns meaningful money within 12 months: 15%.** Best case, a paid sync tier
finds a few hundred paying users in a niche with no direct competitor. Expected case, it stays free,
gets used by a small number of people, and pays off as proof-of-build. Worst case, the twenty users
never materialise and it remains a well-engineered tool for one person, which is still a legitimate
outcome for something built to solve the builder's own problem.

**The narrative trap to watch:** "no direct competitor exists" is emotionally satisfying and reads as
opportunity. [Observed — LANDSCAPE.md found no tool doing bills-to-hours + multi-job + tax-adjusted +
priority coverage.] An empty space is equally consistent with nobody wanting the thing. The scan
itself rates its own confidence as medium and flags search-coverage gaps. Treat the gap as an open
question, not as a moat.

## 6. What would change my mind

| Conclusion | Evidence that overturns it |
|---|---|
| Distribution is the binding constraint, not features | Ten users arrive unprompted and churn over a missing feature they name |
| UK shift workers are the right primary segment | The first real users come from a different trade entirely, or from outside the UK |
| The no-server promise is a genuine asset | Users say unprompted that they'd rather log in and keep their data safe across devices |
| Free-for-now is correct | Someone offers to pay before being asked |
| The problem is felt sharply enough to matter | Twenty people try it and none return in week two, which is the single most likely failure mode |

## 7. Reversibility

Everything in §4 is cheap and reversible: seed-data neutralisation, hand recruitment, a PWA manifest.
Wrong guesses here cost days.

Two decisions are not reversible and deserve a genuine stop-and-think when they arrive: **adding a
backend** (breaks the no-server promise, introduces liability for other people's financial data,
cannot be quietly undone once users have accounts) and **monetising via financial-product ads**
(spends trust that does not come back). Neither is due now. Both should be recognised on sight.

## 8. What we are most likely wrong about

That the problem is felt sharply enough to change behaviour. The entire project rests on hourly
workers *wanting a precise answer* to "how many hours do I need this week." The competing hypothesis,
that most people already have a good-enough number in their head and work whatever hours they are
given regardless, is simpler, cheaper to believe, and consistent with all currently available
evidence, because the currently available evidence is one user who found a bug. Twenty real users is
the cheapest experiment that separates the two.
