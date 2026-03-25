---
layout: default
title: POC v2 Canonical Proof Encoding + proof_id
---

# POC v2 Canonical Proof Encoding + `proof_id`

## 1) Canonical encoding (V1)

`WindowConsensusProof` is encoded as UTF-8 JSON, canonicalized with RFC 8785 (JCS).

### Scalar and bytes rules

- Unsigned integers (`u16`, `u32`, `u64`, `u128`) are encoded as **JSON strings** in base-10.
  - no sign, no leading zeros (`"0"` is the only zero form)
- `bytes32`/`bytes48`/`bytes96` and `signer_bitmap` are lowercase hex strings (no `0x`).
- Enum/text fields are ASCII strings.

### Canonical field set

`proof_version, proof_type, network_id, ncn_id, epoch_id, interval_id, window_id, tier_id, subscription_class_id, policy_version, policy_hash, stake_snapshot_epoch, stake_snapshot_root, total_active_stake, quorum_bps, winning_state_root, request_commitment_root, request_count, signer_bitmap, signer_count, signer_stake_sum, aggregate_pubkey, aggregate_signature, proof_flags, opened_at_ms, closed_at_ms, finalized_at_ms, coordinator_nonce`

Unknown fields are invalid for `proof_version = 1`.

## 2) Hash derivation

```text
proof_hash = SHA-256(canonical_proof_json_bytes)
proof_id   = SHA-256(UTF8("RPCNCN:POC2:PROOF_ID:V1") || 0x00 || proof_hash)
```

Both hashes are 32 bytes.

## 3) `policy_hash` derivation (bound into proof)

```text
policy_hash = SHA-256(UTF8("RPCNCN:POC2:POLICY_HASH:V1") || 0x00 || canonical_policy_json_bytes)
```

`canonical_policy_json_bytes` uses the same JCS + integer/bytes string rules.

## 4) Signing payload root

`signing_root` is derived from this subset (same canonicalization rules):

`proof_version, network_id, ncn_id, epoch_id, interval_id, window_id, tier_id, subscription_class_id, policy_version, policy_hash, stake_snapshot_epoch, stake_snapshot_root, quorum_bps, winning_state_root, request_commitment_root, request_count, coordinator_nonce`

```text
signing_root = SHA-256(UTF8("RPCNCN:POC2:SIGNING_ROOT:V1") || 0x00 || canonical_signing_payload_json_bytes)
```

`signing_root` is the message root used by the locked BLS profile.

## Implementation notes

- `operator-node/src/poc2.rs` implements this canonicalization flow and derives `proof_hash`, `proof_id`, `policy_hash`, and `signing_root`; it relies on the shared `serde_jcs` helper crate that enforces RFC 8785 serialization.
- The domain tags referenced here live under `configs/protocol/poc2/constants.v1.json`, so any future `proof_version` bump must add new domain/tag entries instead of mutating `V1` in place.
- `operator-node/tests/window_consensus_proof_tests.rs` validates the hash derivations, canonical payload ordering, and signer bitmap rules described in this document.
