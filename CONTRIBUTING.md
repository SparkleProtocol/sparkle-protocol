# Contributing to Sparkle Protocol

Thank you for your interest in contributing to Sparkle Protocol!

## Project Status

**Alpha specification (v0.1.0)** - This is an early-stage protocol specification with reference implementations. The protocol may change as we receive feedback.

## Ways to Contribute

### 1. Protocol Design Feedback
- Review the SIP specifications
- Suggest improvements to the protocol
- Identify edge cases or security concerns
- Propose new SIPs

### 2. Code Contributions
- Improve reference implementations
- Add test coverage
- Fix bugs
- Improve documentation

### 3. Testing
- Test on Bitcoin testnet
- Report issues
- Document your testing process
- Share testnet inscription examples

### 4. Documentation
- Improve README clarity
- Add code examples
- Write tutorials
- Translate documentation

## Development Setup

```bash
# Clone the repository
git clone https://github.com/SparkleProtocol/sparkle-protocol.git
cd sparkle-protocol

# Install dependencies
cd tools
npm install

# Run tests
npm test
```

## Pull Request Process

### Before Submitting

1. **Read the specifications** - Understand SIP-1, SIP-2, and SIP-3
2. **Check existing issues** - Avoid duplicate work
3. **Test your changes** - Run `npm test` and verify manually
4. **Update documentation** - If you change behavior

### PR Guidelines

1. **One feature per PR** - Keep changes focused
2. **Write clear commit messages** - Explain what and why
3. **Add tests** - For new functionality
4. **Update README** - If you add new features
5. **Follow code style** - Match existing patterns

### Commit Messages

Use clear, descriptive commit messages:

```
Add validation for HTLC timeout ranges

- Check minimum 6 blocks
- Check maximum 1008 blocks
- Add test cases for edge values
```

## Code Style

- **JavaScript**: Standard JS style
- **Indentation**: 2 spaces
- **Line length**: 80 characters preferred, 100 max
- **Comments**: Explain why, not what
- **Function names**: camelCase
- **Constants**: UPPER_SNAKE_CASE

## Testing Standards

All new features must include tests:

```javascript
// tools/test-vectors.js
{
    name: 'Description of test case',
    json: '{\"p\":\"sparkle\",\"v\":1}',
    shouldPass: true
}
```

## Documentation Standards

- Use clear, simple language
- Provide code examples
- Explain security implications
- Link to related specifications

## Security

- **Never commit secrets** - Use .env files
- **Report vulnerabilities privately** - Email sparkle@sparkleprotocol.com
- **Follow secure coding practices** - Validate all inputs
- See [SECURITY.md](SECURITY.md) for details

## Code of Conduct

### Our Standards

- Be respectful and professional
- Accept constructive criticism
- Focus on what's best for the protocol
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Public or private attacks
- Publishing others' private information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Open an issue for questions
- Email: sparkle@sparkleprotocol.com
- GitHub Discussions: (coming soon)

## Attribution

Contributors will be recognized in:
- GitHub contributors page
- Release notes (for significant contributions)
- Protocol acknowledgments

Thank you for helping improve Sparkle Protocol!
