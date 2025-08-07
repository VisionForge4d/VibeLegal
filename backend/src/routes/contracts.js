const express = require('express');
const router = express.Router();
const { composeContract } = require('../engine/composer.js');
const { authenticateToken } = require('../middleware/authenticateToken.js');
const { rateLimitMiddleware } = require('../middleware/rateLimit.js');

module.exports = (pool) => {
    router.post('/generate-contract', rateLimitMiddleware, authenticateToken, async (req, res) => {
        if (!req.body || !req.body.parameters || !req.body.options || !req.body.parameters.title) {
            return res.status(400).json({ error: 'Invalid request payload. Missing title, parameters, or options.' });
        }
        
        const userId = req.user.userId;
        const userInput = req.body;

        try {
            // 1. Generate the contract content using the composer engine.
            const contractContent = await composeContract(userInput);

            // 2. Save the newly generated contract to the database.
            const newContractResult = await pool.query(
                'INSERT INTO contracts (user_id, title, contract_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
                [userId, userInput.parameters.title, userInput.contractType, contractContent]
            );
            const savedContract = newContractResult.rows[0];

            // --- CHANGE START ---
            // 3. Atomically increment the user's usage count for the month.
            // This is a "fire and forget" operation. We log errors but do not fail the
            // overall request, as the user has already received their contract.
            pool.query(
                'UPDATE users SET contracts_used_this_month = contracts_used_this_month + 1 WHERE id = $1',
                [userId]
            ).catch(err => {
                // If this fails, it's an internal issue but not critical to the user's flow.
                // We log it for maintenance purposes.
                console.error(`Failed to increment usage count for user ${userId}:`, err);
            });
            // --- CHANGE END ---

            // 4. Return the successful response to the user.
            res.status(200).json({
                message: "Contract generated and saved successfully.",
                contract: contractContent,
                savedContract: savedContract
            });

        } catch (error) {
            console.error('Contract generation or saving failed:', error);
            res.status(500).json({ error: 'An unexpected error occurred while processing the contract.' });
        }
    });

    return router;
};