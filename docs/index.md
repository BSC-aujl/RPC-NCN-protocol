---
layout: default
title: RPC-NCN Protocol
---

# RPC-NCN Protocol

<div class="ncn-hero">
  <p class="ncn-kicker">Verifiable, high-assurance RPC</p>
  <p class="ncn-lead">RPC-NCN adds independent verification on top of standard RPC flows using stake-weighted quorum, signed attestations, and on-chain accountability.</p>
</div>

## Why RPC-NCN

<div class="ncn-stat-grid">
  <div class="ncn-stat-card"><strong>Integrity</strong><span>Detect inconsistent operator responses via stake-weighted hash agreement.</span></div>
  <div class="ncn-stat-card"><strong>Verifiability</strong><span>Produce signed attestations linked to interval and epoch outcomes.</span></div>
  <div class="ncn-stat-card"><strong>Accountability</strong><span>Finalize correctness outcomes for transparent reward/offense handling.</span></div>
</div>

## Request-to-proof flow

<div class="ncn-flow-vertical">
  <div class="ncn-flow-step"><strong>1</strong><span>Client sends an RPC request.</span></div>
  <div class="ncn-flow-arrow">↓</div>
  <div class="ncn-flow-step"><strong>2</strong><span>Gateway fans out to operators.</span></div>
  <div class="ncn-flow-arrow">↓</div>
  <div class="ncn-flow-step"><strong>3</strong><span>Operators return response + hash.</span></div>
  <div class="ncn-flow-arrow">↓</div>
  <div class="ncn-flow-step"><strong>4</strong><span>Gateway accepts the quorum hash (≥ 2/3 stake).</span></div>
  <div class="ncn-flow-arrow">↓</div>
  <div class="ncn-flow-step"><strong>5</strong><span>Operators submit interval attestations.</span></div>
  <div class="ncn-flow-arrow">↓</div>
  <div class="ncn-flow-step"><strong>6</strong><span>Epoch finalization updates correctness and reward/offense state.</span></div>
</div>

## System architecture

<div class="ncn-split">
  <div class="ncn-card">
    <h3>POC v1 components</h3>
    <ul>
      <li><strong>Gateway:</strong> request routing + stake-weighted aggregation</li>
      <li><strong>Operators:</strong> RPC execution + signed attestations</li>
      <li><strong>On-chain program:</strong> interval/epoch correctness accounting</li>
      <li><strong>Client SDK:</strong> request and verification support</li>
    </ul>
  </div>
  <button class="viz-card ncn-visual-button" data-viz-src="./specs/images/architecture-diagram.png" data-viz-title="System architecture">
    <img src="./specs/images/architecture-diagram.png" alt="RPC-NCN system architecture diagram" />
    <span>System architecture (click to zoom + pan)</span>
  </button>
</div>

## Repository details

- [Repository README (single-page reference)](https://github.com/BSC-aujl/RPC-NCN-protocol#readme)

## Related background

- [Community discussion thread](https://forum.jito.network/t/blocksize-rpc-ncn-verifiable-high-assurance-infrastructure-for-the-jito-ecosystem/928)

{% include viz-modal.html %}
