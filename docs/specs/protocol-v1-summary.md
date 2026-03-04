# Protocol v1 Summary (Public)

This page is a concise public summary of RPC-NCN Protocol v1.

## Core objective
Provide verifiable RPC response integrity using stake-weighted multi-operator consensus and on-chain attestations.

## High-level model
1. Client sends request to gateway.
2. Gateway fans out to operators.
3. Operators compute response hashes.
4. Quorum is reached when >=2/3 of active stake agrees on one hash.
5. Operators submit interval attestations on-chain.
6. Interval and epoch finalization update correctness and reward state.

## Trust/security assumptions
- Secure if <1/3 active stake is malicious.
- Attestations are signed and verifiable.
- Stake weights are sourced from on-chain restaking state.

## Penalty model (current)
- Offense-based penalties with suspension threshold.
- Slashing remains future/conditional on ecosystem support.

## Why this is useful
- Improves integrity assurances for high-value RPC consumers.
- Makes behavior auditable at interval/epoch granularity.
- Aligns with restaking-based operator incentives.
