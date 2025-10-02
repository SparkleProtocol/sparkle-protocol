# Security Policy

## Supported Versions

| Version | Status |
|---------|--------|
| 0.1.x   | Alpha - Testnet only |

## Security Status

**WARNING: This is alpha software intended for testnet experimentation only.**

- No production deployments
- No third-party security audits
- No formal verification by external parties
- Use at your own risk

## Known Limitations

### Protocol Design
- **Coordinator Trust**: The coordinator can censor trades but cannot steal funds
- **Reorg Risk**: Deep blockchain reorganizations may revert ownership
- **Lightning Failures**: Payment routing can fail; HTLCs may timeout
- **Mempool Attacks**: Transaction pinning and RBF races are possible

### Implementation Status
- Reference implementations are not production-hardened
- No rate limiting or DDoS protection
- No comprehensive error handling
- Limited input validation

## Reporting a Vulnerability

If you discover a security vulnerability, please email:

**sparkle@sparkleprotocol.com**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline
- Initial response: Within 72 hours
- Status update: Within 1 week
- Fix timeline: Depends on severity

## Security Best Practices

### For Users
1. **Use testnet only** - Do not use with real funds
2. **Verify transactions** - Always check PSBTs before signing
3. **Run your own coordinator** - Eliminate third-party trust
4. **Use 6+ confirmations** - For high-value trades
5. **Set appropriate HTLC timeouts** - Allow sufficient time for confirmation

### For Developers
1. **Never commit secrets** - Use .env files (gitignored)
2. **Validate all inputs** - Check JSON schema compliance
3. **Rate limit APIs** - Prevent abuse
4. **Use HTTPS only** - For production deployments
5. **Implement monitoring** - Track suspicious activity

## Disclosure Policy

- Vulnerabilities will be disclosed publicly after:
  - A fix is available
  - Affected parties are notified
  - Reasonable time for updates (typically 90 days)

- Critical vulnerabilities may be disclosed earlier if actively exploited

## Security Roadmap

Future security improvements (not yet implemented):
- [ ] Third-party security audit
- [ ] Formal verification of critical components
- [ ] Bug bounty program
- [ ] Mainnet readiness assessment
- [ ] Production hardening

## Contact

For security-related questions:
- Email: sparkle@sparkleprotocol.com
- GitHub: https://github.com/SparkleProtocol

**Do not report security vulnerabilities via public GitHub issues.**
