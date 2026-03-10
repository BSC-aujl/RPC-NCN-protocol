# Contributing

How to propose changes to this public protocol repository.

**Protocol status of this page:** Informative/process guidance.

## Scope for contributions

Allowed:
- Protocol specification text
- RFC proposals
- Schemas and conformance assets
- Versioning/governance process documents

Out of scope:
- Runtime/service implementation code
- Internal operational runbooks
- Sensitive or non-public material (see [Publication Policy](./publication-policy.md))

## Required flow

1. Classify your change:
   - **Normative protocol behavior change**, or
   - **Informative/editorial/process only**
2. If behavior changes, create/update an RFC in `rfcs/`.
3. Add explicit compatibility impact (backward/forward/breaking).
4. Update linked artifacts when applicable:
   - `schemas/`
   - `reference-test-vectors/`
   - `compliance-tests/`
5. Keep wording precise and unambiguous in normative text.

## PR expectations

- Keep PRs focused and reviewable.
- Link related issues/RFCs.
- Include migration notes for implementers when relevant.
- Confirm content is publication-safe per [Publication Policy](./publication-policy.md).

## Review

Maintainers under **Blocksize** review protocol correctness, compatibility, and publication safety.

## Security reporting

Do not post exploit details or sensitive operational data in public issues/PRs.
Request a secure reporting path from maintainers when needed.
