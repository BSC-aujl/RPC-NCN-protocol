# Governance / Approval Flow for Protocol Updates

**Status:** governance process (informative, but required for maintainer workflow).

## Change flow

1. Classify change type (normative vs informative-only).
2. For normative changes, open/update RFC from `../rfcs/RFC-TEMPLATE.md`.
3. Document compatibility impact and target version.
4. Update linked artifacts (spec/schema/vector/compliance/versioning) as required.
5. Maintainer review for protocol correctness + publication safety.
6. Merge and release-note entry with version impact.

## Approval expectations

Normative changes require:
- clear RFC rationale,
- compatibility classification,
- traceable artifact links,
- no publication-policy violations.

See: `../PUBLICATION_POLICY.md` and `../versioning/COMPATIBILITY_POLICY.md`.
