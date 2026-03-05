# RPC-NCN Protocol Publication Policy

Visibility: **Public**  
Owner alias in-repo: **Blocksize**

**Protocol status of this file:** Governance policy (not protocol behavior).

This is the canonical policy for what may be published in this repository.

## Publication model

- Curated, copy-first migration from source monorepo (`repos/RPC-NCN`)
- Protocol-focused content only
- No implementation source code or operational internals

## Prohibited content (must not be published)

- Secrets, private keys, credentials, tokens
- Private/internal endpoints or infrastructure identifiers
- Internal runbooks and incident procedures
- Detailed exploit instructions before coordinated disclosure

## Included source mappings (current)

- `specs/poc-protocol-v1.md` → `specs/core/poc-protocol-v1-draft.md` (canonical)
- Legacy compatibility alias retained at `specs/wire-format/poc-protocol-v1.md`
- `specs/ncn-implementation-spec.md` → `specs/core/ncn-implementation-spec-public-redacted.md`

## Release gates

All public changes should pass:
1. **Safety gate:** no prohibited content
2. **Scope gate:** protocol/public-doc scope only
3. **Process gate:** behavior changes are reflected in RFC/governance flow
4. **Traceability gate:** related schema/vector/compliance artifacts are linked when behavior changes

## Cross-references

- Contribution workflow: `docs/CONTRIBUTING.md`
- Migration backlog: `docs/MIGRATION_CHECKLIST.md`
