# Contributing (Public Protocol Repo)

Thanks for helping improve the RPC-NCN protocol specs.

## Scope
Contributions here should be protocol-level and public-safe:
- Normative spec text
- RFC proposals
- Schemas and conformance vectors
- Versioning and governance docs

Do **not** submit:
- Implementation runtime code
- Secrets, credentials, internal endpoints, or operational runbooks

## Before opening a PR
1. Check whether the change is normative or informative.
2. If protocol behavior changes, open/update an RFC in `rfcs/`.
3. Document compatibility impact (non-breaking vs breaking).
4. Update tests/vectors/schemas when behavior changes.

## Pull request expectations
- Keep PRs focused and reviewable.
- Use precise, unambiguous wording in normative sections.
- Link related issues/RFCs.
- Include a short migration note when relevant.

## Review and ownership
Maintainers under **Blocksize** review for protocol correctness, compatibility, and publication safety.

## Security and sensitive findings
Do not publish exploit details or sensitive operational data in issues/PRs.
If needed, request a private reporting path from maintainers first.
