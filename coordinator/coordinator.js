#!/usr/bin/env node
/**
 * Sparkle Protocol Reference Coordinator (SIP-3)
 * Coordinates atomic Lightning + Bitcoin PSBT trades
 *
 * WARNING: This is a reference implementation for testnet only.
 * Production coordinators require proper Lightning infrastructure.
 *
 * Usage:
 *   node coordinator.js --port 4000
 */

const http = require('http');
const crypto = require('crypto');

// In-memory trade database
const trades = new Map();
const stats = {
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    expired: 0
};

/**
 * Generate trade ID
 */
function generateTradeId() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Create new trade
 */
function createTrade(params) {
    const {
        inscriptionId,
        sellerLightningNode,
        buyerLightningNode,
        priceMilliSats,
        htlcTimeout
    } = params;

    // Validation
    if (!inscriptionId || !sellerLightningNode || !priceMilliSats) {
        throw new Error('Missing required parameters');
    }

    const tradeId = generateTradeId();
    const now = Date.now();

    const trade = {
        tradeId,
        inscriptionId,
        sellerLightningNode,
        buyerLightningNode: buyerLightningNode || null,
        priceMilliSats: parseInt(priceMilliSats),
        htlcTimeout: htlcTimeout || 144,
        status: 'pending',
        createdAt: now,
        expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours
        sellerPSBT: null,
        buyerPSBT: null,
        htlcHash: null,
        txid: null
    };

    trades.set(tradeId, trade);
    stats.total++;
    stats.pending++;

    return trade;
}

/**
 * Submit seller PSBT
 */
function submitSellerPSBT(tradeId, psbt) {
    const trade = trades.get(tradeId);

    if (!trade) {
        throw new Error('Trade not found');
    }

    if (trade.status !== 'pending') {
        throw new Error(`Trade is ${trade.status}`);
    }

    // Basic PSBT validation (should be more thorough in production)
    if (!psbt || typeof psbt !== 'string') {
        throw new Error('Invalid PSBT');
    }

    trade.sellerPSBT = psbt;
    trade.status = 'awaiting_buyer';

    return trade;
}

/**
 * Submit buyer participation (HTLC hash + PSBT signature)
 */
function submitBuyerParticipation(tradeId, htlcHash, psbt) {
    const trade = trades.get(tradeId);

    if (!trade) {
        throw new Error('Trade not found');
    }

    if (trade.status !== 'awaiting_buyer') {
        throw new Error(`Trade is ${trade.status}`);
    }

    if (!htlcHash || !psbt) {
        throw new Error('Missing HTLC hash or PSBT');
    }

    trade.htlcHash = htlcHash;
    trade.buyerPSBT = psbt;
    trade.status = 'ready_to_settle';

    return trade;
}

/**
 * Settle trade (broadcast PSBT, reveal preimage)
 */
function settleTrade(tradeId, txid, preimage) {
    const trade = trades.get(tradeId);

    if (!trade) {
        throw new Error('Trade not found');
    }

    if (trade.status !== 'ready_to_settle') {
        throw new Error(`Trade is ${trade.status}`);
    }

    trade.txid = txid;
    trade.preimage = preimage;
    trade.status = 'completed';
    trade.completedAt = Date.now();

    stats.pending--;
    stats.completed++;

    return trade;
}

/**
 * Query trade status
 */
function getTrade(tradeId) {
    const trade = trades.get(tradeId);

    if (!trade) {
        throw new Error('Trade not found');
    }

    return trade;
}

/**
 * List trades
 */
function listTrades(filters = {}) {
    let results = Array.from(trades.values());

    if (filters.status) {
        results = results.filter(t => t.status === filters.status);
    }

    if (filters.inscriptionId) {
        results = results.filter(t => t.inscriptionId === filters.inscriptionId);
    }

    return results.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Cleanup expired trades
 */
function cleanupExpiredTrades() {
    const now = Date.now();
    let expired = 0;

    for (const [tradeId, trade] of trades.entries()) {
        if (trade.status === 'pending' && trade.expiresAt < now) {
            trade.status = 'expired';
            stats.pending--;
            stats.expired++;
            expired++;
        }
    }

    return expired;
}

/**
 * REST API handler
 */
function handleRequest(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const url = new URL(req.url, `http://localhost`);
    const path = url.pathname;

    try {
        // POST /trade/create
        if (path === '/trade/create' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const params = JSON.parse(body);
                const trade = createTrade(params);
                res.end(JSON.stringify(trade, null, 2));
            });

        // POST /trade/:id/seller-psbt
        } else if (path.match(/^\/trade\/[a-f0-9]+\/seller-psbt$/) && req.method === 'POST') {
            const tradeId = path.split('/')[2];
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const { psbt } = JSON.parse(body);
                const trade = submitSellerPSBT(tradeId, psbt);
                res.end(JSON.stringify(trade, null, 2));
            });

        // POST /trade/:id/buyer-participate
        } else if (path.match(/^\/trade\/[a-f0-9]+\/buyer-participate$/) && req.method === 'POST') {
            const tradeId = path.split('/')[2];
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const { htlcHash, psbt } = JSON.parse(body);
                const trade = submitBuyerParticipation(tradeId, htlcHash, psbt);
                res.end(JSON.stringify(trade, null, 2));
            });

        // POST /trade/:id/settle
        } else if (path.match(/^\/trade\/[a-f0-9]+\/settle$/) && req.method === 'POST') {
            const tradeId = path.split('/')[2];
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const { txid, preimage } = JSON.parse(body);
                const trade = settleTrade(tradeId, txid, preimage);
                res.end(JSON.stringify(trade, null, 2));
            });

        // GET /trade/:id
        } else if (path.match(/^\/trade\/[a-f0-9]+$/) && req.method === 'GET') {
            const tradeId = path.split('/')[2];
            const trade = getTrade(tradeId);
            res.end(JSON.stringify(trade, null, 2));

        // GET /trades
        } else if (path === '/trades' && req.method === 'GET') {
            const status = url.searchParams.get('status');
            const inscriptionId = url.searchParams.get('inscription');
            const trades = listTrades({ status, inscriptionId });
            res.end(JSON.stringify(trades, null, 2));

        // GET /stats
        } else if (path === '/stats' && req.method === 'GET') {
            res.end(JSON.stringify(stats, null, 2));

        // GET /health
        } else if (path === '/health' && req.method === 'GET') {
            res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));

        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
        }

    } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
    }
}

/**
 * Start server
 */
function startServer(port = 4000) {
    const server = http.createServer(handleRequest);

    // Cleanup expired trades every minute
    setInterval(cleanupExpiredTrades, 60000);

    server.listen(port, () => {
        console.log(`\nSparkle Protocol Coordinator (Reference Implementation)`);
        console.log(`Running on http://localhost:${port}\n`);
        console.log(`WARNING: This is a testnet reference implementation.`);
        console.log(`Production use requires proper Lightning infrastructure.\n`);
        console.log(`Endpoints:`);
        console.log(`  POST /trade/create - Create new trade`);
        console.log(`  POST /trade/:id/seller-psbt - Submit seller PSBT`);
        console.log(`  POST /trade/:id/buyer-participate - Buyer joins trade`);
        console.log(`  POST /trade/:id/settle - Settle trade`);
        console.log(`  GET  /trade/:id - Query trade status`);
        console.log(`  GET  /trades - List trades`);
        console.log(`  GET  /stats - View statistics\n`);
    });
}

// Main
if (require.main === module) {
    const args = process.argv.slice(2);
    const portIdx = args.indexOf('--port');
    const port = portIdx !== -1 ? parseInt(args[portIdx + 1]) : 4000;

    startServer(port);
}

module.exports = {
    createTrade,
    submitSellerPSBT,
    submitBuyerParticipation,
    settleTrade,
    getTrade,
    listTrades
};
