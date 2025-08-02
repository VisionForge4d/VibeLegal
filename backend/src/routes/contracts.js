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
        try {
            const userInput = req.body;
            const userId = req.user.userId;
            const contractContent = await composeContract(userInput);
            const newContract = await pool.query(
                'INSERT INTO contracts (user_id, title, contract_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
                [userId, userInput.parameters.title, userInput.contractType, contractContent]
            );
            res.status(200).json({
                message: "Contract generated and saved successfully.",
                contract: contractContent,
                savedContract: newContract.rows[0]
            });
        } catch (error) {
            console.error('Contract generation or saving failed:', error);
            res.status(500).json({ error: 'An unexpected error occurred while processing the contract.' });
        }
    });
    return router;
};
