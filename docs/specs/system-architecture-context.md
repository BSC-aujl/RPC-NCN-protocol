# RPC-NCN Architecture

> **Status:** Informative architecture context (non-normative)
> **Last Updated:** December 2025

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RPC-NCN System                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│   │   Client    │────▶│   Gateway   │────▶│  Operators  │          │
│   │   (SDK)     │◀────│   (Router)  │◀────│  (RPC+Sign) │          │
│   └─────────────┘     └─────────────┘     └─────────────┘          │
│                              │                   │                  │
│                              ▼                   ▼                  │
│                       ┌─────────────────────────────────┐          │
│                       │      Solana Settlement          │          │
│                       │   (Staking / Slashing / Rewards)│          │
│                       └─────────────────────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Operators

Run RPC infrastructure and sign responses.

| Responsibility | Description |
|----------------|-------------|
| Serve RPC requests | Any JSON-RPC method |
| Sign responses | ED25519 attestation |
| Measure peers | Latency attestation network |
| Stake collateral | Economic security |

### 2. Gateway

Client-facing router and response aggregator.

| Function | Description |
|----------|-------------|
| Route requests | By subscription verification level |
| Aggregate responses | Multi-operator consensus |
| Verify signatures | Threshold check (e.g., 3-of-5) |
| Track metrics | Latency, success rates |

### 3. Settlement Layer (Solana)

On-chain economic security via Jito Restaking.

| Function | Description |
|----------|-------------|
| Stake custody | Operator collateral |
| Slashing | Penalties for misbehavior |
| Rewards | Fee distribution |
| Registry | Operator/subscription management |

## Verification Tiers

| Tier | Operators | Proof | Latency SLA | Price |
|------|-----------|-------|-------------|-------|
| Basic | 1 | Signature | 100ms | $0.0001/req |
| Standard | 3-5 | Multi-sig | 50ms | $0.0005/req |
| Premium | 5+ | Merkle + Multi-sig | 20ms | $0.001/req |
| Enterprise | 7+ | Full + Insurance | 10ms | $0.005/req |

## Data Flow: Verified RPC Request

```
1. Client → Gateway         Request with API key
2. Gateway                  Lookup subscription → verification level
3. Gateway → Operators      Fanout to N operators
4. Operators → Solana       Query RPC, sign response
5. Operators → Gateway      Return signed responses
6. Gateway                  Aggregate, verify consensus
7. Gateway → Client         Verified response + proof
```

## Latency Attestation

Operators measure each other via challenge-response:

```
Operator A                           Operator B
    │                                    │
    │─── Challenge(nonce) ──────────────▶│
    │         t1 = now()                 │
    │                                    │
    │◀── Response(sign(nonce)) ──────────│
    │         t2 = now()                 │
    │                                    │
    │   Attestation: RTT = t2 - t1       │
```

Attestations aggregated → P50/P95/P99 committed on-chain per epoch.

## Slashing Conditions

| Offense | Slash Rate | Evidence Required |
|---------|------------|-------------------|
| Incorrect data | 10% | Merkle proof mismatch |
| Latency violation | 1% | Peer attestation threshold |
| Downtime | 0.5% | Missing heartbeats |

## Technology Stack

| Component | Technology |
|-----------|------------|
| Operator Node | Rust |
| Gateway | TypeScript/Node.js |
| On-Chain Programs | Anchor (Rust) |
| Client SDK | TypeScript |
| Staking | Jito Restaking |

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Jito Restaking | Faster launch, existing operators, existing restaking infra |
| Peer attestation for latency | Decentralized, BFT |
| Per-subscription verification | Flexible SLAs |
| Optimistic verification (lower tiers) | Speed vs security tradeoff |

---

See [Implementation Spec](../../specs/core/ncn-implementation-spec.md) for detailed entity definitions and flowcharts.
