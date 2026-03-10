# RPC-NCN Protocol

Public docs site: https://bsc-aujl.github.io/RPC-NCN-protocol/

Contact: https://blocksize.info/contact/

---

## Single-page reference

This README is the long single-page version of the current GitHub Pages content.

### RPC-NCN overview

RPC-NCN adds independent verification on top of standard RPC flows using stake-weighted quorum, signed attestations, and on-chain accountability.

#### Why RPC-NCN

- **Integrity:** detect inconsistent operator responses via stake-weighted hash agreement.
- **Verifiability:** produce signed attestations linked to interval and epoch outcomes.
- **Accountability:** finalize correctness outcomes for transparent reward/offense handling.

### Request-to-proof flow

1. Client sends an RPC request.
2. Gateway fans out to operators.
3. Operators return response + hash.
4. Gateway accepts the quorum hash (≥ 2/3 stake).
5. Operators submit interval attestations.
6. Epoch finalization updates correctness and reward/offense state.

### System architecture

POC v1 components:
- **Gateway:** request routing + stake-weighted aggregation
- **Operators:** RPC execution + signed attestations
- **On-chain program:** interval/epoch correctness accounting
- **Client SDK:** request and verification support

![RPC-NCN system architecture](docs/specs/images/architecture-diagram.png)

---

## Protocol v1 + POC status

RPC-NCN v1 focuses on verifiable response integrity for high-assurance RPC workflows.

### Core mechanics

- stake-weighted response agreement (≥ 2/3)
- operator-side response hash chaining
- interval-based on-chain attestations
- epoch-based reward/offense accounting

### Implementation snapshot

| Component | Status | Evidence |
|---|---|---|
| On-chain program | ✅ Ready | integration tests + public test deployment |
| Gateway | ✅ Ready | stake-weighted aggregation + interval services |
| Operator node | ✅ Ready | hash chaining + attestation flow |
| E2E lifecycle | ✅ Ready | interval/epoch flow verification |

### Test snapshot

| Suite | Count | Scope |
|---|---:|---|
| Contract integration | 40 | registration, attestations, quorum, state |
| Gateway unit tests | 109 | consensus, routing, interval/finalization, security |
| Protocol E2E | 16 | end-to-end lifecycle |

### Deployment snapshot

| Environment tier | Status |
|---|---|
| local development | ✅ Active |
| public test environment | ✅ Active |
| production environment | ⏳ Pending |

### Current limits

- no production slashing integration yet (offense model in POC)
- production readiness still depends on additional hardening, audit, and governance gates

---

## Visualizations

![RPC-NCN POC component diagram](docs/specs/images/component-diagrams.png)

![RPC-NCN implementation status](docs/specs/images/poc-implementation-status.png)

---

## Links

- Docs homepage: https://bsc-aujl.github.io/RPC-NCN-protocol/
- Protocol v1 + POC status: https://bsc-aujl.github.io/RPC-NCN-protocol/poc-status.html
- Visualizations: https://bsc-aujl.github.io/RPC-NCN-protocol/visualizations.html
- Request access: https://blocksize.info/contact/
- Community thread: https://forum.jito.network/t/blocksize-rpc-ncn-verifiable-high-assurance-infrastructure-for-the-jito-ecosystem/928
