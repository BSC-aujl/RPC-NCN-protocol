---
layout: default
title: POC Status
---

# POC implementation status snapshot

This page tracks implementation progress of the RPC-NCN proof-of-concept against protocol v1.

## Current state

| Component | Status | Evidence |
|---|---|---|
| On-chain program | ✅ Ready | Integration tests and testnet deployment |
| Gateway | ✅ Ready | Stake-weighted aggregation and interval services |
| Operator node | ✅ Ready | Hash chaining + attestation flow |
| E2E lifecycle | ✅ Ready | Interval/epoch flow verified |

## Test snapshot

| Suite | Count | Scope |
|---|---:|---|
| Contract integration | 40 | registration, attestations, quorum, state |
| Gateway unit tests | 109 | consensus, routing, interval/finalization, security |
| Protocol E2E | 16 | end-to-end protocol lifecycle |

## Protocol alignment

- Canonical protocol text: `specs/core/poc-protocol-v1-draft.md`
- Public implementation model (redacted): `specs/core/ncn-implementation-spec-public-redacted.md`
- Architecture context: [`specs/system-architecture-context.md`](./specs/system-architecture-context.md)

## Deployment snapshot

| Network | Program ID | Status |
|---|---|---|
| localnet | `B2Y3DxUw6LXGYGPeuyU4qiRmHM3AFpUqLbLgaethcV8r` | ✅ Active |
| testnet | `DztacWhGG8zA8y75shaHa4bgmniqhUkBLb1AXEbwq4T4` | ✅ Active |
| mainnet | - | ⏳ Pending |

## Visual artifacts

- [Architecture + component diagrams + implementation map](./visualizations.md)

## Known current limits

- no production slashing integration yet (offense model in POC)
- mainnet readiness pending additional hardening/audit/governance gates
