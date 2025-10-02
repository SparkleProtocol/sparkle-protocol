#!/usr/bin/env node
/**
 * Sparkle Protocol Test Vector Runner
 * Runs all test vectors from SIP-1 specification
 */

const { validateInscription } = require('./validate-sip1');

const testVectors = [
    {
        name: 'Minimal valid inscription',
        json: '{"p":"sparkle","v":1}',
        shouldPass: true
    },
    {
        name: 'NFT with recursive layers',
        json: '{"layers":[{"id":"6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0","z":0}],"meta":{"name":"NFT #1"},"p":"sparkle","v":1}',
        shouldPass: true
    },
    {
        name: 'Lightning-enabled NFT',
        json: '{"lightning":{"enabled":true,"htlc_timeout":144,"network":"testnet"},"p":"sparkle","v":1}',
        shouldPass: true
    },
    {
        name: 'Missing protocol field',
        json: '{"v":1,"meta":{"name":"Invalid"}}',
        shouldPass: false
    },
    {
        name: 'Wrong version',
        json: '{"p":"sparkle","v":2}',
        shouldPass: false
    },
    {
        name: 'Empty layers array',
        json: '{"layers":[],"p":"sparkle","v":1}',
        shouldPass: true
    },
    {
        name: 'Max HTLC timeout',
        json: '{"lightning":{"enabled":true,"htlc_timeout":1008},"p":"sparkle","v":1}',
        shouldPass: true
    },
    {
        name: 'Exceeds max HTLC',
        json: '{"lightning":{"enabled":true,"htlc_timeout":2000},"p":"sparkle","v":1}',
        shouldPass: false
    },
    {
        name: 'Invalid inscription ID format',
        json: '{"layers":[{"id":"invalid","z":0}],"p":"sparkle","v":1}',
        shouldPass: false
    },
    {
        name: 'Additional properties',
        json: '{"p":"sparkle","v":1,"custom":"not_allowed"}',
        shouldPass: false
    }
];

function runTests() {
    let passed = 0;
    let failed = 0;

    console.log('Running SIP-1 Test Vectors\n');
    console.log('='.repeat(60));

    testVectors.forEach((test, index) => {
        const result = validateInscription(test.json);
        const testPassed = result.valid === test.shouldPass;

        if (testPassed) {
            console.log(`\n✓ Test ${index + 1}: ${test.name}`);
            passed++;
        } else {
            console.log(`\n✗ Test ${index + 1}: ${test.name} [FAILED]`);
            console.log(`  Expected: ${test.shouldPass ? 'PASS' : 'FAIL'}`);
            console.log(`  Got: ${result.valid ? 'PASS' : 'FAIL'}`);
            if (result.errors) {
                console.log(`  Errors: ${result.errors.join(', ')}`);
            }
            failed++;
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\nResults: ${passed}/${testVectors.length} passed, ${failed} failed\n`);

    process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
    runTests();
}

module.exports = { testVectors };
