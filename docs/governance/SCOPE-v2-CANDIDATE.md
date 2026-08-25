# SCOPE CANDIDATE: Shift Planner 2.0 — answer first

Date: 2026-08-19 · Status: **CANDIDATE. AWAITING YOUR APPROVAL AND FREEZE.**

<!-- v11 and everything before it is archived at docs/archive/v11/, with a README recording why.
     To freeze: read this, cut what you don't want, answer §6, copy into SCOPE.md, add a freeze
     line, append to SCOPE-HISTORY.md, commit. No code before that. -->

---

## Problem

v11 worked and was hard to use. Not because of colour or layout, though both were wrong at times,
but because of **order**. It asked for nine things before it answered one: country, job, rates,
typical hours, pension, ceiling, outgoings, categories, goals. A first-time user landed on a
confident `0.0 hrs/week` with a green tick, which read as success and meant "I have nothing to work
with."

The h1 asks *how many hours does your life cost?* The app refused to answer until you had done
homework. Every competitor gives value in one action. [`COMPETITION-UK.md`.]

## The shape of 2.0

**Two questions produce the number. Everything else is a refinement you add when you have a reason to.**

That is the whole idea, and every decision below follows from it.

| Then | Now |
|---|---|
| Configure a model, then get a number | Get a number, then improve it |
| Nine fields before value | Two fields, about 30 seconds |
| Refinements are prerequisites | Refinements are offered, each with a stated reason |
| "Baseline", "ceiling", "blended rate" | "hours a week", "your limit", "what an hour pays" |

## Carried in unchanged, not up for debate

- **The legal boundary.** The app never reorders, ranks, recommends or evaluates one obligation against another. Art. 39E RAO, FCA PERG 17. It binds copy AND colour. Not a version decision.
- **The tax tables.** Nine countries, audited in `TAX-ACCURACY-AUDIT.md`. **Ported from the archive, not retyped from memory.**
- **`COPY-DECK.md` and `DESIGN-TOKENS.md`.** Voice, contrast-verified palette, colour-vision-checked ramp. Light is the default and dark is chosen.
- **No account, no server, no bank connection.** The trust proposition. [`PROJECT.md` §2.]

---

## Features — 2.0 ONLY

### 1. Two-question start

- Cold open shows one line and one button. No numbers, no seed data, no feature list.
- **Question 1: what you earn an hour.** Question 2: what your month costs, as a single number.
- Country is asked only if it cannot be inferred, and it is asked **first** when it is asked, because it sets currency and tax. Where inference is possible it is offered as "United Kingdom, change this" rather than a question.
- Answering both lands directly on the number. No confirmation step, no summary screen.
- Each answer commits to storage as it is given, so closing the tab mid-flow resumes.
- An "I have a backup file" route on the cold open goes straight to import.

### 2. The answer

- One screen, one figure: **hours a week**, with the two inputs restated in one plain line underneath, e.g. "£1,240 a month, at £11.24 an hour after tax."
- **When an input is missing the screen says what is missing.** It never shows `0.0` with a tick. A zero that means "not set up" and a zero that means "nothing to cover" must not look the same.
- No jargon on this screen. Not "baseline", not "ceiling", not "blended".
- The figure never renders `Infinity`, `NaN`, or a fabricated number.

### 3. Refinements, offered not required

- Below the answer: a short list of ways to make it more accurate. Each is **one tap, and each states what it buys**, e.g. "Add a second rate, if you're paid differently for different work."
- The set for 2.0: add another rate · split your monthly cost into items · set a limit on your hours · add a one-off goal · add a second job.
- Every refinement is optional and reversible. The app works with none of them.
- Adding one updates the number immediately and visibly.

### 4. Log what you worked

- **One** control to add a shift. Not three.
- A shift records date, job, rate applied, start, end, break. Rate and job name are snapshotted at log time so later edits cannot rewrite what you were paid.
- The week's shifts show hours and pay per shift, and one total.
- Overnight shifts must stay correct across a month boundary and the October clock change.

### 5. Weeks

- Banking a week freezes what it covered, so a later edit cannot rewrite history.
- Week rows read newest first: date, hours, earned, and what it reached **in your own order**.
- **An empty Weeks screen says so.** v11's said nothing at all.

### 6. Settings and the compliance surface

- Country and currency, appearance, export, import, reset. All in one place, reached from the header. **Not scattered between the header and a panel.**
- Tax disclaimer, accurate to what is actually simplified.
- Plain not-debt-advice statement with a pointer to free regulated debt advice.
- WCAG 2.2 AA: every token pair at 4.5:1, no state conveyed by colour alone, visible keyboard focus.

### 7. Words a tired person can read

- Reading age around 9. Short sentences, common words, second person.
- **One word for one thing across the whole app.** v11 had "Your jobs" containing "Employer" and a button called "+ Job". 2.0 picks one and uses it everywhere.
- Nothing appears twice on one screen. v11 showed the same week's figures in two cards.
- Every string written by `shift-planner-copywriter`, checked against Rule 0.

### 8. Storage

- Carried from v11: schema v6, and the v5 migration, both already tested. **This is the one part of the code that is ported rather than rewritten**, because it protects data that already exists on your device.
- Export and import round-trip.
- A blob from a newer version is refused and left untouched, never downgraded.

---

## Navigation

Four screens, named after what you'd actually ask:

**Now** (the number, log a shift) · **Earn** (jobs, rates, hours, your limit, what an hour pays) ·
**Owe** (monthly items, goals, where the hours go) · **Weeks** (history).

"Earn" and "Owe" mirror the two opening questions on purpose. Settings sits behind a header
control, as before.

---

## NOT in 2.0

- **PWA, offline, install.** Real, and it is not what makes this usable. v2.1.
- **Multiple currencies, dated obligations, protected time.** All were v11 scope. All are refinements on a product that first has to be worth opening.
- **The feedback route and the ICO/privacy surface.** Triggered by collecting data; 2.0 collects nothing. Ships when the feedback route does.
- **Accounts, sync, any backend.** Gated on real users.
- **Any ranking or recommendation between obligations.** Permanently out.

---

## §6 — Decisions I need from you before freeze

1. **Screen names: Now / Earn / Owe / Weeks.** Plainer than Work/Money and they mirror the two questions. "Owe" may read as debt-specific when it also covers savings and spending, so it is the weakest of the four.
2. **One word for a workplace: "job" or "employer"?** A job has rates. Recommend **job**, as the plainer word, used everywhere with no exceptions.
3. **Country: infer or ask?** Recommend inferring from the browser and showing "United Kingdom, change this", because it removes a question from a flow whose whole point is brevity. Inference can be wrong.
4. **Does question 2 accept one number, or ask for a short list?** Recommend one number, split later as a refinement. A list is more accurate and slower, and slow is what went wrong.

## Freeze

NOT FROZEN. No code may be written against this file.

`FROZEN: <date>` to be added by you, in `SCOPE.md`.
