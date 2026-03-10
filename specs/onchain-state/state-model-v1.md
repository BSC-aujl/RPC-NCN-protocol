# On-Chain State Model and Invariants (v1)

**Status:** normative.

Source baseline: `../core/poc-protocol-v1-draft.md`.

## State components

Protocol v1 defines and updates at least:

- NCN state
- Interval state
- Operator state
- Epoch/finalization accounting state

## Core invariants

1. **Stake source invariant:** stake weights used for quorum and rewards are sourced from authoritative on-chain state.
2. **Quorum invariant:** accepted interval outcomes must satisfy the configured quorum threshold (>= 2/3 stake).
3. **Attestation integrity invariant:** interval outcomes are based on signed operator attestations.
4. **Epoch accounting invariant:** epoch finalization uses interval outcomes and offense tracking state.

## State transition boundaries

- Request-time aggregation is off-chain.
- Interval/epoch correctness and accounting are finalized on-chain.

## Compatibility note

Any state-layout or invariant change is a protocol behavior change and requires RFC + compatibility annotation.
