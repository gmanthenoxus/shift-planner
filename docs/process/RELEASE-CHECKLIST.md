# RELEASE CHECKLIST

Run before every deploy. Short on purpose: a checklist nobody finishes is a checklist nobody reads.

<!-- Created 2026-08-19, revised the same day for 2.0. Exists because the version stamps are only
     useful if someone bumps them, and nothing else enforces that. A convention with no home lapses.
     The service-worker items were removed when 2.0 dropped the PWA. -->

## Every release

- [ ] `meta.appVersion` bumped in `index.html`. **This is the release action.**
- [ ] The footer version stamp renders and reads correctly on a real phone.
- [ ] Deploy, then hard-reload and confirm the version stamp in the footer shows the new number.
- [ ] `HANDOVER.md` entry written and committed.
- [ ] `QA-REPORT.md` exists for this version and the Breaker's verdict is SHIP-READY.
- [ ] The human pressed ship. Never assumed, never inferred. Standing order: no deploy without it.

## Only when tax figures change

- [ ] **`taxDataVersion` bumped.** Bump this and only this when a bracket, rate, threshold, allowance or credit changes in `COUNTRIES`. It is deliberately independent of `appVersion` so that a tax correction is legible as one in a support conversation.
- [ ] `docs/research/TAX-ACCURACY-AUDIT.md` updated to match what actually shipped.
- [ ] The footer's "simplified effective-rate estimates" disclaimer still describes what is actually simplified. If the model got more precise, the disclaimer got less accurate.

**Why this one has its own section:** a stale app is an inconvenience; stale tax maths is a
confidently wrong number with no symptom. The version stamp is the only way a support conversation
can tell which figures someone is looking at, and it only works if it is honest.

## Only when a design token changes

- [ ] `docs/design/DESIGN-TOKENS.md` updated. It is authoritative.
- [ ] `ARCHITECTURE.md` §1's verbatim copy updated **in the same commit**. It has drifted once already.
- [ ] Full contrast sweep re-run: every foreground against every surface, both modes, not just the documented pairs.
- [ ] If a category colour changed, re-run the colour-vision check.

## Only when storage shape changes

- [ ] Schema number bumped in the blob and in `validShape()`.
- [ ] Migration written from the previous version, with a one-line WHY per step.
- [ ] The previous key is retained, not deleted, until the new one has survived a release.
- [ ] Console assertions cover: a real previous blob, truncated, hand-edited, empty string, null, and a from-the-future schema number.

## Only when visitor-facing copy changes

- [ ] Written by `shift-planner-copywriter`, not the Builder. Standing order 11.
- [ ] Every changed string passes that skill's Rule 0 check.
- [ ] Any decision made during the pass is written back to `docs/design/COPY-DECK.md`, not left in a chat reply.
