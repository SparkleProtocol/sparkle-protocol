# GitHub Repository Setup Guide

This directory contains a clean, production-ready version of the Sparkle Protocol for GitHub.

## What's Included

```
sparkle-protocol-github/
├── .gitignore              # Security: blocks secrets, private files
├── LICENSE                 # MIT License
├── README.md               # Main documentation
├── SECURITY.md             # Security policy
├── CONTRIBUTING.md         # Contribution guidelines
├── schema/
│   └── sip-1-schema.json  # JSON Schema for SIP-1
├── tools/
│   ├── validate-sip1.js   # Validator CLI tool
│   ├── test-vectors.js    # Test runner
│   └── package.json       # npm configuration
├── indexer/
│   └── sparkle-indexer.js # Reference indexer
├── coordinator/
│   └── coordinator.js     # Reference coordinator (SIP-3)
└── docs/
    ├── sip-1.html         # Metadata specification
    ├── sip-2.html         # Upgrade semantics
    ├── sip-3.html         # Lightning trades
    └── sip-4.html         # Combined spec
```

## What's NOT Included (Security)

- Private assessment documents
- Test inscription files with wallet data
- Development notes and brutal assessments
- Cost analysis documents
- Deployment scripts with credentials
- Any files containing "darkita", passwords, or secrets

## Setup Instructions

### 1. Initialize Git Repository

```bash
cd sparkle-protocol-github
git init
git add .
git commit -m "Initial commit: Sparkle Protocol v0.1.0

- SIP-1 JSON Schema specification
- Reference validator and test suite
- Reference indexer with REST API
- Reference coordinator for Lightning trades
- Complete documentation
"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `sparkle-protocol`
3. Description: `Lightning-enabled Bitcoin Ordinals with recursive inscriptions`
4. Public repository
5. **DO NOT** initialize with README (we have one)
6. Click "Create repository"

### 3. Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sparkle-protocol.git
git push -u origin main
```

### 4. Configure Repository Settings

**Topics** (add these tags):
- `bitcoin`
- `ordinals`
- `lightning-network`
- `nft`
- `protocol`
- `recursive-inscriptions`

**Description:**
```
Lightning-enabled Bitcoin Ordinals NFT protocol with recursive inscriptions. Alpha specification with reference implementations.
```

**Website:**
```
https://sparkleprotocol.com
```

### 5. Create First Release

1. Go to repository → Releases → Create a new release
2. Tag version: `v0.1.0`
3. Release title: `v0.1.0 - Alpha Specification`
4. Description:

```markdown
## Sparkle Protocol v0.1.0 (Alpha)

First public release of the Sparkle Protocol specification and reference implementations.

### What's Included

- ✅ SIP-1: Metadata Schema specification
- ✅ JSON Schema validator with canonicalization
- ✅ Test vector suite (10 test cases)
- ✅ Reference indexer with REST API
- ✅ Reference coordinator for Lightning trades (SIP-3)
- ✅ Complete HTML documentation

### Status

**WARNING: Alpha software - Testnet only**

- No production deployments
- No third-party security audits
- Protocol may change based on feedback
- Use at your own risk

### Installation

```bash
npm install
npm test
```

### Documentation

- [README.md](README.md) - Quick start guide
- [SIP-1](docs/sip-1.html) - Metadata specification
- [SIP-3](docs/sip-3.html) - Lightning trades
- [SECURITY.md](SECURITY.md) - Security policy

### Known Limitations

- Coordinator is centralized (run your own to mitigate)
- No wallet integration yet
- No marketplace support
- Reorg risk (standard Bitcoin finality applies)

See [SECURITY.md](SECURITY.md) for full details.
```

## Security Checklist

Before pushing, verify:

- [ ] No passwords or API keys in code
- [ ] No wallet seeds or private keys
- [ ] No `.env` files committed
- [ ] No personal email addresses (use sparkle@sparkleprotocol.com)
- [ ] No test inscription data with real addresses
- [ ] `.gitignore` is present and comprehensive

## Post-Publication Tasks

1. **Update website** - Add real GitHub link to sparkleprotocol.com
2. **Social media** - Announce on Twitter (@SparkleProtocol)
3. **Community** - Enable GitHub Discussions
4. **Issues** - Enable issue templates
5. **CI/CD** - Set up GitHub Actions for automated testing

## Contact

For questions about this setup:
- Email: sparkle@sparkleprotocol.com
- GitHub: @SparkleProtocol
