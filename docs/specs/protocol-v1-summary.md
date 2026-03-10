# Protocol v1 Summary

**Status:** informative summary. Normative behavior is defined in `specs/core/poc-protocol-v1-draft.md`.

## Objective

Deliver verifiable RPC integrity for high-assurance workflows.

## POC v1 core mechanics

- stake-weighted response agreement (>=2/3)
- operator-side response hash chaining
- on-chain interval attestations and finalization
- epoch-based reward/offense accounting

## Current implementation status

See: [POC Status](../poc-status.md)

## Visual context

See: [Visualizations](../visualizations.md)

## Normative module map

- Specs index: `../../specs/INDEX.md`
- Consensus rules: `../../specs/consensus/quorum-verification-v1.md`
- State invariants: `../../specs/onchain-state/state-model-v1.md`
- Economics rules: `../../specs/economics/reward-penalty-v1.md`
- Wire/serialization rules: `../../specs/wire-format/serialization-rules-v1.md`

## Conformance + compatibility

- Schemas: `../../schemas/README.md`
- Reference vectors: `../../reference-test-vectors/README.md`
- Compliance criteria: `../../compliance-tests/README.md`
- Versioning policy: `../../versioning/COMPATIBILITY_POLICY.md`
