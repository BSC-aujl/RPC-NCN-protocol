---
layout: default
title: RPC-NCN Protocol
---

# RPC-NCN: Verifiable, high-assurance RPC for the Jito ecosystem

This site supports the proposal and discussion here:
- [Blocksize RPC-NCN — Verifiable high-assurance infrastructure for the Jito ecosystem](https://forum.jito.network/t/blocksize-rpc-ncn-verifiable-high-assurance-infrastructure-for-the-jito-ecosystem/928)

## Why this matters

RPC-NCN targets a concrete gap: high-value consumers need RPC responses they can verify, not only trust.

POC v1 focuses on:
- stake-weighted consensus (>= 2/3)
- operator attestations anchored on-chain
- offense-based penalties compatible with current Jito restaking reality

## POC snapshot

- Protocol version: **v0.5.2**
- Program ID (testnet): `DztacWhGG8zA8y75shaHa4bgmniqhUkBLb1AXEbwq4T4`
- Current implementation status: [POC Status](./poc-status.md)
- Visual proof artifacts: [Visualizations](./visualizations.md)

## Canonical protocol docs

| Purpose | Document |
|---|---|
| Normative POC protocol (canonical) | [`specs/core/poc-protocol-v1-draft.md`](../specs/core/poc-protocol-v1-draft.md) |
| Implementation-oriented protocol context | [`specs/core/ncn-implementation-spec.md`](../specs/core/ncn-implementation-spec.md) |
| Public summary | [`docs/specs/protocol-v1-summary.md`](./specs/protocol-v1-summary.md) |
| Architecture context | [`docs/specs/system-architecture-context.md`](./specs/system-architecture-context.md) |

## Alignment map (proposal ↔ implementation ↔ research)

| Layer | Current source of truth |
|---|---|
| Protocol contract | `RPC-NCN-protocol/specs/` |
| Runtime implementation | `RPC-NCN-core` (gateway/operator/contracts/tests) |
| Research rationale & trade-offs | `RPC-NCN-research` |

Repository links:
- Core: `https://github.com/BSC-aujl/RPC-NCN-core`
- Protocol: `https://github.com/BSC-aujl/RPC-NCN-protocol`
- Research: `https://github.com/BSC-aujl/RPC-NCN-research`

This protocol repo is the public-facing contract and governance surface.

## Governance and contribution

- [Contributing](./CONTRIBUTING.md)
- [Publication policy](../PUBLICATION_POLICY.md)
- [Migration checklist](./MIGRATION_CHECKLIST.md)
- [Open migration questions](../governance/open-questions-from-source.md)
