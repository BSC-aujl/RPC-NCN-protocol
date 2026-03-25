---
layout: default
title: POC v2 BLS Ciphersuite + Domain Tags
---

# POC v2 BLS Ciphersuite + Domain Tags

## Locked cryptography profile (V1)

| Item | Locked value |
|---|---|
| Curve | `BLS12-381` |
| Signature mode | Minimal-pubkey-size (`G1` pubkeys, `G2` signatures) |
| Sign/verify ciphersuite | `BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_` |
| Key PoP ciphersuite (registration) | `BLS_POP_BLS12381G2_XMD:SHA-256_SSWU_RO_POP_` |
| Canonical library family | `supranational/blst` (`min_pk`) |
| Public key serialization | 48-byte compressed `G1` (`bytes48`) |
| Signature serialization | 96-byte compressed `G2` (`bytes96`) |

All implementations MUST be byte-compatible with this profile and the golden vectors published in core.

## Domain tags (constants)

```text
BLS_DOMAIN_WINDOW_CONSENSUS_V1 = "RPCNCN:POC2:WINDOW_CONSENSUS:V1"
BLS_DOMAIN_OPERATOR_POP_V1     = "RPCNCN:POC2:OPERATOR_POP:V1"
```

Window consensus signatures MUST sign:

`message_bytes = UTF8(BLS_DOMAIN_WINDOW_CONSENSUS_V1) || 0x00 || signing_root`

where `signing_root` is defined in [proof encoding + proof_id](./proof-encoding-and-proof-id.html).

## Validation requirements

- Reject non-canonical compressed encodings.
- Reject identity/infinity keys or signatures.
- Require valid PoP before a BLS key is accepted into an active snapshot.
- Mixing ciphersuites or domain tags in the same network is invalid.
