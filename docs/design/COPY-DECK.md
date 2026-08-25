# COPY DECK: Shift Planner

Source of truth for what Shift Planner sounds like, and for copy decisions already resolved.

<!-- Read by the `shift-planner-copywriter` skill before it writes anything. Same convention as
     Sporelo's COPY-DECK.md. Voice rules live HERE, not in the skill, so there is one place to
     change them. The one exception is Rule 0 (the no-advice legal boundary) which lives in the
     skill and is NOT restated here: it is not a voice decision, it is not editable as taste, and
     a legal rule with two homes is a legal rule that goes stale in one of them.

     Do not re-litigate a decision recorded in §4. If your work changes one, say so explicitly
     and update this file. A decision that lives only in a chat reply is a decision the next
     session makes differently. -->

---

## 1. The reader

A UK shift worker: security, door supervision, hospitality, care, retail, warehouse, delivery.
Paid hourly, hours vary, often more than one employer.

Reading **on a phone, at the end of a shift, frequently after midnight, sometimes worried about
money.** That sentence decides most calls:

- Tired means short. Two lines beats five.
- Worried about money means never cheerful about a shortfall, and never grim about one. Flat is kind here.
- On a phone means the first four words carry the meaning. The rest may not be read.
- They are competent adults doing hard work. Nothing may read as talking down.

Target reading age around 9 — the UK government standard for public information. Short sentences,
common words, active voice, second person.

## 2. Voice rules

### The number is the message. Words are labels, not commentary.

The app's job is arithmetic nobody wants to do at 1am. The figure does the work. Copy says what the
figure means and stops. Every adjective is a candidate for deletion.

> Not: "You're doing really well, only 6.1 more hours to go this week!"
> Yes: "6.1 extra hours this week"

### On their side, never above them.

No congratulating, encouraging, coaching or "great job." Equally: no disappointment, no concern, no
gentle warnings. Both directions are the app having an opinion about a life it knows nothing about.
Warmth comes from being useful and unpatronising, not from tone.

### Say the uncomfortable thing plainly.

When the plan doesn't work, say it doesn't work. Softening a shortfall makes it harder to act on and
less trustworthy. Honesty is the product: the app exists because a rough mental estimate isn't reliable.

> Not: "You might find this week a little tight."
> Yes: "You need 51 hours. Your ceiling is 44."

### Hard rules

- No em-dash. Comma, colon, full stop or parentheses. (Violated once across v6–v9, found and fixed in the retroactive copy pass. Do not reintroduce.)
- No emoji. Anywhere, including compliance copy and feedback questions.
- No exclamation marks.
- No "we". The app is not a team talking to the user. It has no personality and claims none.
- Contractions on: "you'll", "doesn't", "here's". Formal words make a small tool sound like a bank.
- Second person, active voice. "You need 6 hours", never "6 hours are needed".
- Numerals always. "6.1 hours", not "six point one".
- Currency symbol, no space: £440, ₦3,000,000.
- Sentence case everywhere, including buttons.
- No AI cliches: delve, unlock, elevate, seamless, robust, leverage as filler.
- No value judgement about the user's financial position: not tight, not stretched, not comfortable, not healthy, not brutal.
- Never claim precision the model doesn't have.

## 3. Register per surface

Clarity is maxed everywhere. Warmth varies, and **never exceeds Low anywhere in this app.** That is
deliberate. A tool handling someone's real financial position at 1am earns trust by being flat and
correct, not by being likeable.

| Surface | Clarity | Warmth | Note |
|---|---|---|---|
| Headline number and verdict | Max | None | Pure fact. The legal rule bites hardest here |
| Coverage after banking a week | Max | None | Most tempting place to be helpful, most expensive |
| Empty states | Max | Low | One sentence naming the one action that fills it |
| Onboarding steps | Max | Low | One question per screen. No welcome essay |
| Field labels and hints | Max | None | Label the field. Explain only where genuinely ambiguous |
| Errors | Max | Low | What went wrong, what is unaffected, what to do. Never blame the user |
| Feedback questions | Max | Low | Must get answered by a stranger on a phone. No throat-clearing |
| Compliance copy | Max | Low | Plain English legal. Serious is not the same as formal |
| Tax disclaimer | Max | None | Accuracy over reassurance |

## 4. Resolved decisions — do not re-litigate

| # | Decision | Resolved | Why |
|---|---|---|---|
| C1 | Footer disclaimer reads "Nothing leaves your browser, ever." | 6 Jul 2026 | Alternate chosen over main on tone. It is the trust proposition, stated flatly |
| C2 | Em-dashes removed throughout, replaced by comma/colon/period per context | 6 Jul 2026 | Hard rule violation found in a retroactive full copy pass |
| C3 | Empty states read as one family: "Add a job with an hourly rate to see..." | 6 Jul 2026 | Consistency across v9's new empty states |
| C4 | The three-tier verdict must stop using "brutal" | 19 Aug 2026 | It is a judgement about the user's life, made by a tool that knows their bills and nothing else. Replace with facts about the ceiling. **APPLIED 19 Aug 2026** |
| C5 | "Credit commitment", never "debt" | 19 Aug 2026 | Neutral, and matches the v11 data model |
| C6 | "Not reached", never "missed" or "failed" | 19 Aug 2026 | Both alternatives assign fault to the user |
| C7 | Moving blended rate is explained, not hidden. String: **"Based on {n} shift logged this week. It moves as more are logged."** Shown beside net/hr only when 1-2 shifts exist in the current week | 19 Aug 2026 | The rate switches from declared typical hours to actual shifts once the week's first shift is logged, so the number visibly changes without the user changing anything. A silent recalculation on a financial figure reads as a bug or a lie. Pluralise "shift" at n=2 |
| C8 | Headline verdict is hours against the ceiling the user set, in both branches. Over: "{n} hrs/week. That is {gap} hrs more than the {max} hr ceiling you set." Within: "{n} hrs/week. That leaves {gap} hrs of the {max} hr ceiling you set." Colour still tiers across three bands; the words do not | 19 Aug 2026 | The four previous strings all failed. "Cut outgoings, extend goal deadlines, or lift the ceiling" was a RULE 0 VIOLATION shipping in production, and "brutal" / "heavy but workable" / "sustainable" were judgements about a life the app knows nothing about. **Alternate considered and rejected:** three distinct factual strings per band, which read as the app grading the bands anyway. Naming the ceiling as one the user set is load-bearing, it keeps the number theirs |
| C9 | Header lede cut to one sentence: **"Enter what you earn an hour and what your month costs. It works out the hours."** | 19 Aug 2026 | The previous lede ran four lines and read as a landing page. On a tool someone opens mid-shift it pushed the first real card below the fold on desktop and further on a phone. The h1 already asks the question; the lede only has to say what you put in and what comes out |

## 5. Word swaps

| Don't | Do |
|---|---|
| utilise, commence, provide, require, additional | use, start, give, need, more |
| in order to | to |
| please note that | (delete) |
| we're unable to | it can't |
| your obligations were not satisfied | not reached |
| debt | credit commitment |
| brutal, punishing, crushing | over your ceiling |
| sustainable, healthy | within your ceiling |
| oops, whoops, uh oh | (delete, state the error) |
| Congratulations! | (delete) |

## 6. Anti-patterns

- **The encouraging coach.** "You've got this." Delete on sight.
- **The concerned friend.** "That's a lot of hours, look after yourself." Well meant, out of scope, edging toward advice.
- **The helpful nudge.** The single most likely way this app becomes a regulated activity. See the skill's Rule 0.
- **Reasoning before impact.** Users care what it means for them first. Reasoning after, if at all.
- **Empty-state essays.** One sentence, one action.
- **Fake precision.** "£1,594.38" from a manually entered FX rate that is four months old is a lie with decimal places.
- **Celebrating a streak.** Retention theatre. This app is used when needed, and needing it less is a good outcome.
