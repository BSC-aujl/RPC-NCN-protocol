---
layout: default
title: POC v2 Phase 0 Locks
---

# POC v2 Phase 0 Locks

These pages freeze the POC v2 protocol decisions required at implementation kickoff.

**Status:** Locked (v1) — 2026-03-16

## Locked artifacts

1. [BLS ciphersuite + domain tags](./bls-ciphersuite-and-domain-tags.html)
2. [Canonical proof encoding + `proof_id`/hash derivation](./proof-encoding-and-proof-id.html)
3. [Signer-index derivation + bitmap ordering](./signer-index-and-bitmap.html)
4. [Shared error code registry (stable IDs)](./error-code-registry.html)

## Implementation reference

- The runtime loads these locks through `operator-node/src/poc2.rs`, so the canonical encoding, signer/bitmap logic, and error IDs stay in sync with the files above.
- Domain tags and constants live in `configs/protocol/poc2/constants.v1.json` and `configs/protocol/poc2/error-codes.v1.json`; future protocol versions must add new tags instead of mutating the `V1` entries.
- Unit tests in `operator-node/tests/window_consensus_proof_tests.rs` (powered by the common `operator-node/tests/fixtures/poc2/window-consensus-proof.golden.v1.json` vectors) exercise the proof encoding, signer bitmap invariants, and error expectations documented here, while gateway adversarial coverage in `gateway/tests/security/poc2-adversarial.test.ts` validates the same BITMAP_* error cases when quorum or signer-stake expectations are violated.

## Change policy

Breaking changes to any lock on this page MUST:

- bump `proof_version`, and
- use new `...:V*` domain/hash tags (no in-place mutation of `V1`).
