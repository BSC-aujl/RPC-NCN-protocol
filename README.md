# RPC-NCN Protocol

Normative protocol repository for RPC-NCN.

## Scope

This repo defines the protocol contract that implementations must follow, independent of language/runtime.

### What belongs here

- Normative specifications (message formats, signing rules, quorum semantics)
- Protocol state machine and lifecycle definitions
- Cryptographic and verification requirements
- Economic rules (staking, reward, slash conditions) at protocol level
- Versioning policy, compatibility guarantees, and upgrade process
- Compliance criteria and reference test vectors

### What does **not** belong here

- Service/runtime implementation code (move to `RPC-NCN-core`)
- Exploratory research drafts that are not ratified protocol text (move to `RPC-NCN-research`)
- Environment-specific deployment instructions

## Suggested Structure

- `specs/core/` — core protocol definitions
- `specs/wire-format/` — canonical payload and serialization rules
- `specs/consensus/` — verification and quorum logic
- `specs/economics/` — stake/slash/reward protocol rules
- `specs/onchain-state/` — chain-state model and invariants
- `rfcs/` — change proposals before ratification
- `schemas/` — machine-readable protocol schemas
- `reference-test-vectors/` — deterministic conformance vectors
- `compliance-tests/` — implementation-agnostic test definitions
- `versioning/` — semver and compatibility policy
- `governance/` — process for approvals and protocol stewardship

## Contribution Rules

1. Mark each spec statement as **normative** or **informative**.
2. Any protocol change requires an RFC and explicit compatibility impact section.
3. Changes to signing/verification/economic rules require at least one reference test vector update.
4. Keep implementation examples minimal and non-authoritative.
5. Use stable terminology; avoid ambiguous wording in normative sections.

## Publication status

Public curation is in progress: protocol material is being migrated from the source monorepo, sanitized, and versioned for open review.

## GitHub Pages

Documentation is published from the `docs/` directory via GitHub Pages.
See `docs/index.md` for the current public entry point.

