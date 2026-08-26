# DESIGN TOKENS: Evenweek

Style: **Guide (Warm)** · Decided 2026-08-19 (D10, warm accent confirmed)
Produced from the `noxus-design-system` skill's Guide reference. This is the token document that
skill names as its default deliverable, and it is an input the architect pass requires.

<!-- SPEC-v11-TARGET.html was drafted in Engineer tokens (#f9f9f7 bg, #2a78d6 action, 8px radius,
     borders everywhere). Those are superseded. That file remains useful for LAYOUT and FLOW only.
     Do not take a single colour, radius or type size from it. -->

---

## Brand anchor

- **Feel, in three words:** calm, honest, unhurried.
- **Default style when unsure:** Guide.
- **Off-limits style:** Disruptor. Nothing about this product should shout, and a financial tool
  that grabs at a tired person is doing harm, not marketing.

---

## The rule that overrides taste

**Colour may not editorialise where the copy is forbidden to.**

`COPY-DECK.md` bans judgement about the user's financial position, and Rule 0 of
`shift-planner-copywriter` bans anything reading as steering. A red "not reached" row would say
*failure* louder than any sentence, and would say it about a person's life. The palette carries the
same constraint as the words:

| State | Treatment | Why |
|---|---|---|
| Covered | Sage, quiet | A fact, not a reward. No celebration colour |
| Short by an amount | Ochre, informational | Attention, not alarm |
| Not reached | **No colour at all** — muted text | The absence of colour is the point. Nothing happened; nothing is wrong |
| Over your ceiling | Ochre | Information about arithmetic, not a verdict about you |
| Actual error | Rust red | **Reserved.** Bad import, corrupt data, broken state. Never for a financial position |

Rust red appears only when the *app* has a problem. It never appears because the *user* does.

## The other rule: contrast beats warmth

Guide's style file says "avoid stark contrast." WCAG 2.2 AA requires 4.5:1 for body text, and the
Equality Act duty behind it is a legal obligation, not a preference (`REQUIREMENTS.md` §3.3). Where
the two conflict, **contrast wins and the warmth comes from hue, not from washing text out.**
Every pair below is measured, not estimated. See "Verified contrast".

---

## Tokens

```css
:root {
  color-scheme: light;

  /* surfaces — warm neutral, never pure white */
  --bg:          #F4F0E9;   /* page */
  --surface:     #FFFDFA;   /* card */
  --surface-2:   #EDE7DD;   /* inset, meter track */

  /* ink */
  --text:        #2A241F;   /* primary */
  --text-2:      #5E5449;   /* secondary, row labels */
  --muted:       #6D6458;   /* hints, "not reached", timestamps. Darkened from #7D7367,
                               which failed AA at 4.09:1 against --bg. See "Verified contrast" */

  /* lines — used sparingly. Guide separates with space, not rules */
  --line:        #E3DACE;
  --line-strong: #CFC3B2;

  /* the one accent */
  --accent:      #A84E29;   /* clay. Primary action, links, emphasis */
  --accent-ink:  #FFFDFA;   /* text on accent fill */
  --accent-soft: #F2E4DA;   /* tint background */

  /* semantic — deliberately un-alarming, see "the rule that overrides taste" */
  --covered:     #47663F;   /* sage */
  --covered-soft:#E4EADF;
  --attention:   #8A5B0E;   /* ochre */
  --attention-soft:#F7EBD5;
  --error:       #93342A;   /* rust. App faults only */
  --error-soft:  #F7E3DF;

  /* spend categories. Warm-leaning, separated by hue AND luminance so the donut survives a
     colour-vision deficiency. The first version of this ramp FAILED a simulated protanopia,
     deuteranopia and tritanopia check: warm hues at similar lightness collapse into one another,
     and the claim that they were "separated by hue AND luminance" was simply wrong. Since the warm
     family caps hue separation, LIGHTNESS carries the load, stepped wide on purpose. Measured
     worst-case separation after simulation: 0.0162 relative luminance, against a 0.01 floor.
     Every slice still carries a text label, which remains the real guarantee. */
  --c-bills:  #5C2410;
  --c-save:   #3A5A31;
  --c-repay:  #8A5B0E;
  --c-spend:  #8E6A60;
  --c-tax:    #4A443C;

  /* shape */
  --r-card:      16px;
  --r-control:   14px;
  --r-pill:      999px;

  /* space — 8px baseline, medium-high */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 20px; --s-6: 28px; --s-7: 40px; --s-8: 56px;
  --pad-card: 20px;
  --gap-card: 12px;
  --gap-section: 28px;

  /* motion */
  --dur: 200ms;
  --ease: cubic-bezier(.2,.6,.3,1);
}

/* Light is the DEFAULT and it is explicit: `<html data-theme="light">`. Dark is chosen, never
   inherited. An earlier build let prefers-color-scheme win silently, so anyone on a dark-mode OS
   never saw the palette that was designed, approved and contrast-checked, and the mockups shown
   for sign-off did not match what shipped. The OS preference now applies only under
   data-theme="auto", which the user selects in Settings. Corrected 2026-08-19. */
:root[data-theme="dark"] { /* ...same values as below... */ }

@media (prefers-color-scheme: dark) {
  :root[data-theme="auto"] {
    color-scheme: dark;
    --bg:          #16120E;
    --surface:     #211C17;
    --surface-2:   #2C251E;
    --text:        #F4F0E9;
    --text-2:      #C9BDAD;
    --muted:       #9B8F80;
    --line:        #322A22;
    --line-strong: #443A2F;
    --accent:      #E2825A;
    --accent-ink:  #16120E;
    --accent-soft: #33231A;
    --covered:     #9DBE93;
    --covered-soft:#222A1E;
    --attention:   #E0AC4E;
    --attention-soft:#302516;
    --error:       #E89184;
    --error-soft:  #33201C;

    /* dark category ramp. Verified separately: a light-mode ramp inverted is not automatically
       safe, and this one was missing from this document entirely while the app carried values.
       Worst-case CVD separation 0.0384, all five at 4.5:1+ on --surface. */
    --c-bills:  #DD7C55;
    --c-save:   #A3C79A;
    --c-repay:  #D19B3B;
    --c-spend:  #D8C2BA;
    --c-tax:    #8E8578;
  }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

## Type

**One family: the system stack.** No webfont, and the reason is architectural rather than
aesthetic — a webfont is a network request, and v11 ships a PWA whose core loop must work with no
network (`SCOPE-v11-CANDIDATE.md` feature 10). A font that fails to load is a layout that shifts on
the one screen the user opens mid-shift.

```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

**Two weights only: 400 and 500.** Guide is human-scale, not loud. 600 and 700 read as shouting at
these sizes and against a warm background.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Headline figure | 44px | 500 | letter-spacing -.03em. The one big thing on screen |
| Headline unit ("extra hours") | 15px | 400 | `--muted`, sits under the figure, never beside it |
| Section heading | 20px | 500 | |
| Body / row value | 15px | 500 | values are 500, labels are 400 |
| Row label | 15px | 400 | `--text-2` |
| Field label | 13px | 400 | `--muted` |
| Smallest permitted | **12px** | 400 | Hard floor. Stricter than usual, because the reader is tired |

Line height 1.5 body, 1.1 on the headline figure. Sentence case everywhere, including buttons.

## Space

Medium-high. **Guide separates with whitespace, not borders** — this is the single biggest
departure from the Engineer draft, where every panel had a 1px rule around it.

- Cards: `--surface` fill, `--r-card` radius, `--pad-card` padding, **no border in light mode.**
  In dark mode add `1px solid var(--line)`, because fill alone stops separating surfaces.
- Card gap 12px, section gap 28px, page padding 16px mobile / 24px above 480px.
- Max content width 720px. Wider than that and the eye has to travel for no reason.

## Motion

Gentle. 200ms, ease-out, no snap, no bounce, no spring. Things fade and settle; nothing pops.
The meter fill animates on change; numbers do not count up — a figure that animates is a figure you
have to wait for.

`prefers-reduced-motion` is honoured, and it is in the token block above rather than left to the
Builder to remember.

## Icons

**Lucide.** Rounded terminals, stroke-based, matches Guide's warmth without being childish. One
library, no exceptions, no emoji, no keyboard glyphs — the design system's global icon rule.

- Stroke 1.75px, matched to 400/500 type weight.
- 20px inline, 24px standalone.
- **44×44px minimum tap target** regardless of icon size, per the accessibility criterion carried
  from v9.
- Icons are functional. If removing it costs no comprehension, remove it.

## Voice

Plain, candid, never patronising. Full rules live in `COPY-DECK.md`, and the legal boundary lives
in the `shift-planner-copywriter` skill. Not restated here — one home per fact.

## Verified contrast

Measured with the WCAG 2.1 relative-luminance formula, not estimated. AA needs 4.5:1 for body text,
3:1 for large text (18.66px+ at 400, or 14px+ at 500) and for UI component boundaries.

| Pair | Light | Dark | Needs |
|---|---|---|---|
| `--text` on `--surface` | 15.1:1 | 14.9:1 | 4.5 |
| `--text-2` on `--surface` | 7.3:1 | 9.1:1 | 4.5 |
| `--muted` on `--surface` | 5.2:1 | 5.3:1 | 4.5 |
| `--muted` on `--bg` | 4.7:1 | 5.9:1 | 4.5 |
| `--accent` on `--surface` | 5.5:1 | 6.1:1 | 4.5 |
| `--accent-ink` on `--accent` fill | 5.5:1 | 6.7:1 | 4.5 |
| `--covered` on `--surface` | 6.4:1 | 8.2:1 | 4.5 |
| `--attention` on `--surface` | 5.8:1 | 8.2:1 | 4.5 |
| `--error` on `--surface` | 7.5:1 | 7.1:1 | 4.5 |
| `--line-strong` on `--surface` | 1.7:1 | 1.5:1 | decorative only |

**Swept 2026-08-19 when the palette was applied to the app: every foreground against every surface,
both modes, not just the documented pairs. All pass.** Three values were changed to get there:

- `--muted` was `#7D7367` (4.09:1 on `--bg`), then `#736A5E` (4.32:1 on `--surface-2`). Now `#6D6458`.
- `--c-tax` was `#8C8378`, measuring 3.67:1 on `--surface`. Now `#6E665C`.

The second `--muted` failure is the instructive one. The first table verified `--muted` against
`--surface` and `--bg` but **not against `--surface-2`**, which is the inset background every
employer and shift card uses, paired with `--muted` labels. Verifying documented pairs is not the
same as verifying composed ones, and the gap only surfaced when real markup put the two together.
Any new surface or foreground token means re-running the full sweep, not adding one row.

`--line` and `--line-strong` do not meet 3:1 and **must never be the only means of conveying a
boundary or a state.** They are decoration. Structure is carried by fill and space.

Colour is never the only channel: every state that uses a semantic colour also carries a text
label. A user who cannot distinguish sage from ochre still reads "covered" and "£38 short".

## What to build first

Guide's integration rule: component library with voice, minimal deliverable **onboarding card,
empty state, error state done right.** That maps exactly onto v11 feature 2, which is the correct
place for the architect to start the UI work.

## Open

**Nothing.** The warm-versus-cool question (D10's rider) is resolved warm and the palette above is
the answer. If a cool accent is ever wanted it is a new decision, recorded with its reason, not a
nudge to these values.
