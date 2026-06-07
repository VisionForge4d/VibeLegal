/**
 * AI Provider Interface
 * Abstract base class for all AI providers (remote APIs and local LLMs)
 */

class AIProvider {
  constructor(config = {}) {
    this.config = config;
    this.isLocal = false;
  }

  /**
   * Generate structured JSON from natural language input
   * @param {string} userInput - Natural language contract request
   * @param {Object} context - Additional context (user info, preferences)
   * @returns {Promise<Object>} - Structured contract JSON
   */
  async generateContractSpec(userInput, context = {}) {
    throw new Error('generateContractSpec must be implemented by provider');
  }

  /**
   * Validate provider connection/availability
   * @returns {Promise<boolean>} - Provider is ready
   */
  async validateConnection() {
    throw new Error('validateConnection must be implemented by provider');
  }

  /**
   * Get provider metadata
   * @returns {Object} - Provider info (name, type, local/remote)
   */
  getProviderInfo() {
    return {
      name: this.constructor.name,
      type: this.isLocal ? 'local' : 'remote',
      config: { ...this.config, apiKey: '[HIDDEN]' } // Never expose API keys
    };
  }
}

module.exports = { AIProvider };
