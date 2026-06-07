const { pool } = require('../db/pool');
const { GoogleAIProvider } = require('../ai-providers/google-ai-provider.js');
const { LocalLLMProvider } = require('../ai-providers/local-llm-provider.js');

/**
 * Returns the appropriate AI provider for a given user.
 * Defaults to Google Gemini unless the user has enabled a local LLM in settings.
 *
 * @param {number} userId - Authenticated user's ID
 * @param {object} options - Optional overrides (model, apiKey)
 * @returns {Promise<GoogleAIProvider|LocalLLMProvider>}
 */
async function getAIProvider(userId, options = {}) {
  if (!userId) {
    return new GoogleAIProvider(options);
  }

  const result = await pool.query(
    `SELECT local_llm_enabled, local_llm_endpoint, local_llm_model, local_llm_api_key
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return new GoogleAIProvider(options);
  }

  const settings = result.rows[0];

  if (settings.local_llm_enabled && settings.local_llm_endpoint && settings.local_llm_model) {
    try {
      const provider = new LocalLLMProvider({
        endpoint: settings.local_llm_endpoint,
        model: settings.local_llm_model,
        apiKey: settings.local_llm_api_key
      });

      console.log(`🏠 Using Local LLM for user ${userId}: ${settings.local_llm_model} at ${settings.local_llm_endpoint}`);
      return provider;
    } catch (error) {
      console.error('Failed to initialize Local LLM provider, falling back to Google AI:', error.message);
    }
  }

  console.log(`☁️ Using Google AI for user ${userId}`);
  return new GoogleAIProvider(options);
}

module.exports = { getAIProvider };
