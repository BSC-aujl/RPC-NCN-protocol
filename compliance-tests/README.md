# Compliance Tests

**Status:** normative conformance artifact namespace.

This directory defines protocol-level compliance expectations independent of implementation language.

## Pass/fail criteria by version

### v0.5.x baseline

A compliant implementation must:

1. Enforce quorum acceptance at >= 2/3 active stake.
2. Produce deterministic response hashes for equivalent payloads.
3. Maintain interval hash-chain continuity.
4. Support interval attestation submission and epoch-level correctness accounting.

Failure on any required criterion is non-compliant for the target version.

See also:
- `../reference-test-vectors/README.md`
- `../versioning/COMPATIBILITY_POLICY.md`
