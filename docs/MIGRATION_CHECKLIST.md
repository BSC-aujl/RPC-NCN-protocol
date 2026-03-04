# Migration Checklist (from source monorepo)

Tracking remaining protocol artifacts to copy, sanitize, and publish from `RPC-NCN`.

## Specs
- [ ] Core protocol spec split into stable modules (`specs/core/*`)
- [ ] Wire format and canonical serialization rules (`specs/wire-format/*`)
- [ ] Consensus/quorum verification rules (`specs/consensus/*`)
- [ ] On-chain state model and invariants (`specs/onchain-state/*`)
- [ ] Economics (staking/rewards/slashing) protocol rules (`specs/economics/*`)

## Schemas and validation
- [ ] Migrate machine-readable schemas to `schemas/`
- [ ] Add schema version map and changelog
- [ ] Verify schema/spec parity

## Conformance assets
- [ ] Migrate deterministic reference vectors to `reference-test-vectors/`
- [ ] Migrate implementation-agnostic compliance definitions to `compliance-tests/`
- [ ] Document expected pass/fail criteria per version

## Process and governance
- [ ] Backfill RFC history for accepted protocol changes
- [ ] Publish governance/approval flow for protocol updates
- [ ] Publish semantic versioning and compatibility policy

## Publication hardening
- [ ] Remove internal-only operational details
- [ ] Remove credentials/endpoints/infra identifiers
- [ ] Mark each section as normative vs informative
- [ ] Add cross-links between specs, RFCs, schemas, and tests
