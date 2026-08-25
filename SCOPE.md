# SCOPE: Shift Planner 2.0, answer first

Date: 2026-08-19

<!-- Frozen 2026-08-19. v11 and everything before it is archived at docs/archive/v11/.
     Builder is read-only on this file. Changes go in the Changelog, not the features. -->

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

## Features, 2.0 ONLY

### 1. Two-question start

- Cold open shows one line and one button. No numbers, no seed data, no feature list.
- **Question 1: what you earn an hour.** **Question 2: what your month costs, as one number** (D5). Splitting it into items is a refinement, not a prerequisite.
- **Country is inferred, never asked** (D4). Read `Intl.DateTimeFormat().resolvedOptions().timeZone` first, since a timezone maps to a country more reliably than a language tag; fall back to `navigator.language`; fall back to United Kingdom. The result is shown as a changeable line, not a question: "United Kingdom, change this".
- Inference can be wrong, so the line is visible on the first screen where money appears, not hidden in Settings. A wrong country means a wrong tax model and therefore a wrong number, which is the one error this app cannot afford to make quietly.
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

### 8. Storage, a clean break

- **A new key and a new schema. Nothing is migrated from any previous version** (D6). The two-question
  flow and the refinements define the shape; the shape is not inherited from a model built for a
  different product.
- Old keys `shiftPlanner.v5` and `shiftPlanner.v6` are **never read, never written, never deleted.**
  Data already on a device is left exactly where it is, and the archived v11 app at
  `docs/archive/v11/index.html` still opens and still exports it.
- No reserved fields for deferred features. v11 carried an empty `protectedBlocks` to dodge a future
  migration; a schema that is happy to change does not need to hoard.
- Export and import round-trip at the new schema.
- A blob declaring a higher schema version is refused and left untouched, never downgraded.

---

## Navigation

Four screens, named after what you'd actually ask:

**Now** (the number, log a shift) · **Earn** (jobs, rates, hours, your limit, what an hour pays) ·
**Outgoings** (monthly items, goals, where the hours go) · **Weeks** (history).

"Earn" and "Outgoings" mirror the two opening questions on purpose (D2). **"Owe" was rejected**: the
screen also holds savings and spending, and a savings pot is not something you owe. "Bills" is too
narrow for the same reason, and "Expenses" reads like something you claim back from an employer.
"Outgoings" is the everyday UK word, already used in the app, and it carries no implication of debt,
which matters for a product that must never look like it advises on debt. Cost: nine characters
against four, in a four-column tab bar. Acceptable at 11px, and the Builder must verify it does not
wrap on a 320px viewport.

**A workplace is a "job", everywhere, with no exceptions** (D3). A job holds one or more rates. The
words "employer" and "workplace" do not appear in any visitor-facing string. v11 shipped a card
headed "Your jobs" containing a field labelled "Employer" and a button reading "+ Job".

---

## NOT in 2.0

- **PWA, offline, install.** Real, and it is not what makes this usable. v2.1.
- **Multiple currencies, dated obligations, protected time.** All were v11 scope. All are refinements on a product that first has to be worth opening.
- **The feedback route and the ICO/privacy surface.** Triggered by collecting data; 2.0 collects nothing. Ships when the feedback route does.
- **Accounts, sync, any backend.** Gated on real users.
- **Any ranking or recommendation between obligations.** Permanently out.

---

## Decisions, answered 2026-08-19

| # | Decision | Why |
|---|---|---|
| D2 | Screens are **Now / Earn / Outgoings / Weeks** | "Owe" rejected: the screen holds savings and spending too. See Navigation |
| D3 | A workplace is a **job**, everywhere | One word for one thing. v11 used three for this |
| D4 | Country is **inferred from the browser**, shown as a changeable line | Removes a question from a flow whose whole point is brevity |
| D5 | Question 2 takes **one number** | Splitting into items is a refinement. Slow is what went wrong |

**Still standing, unanswered:** whether to overrule the port-not-rewrite deviation. The instruction
was to reset all code; the tax tables and the v6 schema/migration are currently scoped as ported.
Silence leaves them ported.

## Freeze

FROZEN: 2026-08-25

## Changelog

<!-- None. -->

**[2026-08-19] Feature 8 replaced: clean-break storage.** Frozen scope originally carried v6 and its
v5 migration forward as the one ported piece of code. The human then chose a completely new schema
with blank data, and explicitly asked that nothing conflicting be carried over. This removes the
`employers` versus `jobs` clash the architect pass found in their own on-disk blob, removes two
legacy fields that existed only for deferred features, and removes the migration entirely. Cost,
stated plainly: their existing data is no longer read by the app. It is not destroyed, and the
archived v11 build still exports it.
