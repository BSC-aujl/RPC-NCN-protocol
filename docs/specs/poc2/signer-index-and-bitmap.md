---
layout: default
title: POC v2 Signer Index + Bitmap Ordering
---

# POC v2 Signer Index + Bitmap Ordering

## 1) Snapshot signer list derivation (V1)

Given the stake snapshot pinned by `(stake_snapshot_epoch, stake_snapshot_root)`:

1. Keep records where:
   - `active = true`
   - `effective_stake > 0`
   - BLS key is PoP-verified
2. Reject snapshot if duplicate `operator_id` or duplicate `bls_pubkey` exists.
3. Sort remaining records by raw `operator_id` bytes, ascending lexicographic order.
4. Assign `signer_index` as zero-based array position.

This sorted list is the canonical signer universe for bitmap interpretation.

## 2) Bitmap ordering lock

For signer index `i`:

- `byte_index = floor(i / 8)`
- `bit_mask = 1 << (i % 8)` (LSB-first inside each byte)

Rules:

- bitmap byte order is ascending `byte_index` (index 0 in byte 0).
- bitmap length MUST equal `ceil(snapshot_signer_count / 8)`.
- unused high bits in the final byte MUST be zero.

Example: set indices `{0,3,8}` → bitmap bytes `[0x09, 0x01]`.

## 3) Derived proof checks

- `signer_count == popcount(signer_bitmap)`
- `signer_stake_sum == sum(effective_stake for set bits)`
- no set bit may reference index `>= snapshot_signer_count`
- `aggregate_pubkey` is the aggregate of selected signer pubkeys (selected by bitmap)

Any mismatch is invalid and MUST fail closed.

## Implementation notes

- `operator-node/src/poc2.rs::validate_bitmap` uses the snapshot signer list sorted by `operator_id` to enforce the described bitmap layout, length, and stake-count invariants.
- Snapshot validation is shared with the gateway via the same serialized proofs, and the signer universe is derived from `configs/protocol/poc2/constants.v1.json` plus the stake snapshot JSON referenced in `operator-node/tests/fixtures/poc2/window-consensus-proof.golden.v1.json`.
- `operator-node/tests/window_consensus_proof_tests.rs`, together with the `operator-node/tests/fixtures/poc2/window-consensus-proof.golden.v1.json` vectors, exercises bitmap length, popcount, stake-sum, and signer index bounds so `validate_bitmap` stays aligned with this specification.
- Gateway adversarial checks (`gateway/tests/security/poc2-adversarial.test.ts`) assert the same BITMAP_* error paths when proofs misreport quorum or signer stake, keeping the shared proof validation semantics consistent.
