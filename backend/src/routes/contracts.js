const express = require('express');
const router = express.Router();
const { composeContract } = require('../engine/composer.js');

// Import the middleware functions. The .js extension makes the path explicit.
const { authenticateToken } = require('../middleware/authenticateToken.js');
const { rateLimitMiddleware } = require('../middleware/rateLimit.js');

/**
 * POST /api/generate-contract
 * This route is protected by both rate limiting and authentication.
 */
router.post('/generate-contract', rateLimitMiddleware, authenticateToken, async (req, res) => {
    // Basic validation to ensure the request body exists and has the correct structure.
    if (!req.body || !req.body.parameters || !req.body.options) {
        return res.status(400).json({ error: 'Invalid request payload. Missing parameters or options.' });
    }

    try {
        const userInput = req.body;
        const contractContent = await composeContract(userInput);

        res.status(200).json({
            contract: contractContent,
            contractType: userInput.contractType,
            clientName: userInput.parameters.clientName,
            otherPartyName: userInput.parameters.otherPartyName,
            jurisdiction: userInput.jurisdiction
        });

    } catch (error) {
        console.error('Contract generation failed:', error);
        res.status(500).json({ error: 'An unexpected error occurred while generating the contract.' });
    }
});


// This is the critical line that exports the router for server.js to use.
module.exports = router;
