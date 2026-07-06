# Tax Accuracy Audit — 2026-07-06

Researched via three parallel passes (UK/IE/DE, FR/NL/ES, US/CA/AU) against current official sources, checked line-by-line against the exact code in `index.html`'s `COUNTRIES` object. Findings below split into **structural bugs** (wrong regardless of tax year) and **stale figures** (right shape, old numbers). The app's own disclaimer ("simplified effective-rate estimates... ignores allowances, credits, student loans, overtime rules") is a reasonable simplification boundary — nothing here asks for full statutory precision, only for the core brackets/rates to be structurally correct and current.

## Structural bugs (wrong at any tax year, not just outdated)

1. **France's bracket loop is shifted by one row.** The array `[[11294,0],[28797,.11],[82341,.30],[177106,.41]]` pairs each threshold with the *wrong* rate and has no terminal top-rate row. Hand-traced example: gross €100,000 currently computes **€11,188** income tax; the correct figure (even with only the stale thresholds) is **€25,229** — a ~55% under-count. This is a logic bug, not a stale-number issue. Fix shape: `[[0,0],[11294,.11],[28797,.30],[82341,.41],[177106,.45]]` (also adds the missing 45% top band).
2. **US federal tax stops at a 32% top bracket, applied forever above $191,950** — the 35% and 37% brackets don't exist in the code at all, understating tax for any high annualized gross (relevant since the app can annualize at the user's full working ceiling, not just typical hours).
3. **Canada federal tax stops at 26%** — the 29% and 33% top brackets are entirely missing, same understatement pattern. CPP2 (a second contribution tier above the original CPP ceiling) is unmodeled entirely, not just outdated.
4. **Australia stops at 37%** — the 45% top bracket above $190,000 is missing.
5. **Germany's flat 30% "approximation" materially misrepresents the real curve**, not just a rounding simplification: it overtaxes low/mid incomes (real effective rate ~8-18% around €20k-40k) and only roughly matches near €70k-100k, while understating tax for higher earners subject to 42-45%. A flat rate flattens away the progression the app's own "effective-rate estimate" disclaimer implies still exists.
6. **Netherlands omits arbeidskorting (labour tax credit) entirely** — for an employee this credit is larger than the general credit already modeled (2026 max ~€5,685), so its absence materially overstates Dutch tax specifically for the employee/shift-worker case this app is built for.

## Stale figures (structure is fine, numbers need updating)

**UK** — Personal Allowance (£12,570) and higher-rate threshold (£50,270) are correct and frozen through 2026/27; NI 8%/2% bands match current rates exactly. Only gap: no additional-rate (45% above £125,140) band — add a third band, the personal-allowance taper above £100k is fine to keep skipped.

**Ireland** — standard-rate cutoff should be €44,000 (code has €42,000); USC second band should end at €28,700 not €25,760, at 2% not... actually the rate above that band should be 3% not 4% (code currently applies 4% where 2026 law says 3%); PRSI should be ~4.2% (code has 4.1%, stale but close).

**Germany** — Grundfreibetrag should be €12,348 (code has €11,604, a 2024 figure); top marginal rate (42%) now starts at €69,878. Social contribution rate should be ~21% not 20%; the single earnings cap is outdated and real law actually splits into two caps (€69,750 health/care, €101,400 pension/unemployment) — fine to keep one blended cap if updated, e.g. ~€85k.

**US** — standard deduction should be $16,100 (code has $14,600, a 2024 figure); brackets should be 10% to $12,400, 12% to $50,400, 22% to $105,700, 24% to $201,775, 32% to $256,225 (then 35%/37%, see bug #2 above). FICA should cap the 6.2% Social Security portion at the $184,500 wage base (Medicare's 1.45% stays uncapped) — code currently applies the full 7.65% uncapped.

**Canada** — basic personal amount should be $14,829 (code has $15,705, stale); lowest bracket rate is now 14% not 15% (cut in 2025, permanent for 2026); bracket thresholds should be $58,523 / $117,045 / $181,440 (then 29%/33%, see bug #3). CPP should be 5.95% up to $74,600 (not 68,500), EI 1.63% up to $68,900 (a different, separate cap from CPP's) — not a flat combined 7.3%.

**Australia** — tax-free threshold ($18,200) still correct. Second bracket should be 15% not 16% (cut effective 1 July 2026); bracket thresholds should be $45,000 / $135,000 / $190,000 (then 45%, see bug #4). Medicare levy cliff threshold should be $29,207 not $27,222 (real law has a shade-in band to $36,509 before the flat 2%; keeping a single cliff is a fine simplification once the number's current).

**France** — thresholds should be 0% to €11,600, 11% to €29,579, 30% to €84,577, 41% to €181,917 (then 45%, see bug #1) — current code is using 2024-income (barème 2024) figures, not 2026. Cotisations sociales ~22% flat remains a fair round figure, no change needed.

**Netherlands** — box 1 should be 3 bands not 2: 35.75% to €38,883, 37.56% to €78,426, 49.50% above (2026). General tax credit should be max €3,115, phasing from €29,736 at 6.398% (code's €3,362/€24,000/6% figures are stale). Bundling income tax + national insurance into one box-1 rate is real and correct, not a simplification error — that's how Dutch payroll actually works.

**Spain** — IRPF brackets (19/24/30/37/45 at 0/12,450/20,200/35,200/60,000) are current and correct, including the choice to ignore regional variation — no change needed there. Missing the 47% bracket above €300,000 (minor). Social security ceiling should be €61,214.40 for 2026 (code has €56,646, a 2024 figure); rate should be ~6.47-6.50% including the MEI surcharge (code has 6.35%, predates MEI).

## What this means for v9

Every number above has a cited source (gov.uk, revenue.ie, IRS, canada.ca, ato.gov.au, service-public.gouv.fr, belastingdienst.nl, agenciatributaria.es, or established country tax-guide publishers like KPMG/Deloitte/Grant Thornton) — full citations are in the research agents' original findings, summarized here for the fix list. This is real-money-affecting logic in a tool people use to plan actual work hours, so it's a strong candidate for v9's first priority rather than a nice-to-have, but the decision to scope it that way is still yours to make in `SCOPE.md`, same as everything else here.
