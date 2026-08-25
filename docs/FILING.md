# FILING: where things live and why

Written 2026-08-19, when the repo root had grown to 18 files and nobody could tell governance from
research from dead drafts at a glance.

## The rule

**Root holds only what a session reads every time, plus the app.** Everything else lives under
`docs/` in the folder matching what it is *for*, not what it is *about*.

If you are adding a file and it is not read at the start of every session, it does not go in root.

## Root

| File | What it is | Who owns it |
|---|---|---|
| `CLAUDE.md` | Standing orders. The constitution | Human |
| `SCOPE.md` | The frozen scope for the current version | Human. Builder is read-only |
| `ARCHITECTURE.md` | Structure and decisions log | Architect. Builder is read-only |
| `PARKING.md` | Parked ideas | Scope-clerk. Builder is read-only |
| `HANDOVER.md` | Append-only session log. The org's only memory | Every session appends |
| `README.md` | What this is, for a stranger | Human |
| `index.html` | The app | Builder |

Standing order 7 names `HANDOVER.md`, `SCOPE.md` and `ARCHITECTURE.md` as the start-of-session read.
That is why they are here and not filed away.

## docs/

| Folder | Holds | Test for "does it go here" |
|---|---|---|
| `governance/` | Human-owned documents that define what gets built and why | Would a wrong answer here mean building the wrong thing? |
| `process/` | Run-books and prompt sets | Does it tell a session *how* to work rather than *what* to build? |
| `research/` | Findings consulted when deciding, not when building | Is it evidence rather than instruction? |
| `design/` | Visual and copy source-of-truth | Does it define what the thing looks or sounds like? |
| `archive/` | Superseded and version-closed material | Is it now historically true but operationally dead? |

### Current contents

```
docs/
  FILING.md                       this file
  governance/
    PROJECT.md                    problem, audience, strategy, money. Version-independent
    REQUIREMENTS.md               full-app requirements + the legal trigger map
    SCOPE-HISTORY.md              append-only, one line per frozen version
  process/
    RELEASE-CHECKLIST.md          run before every deploy
  research/
    COMPETITION-UK.md             UK competitive landscape, four tiers
    TAX-ACCURACY-AUDIT.md         per-country tax model audit. Still referenced by index.html
  design/
    COPY-DECK.md                  voice, register, resolved copy decisions
    DESIGN-TOKENS.md              Guide (warm), contrast-verified
  archive/
    v11/                          THE WHOLE OF v11. README.md records why it closed
      README.md  index.html  SCOPE.md  ARCHITECTURE.md  TECH-PACK.md  PROMPTS.md
      migration-assertions.js  render-tests.js  tab-tests.js  dst-and-colour-checks.js
    v9/
      QA-REPORT.md                v9 breaker report. Superseded when v11's is written
      TECH-PACK.md                v9 layout, single-scroll. Superseded by the v11 rebuild
    superseded/
      LANDSCAPE.md                Jul 2026 scan, extended and replaced by COMPETITION-UK.md
      SCOPE-v10-CANDIDATE.md      frozen into SCOPE.md v10 on 18 Aug. Draft is dead
      SCOPE-v11-CANDIDATE.md      frozen into SCOPE.md v11 on 19 Aug. Draft is dead
      SCOPE-v2-CANDIDATE.md       frozen into SCOPE.md 2.0 on 19 Aug. Draft is dead
      SPEC-v11-TARGET.html        Engineer-token design target. Superseded by Guide + the rebuild
```

## Conventions

**Archiving, not deleting.** Nothing gets deleted. A superseded document is evidence of how a
decision was reached, and this org's only memory is written down. `archive/vN/` for
version-closed artefacts, `archive/superseded/` for anything replaced by a newer document.

**Cross-references are bare filenames**, not paths — `PROJECT.md` §0, not `docs/governance/PROJECT.md`
§0. Filenames are unique across the repo, so a bare name resolves unambiguously and survives a
reorganisation. Do not introduce path-based references.

**No em-dashes in any document here.** Two frozen `SCOPE.md` files arrived truncated at the em-dash
character, losing the rest of the line each time. Use a comma, colon or full stop. This is a
mechanical constraint of the toolchain, not a style preference, and it matches what `COPY-DECK.md`
already requires of product copy.

**One home per fact.** If two documents state the same rule, one of them goes stale the first time
either changes. When you find a duplicate, pick the authoritative home, delete the copy, and leave
a pointer. The copy deck and the copywriter skill are split on exactly this principle: voice lives
in the deck, the legal rule lives in the skill.

**New version, new candidate.** Scope drafts are `SCOPE-vN-CANDIDATE.md` in `governance/`. When the
human freezes one into `SCOPE.md`, the candidate moves to `archive/superseded/` and a line is
appended to `SCOPE-HISTORY.md`. That last step has been missed once already — see the handover for
2026-08-19.

## What is NOT filed here

Skills live in the user's Claude account, not the repo: `shift-planner-copywriter` (this project's
product copy), `noxus-copywriter` (Moses's first-person brand voice, org-wide), `noxus-design-system`,
`architect`, `breaker`, `design-translator`, `researcher`, `scope-clerk`. The repo holds the
documents those seats read and write, not the seats themselves.
