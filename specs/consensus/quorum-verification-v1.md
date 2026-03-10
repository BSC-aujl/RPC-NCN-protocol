# Consensus / Quorum Verification Rules (v1)

**Status:** normative.

Source baseline: `../core/poc-protocol-v1-draft.md`.

## Quorum definition

Consensus is reached when operators representing **>= 2/3 of active stake** agree on the same response hash.

## Per-request flow requirements

1. Operators return `(response, response_hash)` for the request.
2. Gateway groups operator results by `response_hash`.
3. Gateway sums stake weight per hash.
4. The first hash meeting the quorum threshold is the accepted result.

## Interval attestation requirements

- Operators maintain per-interval chained hashes of their own responses.
- At interval close, operators submit signed attestation records on-chain.
- On-chain logic evaluates quorum/correctness from submitted attestations and stake weights.

## Safety threshold

- Model target: tolerate `< 1/3` malicious active stake.

## Notes

This file defines the extracted consensus rules for v1. If divergence appears, update this file and `../core/poc-protocol-v1-draft.md` together in one change.
