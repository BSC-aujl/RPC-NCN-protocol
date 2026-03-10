# Migration checklist

Tracking remaining protocol artifacts to copy, sanitize, and publish.

## Specs
- [x] Core protocol spec split into stable modules (`specs/core/*`)
- [x] Wire format and canonical serialization rules (`specs/wire-format/*`)
- [x] Consensus/quorum verification rules (`specs/consensus/*`)
- [x] On-chain state model and invariants (`specs/onchain-state/*`)
- [x] Economics (staking/rewards/slashing) protocol rules (`specs/economics/*`)

## Schemas and validation
- [ ] Migrate machine-readable schemas to `schemas/`
- [x] Add schema version map and changelog
- [ ] Verify schema/spec parity

## Conformance assets
- [ ] Migrate deterministic reference vectors to `reference-test-vectors/`
- [ ] Migrate implementation-agnostic compliance definitions to `compliance-tests/`
- [x] Document expected pass/fail criteria per version

## Process and governance
- [ ] Backfill RFC history for accepted protocol changes
- [x] Publish governance/approval flow for protocol updates
- [x] Publish semantic versioning and compatibility policy

## Publication hardening
- [x] Remove internal-only operational details
- [x] Remove credentials/endpoints/infra identifiers
- [x] Mark each section as normative vs informative
- [x] Add cross-links between specs, RFCs, schemas, and tests
