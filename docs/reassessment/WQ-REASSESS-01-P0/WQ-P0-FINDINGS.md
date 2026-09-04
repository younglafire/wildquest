# WQ-P0 Findings Register

## Purpose

Controlled register for technical, product, market, novelty, and competition findings discovered during `WQ-REASSESS-01 Phase 0`.

A finding is recorded here instead of being fixed during Phase 0.

## Severity

- `BLOCKER` — invalidates a key claim, live path, or competition readiness.
- `HIGH` — materially weakens trust, scoring, or demo reliability.
- `MEDIUM` — important but not an immediate gate blocker.
- `LOW` — bounded cleanup or documentation issue.

## Status

- `OPEN`
- `CONFIRMED`
- `ACCEPTED_LIMITATION`
- `DEFERRED`
- `CLOSED_BY_DECISION`

## Findings

| ID | Finding | Type | Severity | Evidence | Affected rubric | Recommended treatment | Status |
|---|---|---|---|---|---|---|---|
| F-P0-001 | Program identity / Devnet deployment reconciliation | Technical | TBD | TBD | Solana, Technical | Verify exact IDs and deployment state; do not deploy in Phase 0 | OPEN |
| F-P0-002 | AI result is not yet cryptographically bound to public `discover_species` input | Trust/Security | TBD | TBD | Solana, AI, Digital Asset | Assess backend attestation/verifier design for later phase | OPEN |
| F-P0-003 | Identify API wallet string does not by itself prove wallet ownership | Trust/Security | TBD | TBD | Product, Technical | Assess signed challenge/session proof requirement | OPEN |
| F-P0-004 | Current classifier domain is bounded relative to broad wildlife positioning | AI/Product | TBD | TBD | AI, Problem, Product | Reconcile marketed scope with tested model capability | OPEN |
| F-P0-005 | Photo → AI identification → collection/progression loop may be highly crowded | Novelty | TBD | TBD | Problem, Product, Pitch | Competitor evidence audit and wedge decision | OPEN |
| F-P0-006 | Primary customer / payer / GTM may be underdefined | Market | TBD | TBD | Market & GTM, Problem | Define customer, pain, workaround, willingness-to-pay evidence | OPEN |
| F-P0-007 | Digital-asset role may be weaker than Solana technical implementation | Product/Blockchain | TBD | TBD | Digital Asset, Solana | Decide whether verifiable observation, mission, or reward is the core asset | OPEN |

Add findings sequentially as `F-P0-008`, `F-P0-009`, etc. Do not renumber existing IDs.

## Finding closure rule

A Phase 0 finding may only close by:

1. evidence proving the concern false;
2. an explicit accepted limitation; or
3. the final product decision removing the affected scope.

No source-code fix is permitted as a Phase 0 closure mechanism.

## Register status

```text
FINDINGS_REVIEW_COMPLETE = NO
BLOCKERS_OPEN = TBD
HIGH_FINDINGS_OPEN = TBD
SOURCE_CODE_CHANGED = NO
```
