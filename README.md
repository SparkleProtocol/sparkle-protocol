# Sparkle Protocol

**Lightning-enabled Bitcoin Ordinals NFTs with recursive inscriptions**

**Status:** Alpha specification (v0.1.0) — Testnet only

---

## Overview

Sparkle Protocol enables atomic trades of Bitcoin Ordinals NFTs using Lightning Network payments. By combining recursive inscriptions with Hash Time-Locked Contracts (HTLCs), it enables sub-second settlement with Bitcoin-level security.

**Key Features:**
- Atomic Lightning + Bitcoin PSBT swaps
- Recursive parent-child inscriptions (96% cost reduction)
- JSON Schema validation
- Reference indexer and coordinator

**Security Model:**
- HTLC atomicity guarantees
- Standard Bitcoin 6-block finality
- Coordinator can censor but cannot steal funds
- Run your own coordinator to eliminate trust

---

## Repository Structure

```
sparkle-protocol/
├── schema/
│   └── sip-1-schema.json          # JSON Schema for SIP-1 validation
├── tools/
│   ├── validate-sip1.js           # CLI validator tool
│   ├── test-vectors.js            # Test vector runner
│   └── package.json               # npm package config
├── indexer/
│   └── sparkle-indexer.js         # Reference inscription indexer
├── coordinator/
│   └── coordinator.js             # Reference trade coordinator
├── docs/
│   └── sip-*.html                 # Specification documents
└── README.md                      # This file
```

---

## Installation

### Prerequisites

- Node.js 18+
- Bitcoin Core (for production use)
- Ord v0.19+ (for inscription indexing)

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/sparkle-protocol.git
cd sparkle-protocol

# Install dependencies
cd tools
npm install
```

---

## Quick Start

### 1. Validate Inscriptions

```bash
# Validate a JSON file
node tools/validate-sip1.js test.json

# Validate from stdin
echo '{"p":"sparkle","v":1}' | node tools/validate-sip1.js

# Run test vectors
npm test
```

### 2. Run Indexer

```bash
# Index a specific inscription
node indexer/sparkle-indexer.js --index abc123...i0

# View statistics
node indexer/sparkle-indexer.js --stats

# Start REST API server
node indexer/sparkle-indexer.js --server --port 3000
```

### 3. Run Coordinator (Testnet)

```bash
# Start coordinator on port 4000
node coordinator/coordinator.js --port 4000

# Create trade
curl -X POST http://localhost:4000/trade/create \
  -H "Content-Type: application/json" \
  -d '{
    "inscriptionId": "abc123...i0",
    "sellerLightningNode": "03abc...",
    "priceMilliSats": 100000000
  }'
```

---

## SIP-1: Metadata Standard

Minimal valid inscription:

```json
{
  "p": "sparkle",
  "v": 1
}
```

NFT with recursive layers:

```json
{
  "p": "sparkle",
  "v": 1,
  "layers": [
    {"id": "abc123...i0", "z": 0},
    {"id": "def456...i0", "z": 1}
  ],
  "meta": {
    "name": "DARKITA #1",
    "collection": "DARKITA Genesis"
  }
}
```

Lightning-enabled NFT:

```json
{
  "p": "sparkle",
  "v": 1,
  "lightning": {
    "enabled": true,
    "network": "testnet",
    "htlc_timeout": 144
  }
}
```

---

## API Documentation

### Validator API

```javascript
const { validateInscription } = require('./tools/validate-sip1');

const result = validateInscription('{"p":"sparkle","v":1}');
console.log(result.valid); // true
```

### Indexer API

```javascript
const { indexInscription, queryInscriptions } = require('./indexer/sparkle-indexer');

// Index inscription
await indexInscription('abc123...i0');

// Query valid inscriptions
const valid = queryInscriptions({ valid: true });
```

### Coordinator API

```javascript
const { createTrade } = require('./coordinator/coordinator');

const trade = createTrade({
  inscriptionId: 'abc123...i0',
  sellerLightningNode: '03abc...',
  priceMilliSats: 100000000,
  htlcTimeout: 144
});
```

---

## Testing

```bash
cd tools
npm test

# Output:
# Running SIP-1 Test Vectors
# ============================================================
# ✓ Test 1: Minimal valid inscription
# ✓ Test 2: NFT with recursive layers
# ✓ Test 3: Lightning-enabled NFT
# ...
# Results: 10/10 passed, 0 failed
```

---

## Security Considerations

**What Sparkle Protocol DOES provide:**
- Atomic swaps (HTLC prevents partial execution)
- Standard Bitcoin finality (6+ confirmations)
- Censorship resistance (run your own coordinator)

**What Sparkle Protocol DOES NOT provide:**
- Instant finality (Bitcoin requires ~10 min for on-chain settlement)
- Protection against deep reorgs (standard Bitcoin risk)
- Trustless coordination (coordinator can censor trades)

**Recommendations:**
1. Use 6+ block confirmations for high-value trades
2. Set HTLC timeout > PSBT confirmation target + safety margin
3. Run your own coordinator for censorship resistance
4. Verify inscription ownership before trading

---

## Development Status

### Completed
- [x] SIP-1 JSON Schema specification
- [x] Reference validator with canonicalization
- [x] Test vector suite (10 cases)
- [x] Reference indexer with REST API
- [x] Reference coordinator (testnet)

### In Progress
- [ ] Production Lightning integration
- [ ] Wallet SDK for inscriptions
- [ ] Marketplace integration guide
- [ ] DARKITA 10K collection deployment

### Future SIPs
- SIP-2: Protocol upgrades
- SIP-4: Marketplace integration
- SIP-5: Collection standards

---

## Contributing

This is an alpha specification. Feedback is welcome via:
- GitHub Issues
- Pull Requests
- Twitter: @sparkleprotocol (placeholder)

**Note:** No wallet or marketplace integration exists yet. This is a public specification with reference implementations.

---

## License

MIT License

Copyright (c) 2025 David Michael

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## Disclaimer

**EXPERIMENTAL SOFTWARE — USE AT YOUR OWN RISK**

This is alpha software on testnet only. The protocol may change. No guarantees are made about compatibility, security, or fitness for any purpose. Always verify transactions before signing.

**Brand Disambiguation:**
- Not affiliated with [Lightspark's Spark](https://www.lightspark.com/) (Bitcoin L2)
- Not affiliated with [Maker/Sky's Spark Protocol](https://www.spark.fi/) (DeFi/Lending)

---

**Website:** https://sparkleprotocol.com
**Author:** David Michael
**Version:** 0.1.0 (Alpha Draft)
