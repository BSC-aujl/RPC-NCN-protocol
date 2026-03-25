---
layout: default
title: POC v2 Shared Error Code Registry (Stable IDs)
---

# POC v2 Shared Error Code Registry (Stable IDs)

`error_id` is a stable `u16` shared by gateway, operator, and contract paths.

## Registry rules

- IDs are immutable once published.
- IDs are never reused (even if an error is deprecated).
- Components SHOULD emit both `error_id` and `error_name`.

## V1 registry

| ID | Name | Meaning |
|---:|---|---|
| 1000 | `PROOF_ENCODING_INVALID` | Canonical proof JSON/JCS encoding failed |
| 1001 | `INVALID_PROOF_VERSION` | Unsupported `proof_version` |
| 1002 | `INVALID_PROOF_TYPE` | `proof_type` not allowed |
| 1003 | `REQUIRED_FIELD_MISSING` | Required proof field absent |
| 1004 | `FIELD_LENGTH_INVALID` | Fixed-size field length mismatch |
| 1005 | `HASH_DERIVATION_MISMATCH` | Recomputed hash/proof_id does not match |
| 1100 | `POLICY_NOT_FOUND` | Active policy not resolvable |
| 1101 | `POLICY_VERSION_STALE` | Non-active policy version used |
| 1102 | `POLICY_HASH_MISMATCH` | Proof/policy hash mismatch |
| 1103 | `POLICY_CONTEXT_MISMATCH` | Tier/class context inconsistent |
| 1104 | `TIER_NOT_FOUND` | Tier missing in active policy |
| 1105 | `SUBSCRIPTION_CLASS_NOT_FOUND` | Subscription class missing |
| 1106 | `DEGRADED_NOT_ALLOWED` | Degraded path not policy-authorized |
| 1107 | `MAX_DEGRADED_RATIO_EXCEEDED` | Epoch degraded cap exceeded |
| 1200 | `SNAPSHOT_NOT_FOUND` | Referenced snapshot missing |
| 1201 | `SNAPSHOT_UNAVAILABLE` | Snapshot source unavailable |
| 1202 | `SNAPSHOT_DRIFT` | Snapshot used for checks differs from proof |
| 1203 | `SNAPSHOT_DUPLICATE_OPERATOR` | Duplicate operator in snapshot signer universe |
| 1204 | `SNAPSHOT_DUPLICATE_BLS_KEY` | Duplicate BLS key in snapshot signer universe |
| 1205 | `BITMAP_LENGTH_INVALID` | Bitmap length not equal to expected signer-universe size |
| 1206 | `BITMAP_COUNT_MISMATCH` | `signer_count` != `popcount(bitmap)` |
| 1207 | `BITMAP_STAKE_MISMATCH` | `signer_stake_sum` mismatch |
| 1208 | `SIGNER_INDEX_OUT_OF_RANGE` | Bitmap references out-of-range signer index |
| 1209 | `SIGNER_REPLAY` | Duplicate signer contribution detected |
| 1300 | `DOMAIN_MISMATCH` | Signed domain/tag mismatch |
| 1301 | `INVALID_BLS_PUBLIC_KEY` | Invalid public key encoding/content |
| 1302 | `INVALID_BLS_SIGNATURE` | Aggregate BLS verification failed |
| 1303 | `AGGREGATE_PUBKEY_MISMATCH` | Aggregate pubkey inconsistent with bitmap set |
| 1304 | `QUORUM_NOT_MET` | Stake quorum not satisfied |
| 1305 | `NO_QUORUM_TIMEOUT` | Window closed without quorum |
| 1306 | `NO_CANDIDATE_ROOT` | No valid winning root candidate |
| 1307 | `NONCE_REPLAY` | Coordinator nonce duplicated/regressed |
| 1400 | `LATE_ATTESTATION_DROPPED` | Attestation arrived after close/grace |
| 1401 | `WINDOW_RECORD_DUPLICATE` | Duplicate operator-window record write |
| 1402 | `DUPLICATE_WINDOW_ACCOUNTING` | Same window accounted more than once |
| 1403 | `PROOF_LINK_MISSING` | Accounting references missing/invalid proof |
| 1404 | `OUT_OF_ORDER_SETTLEMENT` | Settlement attempted before prerequisites |
| 1405 | `SETTLEMENT_INPUT_GAP` | Missing required interval/window input |
| 1406 | `OVERFLOW_GUARD_TRIGGERED` | Arithmetic bounds check failed |

Reserved for future: `1500-1999`.

## Implementation notes

- These IDs are published to `configs/protocol/poc2/error-codes.v1.json` and loaded by the runtime through `operator-node/src/poc2.rs` (`ProtocolConstants::load`).
- The `ProofError` variants in `operator-node/src/poc2.rs` map to the named IDs listed above, and `operator-node/tests/window_consensus_proof_tests.rs` exercise the registry to keep the mapping aligned with the canonical encoding.
