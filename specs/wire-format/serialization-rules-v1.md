# Wire Format and Canonical Serialization Rules (v1)

**Status:** normative.

Source baseline: `../core/poc-protocol-v1-draft.md`.

## Canonical hashing input

Protocol verification depends on deterministic hashing of operator responses. For a fixed logical response payload, all implementations MUST produce the same hash input bytes.

## Required behavior

1. Use a deterministic serialization for hashed response payloads.
2. Do not include transport-only metadata in hashed payloads.
3. Keep field ordering and encoding stable for each protocol version.
4. Version changes that alter serialization are compatibility events and require RFC + versioning updates.

## Hash-chaining linkage

Per-interval hash chains operate on per-request response hashes and therefore inherit canonical-serialization requirements.

## Compatibility alias

For older links, `poc-protocol-v1.md` remains as a pointer to canonical sources.
