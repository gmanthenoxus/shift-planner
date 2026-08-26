# BRANDING: Evenweek

Name, mark and usage rules. Decided 2026-08-26.

<!-- Same job as COPY-DECK.md and DESIGN-TOKENS.md: one home for a decision, so the next session
     does not re-decide it. If you change something here, say so explicitly and update this file.
     A branding decision that lives only in a chat reply is a branding decision that gets undone. -->

---

## 1. The name

**Evenweek.** Written in sentence case, one word, always. Not "EvenWeek", not "evenweek", not
"Even Week".

The week where what you earn and what you owe come level. That is the entire product in one word:
two inputs, one number, and the number tells you where level is.

### Why the old name was wrong

Not because it was dull. Because it was a **category error**.

"Shift planner" is the app-store search term for rota management: Supershift, When I Work, Deputy,
Planday. `COMPETITION-UK.md` §Distribution already recorded that those competitors own that search
term. This product does not build a rota, does not assign shifts, and does not schedule anything;
the shift log records what already happened. Someone searching "shift planner" arrives expecting to
manage a rota and finds a calculator. That is a bounce, not a weak first impression.

### Names considered and rejected

| Name | Why not |
|---|---|
| Breakeven | Describes the product exactly and cannot be owned. breakeven.app, .uk, .co.uk, getbreakeven.com, breakevenapp.com all taken. A term you rent |
| Clocked | Best-sounding for the audience, but every domain gone, and "clocked" implies time-tracking, walking straight back into the rota category |
| Graft | The most native word this audience has. Means corruption in American English, and the tax tables already cover nine countries |
| Cover / Coverage | Collides with covering someone's shift. Worst possible ambiguity for this audience |
| Owed / Owe | Already reasoned out in SCOPE D2: the Outgoings screen holds savings and goals, and a savings pot is not owed |
| Enough | Emotionally exact, and it reverses into a judgement about the user ("not doing enough"), which DESIGN-TOKENS forbids colour from doing and COPY-DECK forbids words from doing |

### Domains

`evenweek.app` and `evenweek.co.uk` were both unregistered at time of writing. Neither is bought
yet. The app currently ships from GitHub Pages and the repo has **not** been renamed, so the live
URL is unchanged. Renaming the repo breaks every link already shared. That is a separate, deliberate
decision, not a side effect of the rename.

## 2. What the name is allowed to say

Evenweek is a name, not a claim. It does not promise the week will come level, and no surface may
imply it will. Rule 0 of `shift-planner-copywriter` and the no-editorialising rule in
`DESIGN-TOKENS.md` both still bind. The name describes the unit of measurement, not an outcome.

## 3. The mark

A circle split across its exact middle: the lower half solid, the upper half at 34%.

The split is at the midpoint, not near it. Even means even. The circle also carries over from the
donut clock the app has used since v6, so the mark is not arriving from nowhere.

It is deliberately **not a bar chart**. An earlier pass drew ascending bars meeting a horizontal
rule; it read as generic analytics, and worse, the rule read as a *ceiling*, a concept 2.0
explicitly removed (see the SCOPE changelog for 19 Aug). Nothing in the mark may read as a limit,
a target, or a verdict.

### Files

| File | Use |
|---|---|
| `brand/evenweek-mark.svg` | Primary. Clay tile, cream disc. Anywhere the mark stands alone |
| `brand/evenweek-mark-mono.svg` | Single colour via `currentColor`, inherits `--accent` or `--text`. **24px minimum** |
| `brand/evenweek-lockup.svg` | Mark + wordmark, light surfaces |
| `brand/evenweek-lockup-dark.svg` | Mark + wordmark, dark surfaces |
| `icons/favicon.svg`, `icons/favicon.ico` | Browser tab. `.ico` carries 16/32/48 |
| `icons/icon-192.png`, `icons/icon-512.png` | Home screen, when the PWA lands in v2.1 |
| `icons/icon-maskable-512.png` | Android adaptive. Mark sits inside the 80% safe circle |
| `icons/apple-touch-icon.png` | 180px, iOS |

### Colour

Straight from `DESIGN-TOKENS.md`. No new values were invented for the brand.

Clay `#A84E29` tile, cream `#FFFDFA` disc, ink `#2A241F` wordmark, cream `#F4F0E9` wordmark on dark.
Dark-mode mono uses `#E2825A`.

Measured contrast, every pair at or above AA:

```
5.46  cream disc on clay tile
4.88  mono mark on page background
5.46  mono mark on card
6.72  dark-mode mono on dark background
13.49 wordmark ink on page background
16.40 wordmark cream on dark background
```

### Type

The wordmark is set in the app's own stack, `system-ui, -apple-system, "Segoe UI", Roboto,
sans-serif`, at weight 500, letter-spacing -0.02em.

This means the wordmark renders slightly differently across platforms. That is accepted, and it is
the same trade `DESIGN-TOKENS.md` already made for the whole product: no webfont, because a webfont
is a network request on the one screen someone opens mid-shift. A logo that needs a font the product
refuses to load is a logo arguing with its own product.

### Rules

- Clear space around the mark: half the mark's height, on all four sides.
- Never recolour it outside the tokens above.
- Never rotate, skew, outline, add a gradient, or add a shadow.
- Never change the split away from the midline. The midline is the meaning.
- Never place the tile mark on a clay or near-clay background.
- Never set the wordmark in a different family to make it "more designed".
- The mono mark is never used below 24px. Below that, use the tile.

## 4. Not done, deliberately

- **The repo and live URL still say `shift-planner`.** Renaming breaks shared links. Human decision.
- **The `shift-planner-copywriter` skill keeps its name.** It lives in the Claude account, not this
  repo (`FILING.md` §Skills), and renaming it means re-saving the skill.
- **`HANDOVER.md`, `QA-REPORT.md` and `SCOPE-HISTORY.md` are untouched.** They are append-only
  records of what happened. Rewriting the name through them would falsify the record.
- **Storage key `shiftPlanner.2` is untouched and stays untouched.** Renaming it hides every
  existing user's data. This is the exact failure Feature 8 exists to prevent.
- **The name does not appear anywhere in the app's UI.** Adding a header lockup is a change to a
  frozen build and belongs in `PARKING.md`, not here.
- **No meta description was written.** That is visitor-facing copy and routes through the
  copywriter, per standing order 11.
