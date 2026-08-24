# TECH PACK: Shift Planner v11

Design Translator, pre-build, 2026-08-19. Against `SCOPE.md` v11 (frozen, plus three changelog
amendments) and `DESIGN-TOKENS.md` (Guide, warm).

<!-- LAYOUT AND VISUAL SPEC ONLY. Data model, storage schema, computation and file structure live
     in ARCHITECTURE.md and are referenced here, never copied. The v9 Tech Pack is archived at
     docs/archive/v9/TECH-PACK.md. Read-only to everyone but this seat at the next retro. -->

---

## 0. Why this document replaces the v9 one

v9's Tech Pack documented a single scrolling page of fifteen sections. v11 kept that structure and
changed only its colours, and the human rejected the result on sight. The palette was not the
problem. **Fifteen things competing on one scroll is the problem**, and no palette fixes it.

The fix is architectural: one scroll becomes four screens, each holding two or three cards. The
headline gets a screen rather than a slot.

---

## 1. Navigation

**Four tabs, persistent, bottom-anchored.** Plus one settings surface reached from the header, not
a tab, because it is visited rarely and a fifth tab would dilute the four that matter.

| Tab | Answers | SCOPE features |
|---|---|---|
| **Now** | "How many more hours do I need, and what have I done?" | 5, 6 |
| **Work** | "Who do I work for, at what rates, and what does an hour actually pay?" | 3 |
| **Money** | "What do I owe, and where do my hours go?" | 4 |
| **Weeks** | "Did last week's work cover what it was for?" | 7 |
| _Settings (header)_ | Country, data export/import/reset, compliance text, version | 9 |

Tab bar: `--surface` fill, `--r-card` radius, 8px vertical padding, four equal columns, 11px labels,
active in `--accent` at weight 500, inactive in `--muted` at 400. **Labels, not icons alone** —
four abstract icons would need learning, and this is used tired. Each tab target is at least
44×44px. Bar sits above the safe-area inset, never overlapping content.

**Only one tab's content is in the DOM at a time.** Not `display:none` on all four — a screen
reader should not encounter three hidden screens. See States, below, for the switch behaviour.

---

## 2. Screens

Shared: page `--bg`, content max-width 720px, page padding 16px (24px above 480px), card gap 12px,
section gap 28px. Cards are `--surface`, `--r-card`, `--pad-card`, **no border in light mode**,
1px `--line` in dark. Never more than three cards per screen.

### Cold open — feature 2
Full viewport, no tab bar. One line naming what the app answers. Two actions stacked: **Set up**
(`--accent` fill, `--accent-ink` text, `--r-control`, full width) and **I have a backup file**
(text-only, `--accent`, no fill). No hero image, no feature list, no numbers. A cold open showing
fabricated figures is the seed-data problem in a different costume.

### Onboarding — feature 2
Full viewport, no tab bar, one question per screen. Five steps: country/currency → employers →
outgoings → ceiling → goals. Top: step count, 13px `--muted`. Middle: the question, 20px/500, and
its input. Bottom: progress meter (4px, `--surface-2` track, `--accent` fill) then **Continue**.
Goals step carries **Skip** as text-only alongside Continue. Each step writes to storage on
Continue, so a drop-out resumes.

### Now — features 5, 6
1. **Headline card.** Centred. Label 13px `--muted`; figure 52px/500, `-.03em`, `--text`; unit 15px
   `--muted` **under** the figure, never beside it; meter; then one line of context. Nothing else on
   this card. It is the reason the app exists and it gets the room.
2. **This week card.** Two rows: shifts logged, earned so far. Label `--text-2` 14px left, value
   `--text` 15px/500 right.
3. **Log a shift** — `--accent` fill, full width. Below it, this week's shift rows.

### Work — feature 3
1. **Employer cards**, one per employer. Name 15px/500, then one row per rate (name left, value
   right), then **Add rate** as text-only `--accent`. Typical hrs/wk and pension sit at the card
   foot as a two-column pair.
2. **Ceiling card.** Max days and max hours as a two-column pair, computed ceiling below.
3. **Take-home card.** Gross/hr, deduction rows, net/hr emphasised in `--accent`. **The C7 string
   sits here**, 12px `--muted`, only when the current week holds one or two shifts.

### Money — feature 4
1. **Outgoings card.** One row per item: label, category, amount, delete. Running total at the foot.
   A dated item shows its date under the label in 12px `--muted`; a lump sum also shows its
   per-week contribution. **Rows render in the user's stored order and are never re-sorted.**
2. **Goals card.** One row per goal. Expired rows at 0.6 opacity with the existing pill.
3. **Where your hours go.** Donut plus legend. Legend is a list, each entry a swatch, a label and a
   figure. **Every slice carries its text label** — the category ramp is separated by lightness and
   the labels are the actual guarantee, not the colours.

### Weeks — feature 7
1. **Bank this week** — button, `--accent`, disabled-looking but still pressable when no shifts
   exist (per CDS restraint: respond on use rather than disabling).
2. **Week rows**, newest first. Date, hours, net, then the frozen coverage bar and "reached N of M".
   Legacy migrated rows show their stored label and no date sort.

### Settings — feature 9
Reached from a header control. Country/currency, export, import, reset, and the compliance block:
tax disclaimer, not-debt-advice statement with a pointer to free regulated debt advice, version
stamp (`appVersion`, `taxDataVersion`). Reset is the only destructive action and keeps its
confirmation.

---

## 3. States

Every component that can be in more than one. Anything absent here has exactly one state.

| Component | Empty | Error | Normal |
|---|---|---|---|
| Tab bar | — | — | One active tab; switching swaps DOM content, moves focus to the new screen's heading, and preserves scroll position per tab |
| Headline | net ≤ 0, or no employer: "Add an employer and an hourly rate to see your numbers." No figure, no meter | Infinity/NaN prevented upstream, never rendered | Figure + meter + context line |
| This week | Hidden entirely when no shifts logged | — | Two rows |
| Shift list | "No shifts logged this week." | — | One row per shift |
| Employer list | "Add an employer and an hourly rate to see your numbers." | — | One card per employer |
| Rate list | An employer with zero rates shows "Add a rate" only | — | One row per rate |
| Take-home | "No deductions" when none | — | Rows + emphasised net/hr |
| C7 line | Hidden at 0 shifts and at 3+ | — | Visible at 1–2 shifts this week |
| Outgoings | "Add what you pay each month to see hours needed." | — | Rows + total |
| Goals | "No one-off goals." | — | Rows, expired distinguished |
| Donut | gross ≤ 0: "Add an employer and an hourly rate to see the breakdown." | — | Donut + labelled legend |
| Weeks | "No weeks banked yet." | — | Rows, newest first |
| Import | Slot hidden | `--error` inline: invalid JSON / wrong shape / **blob from a newer version** | Silent success, re-render is the confirmation |
| Update banner | Hidden | — | Inline, dismissible, "New version ready. Reload" |

**No loading states anywhere.** Storage is read synchronously and nothing fetches. Omitted
deliberately rather than forgotten.

---

## 4. Forking decisions — flag, do not resolve here

Per this seat's multi-prototype rule, these have more than one reasonable answer and should go
through `noxus-design-prototypes` rather than being settled by one agent:

1. **Where the take-home summary lives.** Placed on Work because it derives from rates. It is also
   defensible on Now, since "what does an hour pay" is part of "should I take this shift".
2. **Whether the donut belongs on Money or Now.** Placed on Money as an explanation of obligations.
   It is arguably the answer to "where do my hours go", which is a Now question.
3. **Tab labels.** "Now / Work / Money / Weeks" is one naming. "This week / Jobs / Bills / History"
   is plainer and longer. Copy call, routes through `shift-planner-copywriter`.

The four-tab split itself is **not** a fork: the human chose it on 2026-08-19 after seeing a
rendered comparison.

---

## 5. What this document does not cover

Data model, storage schema, migration, computation, service-worker strategy and file layout:
`ARCHITECTURE.md`. Voice and string content: `COPY-DECK.md`. Token values: `DESIGN-TOKENS.md`.

---

## Handover

**Done:** Replaced the v9 Tech Pack with a v11 layout spec built on the four-screen structure the human approved. Covers navigation, six screens, per-screen card composition sourced from the token doc's spacing and type scale, a full state table, SCOPE feature mapping per screen, and three flagged forking decisions. Archived the v9 Tech Pack. Wrote the SCOPE changelog entry recording the layout rebuild as the third post-freeze amendment, including a process note that the freeze is weakening.

**Assumed:** (1) Settings belongs behind a header control rather than a fifth tab; a rarely-visited surface would dilute four tabs that matter. (2) Tab labels are text, not icons alone, because four abstract icons need learning and this is used tired. (3) Only the active tab's content is in the DOM, rather than all four hidden with CSS, so a screen reader does not walk three invisible screens. That is an accessibility call with a real implementation cost and it belongs to the Builder to confirm as feasible. (4) Scroll position is preserved per tab. (5) "Bank this week" stays pressable with no shifts and responds on use rather than being disabled.

**Risky:** (1) **THIS SPEC HAS NEVER BEEN RENDERED.** The four-screen structure was approved from a single static mockup of two screens. Money and Weeks have not been drawn at all, and the card counts on them are a guess about density. (2) The tab bar adds a persistent element to a phone viewport that already loses room to browser chrome; on a small device the headline card plus tab bar may not leave the breathing room the whole rebuild exists to create. Untested. (3) Moving to tabs means the app can no longer be scanned in one scroll, which is a genuine loss for anyone who used it that way. The one real external user has never been asked. (4) Three forking decisions are flagged but the `noxus-design-prototypes` workflow has not been run, and the Builder session is the only one that can run it. (5) Onboarding's five full-viewport steps are specified but never drawn; step density is unverified.

**Open:** (1) Run `noxus-design-prototypes` for the three forks in §4, or accept the placements as drafted and record that. (2) Tab labels need `shift-planner-copywriter`. (3) Money and Weeks need drawing before build, or built and then judged. (4) Post-build, this seat owes a live walkthrough and the human owes explicit sign-off; that gate is not satisfied by approving a mockup. (5) `SPEC-v11-TARGET.html` in `docs/design/` now describes a layout that no longer exists and should be archived.

**Touched:** `docs/design/TECH-PACK.md` (rewritten for v11), `docs/archive/v9/TECH-PACK.md` (moved), `SCOPE.md` (changelog, authorised). Read-only inputs: `SCOPE.md`, `DESIGN-TOKENS.md`, `COPY-DECK.md`, `ARCHITECTURE.md`. No code written.
