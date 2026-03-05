# Critical Review — RPC-NCN-protocol

Date: 2026-03-05

## Scope reviewed
- Canonical ownership clarity
- Normative vs informative boundaries
- Publication safety posture
- Docs duplication
- Link correctness
- Migration artifact quality

## Findings

### P0 (must fix before publication)

| ID | Area | Finding | Action | Status |
|---|---|---|---|---|
| P0-1 | Link correctness | Broken local Markdown links in public docs and spec context (`docs/specs/system-architecture-context.md`, `specs/core/ncn-implementation-spec.md`). | Fixed link targets, removed dead reference links to non-existent migrated docs, re-ran local link sanity checks. | ✅ Resolved |

### P1 (important, should fix now)

| ID | Area | Finding | Action | Status |
|---|---|---|---|---|
| P1-1 | Canonical ownership / duplication | Full POC protocol content was duplicated in both `specs/core/poc-protocol-v1-draft.md` and `specs/wire-format/poc-protocol-v1.md`, creating ambiguous ownership. | Kept `specs/core/poc-protocol-v1-draft.md` as canonical; converted `specs/wire-format/poc-protocol-v1.md` into a compatibility alias notice. | ✅ Resolved |
| P1-2 | Migration artifacts | Source mapping docs disagreed on where `specs/poc-protocol-v1.md` migrated (`PUBLICATION_POLICY.md` vs `docs/MIGRATED_FROM_RPC-NCN.md`). | Aligned mappings and explicitly documented canonical target + legacy alias. | ✅ Resolved |
| P1-3 | Normative vs informative boundaries | Informative docs in `docs/specs/` did not consistently mark non-normative status. | Added explicit informative status language to `docs/specs/protocol-v1-summary.md` and `docs/specs/system-architecture-context.md`. | ✅ Resolved |
| P1-4 | Migration artifact quality / CI safety | `.github/workflows/ci.yml` referenced missing `poc/*` paths from source monorepo, causing invalid CI for this repo. | Replaced with repo-relevant sanity checks (`git diff --check` + Markdown local link/anchor validation). | ✅ Resolved |

### P2 (quality improvements, non-blocking)

| ID | Area | Finding | Suggested next action | Status |
|---|---|---|---|---|
| P2-1 | Informative doc freshness | `docs/security/THREAT_MODEL.md` references test paths that are not present in this repo (source-repo leftovers). | Either migrate corresponding public conformance artifacts or add a short note that referenced tests live in another repository until migration completes. | ⏳ Open |
| P2-2 | Governance traceability | `governance/open-questions-from-source.md` follow-up targets include artifacts not yet present in this repo (e.g., research docs/roadmap paths). | Add migration status tags per question and convert follow-up locations into explicit repo/path ownership fields. | ⏳ Open |

## Checks run
- `git diff --check` ✅
- Local Markdown link sanity on edited docs (file + anchor validation) ✅
