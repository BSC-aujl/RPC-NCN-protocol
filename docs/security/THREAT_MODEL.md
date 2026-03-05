# RPC-NCN Security Threat Model

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** POC Protocol v1

This document describes the security threats, attack vectors, mitigations, and test coverage for the RPC-NCN verified RPC system.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Trust Assumptions](#trust-assumptions)
3. [Threat Categories](#threat-categories)
4. [Detailed Threat Analysis](#detailed-threat-analysis)
5. [Test Coverage Matrix](#test-coverage-matrix)
6. [Security Recommendations](#security-recommendations)

---

## System Overview

RPC-NCN provides verified RPC responses through:
- **Operators**: Run RPC proxies, sign responses with ED25519 keys
- **Gateway**: Routes requests, aggregates responses, checks consensus
- **On-Chain Program**: Manages operator registration, stake, and attestations

```
Client → Gateway → [Operator 1, 2, 3] → Solana RPC
              ↓                ↓
         Consensus      Attestations
              ↓                ↓
         On-Chain NCN Program
```

---

## Trust Assumptions

### Trusted Components
- Solana validator RPC endpoints (data source)
- ED25519 cryptographic primitives
- On-chain program execution environment

### Partially Trusted
- Operators (economically incentivized via stake)
- Gateway (can be replicated/verified)

### Untrusted
- External clients
- Network layer
- Individual operator hardware

### Security Threshold
- System remains secure if **< 1/3 of stake** is malicious
- Requires **≥ 2/3 stake** agreement for consensus

---

## Threat Categories

| Category | Severity | Components Affected |
|----------|----------|---------------------|
| Consensus Manipulation | Critical | Gateway, On-Chain |
| Authentication Bypass | High | Gateway |
| Data Integrity | High | Operator, Gateway |
| Denial of Service | Medium | All |
| Information Disclosure | Low | Operator, Gateway |

---

## Detailed Threat Analysis

### 1. Consensus Manipulation Attacks

#### 1.1 Sybil Attack
**Description:** Attacker creates many fake operators to influence consensus.

**Attack Vector:**
- Register many operators with minimal stake
- Coordinate to submit false responses

**Mitigation:**
- Stake-weighted consensus (not operator count)
- Minimum stake requirement (1 SOL per operator)
- On-chain operator registration with economic stake

**Test Coverage:**
- `gateway/tests/security/quorum-attacks.test.ts` - Sybil resistance tests
- `gateway/tests/fuzz/consensus.fuzz.test.ts` - Property: many low-stake attackers

#### 1.2 Stake Manipulation
**Description:** Attacker acquires > 33% stake to block consensus or > 66% to control it.

**Attack Vector:**
- Accumulate stake through Jito restaking
- Time attack for when honest stake is low

**Mitigation:**
- Transparent on-chain stake tracking
- Slashing for detected misbehavior (future)
- Insurance/dispute mechanism (future)

**Test Coverage:**
- `gateway/tests/security/quorum-attacks.test.ts` - Stake threshold tests
- `gateway/tests/fuzz/consensus.fuzz.test.ts` - Property: 33%/67% thresholds

#### 1.3 Collusion Attack
**Description:** Multiple operators collude to return false data.

**Attack Vector:**
- Operators coordinate off-chain
- Submit identical false responses

**Mitigation:**
- Requires > 66% stake collusion (economically expensive)
- Hash chain creates audit trail
- Attestations are on-chain and verifiable

**Test Coverage:**
- `gateway/tests/security/quorum-attacks.test.ts` - Collusion scenarios

#### 1.4 Byzantine Behavior
**Description:** Operators behave inconsistently or non-deterministically.

**Attack Vector:**
- Return different responses to different clients
- Selectively participate in consensus

**Mitigation:**
- Hash chaining creates ordered sequence
- Attestations commit to specific state
- Interval-based aggregation detects inconsistency

**Test Coverage:**
- `gateway/tests/security/quorum-attacks.test.ts` - Byzantine scenarios
- `operator-node/tests/hash_chain_tests.rs` - Concurrent access

---

### 2. Authentication & Authorization

#### 2.1 API Key Enumeration
**Description:** Attacker guesses valid API keys.

**Attack Vector:**
- Brute force API key space
- Timing attacks on validation

**Mitigation:**
- UUID v4 API keys (128-bit entropy)
- Constant-time comparison
- Rate limiting on failed attempts

**Test Coverage:**
- `gateway/tests/security/auth.test.ts` - Invalid key rejection

#### 2.2 Rate Limit Bypass
**Description:** Attacker circumvents request limits.

**Attack Vector:**
- Multiple API keys
- Distributed requests

**Mitigation:**
- Per-subscription tracking
- On-chain subscription registry (future)
- IP-based secondary limits (future)

**Test Coverage:**
- `gateway/tests/security/auth.test.ts` - Rate limit enforcement
- `poc/tests/e2e/run.sh` - Rate limit E2E test

#### 2.3 Privilege Escalation
**Description:** Basic tier user accesses premium features.

**Attack Vector:**
- Modify verification level header
- Replay premium tier tokens

**Mitigation:**
- Server-side subscription lookup
- Ignore client-provided verification level when API key present

**Test Coverage:**
- `gateway/tests/security/auth.test.ts` - Subscription validation

---

### 3. Data Integrity Attacks

#### 3.1 Signature Forgery
**Description:** Attacker forges operator signatures.

**Attack Vector:**
- Guess/calculate ED25519 signature
- Steal operator private key

**Mitigation:**
- ED25519 is cryptographically secure
- Operator keys stored securely (not on-chain)
- Signature includes timestamp and slot

**Test Coverage:**
- `operator-node/tests/signer_tests.rs` - Signature verification
- `operator-node/tests/signer_tests.rs` - Wrong key detection

#### 3.2 Replay Attack
**Description:** Attacker replays old valid responses.

**Attack Vector:**
- Capture signed response
- Replay to client later

**Mitigation:**
- Timestamp in signed message
- Slot number binding
- Interval-based freshness

**Test Coverage:**
- `poc/tests/e2e/run.sh` - Replay attack section
- `operator-node/tests/signer_tests.rs` - No signature reuse

#### 3.3 Hash Chain Tampering
**Description:** Attacker modifies hash chain history.

**Attack Vector:**
- Insert/modify responses in chain
- Reset chain state

**Mitigation:**
- SHA256 chaining (append-only)
- On-chain attestation commits
- Interval boundaries are immutable

**Test Coverage:**
- `operator-node/tests/hash_chain_tests.rs` - Chain integrity
- `operator-node/fuzz/fuzz_targets/fuzz_hash_chain.rs` - Property tests

---

### 4. Input Validation Attacks

#### 4.1 JSON-RPC Injection
**Description:** Malformed RPC requests cause unexpected behavior.

**Attack Vector:**
- Malformed JSON
- SQL/XSS injection in method names
- Buffer overflow in params

**Mitigation:**
- Strict JSON parsing
- Method whitelist (Solana RPC methods)
- Input length limits

**Test Coverage:**
- `gateway/tests/security/auth.test.ts` - Input validation
- `gateway/tests/fuzz/json-rpc.fuzz.test.ts` - Fuzzing
- `poc/tests/e2e/run.sh` - Malformed input section

#### 4.2 Denial of Service
**Description:** Attacker exhausts system resources.

**Attack Vector:**
- Large request bodies
- Deeply nested JSON
- Many concurrent requests

**Mitigation:**
- Request size limits
- Recursion depth limits
- Connection pooling

**Test Coverage:**
- `gateway/tests/fuzz/json-rpc.fuzz.test.ts` - Large input handling
- `poc/tests/e2e/run.sh` - Nested params test

---

### 5. Information Disclosure

#### 5.1 Operator Key Leakage
**Description:** Operator endpoints leak sensitive information.

**Attack Vector:**
- Query /info endpoint
- Error messages with secrets

**Mitigation:**
- /info returns only public key
- Structured error responses
- No stack traces in production

**Test Coverage:**
- `poc/tests/e2e/run.sh` - Operator info endpoint safety

#### 5.2 Timing Side Channels
**Description:** Response timing reveals information.

**Attack Vector:**
- Measure response times
- Infer consensus state

**Mitigation:**
- Aggregated response timing
- Timeout-based batching

**Test Coverage:**
- Manual review recommended

---

## Test Coverage Matrix

| Threat | Unit Tests | Integration Tests | Fuzz Tests | E2E Tests |
|--------|------------|-------------------|------------|-----------|
| Sybil Attack | `quorum-attacks.test.ts` | - | `consensus.fuzz.test.ts` | - |
| Stake Manipulation | `quorum-attacks.test.ts` | - | `consensus.fuzz.test.ts` | - |
| Collusion | `quorum-attacks.test.ts` | - | `consensus.fuzz.test.ts` | - |
| Byzantine | `quorum-attacks.test.ts` | - | - | - |
| API Key Bypass | `auth.test.ts` | - | - | `run.sh` |
| Rate Limit Bypass | `auth.test.ts` | - | - | `run.sh` |
| Signature Forgery | `signer_tests.rs` | - | - | `run.sh` |
| Replay Attack | `signer_tests.rs` | - | - | `run.sh` |
| Hash Chain Tampering | `hash_chain_tests.rs` | - | `fuzz_hash_chain.rs` | - |
| JSON-RPC Injection | `auth.test.ts` | - | `json-rpc.fuzz.test.ts` | `run.sh` |
| DoS (Large Input) | - | - | `json-rpc.fuzz.test.ts` | `run.sh` |
| Info Disclosure | - | - | - | `run.sh` |

---

## Security Recommendations

### Immediate (POC)
1. ✅ Stake-weighted consensus implemented
2. ✅ ED25519 signatures on responses
3. ✅ Hash chaining for audit trail
4. ✅ Input validation on all endpoints
5. ✅ API key authentication

### Short-term (v1.0)
1. ⏳ Slashing implementation for misbehavior
2. ⏳ On-chain subscription registry
3. ⏳ Signature verification on gateway (verify operator signatures)
4. ⏳ TLS for operator-gateway communication

### Long-term (Production)
1. ⏳ Hardware security modules for operator keys
2. ⏳ Formal verification of consensus algorithm
3. ⏳ Bug bounty program
4. ⏳ Third-party security audit
5. ⏳ Insurance mechanism for clients

---

## Running Security Tests

```bash
# Unit + Security Tests
cd poc/gateway && npm test

# Fuzz Tests (Gateway)
cd poc/gateway && npm run test:fuzz

# Fuzz Tests (Operator - requires nightly)
cd poc/operator-node && cargo +nightly fuzz run fuzz_json_rpc
cd poc/operator-node && cargo +nightly fuzz run fuzz_hash_chain
cd poc/operator-node && cargo +nightly fuzz run fuzz_response_hash

# E2E Security Tests
cd poc/tests/e2e && ./run.sh --security

# Full Testnet E2E
cd poc/tests/e2e && ./run-testnet.sh
```

---

## Changelog

- **v1.0** (Jan 2026): Initial threat model for POC Protocol v1
