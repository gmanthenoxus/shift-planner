# ARCHIVE: v11 and everything before it

Closed 2026-08-19. The human opened the finished v11 UI, found it hard to use, and chose a clean
restart as 2.0. Nothing here is deleted, because this org's only memory is what got written down.

## Why it was closed

v11 was not wrong in its parts. It was wrong in its order: **it demanded a nine-field model before
it would answer anything.** Country, employer, rates, typical hours, pension, ceiling, outgoings,
categories, goals, all before the headline meant a thing. A first-time user landed on a confident
`0.0 hrs/week` with a green tick, which looked like success and actually meant "I have nothing to
work with."

Specific faults found on inspection, kept so 2.0 does not reinvent them:

- The Weeks screen had no empty state at all, just a bare label.
- Blended gross/hr showed the FIRST rate only, so a second rate was silently ignored.
- Three separate controls added a shift: "Log a shift", "+ Shift", "New week".
- The same figures appeared twice on one screen ("This week so far" and "Earned/Needed/Hours worked").
- "Where are you based? Start here" was buried in Settings, which is not the start.
- "Your jobs" contained a field called "Employer" and a button called "+ Job".
- The headline card tinted green with a tick when nothing was configured.

## What is still true and gets carried into 2.0

- **The tax tables.** Nine countries, audited against real law in `TAX-ACCURACY-AUDIT.md`, which
  found two structural bugs in the process. These are PORTED, not retyped from memory. Re-deriving
  tax law by recollection for a tool that tells people how many hours to work is not a defensible
  saving.
- **The legal boundary.** Art. 39E RAO / PERG 17: the app never ranks, recommends or evaluates one
  obligation against another. This binds 2.0 identically and is not a version decision.
- **The copy deck and design tokens.** Voice, contrast-verified palette, colour-vision-checked ramp.
- **`COMPETITION-UK.md` and `REQUIREMENTS.md`.** The competitive read and the legal trigger map.

## What is here

`index.html` (v11 app) · `SCOPE.md` v11 · `ARCHITECTURE.md` v11 · `TECH-PACK.md` v11 ·
`PROMPTS.md` (v11 run-book) · four jsdom/node test scripts.
