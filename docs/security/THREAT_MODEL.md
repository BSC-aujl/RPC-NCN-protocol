# RPC-NCN Threat Model (Public Summary)

Normative protocol behavior is defined in `specs/`.

## Security objective

Protect response integrity under a stake-weighted quorum model.

## Trust and threshold assumptions

- Safety target: tolerate `< 1/3` malicious active stake.
- Quorum threshold: `>= 2/3` active stake agreement.
- Attestations are signed and verifiable.

## Primary threat categories

1. **Consensus manipulation** (collusion / stake concentration).
2. **Data integrity faults** (inconsistent response hashing).
3. **Availability attacks** (operator outage or degraded participation).
4. **On-chain/off-chain divergence** (attestation mismatch, stale stake view).

## Public mitigations (v1)

- stake-weighted quorum acceptance rules
- per-interval attestation workflow
- offense-based penalties and suspension model
- deterministic hashing / serialization requirements

## Residual risk themes

- liveness degradation when participation drops
- governance latency for policy updates
- eventual migration complexity for future slashing integration

## Related documents

- Protocol summary: `../specs/protocol-v1-summary.md`
- Consensus rules: `../../specs/consensus/quorum-verification-v1.md`
- State invariants: `../../specs/onchain-state/state-model-v1.md`
- Economics rules: `../../specs/economics/reward-penalty-v1.md`
