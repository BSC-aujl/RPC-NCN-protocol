# RPC-NCN Implementation Specification

> **Status:** Design Specification (see POC Protocol v1 for current implementation)
> **Version:** 1.1
> **Last Updated:** January 2026

> ⚠️ **Important:** For the current POC implementation, refer to [**poc-protocol-v1-draft.md**](./poc-protocol-v1-draft.md).
> This document provides background context and future considerations.
> The POC protocol supersedes the detailed designs in this document.

This document provides detailed entity descriptions, flowcharts, derived requirements, and a proof of concept implementation plan for the RPC-NCN system.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Entity Descriptions](#entity-descriptions)
- [System Architecture Diagrams](#system-architecture-diagrams)
- [Component Flowcharts](#component-flowcharts)
- [Derived Requirements](#derived-requirements)
- [Consequence Analysis](#consequence-analysis)
- [Proof of Concept Plan](#proof-of-concept-plan)
- [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Current Implementation: POC Protocol v1

The POC focuses on **integrity verification via stake-weighted consensus**. See [poc-protocol-v1-draft.md](./poc-protocol-v1-draft.md) for the complete specification.

| Component | POC Implementation | Future (v2) |
|-----------|-------------------|-------------|
| **NCN Framework** | Jito Restaking | Full Jito integration |
| **Verification** | Chained hash attestations | Merkle proofs |
| **Latency Proofs** | Deferred | Peer attestation network |
| **Consensus** | Gateway-coordinated, ≥2/3 stake | Threshold signatures |
| **Penalty Model** | Offense tracking (no slashing) | Jito slashing when available |

### Key POC Decisions

| Decision | Rationale |
|----------|-----------|
| Interval-based attestation | Amortize on-chain costs |
| First response as initial hash | Async finalize_interval compatibility |
| Epoch-based rewards | Align with Jito NCN template |
| Offense-based penalties | Jito slashing not yet available |
| Single supported mint | Simplify for POC |

---

## Entity Descriptions

### Core Entities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RPC-NCN ENTITY MODEL                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │      STAKER      │    │      VAULT       │    │    OPERATOR      │      │
│  │                  │    │                  │    │                  │      │
│  │ • pubkey         │───▶│ • pubkey         │───▶│ • pubkey         │      │
│  │ • stake_amount   │    │ • total_stake    │    │ • stake          │      │
│  │ • delegate_to    │    │ • operators[]    │    │ • rpc_endpoint   │      │
│  │ • rewards_earned │    │ • slash_rules    │    │ • region         │      │
│  │                  │    │ • fee_split      │    │ • performance    │      │
│  └──────────────────┘    └──────────────────┘    └────────┬─────────┘      │
│                                                           │                │
│                                                           ▼                │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │   RPC_REQUEST    │    │   RPC_RESPONSE   │    │     PROOF        │      │
│  │                  │    │                  │    │                  │      │
│  │ • request_id     │───▶│ • request_id     │───▶│ • proof_type     │      │
│  │ • method (any)   │    │ • data           │    │ • merkle_path[]  │      │
│  │ • params         │    │ • slot           │    │ • bank_hash      │      │
│  │ • subscription   │    │ • operator_sig   │    │ • signatures[]   │      │
│  │ • latency_sla    │    │ • timestamp      │    │ • timestamp      │      │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘      │
│                                                                             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │  SUBSCRIPTION    │    │ VERIFICATION_CFG │    │   REQUEST_LOG    │      │
│  │                  │    │                  │    │                  │      │
│  │ • subscriber_id  │───▶│ • level          │───▶│ • timestamp      │      │
│  │ • api_key        │    │ • threshold      │    │ • method         │      │
│  │ • verify_level   │    │ • latency_sla    │    │ • response_hash  │      │
│  │ • latency_sla    │    │ • insurance      │    │ • operators[]    │      │
│  │ • is_active      │    │ • operators[]    │    │ • latency_ms     │      │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘      │
│                                                                             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │  ATTESTATION     │    │    SLASH_EVENT   │    │    REWARD        │      │
│  │                  │    │                  │    │                  │      │
│  │ • attester       │    │ • operator       │    │ • recipient      │      │
│  │ • subject        │    │ • evidence       │    │ • amount         │      │
│  │ • metric         │    │ • slash_amount   │    │ • epoch          │      │
│  │ • value          │    │ • reason         │    │ • source         │      │
│  │ • signature      │    │ • executed       │    │ • type           │      │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Entity Definitions

#### 1. Staker

```rust
/// Capital provider who delegates stake to the NCN
pub struct Staker {
    /// Unique identifier (Solana pubkey)
    pub pubkey: Pubkey,

    /// Total SOL/tokens staked
    pub stake_amount: u64,

    /// Vault(s) stake is delegated to
    pub delegations: Vec<Delegation>,

    /// Accumulated rewards (claimable)
    pub rewards_pending: u64,

    /// Slashing history
    pub slashed_amount: u64,

    /// Timestamp of first stake
    pub staked_at: i64,
}

pub struct Delegation {
    pub vault: Pubkey,
    pub amount: u64,
    pub locked_until: i64,
}
```

**Relationships:**
- Staker → Vault (1:N): A staker can delegate to multiple vaults
- Staker → Reward (1:N): A staker receives rewards from their delegations

**Invariants:**
- `stake_amount >= Σ(delegations.amount)`
- `rewards_pending >= 0`
- Cannot unstake while `locked_until > current_time`

---

#### 2. Vault

```rust
/// Aggregates stake and manages delegation to operators
pub struct Vault {
    /// Unique identifier
    pub pubkey: Pubkey,

    /// Total stake in vault
    pub total_stake: u64,

    /// Operators this vault delegates to
    pub operator_delegations: Vec<OperatorDelegation>,

    /// Slashing configuration
    pub slash_config: SlashConfig,

    /// Fee distribution parameters
    pub fee_config: FeeConfig,

    /// Vault authority (governance)
    pub authority: Pubkey,

    /// Is vault accepting new deposits
    pub is_active: bool,
}

pub struct OperatorDelegation {
    pub operator: Pubkey,
    pub delegated_amount: u64,
    pub delegation_weight: u16, // basis points (0-10000)
}

pub struct SlashConfig {
    /// Maximum slashable per incident (basis points)
    pub max_slash_bps: u16,

    /// Minimum evidence required for slashing
    pub min_attestations: u8,

    /// Challenge period before slash execution
    pub challenge_period_slots: u64,
}

pub struct FeeConfig {
    /// Operator share (basis points)
    pub operator_share_bps: u16,

    /// Staker share (basis points)
    pub staker_share_bps: u16,

    /// Protocol share (basis points)
    pub protocol_share_bps: u16,
}
```

**Relationships:**
- Vault → Staker (N:M): Multiple stakers delegate to vaults
- Vault → Operator (1:N): Vault delegates to multiple operators
- Vault → NCN_Program (N:1): Vault is registered with NCN program

**Invariants:**
- `operator_share_bps + staker_share_bps + protocol_share_bps == 10000`
- `Σ(operator_delegations.delegation_weight) <= 10000`
- `total_stake >= Σ(operator_delegations.delegated_amount)`

---

#### 3. Subscription (Per-Subscription Verification)

```rust
/// Per-subscriber verification configuration
pub struct Subscription {
    /// Unique identifier
    pub subscriber_id: String,

    /// API key for authentication
    pub api_key: [u8; 32],

    /// Verification level (Basic, Standard, Premium, Enterprise)
    pub verification_level: VerificationLevel,

    /// Latency SLA requirement (ms)
    pub latency_sla_ms: u32,

    /// Operator threshold for multi-sig
    pub operator_threshold: u8,

    /// Insurance coverage amount (if Enterprise)
    pub insurance_coverage_usd: u64,

    /// Monthly request limit
    pub monthly_request_limit: u64,

    /// Requests served this month
    pub requests_this_month: u64,

    /// Is subscription active
    pub is_active: bool,
}

#[derive(Clone, Copy)]
pub enum VerificationLevel {
    /// Single operator signature - fastest, lowest cost
    Basic,
    /// Multi-operator threshold (e.g., 3-of-5)
    Standard,
    /// Merkle proof + multi-sig - highest assurance
    Premium,
    /// Insurance-backed with SLA guarantees
    Enterprise,
}
```

**Verification Level Pricing:**

| Level | Operators | Proof Type | Latency SLA | Price/Request |
|-------|-----------|------------|-------------|---------------|
| Basic | 1 | Signature | 100ms | $0.0001 |
| Standard | 3-5 | Multi-sig | 50ms | $0.0005 |
| Premium | 5+ | Merkle + Multi-sig | 20ms | $0.001 |
| Enterprise | 7+ | Full + Insurance | 10ms | $0.005 |

**Per-Subscription Request Flow:**
1. Client sends request with API key
2. Gateway looks up subscription → verification level
3. Gateway selects operators based on level threshold
4. Response aggregation based on subscription requirements
5. Billing tracked per subscription

---

#### 4. Operator

> **POC Implementation:** See [poc-protocol-v1-draft.md](./poc-protocol-v1-draft.md#operator-account-updated) for the simplified POC account structure.

```rust
/// RPC infrastructure provider participating in the NCN (POC version)
#[account]
pub struct Operator {
    pub owner: Pubkey,
    pub operator_id: String,
    pub signing_pubkey: [u8; 32],

    // Jito Restaking integration
    pub jito_operator_account: Pubkey,
    pub stake: u64,  // Synced from Jito vault delegations

    pub is_active: bool,

    // Epoch tracking
    pub current_epoch: u64,
    pub correct_intervals: u64,  // Reset each epoch

    // Offense tracking (persistent)
    pub offense_count: u8,

    pub bump: u8,
}
```

**POC Simplifications:**
- No complex `PerformanceMetrics` - just `correct_intervals`
- No `total_slashed` - offense-based penalties instead
- Stake from Jito delegations via `sync_operator_stake`

**Relationships:**
- Operator → Jito Operator (1:1): References Jito restaking account
- Operator → Attestation (1:N): Submits attestations per interval
- Operator → Interval (N:M): Participates in multiple intervals

**Invariants:**
- `is_active == true` requires `stake >= min_operator_stake`
- `offense_count >= 3` triggers suspension
- `correct_intervals` reset at epoch end

---

#### 4. RPC Request/Response

```rust
/// Client request for verified RPC data
pub struct VerifiedRpcRequest {
    /// Unique request identifier
    pub request_id: [u8; 32],

    /// Standard JSON-RPC request object (method, params, id, jsonrpc)
    pub rpc_request: serde_json::Value,

    /// Requested verification level
    pub verification_level: VerificationLevel,

    /// Latency requirements
    pub latency_config: LatencyConfig,

    /// Client's timestamp
    pub client_timestamp: i64,
}

/// Wrapper for any standard Solana RPC method
pub type RpcMethod = String;

pub enum VerificationLevel {
    /// Single operator signature
    Basic,
    /// Multiple operator signatures (threshold)
    Standard { min_operators: u8 },
    /// Full Merkle proof (per request)
    Premium,
    /// Subscription-based verification (probabilistic or periodic)
    Subscription {
        tier_id: String,
        verification_rate_bps: u16, // e.g. verify 1% of requests
    },
    /// Insurance-backed response
    Enterprise { coverage_amount: u64 },
}

pub struct LatencyConfig {
    /// Maximum acceptable latency (ms)
    pub max_latency_ms: u32,

    /// Whether to require latency proof
    pub require_latency_proof: bool,
}
```

```rust
/// Verified response from NCN
pub struct VerifiedRpcResponse {
    /// Matches request_id
    pub request_id: [u8; 32],

    /// Response data
    pub data: Vec<u8>,

    /// Solana slot of the data
    pub slot: u64,

    /// Verification proof
    pub proof: ResponseProof,

    /// Latency attestation (if requested)
    pub latency_proof: Option<LatencyProof>,

    /// Response timestamp
    pub timestamp: i64,
}

pub struct ResponseProof {
    /// Type of proof
    pub proof_type: ProofType,

    /// Operator signatures
    pub signatures: Vec<OperatorSignature>,

    /// Merkle proof (if applicable)
    pub merkle_proof: Option<MerkleProof>,
}

pub struct MerkleProof {
    /// Account data hash
    pub leaf: [u8; 32],

    /// Merkle path to root
    pub proof_path: Vec<[u8; 32]>,

    /// Bank hash (root)
    pub bank_hash: [u8; 32],

    /// Slot of bank hash
    pub slot: u64,

    /// Source validators attesting to bank hash
    pub bank_hash_attestations: Vec<ValidatorAttestation>,
}

pub struct ValidatorAttestation {
    pub validator: Pubkey,
    pub signature: Signature,
    pub stake_weight: u64,
}
```

---

#### 5. Latency Attestation

```rust
/// Peer-to-peer latency measurement attestation
pub struct LatencyAttestation {
    /// Operator being measured
    pub subject: Pubkey,

    /// Operator doing the measuring
    pub attester: Pubkey,

    /// Measurement type
    pub metric_type: LatencyMetricType,

    /// Measured value (microseconds)
    pub value_us: u64,

    /// Measurement timestamp
    pub timestamp: i64,

    /// Attester's signature
    pub signature: Signature,

    /// Measurement proof (challenge-response)
    pub measurement_proof: MeasurementProof,
}

pub enum LatencyMetricType {
    /// Round-trip time to operator
    PeerRtt,
    /// Processing time for standard query
    ProcessingTime,
    /// End-to-end response time
    EndToEnd,
}

pub struct MeasurementProof {
    /// Random challenge sent
    pub challenge: [u8; 32],

    /// Signed response from subject
    pub response: [u8; 64],

    /// Request timestamp (attester)
    pub request_time: i64,

    /// Response received timestamp (attester)
    pub response_time: i64,
}
```

---

## System Architecture Diagrams

### High-Level Architecture (POC Protocol v1)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      RPC-NCN SYSTEM ARCHITECTURE (POC)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐                                                           │
│  │     CLIENTS     │                                                           │
│  │  (Wallets/dApps/│                                                           │
│  │   Trading Bots) │                                                           │
│  └────────┬────────┘                                                           │
│           │                                                                     │
│           │ JSON-RPC (any method)                                              │
│           ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐               │
│  │                 GATEWAY (stateless router)                  │               │
│  │                                                             │               │
│  │  • Routes requests to all operators                         │               │
│  │  • Aggregates responses by hash                             │               │
│  │  • Forwards correct response when ≥2/3 stake agrees         │               │
│  │  • Signals interval start/end to operators                  │               │
│  │                                                             │               │
│  │  Does NOT: submit txs, intermediate operator↔chain          │               │
│  └────────────────────────────┬────────────────────────────────┘               │
│                               │                                                 │
│           ┌───────────────────┼───────────────────┐                            │
│           │ requests/responses│                   │                            │
│           ▼                   ▼                   ▼                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                      │
│  │  OPERATOR A  │    │  OPERATOR B  │    │  OPERATOR C  │                      │
│  │  stake = X   │    │  stake = Y   │    │  stake = Z   │                      │
│  │              │    │              │    │              │                      │
│  │ ┌──────────┐ │    │ ┌──────────┐ │    │ ┌──────────┐ │                      │
│  │ │RPC Proxy │ │    │ │RPC Proxy │ │    │ │RPC Proxy │ │                      │
│  │ └──────────┘ │    │ └──────────┘ │    │ └──────────┘ │                      │
│  │ ┌──────────┐ │    │ ┌──────────┐ │    │ ┌──────────┐ │                      │
│  │ │Hash Chain│ │    │ │Hash Chain│ │    │ │Hash Chain│ │                      │
│  │ └──────────┘ │    │ └──────────┘ │    │ └──────────┘ │                      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                      │
│         │                   │                   │                              │
│         │ DIRECT: submit_attestation, sync_operator_stake                      │
│         └───────────────────┼───────────────────┘                              │
│                             │                                                   │
│                             ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────┐               │
│  │                 SOLANA ON-CHAIN (RPC-NCN Program)           │               │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │               │
│  │  │     Ncn      │  │   Interval   │  │   Operator   │      │               │
│  │  │   Account    │  │   Account    │  │   Account    │      │               │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │               │
│  │                                                             │               │
│  │  Operators submit attestations directly (not via gateway)  │               │
│  │  finalize_interval / finalize_epoch called by crank        │               │
│  └────────────────────────────┬────────────────────────────────┘               │
│                               │                                                 │
│                               ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────┐               │
│  │                 JITO RESTAKING PROGRAM                       │               │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │               │
│  │  │     NCN      │  │   Operator   │  │    Vault     │      │               │
│  │  │   (Jito)     │  │   (Jito)     │  │  Delegations │      │               │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │               │
│  └─────────────────────────────────────────────────────────────┘               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram (POC Protocol v1)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PART 1: REQUEST/RESPONSE FLOW (via Gateway)                                   │
│  ─────────────────────────────────────────────                                  │
│                                                                                 │
│  ┌──────────┐                                                                   │
│  │  Client  │                                                                   │
│  └────┬─────┘                                                                   │
│       │ 1. JSON-RPC Request                                                    │
│       ▼                                                                         │
│  ┌──────────────────────────────────────────────────┐                          │
│  │           Gateway (stateless router)             │                          │
│  │  2. Route request to all operators               │                          │
│  └────┬─────────────┬─────────────┬─────────────────┘                          │
│       ▼             ▼             ▼                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                                       │
│  │ Op. A   │   │ Op. B   │   │ Op. C   │                                       │
│  │ 3.Query │   │ 3.Query │   │ 3.Query │                                       │
│  │ 4.Hash  │   │ 4.Hash  │   │ 4.Hash  │                                       │
│  │ 5.Chain │   │ 5.Chain │   │ 5.Chain │                                       │
│  └────┬────┘   └────┬────┘   └────┬────┘                                       │
│       │ (response, hash)        │                                               │
│       ▼             ▼             ▼                                             │
│  ┌──────────────────────────────────────────────────┐                          │
│  │           Gateway (aggregator)                   │                          │
│  │  6. Aggregate by hash, check ≥2/3 stake          │                          │
│  │  7. Forward correct response                     │                          │
│  └────────────────────┬─────────────────────────────┘                          │
│                       │                                                         │
│                       ▼                                                         │
│                  ┌──────────┐                                                   │
│                  │  Client  │                                                   │
│                  └──────────┘                                                   │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  PART 2: ATTESTATION FLOW (Direct to Chain - NOT via Gateway)                  │
│  ─────────────────────────────────────────────────────────────                  │
│                                                                                 │
│     Gateway signals                                                             │
│     "interval end"                                                              │
│          │                                                                      │
│          ▼                                                                      │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                                       │
│  │ Op. A   │   │ Op. B   │   │ Op. C   │                                       │
│  │         │   │         │   │         │                                       │
│  │ Build   │   │ Build   │   │ Build   │                                       │
│  │ tx with │   │ tx with │   │ tx with │                                       │
│  │ submit_ │   │ submit_ │   │ submit_ │                                       │
│  │attestation  │attestation  │attestation                                      │
│  └────┬────┘   └────┬────┘   └────┬────┘                                       │
│       │             │             │                                             │
│       │    DIRECT TO SOLANA (not via gateway)                                  │
│       └─────────────┼─────────────┘                                             │
│                     ▼                                                           │
│  ┌──────────────────────────────────────────────────┐                          │
│  │               Solana On-Chain                    │                          │
│  │                                                   │                          │
│  │  submit_attestation (called by each operator)    │                          │
│  │  finalize_interval (called by crank)             │                          │
│  │  finalize_epoch (called by crank)                │                          │
│  └──────────────────────────────────────────────────┘                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Flowcharts

### Flowchart 1: Verified RPC Request Processing

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│               VERIFIED RPC REQUEST PROCESSING FLOWCHART                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                        ┌─────────────────┐                                      │
│                        │  Client Request │                                      │
│                        │    Received     │                                      │
│                        └────────┬────────┘                                      │
│                                 │                                               │
│                                 ▼                                               │
│                        ┌─────────────────┐                                      │
│                        │ Parse & Validate│                                      │
│                        │    Request      │                                      │
│                        └────────┬────────┘                                      │
│                                 │                                               │
│                    ┌────────────┴────────────┐                                  │
│                    │                         │                                  │
│                    ▼                         ▼                                  │
│           ┌──────────────┐          ┌──────────────┐                           │
│           │  Basic/Std   │          │   Premium/   │                           │
│           │ Verification │          │  Enterprise  │                           │
│           └──────┬───────┘          └──────┬───────┘                           │
│                  │                         │                                    │
│                  ▼                         ▼                                    │
│     ┌────────────────────┐    ┌────────────────────┐                           │
│     │ Route to single/   │    │ Route to multiple  │                           │
│     │ threshold operators│    │  operators (3+)    │                           │
│     └──────────┬─────────┘    └──────────┬─────────┘                           │
│                │                         │                                      │
│                ▼                         ▼                                      │
│     ┌────────────────────┐    ┌────────────────────┐                           │
│     │ Operator queries   │    │ Operators query    │                           │
│     │ Solana RPC         │    │ Solana + generate  │                           │
│     │                    │    │ Merkle proofs      │                           │
│     └──────────┬─────────┘    └──────────┬─────────┘                           │
│                │                         │                                      │
│                ▼                         ▼                                      │
│     ┌────────────────────┐    ┌────────────────────┐                           │
│     │ Sign response with │    │ Generate full      │                           │
│     │ operator key       │    │ verification proof │                           │
│     └──────────┬─────────┘    └──────────┬─────────┘                           │
│                │                         │                                      │
│                └───────────┬─────────────┘                                      │
│                            │                                                    │
│                            ▼                                                    │
│                ┌────────────────────────┐                                       │
│                │ Aggregate at Gateway   │                                       │
│                │ - Compare responses    │                                       │
│                │ - Verify signatures    │                                       │
│                │ - Check consensus      │                                       │
│                └────────────┬───────────┘                                       │
│                             │                                                   │
│              ┌──────────────┴──────────────┐                                    │
│              │                             │                                    │
│              ▼                             ▼                                    │
│   ┌──────────────────┐          ┌──────────────────┐                           │
│   │ Consensus        │          │ Dispute          │                           │
│   │ Achieved         │          │ Detected         │                           │
│   └────────┬─────────┘          └────────┬─────────┘                           │
│            │                             │                                      │
│            ▼                             ▼                                      │
│   ┌──────────────────┐          ┌──────────────────┐                           │
│   │ Return verified  │          │ Trigger dispute  │                           │
│   │ response         │          │ resolution       │                           │
│   └──────────────────┘          └──────────────────┘                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Flowchart 2: Latency Attestation Process

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    LATENCY ATTESTATION FLOWCHART                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────┐                              ┌─────────────┐                  │
│   │ Operator A  │                              │ Operator B  │                  │
│   │ (Attester)  │                              │ (Subject)   │                  │
│   └──────┬──────┘                              └──────┬──────┘                  │
│          │                                           │                          │
│          │  1. Generate random challenge             │                          │
│          │     nonce = random(32 bytes)              │                          │
│          │     t1 = timestamp()                      │                          │
│          │                                           │                          │
│          │─────── Challenge(nonce) ─────────────────▶│                          │
│          │                                           │                          │
│          │                                           │  2. Sign challenge       │
│          │                                           │     response = sign(     │
│          │                                           │       nonce,             │
│          │                                           │       operator_key       │
│          │                                           │     )                    │
│          │                                           │                          │
│          │◀────── Response(signature) ──────────────│                          │
│          │                                           │                          │
│          │  3. Record timing                         │                          │
│          │     t2 = timestamp()                      │                          │
│          │     rtt = t2 - t1                         │                          │
│          │                                           │                          │
│          │  4. Create attestation                    │                          │
│          │     attestation = {                       │                          │
│          │       subject: B,                         │                          │
│          │       attester: A,                        │                          │
│          │       value_us: rtt,                      │                          │
│          │       proof: {nonce, response, t1, t2}    │                          │
│          │     }                                     │                          │
│          │                                           │                          │
│          ▼                                           │                          │
│   ┌─────────────────────┐                            │                          │
│   │ Sign & broadcast    │                            │                          │
│   │ attestation to      │                            │                          │
│   │ consensus layer     │                            │                          │
│   └──────────┬──────────┘                            │                          │
│              │                                       │                          │
│              ▼                                       │                          │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │                    CONSENSUS LAYER                               │          │
│   │                                                                  │          │
│   │  5. Aggregate attestations from multiple attesters               │          │
│   │                                                                  │          │
│   │     Attestations for Operator B:                                │          │
│   │     ┌─────────────┬──────────────┬─────────────┐               │          │
│   │     │ Attester A  │ Attester C   │ Attester D  │               │          │
│   │     │ RTT: 8ms    │ RTT: 9ms     │ RTT: 7ms    │               │          │
│   │     └─────────────┴──────────────┴─────────────┘               │          │
│   │                                                                  │          │
│   │  6. Calculate median/aggregate                                   │          │
│   │     Operator B P50 RTT: 8ms                                     │          │
│   │                                                                  │          │
│   │  7. Detect anomalies                                             │          │
│   │     - Outlier measurements                                       │          │
│   │     - Collusion patterns                                         │          │
│   │     - Selective behavior                                         │          │
│   │                                                                  │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│              │                                                                  │
│              ▼                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │                    SOLANA ON-CHAIN                               │          │
│   │                                                                  │          │
│   │  8. Commit aggregated latency metrics                            │          │
│   │     - Update operator performance records                        │          │
│   │     - Trigger slashing if SLA violated                          │          │
│   │                                                                  │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Flowchart 3: Offense Tracking (POC Model)

> **Note:** Slashing is deferred until Jito slashing support is available.
> The POC uses an offense-based model with proportional reward reduction.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      OFFENSE TRACKING FLOWCHART (POC)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                    ┌────────────────────────┐                                   │
│                    │   Interval Finalized   │                                   │
│                    └───────────┬────────────┘                                   │
│                                │                                                │
│                                ▼                                                │
│                    ┌────────────────────────┐                                   │
│                    │ Operator hash matches  │                                   │
│                    │ consensus hash?        │                                   │
│                    └───────────┬────────────┘                                   │
│                                │                                                │
│              ┌─────────────────┴─────────────────┐                              │
│              │                                   │                              │
│              ▼ YES                              ▼ NO                            │
│     ┌─────────────────┐               ┌─────────────────┐                      │
│     │ correct_intervals               │ No change       │                      │
│     │ += 1                            │ (interval       │                      │
│     │                                 │ counts as       │                      │
│     │                                 │ failed)         │                      │
│     └─────────────────┘               └─────────────────┘                      │
│                                                                                 │
│                                                                                 │
│                    ┌────────────────────────┐                                   │
│                    │   EPOCH BOUNDARY       │                                   │
│                    └───────────┬────────────┘                                   │
│                                │                                                │
│                                ▼                                                │
│                    ┌────────────────────────┐                                   │
│                    │ correct_intervals >=   │                                   │
│                    │ epoch_total / 2 ?      │                                   │
│                    └───────────┬────────────┘                                   │
│                                │                                                │
│              ┌─────────────────┴─────────────────┐                              │
│              │                                   │                              │
│              ▼ YES (≥50%)                       ▼ NO (<50%)                     │
│     ┌─────────────────┐               ┌─────────────────┐                      │
│     │ offense_count   │               │ offense_count   │                      │
│     │ -= 1 (min 0)    │               │ += 1            │                      │
│     │                 │               │                 │                      │
│     │ REWARD:         │               │ IF count >= 3:  │                      │
│     │ proportional    │               │   SUSPENDED     │                      │
│     └─────────────────┘               └─────────────────┘                      │
│                                                                                 │
│                                                                                 │
│  REWARD FORMULA:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  epoch_reward = epoch_revenue                                           │   │
│  │      × (correct_intervals / epoch_total_intervals)                      │   │
│  │      × (stake / total_stake)                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Future: Slashing (v2)

When Jito slashing becomes available, the POC offense model can be extended:
- Integrate via `NcnVaultSlasherTicket`
- Define slashing conditions for egregious behavior
- Keep offense model for minor failures

---

## Derived Requirements

### Functional Requirements (POC Protocol v1)

#### FR-1: Verified RPC Service

| ID | Requirement | POC Status | Notes |
|----|-------------|------------|-------|
| FR-1.1 | System SHALL proxy any JSON-RPC method | ✅ Implemented | Generic proxy |
| FR-1.2 | System SHALL verify via stake-weighted consensus (≥2/3 stake) | ✅ Implemented | Gateway + on-chain |
| FR-1.3 | System SHALL support ED25519 signature verification | ✅ Implemented | Via precompile or brine-ed25519 |
| FR-1.4 | System MAY support Merkle proof verification | ⏳ Deferred | v2 enhancement |
| FR-1.5 | System MAY support threshold signatures | ⏳ Deferred | For N > 100 operators |

#### FR-2: Latency Proofs

| ID | Requirement | POC Status | Notes |
|----|-------------|------------|-------|
| FR-2.1 | System SHALL implement peer-to-peer latency measurement | ⏳ Deferred | v2 feature |
| FR-2.2 | Latency measurements SHALL include cryptographic proof | ⏳ Deferred | v2 feature |
| FR-2.3 | System MAY export latency metrics via Prometheus | ⏳ Optional | Monitoring |

#### FR-3: Economic Security

| ID | Requirement | POC Status | Notes |
|----|-------------|------------|-------|
| FR-3.1 | Operators SHALL have stake from Jito vault delegations | ✅ Implemented | sync_operator_stake |
| FR-3.2 | System SHALL use offense-based penalties | ✅ Implemented | Replaces slashing |
| FR-3.3 | System SHALL distribute rewards proportionally | ✅ Implemented | Epoch-based |
| FR-3.4 | System SHALL suspend operators after 3 offenses | ✅ Implemented | offense_count |
| FR-3.5 | System MAY support Jito slashing | ⏳ Deferred | When Jito slashing is live |

#### FR-4: Operator Management

| ID | Requirement | POC Status | Notes |
|----|-------------|------------|-------|
| FR-4.1 | Operators SHALL register with NCN and Jito operator reference | ✅ Implemented | jito_operator_account |
| FR-4.2 | System SHALL track correct_intervals per epoch | ✅ Implemented | Simplified metrics |
| FR-4.3 | System SHALL update offense_count at epoch end | ✅ Implemented | finalize_epoch |
| FR-4.4 | System SHALL support operator suspension | ✅ Implemented | is_active = false |

### Non-Functional Requirements

#### NFR-1: Performance

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR-1.1 | Verification overhead SHALL be <50ms | 50ms | Maintain RPC usability |
| NFR-1.2 | Gateway SHALL handle >10,000 requests/second | 10K RPS | Scale requirement |
| NFR-1.3 | Proof generation SHALL complete in <20ms | 20ms | Low latency |
| NFR-1.4 | System SHALL maintain 99.9% availability | 99.9% | Enterprise SLA |

#### NFR-2: Security

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR-2.1 | System SHALL tolerate up to f Byzantine operators | f < n/3 | BFT requirement |
| NFR-2.2 | Minimum operator stake SHALL be $10,000 equivalent | $10K | Economic barrier |
| NFR-2.3 | Cryptographic operations SHALL use audited libraries | - | Security |
| NFR-2.4 | System SHALL undergo security audit before mainnet | - | Best practice |

#### NFR-3: Scalability

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR-3.1 | System SHALL support 50+ operators | 50+ | Decentralization |
| NFR-3.2 | System SHALL handle 1B+ requests/month | 1B/mo | Market scale |
| NFR-3.3 | Gateway SHALL support horizontal scaling | - | Growth capacity |

---

## Consequence Analysis

### Consequence Matrix

| Decision | Positive Consequences | Negative Consequences | Mitigation |
|----------|----------------------|----------------------|------------|
| **Use Jito Restaking** | Faster launch, existing operators, battle-tested | Dependency risk, revenue sharing, constraints | Plan migration path |
| **Start with operator signatures** | Simple, fast, low overhead | Weaker security guarantee | Phase in Merkle proofs |
| **Peer attestation for latency** | Decentralized, BFT | Collusion risk, complexity | Randomization, staking |
| **Optimistic verification** | Fast responses | Dispute delay | Short challenge periods |
| **Enterprise-first GTM** | Faster revenue, high-value customers | Slower network effects | Scale to marketplace |

### Risk-Consequence Analysis

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        RISK-CONSEQUENCE MATRIX                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                              IMPACT                                             │
│                    LOW          MEDIUM         HIGH                             │
│              ┌──────────────┬──────────────┬──────────────┐                    │
│              │              │              │              │                    │
│         HIGH │   Monitor    │   Address    │  CRITICAL    │                    │
│              │              │              │              │                    │
│              │ • Gateway    │ • Operator   │ • Slashing   │                    │
│              │   latency    │   collusion  │   bug        │                    │
│              │   spikes     │              │              │                    │
│              ├──────────────┼──────────────┼──────────────┤                    │
│  LIKELIHOOD  │              │              │              │                    │
│       MEDIUM │   Accept     │   Monitor    │   Address    │                    │
│              │              │              │              │                    │
│              │ • Minor      │ • Jito       │ • Proof      │                    │
│              │   downtime   │   dependency │   forgery    │                    │
│              │              │              │              │                    │
│              ├──────────────┼──────────────┼──────────────┤                    │
│              │              │              │              │                    │
│          LOW │   Accept     │   Accept     │   Monitor    │                    │
│              │              │              │              │                    │
│              │ • Config     │ • Competitor │ • Protocol   │                    │
│              │   errors     │   response   │   exploit    │                    │
│              │              │              │              │                    │
│              └──────────────┴──────────────┴──────────────┘                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Consequence Details

#### 1. Jito Restaking Integration

**POC Implementation Status:** ✅ Integrated

| Aspect | POC Implementation | Notes |
|--------|-------------------|-------|
| **NCN Registration** | `jito_ncn_account` on Ncn | Reference to Jito NCN |
| **Operator Registration** | `jito_operator_account` on Operator | Reference to Jito Operator |
| **Stake Source** | `sync_operator_stake` instruction | Read from VaultOperatorDelegation |
| **Supported Mint** | Single `supported_mint` on Ncn | E.g., JitoSOL |
| **Slashing** | Offense-based (not Jito slashing) | Jito slashing not yet live |

**Key Alignments with Jito NCN Template:**

| Jito Pattern | RPC-NCN Implementation |
|--------------|------------------------|
| Epoch-based consensus | ✅ Epochs align with Solana |
| Stake-weighted voting (66%) | ✅ ≥2/3 stake for quorum |
| Reward distribution | ✅ At epoch end |
| Keepers (cranks) | ✅ Gateway + external cranks |

**Decision:** Full Jito integration for POC

#### 2. Merkle Proof Verification

**Consequences:**

| Aspect | Consequence | Impact |
|--------|-------------|--------|
| **Security** | Cryptographically verifiable | Positive: Strong guarantee |
| **Latency** | +10-20ms per request | Negative: Overhead |
| **Complexity** | Requires trusted bank hash source | Negative: Implementation |
| **Coverage** | Only works for account state | Negative: Limited methods |
| **Client** | Requires client verification logic | Negative: Integration burden |

**Decision:** Implement for Premium tier, defer for Basic tier

#### 3. Peer Attestation Network

**Consequences:**

| Aspect | Consequence | Impact |
|--------|-------------|--------|
| **Decentralization** | No trusted third party | Positive: Trust minimized |
| **Accuracy** | Aggregated measurements | Positive: Noise reduction |
| **Collusion** | Operators could coordinate | Negative: Attack vector |
| **Overhead** | Continuous probing traffic | Negative: Resource usage |
| **Scalability** | O(n²) measurements for n operators | Negative: Scale limits |

**Decision:** Implement with randomized probe assignments and stake-weighted reputation

---

## Proof of Concept Implementation

> **POC Code Available:** See `poc/` directory for complete implementations.

### Design Principles

1. **Generalized RPC:** The system proxies **any** JSON-RPC method without restriction. No method whitelist.
2. **Per-Subscription Verification:** Verification levels are configured per subscription, not globally.
3. **Tunable Economics:** All economic parameters are configurable and can be simulated.

### POC Components

| Component | Location | Description |
|-----------|----------|-------------|
| **Economic Simulation** | `poc/economic-simulation/` | Python model for tuning NCN parameters |
| **Operator Node** | `poc/operator-node/` | Rust RPC proxy with signing & attestation |
| **Gateway** | `poc/gateway/` | TypeScript request router and aggregator |
| **Client SDK** | `poc/client-sdk/` | TypeScript client with verification |
| **On-Chain Program** | `poc/contracts/` | Anchor program for registration & slashing |

---

## Proof of Concept Plan

### POC Scope

> **Current Scope:** See [poc-protocol-v1-draft.md](./poc-protocol-v1-draft.md) for the complete POC specification.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      POC SCOPE (Protocol v1)                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  IN SCOPE                                     DEFERRED TO v2                    │
│  ─────────                                    ──────────────                    │
│  ✓ Gateway-coordinated consensus (≥2/3 stake) ✗ Latency measurement            │
│  ✓ Chained hash attestations per interval     ✗ Threshold signatures           │
│  ✓ ED25519 signature verification             ✗ Merkle proofs for requests     │
│  ✓ Interval-based tracking                    ✗ Dispute resolution             │
│  ✓ Epoch-based reward distribution            ✗ BAM integration                │
│  ✓ Offense-based penalties                    ✗ Jito slashing                  │
│  ✓ Jito restaking integration (single mint)   ✗ Multi-mint weight tables       │
│  ✓ Any JSON-RPC method proxying               ✗ Insurance-backed responses     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### POC Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      POC ARCHITECTURE (Protocol v1)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         POC Components                                   │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  1. GATEWAY SERVICE (TypeScript/Node.js) - STATELESS ROUTER            │   │
│  │     ├── Routes JSON-RPC requests to all operators                      │   │
│  │     ├── Aggregates responses by hash                                   │   │
│  │     ├── Forwards response when ≥2/3 stake agrees                       │   │
│  │     ├── Signals interval start/end to operators                        │   │
│  │     └── Does NOT: submit txs, intermediate operator↔chain              │   │
│  │                                                                         │   │
│  │  2. OPERATOR NODE (Rust) - INTERACTS DIRECTLY WITH CHAIN              │   │
│  │     ├── Solana RPC proxy (responds to gateway)                        │   │
│  │     ├── Hash chaining (per response)                                   │   │
│  │     ├── Submits attestations DIRECTLY to NCN program                  │   │
│  │     └── Calls sync_operator_stake at epoch boundaries                 │   │
│  │                                                                         │   │
│  │  3. ON-CHAIN PROGRAMS (Anchor/Solana)                                  │   │
│  │     ├── NCN account with Jito integration                             │   │
│  │     ├── Operator accounts with offense tracking                       │   │
│  │     ├── Interval and OperatorAttestation accounts                     │   │
│  │     └── finalize_interval / finalize_epoch (crank-callable)           │   │
│  │                                                                         │   │
│  │  4. CLIENT SDK (TypeScript)                                            │   │
│  │     ├── Standard JSON-RPC client (points to gateway)                  │   │
│  │     └── Optional: verify operator signatures                           │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### POC Milestones (Protocol v1)

> **Reference:** See [poc-protocol-v1-draft.md](./poc-protocol-v1-draft.md#implementation-order) for detailed tasks.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      POC MILESTONES (Protocol v1)                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Phase 1: Smart Contract                                                        │
│  ───────────────────────                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ M1: Core On-Chain Accounts                                              │   │
│  │                                                                         │   │
│  │ Deliverables:                                                           │   │
│  │ • Ncn account with Jito integration fields                             │   │
│  │ • Operator account with offense tracking                               │   │
│  │ • Interval and OperatorAttestation accounts                            │   │
│  │ • initialize, register_operator instructions                           │   │
│  │                                                                         │   │
│  │ Success Criteria:                                                       │   │
│  │ • NCN can be initialized with Jito references                          │   │
│  │ • Operators can register with Jito operator reference                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Phase 2: Attestation Flow                                                      │
│  ─────────────────────────                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ M2: Interval Lifecycle                                                  │   │
│  │                                                                         │   │
│  │ Deliverables:                                                           │   │
│  │ • create_interval instruction                                          │   │
│  │ • submit_attestation with ED25519 verification                         │   │
│  │ • finalize_interval with quorum evaluation                             │   │
│  │ • sync_operator_stake from Jito                                        │   │
│  │                                                                         │   │
│  │ Success Criteria:                                                       │   │
│  │ • Operators can submit attestations                                    │   │
│  │ • Quorum is evaluated on-chain                                         │   │
│  │ • correct_intervals updated for matching hashes                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Phase 3: Epoch Management                                                      │
│  ─────────────────────────                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ M3: Rewards & Offense Tracking                                          │   │
│  │                                                                         │   │
│  │ Deliverables:                                                           │   │
│  │ • finalize_epoch instruction                                           │   │
│  │ • Reward distribution based on correct_intervals × stake              │   │
│  │ • Offense count updates                                                 │   │
│  │ • Operator suspension logic                                             │   │
│  │                                                                         │   │
│  │ Success Criteria:                                                       │   │
│  │ • Rewards distributed proportionally                                   │   │
│  │ • Offense tracking works correctly                                     │   │
│  │ • Operators suspended after 3 offenses                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Phase 4: Off-Chain Components                                                  │
│  ─────────────────────────────                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ M4: Gateway & Operator Node                                             │   │
│  │                                                                         │   │
│  │ Deliverables:                                                           │   │
│  │ • Gateway: per-request consensus coordination                          │   │
│  │ • Gateway: interval lifecycle (start/end signals)                      │   │
│  │ • Operator: hash chaining (record_response)                            │   │
│  │ • Operator: attestation submission                                     │   │
│  │                                                                         │   │
│  │ Success Criteria:                                                       │   │
│  │ • Gateway routes to operators, determines quorum                       │   │
│  │ • Operators chain hashes correctly                                     │   │
│  │ • Attestations submitted at interval end                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Phase 5: Integration                                                           │
│  ────────────────────                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ M5: End-to-End Testing                                                  │   │
│  │                                                                         │   │
│  │ Deliverables:                                                           │   │
│  │ • Jito testnet integration                                             │   │
│  │ • 3 operators on devnet/testnet                                        │   │
│  │ • Unit and integration tests                                           │   │
│  │ • Documentation                                                         │   │
│  │                                                                         │   │
│  │ Success Criteria:                                                       │   │
│  │ • End-to-end verified RPC flow working                                 │   │
│  │ • Rewards distributed correctly at epoch end                           │   │
│  │ • Demo-able to Jito and potential customers                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### POC Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Operator Node** | Rust | Performance, Solana ecosystem alignment |
| **Gateway** | TypeScript/Node.js | Rapid development, easy deployment |
| **On-Chain Programs** | Anchor (Rust) | Standard Solana development |
| **Client SDK** | TypeScript | Browser/Node.js compatibility |
| **Database** | SQLite (POC), PostgreSQL (prod) | Simple for POC |
| **RPC** | Helius/Triton devnet | Reliable devnet access |

### POC Resource Estimate

*Resource estimation is variable and dependent on team composition and velocity.*

---

## Implementation Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION ROADMAP                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Phase 1: POC & Validation                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ POC    │ POC    │ Customer                                              │   │
│  │ Dev    │ Demo   │ Validation                                            │   │
│  │        │        │                                                       │   │
│  │ • M1-M3│ • M4-M5│ • Customer                                            │   │
│  │        │        │   interviews                                          │   │
│  │        │        │ • Refine                                              │   │
│  │        │        │   requirements                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Phase 2: MVP Development                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Jito   │ Full   │ Security                                              │   │
│  │ Integ  │ Impl   │ Review                                                │   │
│  │        │        │                                                       │   │
│  │ • Vault│ • Merkle│ • Internal                                           │   │
│  │   setup│   proofs│   audit                                              │   │
│  │ • Ops  │ • Full │ • Bug                                                 │   │
│  │   onboard│ latency│  fixes                                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Phase 3: Beta Launch                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Testnet│ Beta   │ External                                              │   │
│  │ Deploy │ Users  │ Audit                                                 │   │
│  │        │        │                                                       │   │
│  │ • Ops  │ • First│ • Security                                            │   │
│  │   setup│   users│   audit                                               │   │
│  │        │        │ • Bug                                                 │   │
│  │        │        │   bounty                                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Phase 4: Mainnet Launch                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Mainnet│ Scale  │ Review                                                │   │
│  │ Launch │ Ops    │                                                       │   │
│  │        │        │                                                       │   │
│  │ • Ops  │ • Scale│ • Review                                              │   │
│  │   live │   up   │                                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix: Data Structures

### On-Chain Account Structures (POC Protocol v1)

> **Reference:** See [poc-protocol-v1-draft.md](./poc-protocol-v1-draft.md#on-chain-state) for the authoritative account definitions.

```rust
// programs/rpc-ncn/src/state.rs (POC)

use anchor_lang::prelude::*;

/// NCN configuration and state
#[account]
pub struct Ncn {
    pub authority: Pubkey,
    pub total_stake: u64,
    pub operator_count: u32,

    // Jito Restaking integration
    pub jito_ncn_account: Pubkey,
    pub supported_mint: Pubkey,
    pub mint_weight_bps: u64,

    // Interval tracking
    pub current_interval: u64,
    pub requests_per_interval: u64,

    // Epoch tracking
    pub current_epoch: u64,
    pub epoch_start_interval: u64,
    pub epoch_revenue: u64,

    // Config
    pub min_operator_stake: u64,
    pub reward_share_bps: RewardShareConfig,

    pub bump: u8,
}

/// Registered operator account
#[account]
pub struct Operator {
    pub owner: Pubkey,
    pub operator_id: String,
    pub signing_pubkey: [u8; 32],

    // Jito Restaking integration
    pub jito_operator_account: Pubkey,
    pub stake: u64,

    pub is_active: bool,

    // Epoch tracking
    pub current_epoch: u64,
    pub correct_intervals: u64,

    // Offense tracking
    pub offense_count: u8,

    pub bump: u8,
}

/// Interval consensus result
#[account]
pub struct Interval {
    pub ncn: Pubkey,
    pub interval_id: u64,
    pub epoch: u64,
    pub consensus_hash: Option<[u8; 32]>,
    pub quorum_bps: u16,
    pub finalized: bool,
    pub bump: u8,
}

/// Operator attestation for an interval
#[account]
pub struct OperatorAttestation {
    pub operator: Pubkey,
    pub interval_id: u64,
    pub state_hash: [u8; 32],
    pub signature: [u8; 64],
    pub bump: u8,
}
```

### Legacy Structures (Deferred to v2)

The following structures from the original design are deferred:

- `LatencyCommitment` - Requires peer attestation network
- `SlashProposal` - Requires Jito slashing support
- Complex `PerformanceMetrics` - Simplified to `correct_intervals`

---

## See Also

- [**POC Protocol v1 Draft**](./poc-protocol-v1-draft.md) — current protocol behavior draft
- [Public redacted implementation summary](./ncn-implementation-spec-public-redacted.md) — publication-safe high-level model
- [Protocol v1 summary](../../docs/specs/protocol-v1-summary.md) — concise public overview
- [System architecture context](../../docs/specs/system-architecture-context.md) — informative architecture framing
- [Open migration questions](../../governance/open-questions-from-source.md) — unresolved source migration decisions
