# System Architecture Context (Informative)

**Status:** non-normative context page.

## POC v1 architecture

RPC-NCN POC v1 has four implementation parts:

1. **Gateway** (TypeScript): routes requests, aggregates responses, evaluates stake-weighted quorum.
2. **Operator nodes** (Rust): execute RPC, maintain response hash chains, submit attestations.
3. **On-chain program** (Anchor/Rust): stores NCN/operator/interval state and finalization outcomes.
4. **Client SDK** (TypeScript): request/verification support.

## Verification flow (high level)

1. Client request enters gateway.
2. Gateway fans out to operators.
3. Operators return response + hash.
4. Gateway identifies quorum hash (>=2/3 stake).
5. Operators submit interval attestations on-chain.
6. Interval/epoch finalization updates correctness and reward/offense state.

## Security/economic posture in POC

- stake-weighted consensus threshold: >=2/3
- offense-based penalties and suspension model
- slashing integration remains future/conditional on ecosystem support

## Visuals

- Architecture: `docs/specs/images/architecture-diagram.*`
- Components: `docs/specs/images/component-diagrams.*`
- Implementation map: `docs/specs/images/poc-implementation-status.*`

For normative details, use:
- `specs/core/poc-protocol-v1-draft.md`

For informative implementation context, use:
- `specs/core/ncn-implementation-spec-public-redacted.md`
