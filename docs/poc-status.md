---
layout: default
title: Protocol v1 + POC Status
---

# Protocol v1 + POC status

RPC-NCN v1 focuses on verifiable response integrity for high-assurance RPC workflows. This page documents the evidence captured in the [RPC-NCN-core repository](https://github.com/BSC-aujl/RPC-NCN-core) and makes explicit which pieces are delivered versus still aspirational.

## Protocol v1 at a glance

- Stake-weighted response agreement (≥ 2/3). Gateway and contract quorum checks rely on the same quorum basis points that the operator SDK exposes.
- Operator-side proof generation and hash chaining, including canonical serialization rules, signer bitmap ordering, and proof identifiers.
- Interval-based on-chain attestations with epoch finalization for correctness, rewards, and offense accounting.

### Key terms

- **Interval:** A collection window for RPC responses and proof-building that is later submitted as an attestation to the on-chain program.
- **Epoch:** A series of intervals whose finalization reconciles rewards/offenses and lets the program clean up stake state.
- **Stake-weighted quorum:** The ≥2/3 of active stake (measured in basis points) required for hash or proof acceptance by the gateway or contract.

## Implementation snapshot (verified components)

| Component | Scope & status | Verification evidence |
|---|---|---|
| On-chain program | Implemented (POC v1 Anchor program with interval/epoch machines for correctness, rewards, and offense tracking). | [`RPC-NCN-core/contracts`](https://github.com/BSC-aujl/RPC-NCN-core/tree/main/contracts), [`RPC-NCN-core/tests/run-tests.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/tests/run-tests.sh) (contracts) |
| Gateway | Implemented (stake-aware JSON-RPC fan-out, quorum aggregation, and interval lifecycle transitions). | [`RPC-NCN-core/gateway`](https://github.com/BSC-aujl/RPC-NCN-core/tree/main/gateway), [`RPC-NCN-core/tests/run-tests.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/tests/run-tests.sh) (gateway) |
| Operator node | Implemented (proof builder, canonical serialization, attestation submission). | [`RPC-NCN-core/operator-node`](https://github.com/BSC-aujl/RPC-NCN-core/tree/main/operator-node), `cargo test` in that directory, [`RPC-NCN-core/integration-tests/run-tests.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/integration-tests/run-tests.sh) (all) |
| Client SDK | Implemented (request helpers, proof verification matching stake-weighted quorum rules). | [`RPC-NCN-core/client-sdk`](https://github.com/BSC-aujl/RPC-NCN-core/tree/main/client-sdk) (sources + README) and `npm test` run inside that directory (unit suites covering canonical verification, signature checks, and freshness guards). |
| Integration & E2E | Implemented (combined gateway/operator/contract flows with scripted harnesses). | [`RPC-NCN-core/integration-tests/run-tests.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/integration-tests/run-tests.sh) (all), [`RPC-NCN-core/tests/e2e/run-local-e2e.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/tests/e2e/run-local-e2e.sh), [`RPC-NCN-core/scripts/preflight-e2e.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/scripts/preflight-e2e.sh) |

This table captures the components that are exercised today. The verification evidence column ties each component back to the directories and command suites that keep its behavior regression-tested.

## Tests & verification

- [`RPC-NCN-core/tests/run-tests.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/tests/run-tests.sh) (gateway) exercises gateway routing, quorum aggregation, and interval transitions.
- [`RPC-NCN-core/tests/run-tests.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/tests/run-tests.sh) (contracts) covers the Anchor program’s interval/epoch state machines, reward/offense hooks, and serialization checks.
- Running `cargo test` inside the [RPC-NCN-core/operator-node](https://github.com/BSC-aujl/RPC-NCN-core/tree/main/operator-node) directory validates the proof builder, signer bitmap ordering, and canonical encoding described in `docs/specs/poc2/proof-encoding-and-proof-id.md`.
- [`RPC-NCN-core/integration-tests/run-tests.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/integration-tests/run-tests.sh) (all) and [`RPC-NCN-core/tests/e2e/run-local-e2e.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/tests/e2e/run-local-e2e.sh) verify the combined gateway/operator/contract choreography, ensuring proofs flow from request to epoch finalization—these protocol-level harnesses do not import the Client SDK package.
- [`RPC-NCN-core/scripts/preflight-e2e.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/scripts/preflight-e2e.sh) brings up local validators, wallets, and operator binaries so the harnesses can reproduce the POC timing assumptions.

## Aspirational roadmap

These capabilities are still under design or await broader governance, hardening, or incentives before they are considered operational:

- **Production slashing/incentive enforcement:** The POC records offenses, but live slashing gates and incentives are not yet wired into the on-chain program or operational tooling. Follow-on work will bolt penalty execution into the epoch finalizer hooks when the incentive model, proof attestation, and governance gates align.
- **Public governance & deployment hardening:** Multi-region failover, audits, and community-driven governance workflows are planned but not shipped. They require multi-party validation, monitoring instrumentation, and deployment policies before they move from aspiration to implementation.
- **Formal verification & performance benchmarking:** While the POC exposes deterministic interval windows, formal proofs of latency/throughput bounds and SLA commitments await dedicated verification campaigns beyond the existing unit/integration suites.

## Deployment context

- **Local development:** The [`RPC-NCN-core/tests/run-tests.sh`](https://github.com/BSC-aujl/RPC-NCN-core/blob/main/tests/run-tests.sh) helpers and the e2e scripts keep the POC runnable with `solana-test-validator` and local operator binaries.
- **Public test environment:** Access is governed by invite; testers rely on the same Anchor deployments and configs tracked under `configs/` while coordinating through the community thread.
- **Production environment:** Pending broader hardening, audits, governance, and incentive gates; slashing integration remains aspirational as noted above.

## Detailed visual views

<div class="viz-grid">
  <button class="viz-card" data-viz-src="./specs/images/component-diagrams.png" data-viz-title="POC component view">
    <img src="./specs/images/component-diagrams.png" alt="RPC-NCN POC component diagram" />
    <span>POC component view (click to zoom + pan)</span>
  </button>
  <p class="viz-caption">Shows how the gateway, operators, and on-chain program interact when building interval attestations.</p>

  <button class="viz-card" data-viz-src="./specs/images/poc-implementation-status.png" data-viz-title="Implementation status view">
    <img src="./specs/images/poc-implementation-status.png" alt="RPC-NCN implementation status" />
    <span>Implementation status view (click to zoom + pan)</span>
  </button>
  <p class="viz-caption">Reports which components are covered by the current POC and which parts remain under active work.</p>
</div>

## More details

- [Repository README (single-page reference)](https://github.com/BSC-aujl/RPC-NCN-protocol#readme)
- [Visualizations page](./visualizations.html)

{% include viz-modal.html %}
