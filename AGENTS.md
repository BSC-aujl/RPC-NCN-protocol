# AGENTS.md

This repository is publication-facing protocol documentation. Optimize for clarity, safety, and minimal duplication.

## Hard Rules (Docs)

1. **One canonical owner per topic.**
   - Do not duplicate requirements across files.
   - In non-canonical files, keep only a short summary and link to the canonical source.

2. **Be concise by default.**
   - Prefer short sections, bullets, and tables.
   - Remove repeated background text.
   - Keep examples minimal and explicitly non-authoritative.

3. **Separate protocol normativity from guidance.**
   - `specs/`, `schemas/`, `reference-test-vectors/`, `compliance-tests/`, `versioning/` are protocol-facing sources.
   - `README.md`, `docs/`, `PUBLICATION_POLICY.md`, and process docs are informative/governance unless explicitly stated otherwise.
   - Do not introduce protocol requirements in informative docs.

4. **Public-safe content only.**
   - Never publish secrets, private endpoints, credentials, internal runbooks, or exploit details.
   - If unsure, stop and request maintainer review before publishing.

5. **Change coupling is mandatory for behavior changes.**
   - Protocol behavior change => RFC + compatibility impact + linked schema/vector/compliance updates.

6. **Preserve traceability.**
   - Use explicit links between RFCs, specs, and conformance assets.
   - Keep wording stable; avoid ambiguous normative language.

## Canonical Ownership Map

- Repository scope and doc ownership map: `README.md`
- Public docs landing page: `docs/index.md`
- Contribution workflow: `docs/CONTRIBUTING.md`
- Publication safety and release gates: `PUBLICATION_POLICY.md`
- Migration backlog: `docs/MIGRATION_CHECKLIST.md`
