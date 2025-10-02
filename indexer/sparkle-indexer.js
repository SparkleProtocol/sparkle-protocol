#!/usr/bin/env node
/**
 * Sparkle Protocol Reference Indexer
 * Scans Bitcoin Ordinals inscriptions for Sparkle Protocol metadata
 *
 * Usage:
 *   node sparkle-indexer.js --ord-url http://localhost:80 --scan
 *   node sparkle-indexer.js --query <inscription_id>
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load validator
const { validateInscription } = require('../tools/validate-sip1');

// Configuration
const ORD_SERVER = process.env.ORD_SERVER || 'http://localhost:80';
const DB_PATH = path.join(__dirname, 'sparkle.db.json');

/**
 * Fetch inscription metadata from ord server
 */
function fetchInscription(inscriptionId) {
    return new Promise((resolve, reject) => {
        const url = `${ORD_SERVER}/inscription/${inscriptionId}`;

        http.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Parse inscription content and check if it's Sparkle Protocol
 */
function parseSparkleInscription(content) {
    try {
        // Try to parse as JSON
        const data = JSON.parse(content);

        // Check if it has Sparkle Protocol markers
        if (data.p !== 'sparkle') {
            return null;
        }

        // Validate against schema
        const result = validateInscription(content);

        if (!result.valid) {
            return {
                isSparkle: true,
                valid: false,
                errors: result.errors
            };
        }

        return {
            isSparkle: true,
            valid: true,
            version: data.v,
            hasLayers: Boolean(data.layers && data.layers.length > 0),
            hasLightning: Boolean(data.lightning && data.lightning.enabled),
            metadata: data.meta || {},
            canonical: result.canonical
        };

    } catch (e) {
        return null;
    }
}

/**
 * Load database
 */
function loadDB() {
    if (fs.existsSync(DB_PATH)) {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
    return {
        inscriptions: {},
        stats: {
            total: 0,
            valid: 0,
            invalid: 0,
            withLayers: 0,
            withLightning: 0
        }
    };
}

/**
 * Save database
 */
function saveDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

/**
 * Index a single inscription
 */
async function indexInscription(inscriptionId) {
    console.log(`Fetching ${inscriptionId}...`);

    try {
        const content = await fetchInscription(inscriptionId);
        const result = parseSparkleInscription(content);

        if (!result) {
            console.log(`  Not a Sparkle inscription`);
            return null;
        }

        const db = loadDB();

        db.inscriptions[inscriptionId] = {
            ...result,
            indexedAt: new Date().toISOString()
        };

        // Update stats
        db.stats.total++;
        if (result.valid) {
            db.stats.valid++;
            if (result.hasLayers) db.stats.withLayers++;
            if (result.hasLightning) db.stats.withLightning++;
        } else {
            db.stats.invalid++;
        }

        saveDB(db);

        console.log(`  ✓ Indexed as Sparkle v${result.version} (valid: ${result.valid})`);
        return result;

    } catch (e) {
        console.error(`  Error: ${e.message}`);
        return null;
    }
}

/**
 * Query indexed inscriptions
 */
function queryInscriptions(filter = {}) {
    const db = loadDB();

    let results = Object.entries(db.inscriptions);

    // Apply filters
    if (filter.valid !== undefined) {
        results = results.filter(([id, data]) => data.valid === filter.valid);
    }

    if (filter.hasLayers) {
        results = results.filter(([id, data]) => data.hasLayers);
    }

    if (filter.hasLightning) {
        results = results.filter(([id, data]) => data.hasLightning);
    }

    return results.map(([id, data]) => ({ id, ...data }));
}

/**
 * Display stats
 */
function displayStats() {
    const db = loadDB();

    console.log('\n=== Sparkle Protocol Indexer Stats ===\n');
    console.log(`Total Sparkle inscriptions: ${db.stats.total}`);
    console.log(`  Valid: ${db.stats.valid}`);
    console.log(`  Invalid: ${db.stats.invalid}`);
    console.log(`  With layers: ${db.stats.withLayers}`);
    console.log(`  With Lightning: ${db.stats.withLightning}`);
    console.log('');
}

/**
 * REST API server
 */
function startServer(port = 3000) {
    const server = http.createServer((req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Parse URL
        const url = new URL(req.url, `http://localhost:${port}`);

        // Routes
        if (url.pathname === '/stats') {
            const db = loadDB();
            res.end(JSON.stringify(db.stats, null, 2));

        } else if (url.pathname === '/inscriptions') {
            const validOnly = url.searchParams.get('valid') === 'true';
            const hasLayers = url.searchParams.get('layers') === 'true';
            const hasLightning = url.searchParams.get('lightning') === 'true';

            const results = queryInscriptions({
                valid: validOnly ? true : undefined,
                hasLayers: hasLayers,
                hasLightning: hasLightning
            });

            res.end(JSON.stringify(results, null, 2));

        } else if (url.pathname.startsWith('/inscription/')) {
            const id = url.pathname.split('/')[2];
            const db = loadDB();

            if (db.inscriptions[id]) {
                res.end(JSON.stringify(db.inscriptions[id], null, 2));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not found' }));
            }

        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    });

    server.listen(port, () => {
        console.log(`\nSparkle Indexer API running on http://localhost:${port}`);
        console.log(`  GET /stats - View statistics`);
        console.log(`  GET /inscriptions?valid=true&layers=true - Query inscriptions`);
        console.log(`  GET /inscription/<id> - Get specific inscription\n`);
    });
}

// Main CLI
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help')) {
        console.log(`
Sparkle Protocol Reference Indexer

Usage:
  node sparkle-indexer.js --index <inscription_id>    Index a specific inscription
  node sparkle-indexer.js --stats                     Display statistics
  node sparkle-indexer.js --query [--valid]           Query indexed inscriptions
  node sparkle-indexer.js --server [--port 3000]      Start REST API server

Environment:
  ORD_SERVER    Ord server URL (default: http://localhost:80)
`);
        process.exit(0);
    }

    if (args.includes('--stats')) {
        displayStats();

    } else if (args.includes('--index')) {
        const idx = args.indexOf('--index');
        const inscriptionId = args[idx + 1];

        if (!inscriptionId) {
            console.error('Error: --index requires an inscription ID');
            process.exit(1);
        }

        await indexInscription(inscriptionId);

    } else if (args.includes('--query')) {
        const validOnly = args.includes('--valid');
        const results = queryInscriptions({ valid: validOnly ? true : undefined });

        console.log(JSON.stringify(results, null, 2));

    } else if (args.includes('--server')) {
        const portIdx = args.indexOf('--port');
        const port = portIdx !== -1 ? parseInt(args[portIdx + 1]) : 3000;

        displayStats();
        startServer(port);

    } else {
        console.error('Error: Unknown command. Use --help for usage information.');
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error(`Fatal error: ${err.message}`);
        process.exit(1);
    });
}

module.exports = {
    indexInscription,
    queryInscriptions,
    loadDB
};
