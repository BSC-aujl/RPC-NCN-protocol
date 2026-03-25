---
layout: default
title: RPC NCN
---

# RPC NCN

<div class="ncn-hero">
  <p class="ncn-kicker">Reliability and integrity for production RPC</p>
  <p class="ncn-lead">RPC-NCN is designed for organizations that cannot afford RPC uncertainty. It combines resilient request handling with cryptographic verification so responses are both available and trustworthy.</p>
</div>

## What problem this solves

Standard RPC setups often force a tradeoff between uptime and trust. RPC-NCN is built to remove that tradeoff:

- <strong>RPC that always works</strong> through resilient request routing across independent operators.
- <strong>Requests of proven integrity</strong> through quorum-backed agreement and proof-linked response handling.

## How RPC-NCN works (synopsis)

1. A client sends a request through RPC-NCN.
2. The gateway fans out execution to independent operators.
3. Decentralization provides strong response continuity via multiple independent paths.
4. Responses are compared using stake-weighted agreement.
5. When quorum is reached, integrity context is attached so the response is cryptographically trustworthy.

Even when strict quorum is not reached for a specific attempt, the decentralized operator topology still provides strong assurance of getting a response.

<div class="viz-grid viz-grid-single">
  <button class="viz-card" data-viz-src="./images/request-proof-flow.svg" data-viz-title="Request to proof flow">
    <img src="./images/request-proof-flow.svg" alt="Request to proof flow for RPC-NCN" />
    <span>Request-to-proof flow (click to zoom + pan)</span>
  </button>
</div>

## System overview

<div class="viz-grid viz-grid-single">
  <button class="viz-card" data-viz-src="./images/system-overview.svg" data-viz-title="RPC-NCN system overview">
    <img src="./images/system-overview.svg" alt="RPC-NCN system overview diagram" />
    <span>RPC-NCN system overview (click to zoom + pan)</span>
  </button>
</div>

## Who this is for

- Companies and infrastructure teams with strict uptime and integrity requirements.
- Decision-makers evaluating high-assurance RPC options.
- Technical stakeholders who need a clear, implementation-aware protocol overview without full spec depth.

## Next page

For the single implementation summary, go to [Protocol and POC status](./poc-status.md).

{% include viz-modal.html %}
