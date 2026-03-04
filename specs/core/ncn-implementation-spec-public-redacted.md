# RPC-NCN Implementation Specification (Public Redacted)

> **Status:** Public redacted specification
> **Source:** Internal implementation spec v1.1 (redacted for external sharing)
> **Last Updated:** 2026-03-04

## Purpose
This document publishes the core implementation model and design rationale that are safe to share publicly, while omitting sensitive implementation details and private operational information.

## Redaction scope
The following categories are intentionally omitted or generalized:
- Internal deployment and operational procedures
- Private infrastructure details and non-public endpoints
- Security-sensitive implementation specifics
- Private business/commercial analysis

## Relationship to Protocol v1
- Normative behavior is captured in:
  - `specs/core/poc-protocol-v1-draft.md`
- This document is informative and implementation-oriented.

---

## 1) System overview (public)
RPC-NCN provides verifiable RPC integrity through:
1. Multi-operator response collection
2. Stake-weighted consensus (>= 2/3 active stake)
3. Interval-based on-chain attestations
4. Epoch-based correctness and reward accounting

### Core components
- **Gateway**: request fanout, response aggregation, quorum determination
- **Operators**: execute RPC requests and produce signed attestations
- **On-chain settlement layer**: records attestations, validates quorum/correctness, tracks rewards/penalties
- **Clients**: consume verified responses and proof metadata

---

## 2) Entity model (public)
Key entities (high-level):
- NCN state
- Operator state
- Interval state
- Attestation records
- Epoch state

### Representative fields (non-sensitive)
- operator identity
- active/inactive status
- stake weight
- interval hash / state hash
- quorum threshold values
- epoch counters

---

## 3) Consensus and correctness model (public)
### Per-request (off-chain)
1. Gateway forwards request to selected operators.
2. Operators return response + response hash.
3. Gateway groups matching hashes by stake.
4. Quorum is reached once one hash reaches >= 2/3 of active stake.

### Per-interval (on-chain)
1. Operators submit interval attestations.
2. On-chain logic verifies quorum/correctness for interval outcomes.
3. Correctness metrics are accumulated for epoch finalization.

### Per-epoch
1. Epoch finalization computes rewards/penalties from interval outcomes.
2. Operator offense counters are updated under policy rules.

---

## 4) Penalty model (public)
Current public model:
- Offense-based penalties and suspension thresholds are active.
- Slashing remains future/conditional on ecosystem support and governance readiness.

---

## 5) Security assumptions (public)
- Safety target: tolerate up to <1/3 malicious active stake.
- Attestations must be signed and verifiable.
- Stake weights are sourced from authoritative on-chain restaking state.
- Public threat modeling is tracked separately in research/security documents.

---

## 6) Future directions (public)
- richer proof systems for response correctness
- expanded operator scaling and signature aggregation methods
- broader restaking integration and governance hardening

---

## 7) Redaction notes
Sections from the internal implementation spec were excluded where they may expose private infrastructure, operational controls, or sensitive security details.

For collaboration requests requiring deeper technical review, use maintainer-managed access workflows.
