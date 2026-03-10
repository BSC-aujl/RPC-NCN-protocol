# Economics Rules: Rewards and Penalties (v1)

**Status:** normative.

Source baseline: `../core/poc-protocol-v1-draft.md`.

## Reward accounting scope

- Rewards are calculated at **epoch boundaries** from interval correctness outcomes.
- Stake-weighted participation and correctness drive reward allocation.

## Penalty model (v1)

- v1 uses an **offense-based** model (tracking and suspension thresholds).
- Slashing is explicitly deferred and treated as future/conditional integration.

## Implementation boundary

- Exact economic formulas and accounting logic are protocol-governed behavior.
- Any change to reward/penalty semantics requires RFC + compatibility impact.

## Interop note

Clients and operators should treat this file and `../core/poc-protocol-v1-draft.md` as authoritative for v1 economics behavior.
