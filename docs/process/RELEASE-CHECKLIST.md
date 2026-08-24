# RELEASE CHECKLIST

Run before every deploy. Short on purpose: a checklist nobody finishes is a checklist nobody reads.

<!-- Created 2026-08-19. Exists because ARCHITECTURE.md §4 introduced two version stamps that are
     only useful if someone bumps them, and nothing enforced that. A convention with no home is a
     convention that lapses. -->

## Every release

- [ ] `APP_VERSION` at the top of `sw.js` is bumped. **This is the release action** — the cache name derives from it, so forgetting it means returning users keep the old app.
- [ ] `meta.appVersion` matches `APP_VERSION`.
- [ ] The footer version stamp renders and reads correctly on a real phone.
- [ ] Deploy, then hard-check the update path: load the old version, deploy, reload, confirm the "New version ready" affordance appears and the reload lands you on the new one **without clearing site data**.
- [ ] `HANDOVER.md` entry written and committed.
- [ ] `QA-REPORT.md` exists for this version and the Breaker's verdict is SHIP-READY.
- [ ] The human pressed ship. Never assumed, never inferred. Standing order: no deploy without it.

## Only when tax figures change

- [ ] **`taxDataVersion` bumped.** Bump this and only this when a bracket, rate, threshold, allowance or credit changes in `COUNTRIES`. It is deliberately independent of `appVersion` so that a tax correction is legible as one in a support conversation.
- [ ] `docs/research/TAX-ACCURACY-AUDIT.md` updated to match what actually shipped.
- [ ] The footer's "simplified effective-rate estimates" disclaimer still describes what is actually simplified. If the model got more precise, the disclaimer got less accurate.

**Why this one has its own section:** a stale app is an inconvenience; stale tax maths is a
confidently wrong number with no symptom. It is the failure mode `ARCHITECTURE.md` §4's whole
service-worker strategy exists to prevent, and the strategy does not help if the version stamp
lies.

## Only when storage shape changes

- [ ] Schema number bumped in the blob and in `validShape()`.
- [ ] Migration written from the previous version, with a one-line WHY per step.
- [ ] The previous key is retained, not deleted, until the new one has survived a release.
- [ ] Console assertions cover: a real previous blob, truncated, hand-edited, empty string, null, and a from-the-future schema number.

## Only when visitor-facing copy changes

- [ ] Written by `shift-planner-copywriter`, not the Builder. Standing order 11.
- [ ] Every changed string passes that skill's Rule 0 check.
- [ ] Any decision made during the pass is written back to `docs/design/COPY-DECK.md`, not left in a chat reply.
