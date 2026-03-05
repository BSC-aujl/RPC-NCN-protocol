# Open Questions

This file tracks **active unresolved decisions only**.

- Runtime destination repo: `../RPC-NCN-core`
- Protocol/docs destination repo: `../RPC-NCN-protocol`
- Research destination repo: `../RPC-NCN-research`

> Do not maintain a "resolved" archive here.  
> Once resolved, record final semantics in `specs/` and implementation status in `poc/STATUS.md`.

## Priority legend

| Priority | Meaning |
|----------|---------|
| P0 | Blocking — must resolve before the next implementation gate |
| P1 | Important — affects architecture/economics but not an immediate blocker |
| P2 | Optional — useful optimization/future planning |

## Active questions

| ID | Priority | Area | Question | Current options / notes | Canonical follow-up |
|----|----------|------|----------|-------------------------|---------------------|
| TQ-1 | P0 | Technical | How should trusted bank-hash inputs be sourced? | Validator direct feed vs multi-source aggregation vs delegated attestor set | `specs/` + `docs/research/verified-rpc.md` |
| TQ-6 | P0 | Technical | Should gateway coordination remain centralized for beta or move to decentralized routing now? | Centralized is faster to ship; decentralized improves resilience and censorship resistance | `specs/` + `poc/gateway` |
| EQ-1 | P0 | Economic | What are the concrete Jito revenue-sharing terms and constraints? | Required to finalize fee model and operator economics | `docs/research/business-models.md` |
| TQ-3 | P1 | Technical | Which RPC methods are in the first verification set? | Candidate starter set: `getBalance`, `getAccountInfo`, `getProgramAccounts` | `specs/ncn-implementation-spec.md` |
| TQ-5 | P1 | Technical | How will historical state verification be supported? | Archive-node dependency vs proof snapshots | `docs/research/verified-rpc.md` |
| TQ-7 | P1 | Technical | What proof format should be standardized for client interoperability? | JSON-RPC extension vs detached proof envelope | `specs/` |
| EQ-2 | P1 | Economic | What minimum effective stake target is required for credible security? | Working assumptions need stress-testing against attack costs | `docs/research/business-models.md` |
| EQ-3 | P1 | Economic | What production pricing model should ship first? | Per-request, subscription, or hybrid by customer segment | `docs/research/business-models.md` |
| OQ-1 | P1 | Operational | How should initial operators be bootstrapped and vetted? | Partner-first vs open application cohort | `docs/ROADMAP.md` + runbooks in core repo |
| OQ-3 | P1 | Operational | What governance path should be used from beta to production? | Multisig now, staged decentralization later | `specs/` + `docs/ROADMAP.md` |

## Workflow

- Add: assign ID, priority, owner, and canonical follow-up artifact.
- Resolve: remove from this file, then update canonical destination (`specs/`, `poc/STATUS.md`, or research doc).
