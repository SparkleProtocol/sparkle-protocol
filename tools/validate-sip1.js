#!/usr/bin/env node
/**
 * Sparkle Protocol SIP-1 Validator
 * Validates inscription metadata against the SIP-1 JSON Schema
 *
 * Usage:
 *   node validate-sip1.js <file.json>
 *   echo '{"p":"sparkle","v":1}' | node validate-sip1.js
 */

const fs = require('fs');
const Ajv = require('ajv');
const path = require('path');

// Load the schema
const schemaPath = path.join(__dirname, '../schema/sip-1-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Initialize validator
const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

/**
 * Canonicalize JSON (alphabetical keys, no whitespace)
 */
function canonicalize(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * Validate a Sparkle inscription
 */
function validateInscription(jsonString) {
    let data;

    // Parse JSON
    try {
        data = JSON.parse(jsonString);
    } catch (e) {
        return {
            valid: false,
            errors: [`Invalid JSON: ${e.message}`]
        };
    }

    // Validate against schema
    const valid = validate(data);

    if (!valid) {
        return {
            valid: false,
            errors: validate.errors.map(err =>
                `${err.instancePath || 'root'}: ${err.message}`
            )
        };
    }

    // Check if canonicalized
    const canonical = canonicalize(data);
    const isCanonical = jsonString.replace(/\s/g, '') === canonical;

    return {
        valid: true,
        canonical: isCanonical,
        canonicalForm: canonical,
        warnings: isCanonical ? [] : ['JSON is not canonicalized']
    };
}

// Main execution
function main() {
    let input;

    // Read from file or stdin
    if (process.argv[2]) {
        try {
            input = fs.readFileSync(process.argv[2], 'utf8');
        } catch (e) {
            console.error(`Error reading file: ${e.message}`);
            process.exit(1);
        }
    } else {
        // Read from stdin
        input = fs.readFileSync(0, 'utf8');
    }

    const result = validateInscription(input);

    if (result.valid) {
        console.log('✓ VALID SIP-1 inscription');

        if (result.warnings.length > 0) {
            console.log('\nWarnings:');
            result.warnings.forEach(w => console.log(`  - ${w}`));
            console.log(`\nCanonical form:\n${result.canonicalForm}`);
        }

        process.exit(0);
    } else {
        console.error('✗ INVALID SIP-1 inscription\n');
        console.error('Errors:');
        result.errors.forEach(e => console.error(`  - ${e}`));
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateInscription, canonicalize };
