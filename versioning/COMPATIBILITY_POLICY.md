# Semantic Versioning and Compatibility Policy

**Status:** normative policy for protocol version interpretation.

## Version scheme

Protocol versions follow `MAJOR.MINOR.PATCH`.

- **PATCH:** editorial fixes or clarifications with no behavior change.
- **MINOR:** backward-compatible behavior extensions.
- **MAJOR:** breaking behavior or serialization/state compatibility changes.

## Change classification requirements

Any protocol-affecting PR must explicitly declare one of:
- backward compatible
- forward compatible
- breaking

## Coupled update requirements

Behavior changes must include:
- RFC update in `rfcs/`
- linked spec changes in `specs/`
- conformance impact in `reference-test-vectors/` and/or `compliance-tests/`
- schema/version map updates in `schemas/`
