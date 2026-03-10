---
layout: default
title: Publication Policy
---

# Publication policy

This page summarizes public-release safety requirements for docs published from this repository.

## Do publish

- Protocol semantics and compatibility rules
- Public architecture and verification flow explanations
- RFC/governance process content
- Schemas, conformance assets, and versioning notes

## Do not publish

- Secrets, credentials, tokens, or private keys
- Sensitive operational controls or infrastructure internals
- Incident-specific exploit details
- Any material not approved for public release

## Release gate

Before publishing docs updates:

1. Run link checks for `README.md` and `docs/**/*.md`.
2. Confirm no sensitive or restricted content is included.
3. Keep normative vs informative boundaries explicit.
4. Ensure wording is neutral, concise, and newcomer-readable.

For full governance and gate details, maintainers use the repository root `PUBLICATION_POLICY.md` as the canonical repository publication checklist.
