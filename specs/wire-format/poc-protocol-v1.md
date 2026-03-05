# RPC-NCN POC Protocol Specification v1

> **Focus:** Integrity verification via stake-weighted consensus
> **Deferred to v2:** Latency measurement, threshold signatures, dispute resolution

## Overview

The NCN ensures RPC response integrity through:
1. Gateway-coordinated per-request consensus (≥2/3 stake agrees on response)
2. Chained hash attestations signed by each operator
3. On-chain verification of attestations for reward distribution

## Consensus Model

### Definition

**Consensus is reached when operators holding ≥2/3 of total stake agree on a response hash.**

### Per-Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  PER-REQUEST CONSENSUS (Gateway-coordinated)                     │
│                                                                  │
│  1. Client sends request to gateway                              │
│  2. Gateway broadcasts request to all operators                  │
│  3. Each operator:                                               │
│     - Queries their RPC backend                                  │
│     - Computes response_hash = H(response)                       │
│     - Sends (response, response_hash) to gateway                 │
│  4. Gateway collects responses, tracks stake per response_hash   │
│  5. When ≥2/3 stake agrees on a hash → quorum reached           │
│  6. Gateway forwards correct response to client                  │
│  7. Each operator chains: H(prev_hash || my_response_hash)      │
└─────────────────────────────────────────────────────────────────┘
```

### Gateway Role

The gateway is a **stateless request router and response aggregator**:

```
         ┌─────────────┐
         │   Client    │
         └──────┬──────┘
                │ request
                ▼
         ┌─────────────┐
         │   Gateway   │ ← routes, aggregates, forwards
         └──────┬──────┘   signals interval boundaries
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Op A    │ │ Op B    │ │ Op C    │
│ stake=X │ │ stake=Y │ │ stake=Z │
└─────────┘ └─────────┘ └─────────┘
      │           │           │
      └───────────┼───────────┘
                  ▼
         ┌─────────────────┐
         │  NCN Program    │  ← operators submit attestations directly
         │   (on-chain)    │
         └─────────────────┘
```

**Gateway responsibilities:**
- Routes client requests to all operators
- Aggregates operator responses by hash
- Tracks stake weight per response hash (cached from on-chain)
- Forwards correct response to client when ≥2/3 stake agrees
- Signals interval start/end to operators

**Gateway does NOT:**
- Modify responses
- Submit transactions on behalf of operators
- Intermediate operator ↔ NCN program communication

**Operators interact directly with the NCN program** for:
- Submitting attestations (`submit_attestation`)
- Syncing stake (`sync_operator_stake`)
- Any on-chain state updates

## Chained Hash Attestation

### Core Concept

Each operator maintains a **running hash** of every response they serve. They chain their **own** response hashes:

```
request_1 → my_response_1 → hash_1 = H(initial_hash || my_response_hash_1)
request_2 → my_response_2 → hash_2 = H(hash_1 || my_response_hash_2)
...
request_N → my_response_N → hash_N = H(hash_{N-1} || my_response_hash_N)
```

### Interval Initialization

At the start of each attestation interval, operators initialize their hash chain with the **first response hash** of that interval:

```rust
/// Each operator initializes locally when interval starts
impl OperatorLocalState {
    fn start_interval(&mut self, interval_id: u64) {
        self.interval_id = interval_id;
        self.first_response_received = false;
        // current_hash will be set when first response is processed
    }

    fn record_response(&mut self, my_response_hash: [u8; 32]) {
        if !self.first_response_received {
            // First response: use its hash as the initial hash
            self.current_hash = my_response_hash;
            self.first_response_received = true;
        } else {
            // Subsequent responses: chain the hash
            self.current_hash = sha256(&[
                self.current_hash,
                my_response_hash,
            ].concat());
        }
    }
}
```

**Why not use `last_consensus_hash`?**

`finalize_interval` happens asynchronously after operators have already started processing the next interval's requests. The consensus hash from interval N may not be available when interval N+1 starts. Using the first response hash eliminates this dependency.

### Per-Request Hash Update

```rust
/// Each operator maintains this locally
struct OperatorLocalState {
    /// Current interval
    interval_id: u64,

    /// Running hash (updated for every request)
    current_hash: [u8; 32],

    /// Whether first response has been received this interval
    first_response_received: bool,
}
```

The hash chain for each interval:
```
request_1 → my_response_1 → hash_1 = my_response_hash_1  (initial)
request_2 → my_response_2 → hash_2 = H(hash_1 || my_response_hash_2)
...
request_N → my_response_N → hash_N = H(hash_{N-1} || my_response_hash_N)
```

### Why This Works

If an operator served the **correct** response (matching consensus):
- Their response_hash matches other honest operators
- Their chained hash matches other honest operators

If an operator served a **wrong** response:
- Their response_hash differs
- Their chained hash diverges from honest operators
- On-chain quorum check will detect this

### Attestation Submission

At the end of each interval (every N requests), operators submit their current state:

```rust
/// Submitted by each operator to the NCN program
#[account]
struct OperatorAttestation {
    /// The operator submitting
    operator: Pubkey,

    /// Interval this attestation covers
    interval_id: u64,

    /// The chained hash at interval end
    state_hash: [u8; 32],

    /// ED25519 signature: sign(state_hash || interval_id, operator_signing_key)
    signature: [u8; 64],

    pub bump: u8,
}
```

**Note:** If an operator's hash is included in quorum, they necessarily served all correct responses for that interval.

### Interval Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│  INTERVAL N                                                      │
│                                                                  │
│  1. Gateway signals: IntervalStart { id: N } to all operators   │
│  2. Operators process requests, chain their response hashes     │
│     - First response hash becomes the chain's initial hash      │
│  3. After N requests, gateway signals interval end              │
│  4. Each operator submits attestation DIRECTLY to NCN program:  │
│     - Operator builds tx: submit_attestation(state_hash, sig)   │
│     - Operator signs and sends tx to Solana                     │
│  5. Crank (or any party) calls finalize_interval on NCN program │
│  6. NCN program: evaluate quorum, update correct_intervals      │
└─────────────────────────────────────────────────────────────────┘
```

**Key point:** Gateway only signals timing; operators submit attestations directly to the blockchain.

**Note:** Intervals are independent - no dependency on previous interval's consensus hash.

### Quorum Evaluation (On-Chain)

Quorum is evaluated in `finalize_interval`, using on-chain stake weights:

```rust
/// Called during finalize_interval instruction
pub fn evaluate_quorum(
    ctx: &Context<FinalizeInterval>,
) -> Result<QuorumResult> {
    let interval = &ctx.accounts.interval;
    let ncn = &ctx.accounts.ncn;

    // Load all attestation accounts for this interval
    // (passed as remaining_accounts)
    let attestations: Vec<OperatorAttestation> = load_attestations(&ctx)?;
    let operators: Vec<Operator> = load_operators(&ctx)?;

    let total_stake: u64 = operators.iter()
        .filter(|op| op.is_active)
        .map(|op| op.stake)
        .sum();

    // Group attestations by state_hash, weighted by stake
    let mut hash_stakes: BTreeMap<[u8; 32], u64> = BTreeMap::new();

    for att in &attestations {
        if let Some(op) = operators.iter().find(|op| op.owner == att.operator) {
            *hash_stakes.entry(att.state_hash).or_default() += op.stake;
        }
    }

    // Find hash with most stake
    let (majority_hash, majority_stake) = hash_stakes
        .iter()
        .max_by_key(|(_, stake)| *stake)
        .map(|(h, s)| (*h, *s))
        .unwrap_or(([0u8; 32], 0));

    // Quorum = ≥2/3 of total stake agrees
    let quorum_reached = majority_stake * 3 >= total_stake * 2;

    Ok(QuorumResult {
        quorum_reached,
        consensus_hash: if quorum_reached { Some(majority_hash) } else { None },
        quorum_bps: ((majority_stake * 10000) / total_stake) as u16,
    })
}
```

### Attestation Schedule

| Trigger | Action |
|---------|--------|
| Gateway signals interval start | Operators start new hash chain |
| Gateway signals interval end (after N requests) | Operators submit attestation |
| All attestations received (or timeout) | `finalize_interval` called |
| Solana epoch boundary | `finalize_epoch` called |

**Note:** Intervals are request-count based. Epochs align with Solana epochs (~400k slots).

## On-Chain Verification

### Two-Phase Process

**Phase 1: Finalize Interval**

```
┌─────────────────────────────────────────────────────────────────┐
│  finalize_interval instruction                                   │
│                                                                  │
│  1. Verify all attestation signatures (ED25519)                  │
│  2. Load operator stake weights from on-chain accounts          │
│  3. Evaluate quorum: which state_hash has ≥2/3 stake?           │
│  4. Store result in Interval account:                            │
│     - consensus_hash (if quorum reached)                         │
│     - quorum_bps                                                 │
│  5. For matching operators: increment correct_intervals          │
│  6. Mark interval as finalized                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Phase 2: Update Operator Interval Counts**

```
┌─────────────────────────────────────────────────────────────────┐
│  After each finalize_interval                                    │
│                                                                  │
│  For each operator with matching hash:                           │
│  - Increment operator.correct_intervals                          │
└─────────────────────────────────────────────────────────────────┘
```

**Phase 3: Epoch Finalization (at epoch boundary)**

```
┌─────────────────────────────────────────────────────────────────┐
│  finalize_epoch instruction                                      │
│                                                                  │
│  1. Ensure all intervals are finalized                           │
│  2. Compute epoch_total_intervals                                │
│  3. For each operator:                                           │
│     a. Compute reward share and transfer                         │
│     b. If correct_intervals < epoch_total_intervals / 2:         │
│        - offense_count += 1                                      │
│        - If offense_count >= 3: is_active = false               │
│     c. Else: offense_count -= 1 (min 0)                         │
│     d. Reset correct_intervals = 0                               │
│  4. Reset epoch_revenue = 0, epoch_start_interval = current     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Point: Stake is On-Chain

Quorum calculation uses stake weights from on-chain Operator accounts. Operators cannot lie about their stake.

### Signature Verification

Two options for ED25519 verification on Solana:

**Option A: Ed25519 Precompile (recommended for POC)**

```typescript
// Client-side: include ed25519 instruction in transaction
const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
  publicKey: operatorPubkey.toBytes(),
  message: stateHash,
  signature: signature,
});

const tx = await program.methods
  .submitAttestation(attestation)
  .preInstructions([ed25519Ix])
  .accounts({
    instructionSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
    // ...
  })
  .rpc();
```

```rust
// On-chain: verify the precompile ran correctly
use solana_program::sysvar::instructions::{
    load_instruction_at_checked,
    load_current_index_checked
};

pub fn verify_ed25519_signature(
    instruction_sysvar: &AccountInfo,
    expected_pubkey: &[u8; 32],
    expected_message: &[u8; 32],
    expected_signature: &[u8; 64],
) -> Result<()> {
    let current_idx = load_current_index_checked(instruction_sysvar)?;
    let ed25519_ix = load_instruction_at_checked(
        (current_idx - 1) as usize,
        instruction_sysvar
    )?;

    // Verify ed25519 instruction contains our expected data
    // Parse offsets, compare pubkey, message, signature
    // See: https://github.com/anza-xyz/agave/blob/main/sdk/src/ed25519_instruction.rs

    Ok(())
}
```

**Option B: brine-ed25519 library (~30k CU, no extra lamports)**

```rust
use brine_ed25519::sig_verify;

pub fn verify_attestation_signature(
    pubkey: &[u8; 32],
    signature: &[u8; 64],
    state_hash: &[u8; 32],
) -> Result<()> {
    sig_verify(pubkey, signature, state_hash)
        .map_err(|_| NcnError::InvalidSignature)
}
```

Reference: https://github.com/zfedoran/brine-ed25519

## Reward Calculation

### Epoch-Based Rewards

Rewards are distributed **once at epoch end** for all intervals in that epoch. This aligns with [Jito's NCN template](https://github.com/jito-foundation/ncn-template) which uses epoch-based consensus cycles.

```
┌─────────────────────────────────────────────────────────────────┐
│  REWARD DISTRIBUTION (at epoch end)                              │
│                                                                  │
│  1. For each interval in epoch: finalize_interval (if not done) │
│  2. Count correct_intervals per operator                         │
│  3. Compute epoch_total_intervals                                │
│  4. distribute_epoch_rewards:                                    │
│     - Operators get: (correct_intervals / epoch_total_intervals) │
│       × (operator_stake / total_stake) × epoch_revenue          │
│  5. Update offense counts                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Formula

At epoch end:

```
epoch_reward = epoch_revenue
    × (operator_correct_intervals / epoch_total_intervals)
    × (operator_stake / total_stake)
```

Where:
- `operator_correct_intervals` = intervals where operator's hash matched consensus
- `epoch_total_intervals` = total intervals in this epoch
- `operator_stake` = on-chain stake weight
- `epoch_revenue` = fees collected during this epoch

### Offense Tracking

Offenses are tracked at epoch granularity (epoch ≈ 400k slots):

| Condition | Action |
|-----------|--------|
| Operator fails ≥50% of intervals in epoch | offense_count += 1 |
| Operator succeeds ≥50% of intervals in epoch | offense_count -= 1 (min 0) |
| offense_count ≥ 3 | Operator suspended |

```rust
/// Called at epoch end
fn update_offense_count(
    operator: &mut Operator,
    epoch_total_intervals: u64,
) {
    if operator.correct_intervals * 2 >= epoch_total_intervals {
        // ≥50% success rate
        if operator.offense_count > 0 {
            operator.offense_count -= 1;
        }
    } else {
        // <50% success rate = offense
        operator.offense_count += 1;
        if operator.offense_count >= 3 {
            operator.is_active = false; // Suspended
        }
    }
    // Reset for next epoch
    operator.correct_intervals = 0;
}
```

**Note:** An interval counts as "failed" if:
- Hash doesn't match consensus, or
- No attestation submitted


## On-Chain State

### NCN Account (Updated)

```rust
#[account]
pub struct Ncn {
    pub authority: Pubkey,
    pub total_stake: u64,
    pub operator_count: u32,

    // Jito Restaking integration
    pub jito_ncn_account: Pubkey,    // NCN account in Jito restaking program
    pub supported_mint: Pubkey,       // Accepted stake token mint (e.g., JitoSOL)
    pub mint_weight_bps: u64,         // Weight in basis points (10000 = 1.0x)

    // Interval tracking
    pub current_interval: u64,
    pub requests_per_interval: u64,   // Config: e.g., 1000

    // Epoch tracking (aligned with Solana epochs)
    pub current_epoch: u64,
    pub epoch_start_interval: u64,    // First interval of current epoch
    pub epoch_revenue: u64,           // Accumulated fees for epoch

    // Config
    pub min_operator_stake: u64,
    pub reward_share_bps: RewardShareConfig,

    pub bump: u8,
}
```

**Notes:**
- Epochs align with Solana epochs (~400k slots)
- `epoch_total_intervals = current_interval - epoch_start_interval`
- For POC: single `supported_mint` with weight 1.0x (10000 bps)
- For mainnet: expand to `VaultRegistry` with multiple mints/weights

### Interval Account (New)

```rust
/// One account per interval, stores consensus result
#[account]
pub struct Interval {
    pub ncn: Pubkey,
    pub interval_id: u64,
    pub epoch: u64,  // Solana epoch this interval belongs to

    /// Consensus hash (if quorum reached)
    pub consensus_hash: Option<[u8; 32]>,

    /// Quorum achieved (basis points, e.g., 6700 = 67%)
    pub quorum_bps: u16,

    /// Whether interval has been finalized
    pub finalized: bool,

    pub bump: u8,
}
```

**Note:** Revenue is tracked at the NCN level (`epoch_revenue`), not per-interval.

### Operator Account (Updated)

```rust
#[account]
pub struct Operator {
    pub owner: Pubkey,
    pub operator_id: String,
    pub signing_pubkey: [u8; 32],

    // Jito Restaking integration
    pub jito_operator_account: Pubkey,  // Operator account in Jito restaking program
    pub stake: u64,                      // Synced from Jito vault delegations

    pub is_active: bool,

    // Epoch tracking
    pub current_epoch: u64,
    pub correct_intervals: u64,  // Intervals where hash matched consensus (reset each epoch)

    // Offense tracking (persistent)
    pub offense_count: u8,

    pub bump: u8,
}
```

**Stake Source:** The `stake` field is derived from Jito vault delegations, not self-reported. At epoch start (or via a sync instruction), stake is read from the operator's `OperatorVaultTicket` accounts in the Jito restaking program.

### Instructions

```rust
pub mod rpc_ncn {
    // === Initialization ===
    pub fn initialize(
        ctx: Context<Initialize>,
        jito_ncn_account: Pubkey,
        supported_mint: Pubkey,
        requests_per_interval: u64,
    ) -> Result<()>;

    pub fn register_operator(
        ctx: Context<RegisterOperator>,
        operator_id: String,
        signing_pubkey: [u8; 32],
        jito_operator_account: Pubkey,
    ) -> Result<()>;

    // === Jito Integration ===
    // Sync operator stake from Jito vault delegations (call at epoch start)
    pub fn sync_operator_stake(
        ctx: Context<SyncOperatorStake>,
    ) -> Result<()>;

    // === Interval Management ===
    pub fn create_interval(
        ctx: Context<CreateInterval>,
        interval_id: u64,
    ) -> Result<()>;

    pub fn submit_attestation(
        ctx: Context<SubmitAttestation>,
        interval_id: u64,
        state_hash: [u8; 32],
        signature: [u8; 64],
    ) -> Result<()>;

    pub fn finalize_interval(
        ctx: Context<FinalizeInterval>,
        interval_id: u64,
    ) -> Result<()>;

    // === Epoch Management ===
    // Distribute rewards, update offense counts
    pub fn finalize_epoch(
        ctx: Context<FinalizeEpoch>,
    ) -> Result<()>;
}
```

## Edge Cases

### No Consensus (≥1/3 stake not participating or disagreeing)

```rust
match quorum_result {
    QuorumResult { quorum_reached: true, .. } => {
        // Normal reward distribution
    }
    QuorumResult { quorum_reached: false, .. } => {
        // No rewards for this interval
        // Interval still counts toward total_intervals
        emit!(NoConsensusInterval { interval_id });
    }
}
```

### Operator Goes Offline

- No attestation submitted → interval counts as failed
- If ≥50% of epoch intervals fail → offense_count += 1
- After 3 offenses → suspended

### Late Attestation

- Attestations must be submitted before `finalize_interval` is called
- Late submissions rejected

## Monitoring

All components export Prometheus metrics:

```
# Gateway
rpc_ncn_requests_total{method="getBalance"} 1234
rpc_ncn_consensus_reached_total 1200
rpc_ncn_consensus_failed_total 34
rpc_ncn_intervals_total 50

# Operator
rpc_ncn_operator_stake_weight_bps{operator="op1"} 2500

# On-chain (via indexer)
rpc_ncn_interval_rewards_distributed{interval="123"} 1000000
rpc_ncn_operator_correct_intervals{operator="op1"} 48
rpc_ncn_operator_offense_count{operator="op1"} 0
```

## Deferred to v2

| Feature | Why Deferred |
|---------|--------------|
| Latency measurement | Complex peer measurement, not blocking for integrity POC |
| Threshold signatures | N < 100 operators, individual sigs manageable |
| Dispute resolution | Attestation verification covers this |
| Merkle proofs for requests | Chained hash sufficient for POC |
| BAM integration | Nice-to-have synergy |

## Implementation Order

### Smart Contract

1. [ ] Add `Interval` account
2. [ ] Update `Operator` account (add Jito fields, correct_intervals, offense_count)
3. [ ] Update `Ncn` account (add Jito fields, epoch tracking, epoch_revenue)
4. [ ] Implement `initialize` with Jito NCN reference
5. [ ] Implement `register_operator` with Jito operator reference
6. [ ] Implement `sync_operator_stake` (read from Jito delegations)
7. [ ] Implement `create_interval` instruction
8. [ ] Implement `submit_attestation` with ED25519 verification
9. [ ] Implement `finalize_interval` (quorum + update correct_intervals)
10. [ ] Implement `finalize_epoch` (distribute rewards + offense tracking)

### Jito Integration

11. [ ] Register NCN with Jito restaking program
12. [ ] Register supported mint (e.g., JitoSOL) with weight
13. [ ] Document operator/vault opt-in process

### Gateway

14. [ ] Track operator stake weights (cache from on-chain, refresh periodically)
15. [ ] Route requests to all operators, collect responses
16. [ ] Aggregate responses by hash, forward when ≥2/3 stake agrees
17. [ ] Signal interval start/end to operators (operators then submit attestations directly to NCN program)
18. [ ] Accumulate fees (gateway tracks; on-chain update via crank)

### Operator Node

19. [ ] Implement hash chaining (record_response for each request)
20. [ ] Respond to interval start/end signals from gateway
21. [ ] Submit attestation directly to NCN program at interval end (not via gateway)
22. [ ] Call sync_operator_stake at epoch boundaries (or delegate to crank)

### Testing

23. [ ] Unit tests for quorum evaluation
24. [ ] Integration test: 3 operators, 1 interval
25. [ ] End-to-end test on devnet with Jito testnet

## Jito Restaking Integration

To receive vault delegations from Jito Restaking, the RPC-NCN must integrate with Jito's restaking infrastructure.

### Registration Requirements

| Step | Description | Who |
|------|-------------|-----|
| 1. NCN Registration | Register NCN with Jito restaking program | NCN admin |
| 2. Mint Registration | Register supported stake token mint + weight | NCN admin |
| 3. Operator Opt-in | Operators opt into NCN via `NcnOperatorState` | Operators |
| 4. Vault Opt-in | Vaults opt into NCN via `NcnVaultTicket` | Vault admins |
| 5. Warm-up | Wait one full epoch for relationships to activate | Automatic |

### Jito Program Accounts (External)

These accounts are managed by Jito's restaking program, not our NCN:

```
┌─────────────────────────────────────────────────────────────────┐
│  Jito Restaking Program Accounts                                 │
│                                                                  │
│  NCN (in Jito registry)                                         │
│  ├── NcnVaultTicket (per vault)      ← NCN approves vault       │
│  ├── NcnOperatorState (per operator) ← mutual opt-in            │
│  └── NcnVaultSlasherTicket           ← slashing (not live)      │
│                                                                  │
│  Operator (in Jito registry)                                    │
│  └── OperatorVaultTicket (per vault) ← operator accepts vault   │
│                                                                  │
│  Vault (Jito Vault Program)                                     │
│  └── VaultOperatorDelegation         ← actual stake delegation  │
└─────────────────────────────────────────────────────────────────┘
```

### Reading Operator Stake

Operator stake comes from Jito vault delegations:

```rust
/// Sync operator stake from Jito restaking at epoch start
pub fn sync_operator_stake(
    ctx: Context<SyncOperatorStake>,
) -> Result<()> {
    let operator = &mut ctx.accounts.operator;

    // Read from Jito's VaultOperatorDelegation accounts
    // (passed as remaining_accounts)
    let total_delegation: u64 = ctx.remaining_accounts
        .iter()
        .filter_map(|acc| {
            // Deserialize Jito VaultOperatorDelegation
            // Sum delegations for this operator
        })
        .sum();

    operator.stake = total_delegation;
    Ok(())
}
```

### Slashing Status

> "The slashing program is still under development and not yet live."
> — [Jito Documentation](https://www.jito.network/docs/restaking/jito-restaking-overview/)

Our "diminishing returns" penalty model (offense tracking, suspension) is compatible with the current state. When Jito slashing goes live, we can integrate via `NcnVaultSlasherTicket`.

### POC Simplifications

For POC, we simplify:

| Full Jito Integration | POC Simplification |
|-----------------------|--------------------|
| Multiple mints + weight table | Single `supported_mint` |
| Operator snapshots per epoch | Direct stake reads (stakes stable in epoch) |
| VaultRegistry with N vaults | Track vault count only |
| Full reward routing | Simple proportional distribution |

## Jito NCN Template Alignment

This spec aligns with the [Jito NCN Template](https://github.com/jito-foundation/ncn-template) where possible:

| Jito NCN Pattern | RPC-NCN Implementation |
|------------------|------------------------|
| Epoch-based consensus cycles | ✅ Epochs align with Solana epochs |
| Stake-weighted voting (66% threshold) | ✅ ≥2/3 stake for quorum |
| NCN registration with restaking program | ✅ `jito_ncn_account` reference |
| Operator opt-in via NcnOperatorState | ✅ `jito_operator_account` reference |
| Stake from vault delegations | ✅ `sync_operator_stake` instruction |
| Supported mint registration | ✅ Single mint for POC |
| Weight tables | ⚠️ Simplified: single weight for POC |
| Operator snapshots | ⚠️ Direct reads (stakes stable in epoch) |
| Reward distribution after consensus | ✅ At epoch end |
| Keepers (off-chain cranks) | ✅ Gateway + external cranks |
| Slashing | ⚠️ Deferred (not live in Jito) |

### Key Differences

1. **Voting target**: Jito template votes on weather status; we vote on RPC response hashes
2. **Interval subdivision**: We subdivide epochs into intervals for finer-grained tracking
3. **Hash chaining**: Each operator maintains a hash chain of responses within intervals
4. **Penalty model**: Offense tracking + suspension instead of slashing (until Jito slashing is live)

### Future Alignment (Mainnet)

For mainnet, expand to full Jito infrastructure:
- `VaultRegistry` with multiple supported mints
- `WeightTable` per epoch for multi-token weights
- Full operator/vault snapshot flow
- Slashing integration via `NcnVaultSlasherTicket` (when available)

## References

- [Jito NCN Template](https://github.com/jito-foundation/ncn-template)
- [Jito NCN Documentation](https://www.jito.network/docs/restaking/ncn-implementation-overview/introduction/)
- [Solana Ed25519 Instruction](https://github.com/anza-xyz/agave/blob/main/sdk/src/ed25519_instruction.rs)
- [brine-ed25519 Library](https://github.com/zfedoran/brine-ed25519) (~30k CU, no extra lamports)
