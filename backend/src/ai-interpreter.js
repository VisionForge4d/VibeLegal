const express = require('express');
const { GoogleAIProvider } = require('./ai-providers/google-ai-provider.js');

const router = express.Router();

/**
 * AI Interpreter Endpoint
 * Converts natural language input to structured contract JSON
 * POST /api/ai/interpret
 * 
 * Body options:
 * - useAI: true/false (default: true)
 * - model: "gemini-2.5-pro" | "gemini-2.5-flash" (default: "gemini-2.5-pro")
 * - userInput: string (required when useAI: true)
 * - contractSpec: object (required when useAI: false)
 */
router.post('/interpret', async (req, res) => {
  try {
    const { 
      userInput, 
      contractSpec,
      context = {}, 
      useAI = true,
      model = 'gemini-2.5-pro'
    } = req.body;

    // Direct mode (bypass AI)
    if (!useAI) {
      if (!contractSpec || typeof contractSpec !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'contractSpec is required when useAI is false'
        });
      }

      return res.json({
        success: true,
        contractSpec: contractSpec,
        userInput: userInput || '[Direct Mode]',
        provider: { name: 'DirectMode', type: 'local', model: 'none' }
      });
    }

    // AI mode - validate input
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userInput is required and must be a non-empty string when useAI is true'
      });
    }

    // Initialize AI provider with selected model
    const aiProvider = new GoogleAIProvider({ model });
    
    // Generate contract specification using AI
    const aiGeneratedSpec = await aiProvider.generateContractSpec(userInput, context);

    res.json({
      success: true,
      contractSpec: aiGeneratedSpec,
      userInput: userInput,
      provider: aiProvider.getProviderInfo()
    });

  } catch (error) {
    console.error('AI Interpreter Error:', error);
    res.status(500).json({
      success: false,
      error: `AI interpretation failed: ${error.message}`
    });
  }
});

module.exports = router;
