# RPC-NCN Protocol

Public repository for the RPC-NCN protocol contract.

**Protocol boundary:** this repo defines protocol behavior, compatibility, and conformance requirements; it does not host runtime/service implementation code.

## Normative vs Informative

- **Protocol-normative sources:** `specs/`, `schemas/`, `reference-test-vectors/`, `compliance-tests/`, `versioning/`
- **Process / informative sources:** `README.md`, `docs/`, `rfcs/`, `governance/`, `PUBLICATION_POLICY.md`

Do not place new protocol requirements in informative docs.

## Canonical Document Ownership

| Topic | Canonical file |
| --- | --- |
| Repository scope + ownership map | `README.md` |
| Public docs landing page | `docs/index.md` |
| Contribution workflow | `docs/CONTRIBUTING.md` |
| Publication safety + release gates | `PUBLICATION_POLICY.md` |
| Migration backlog | `docs/MIGRATION_CHECKLIST.md` |
| POC protocol v1 draft (normative) | `specs/core/poc-protocol-v1-draft.md` |
| Legacy alias for old POC path | `specs/wire-format/poc-protocol-v1.md` |
| Change proposals before ratification | `rfcs/` |

## Repository Structure (Protocol Assets)

- `specs/` — protocol text
- `schemas/` — machine-readable definitions
- `reference-test-vectors/` — deterministic vectors
- `compliance-tests/` — implementation-agnostic conformance tests
- `versioning/` — compatibility/version policy artifacts

## Status

Public curation is active: protocol material is being migrated, sanitized, and versioned for open review.

## Publishing

GitHub Pages publishes from `docs/`.
Start at `docs/index.md`.
