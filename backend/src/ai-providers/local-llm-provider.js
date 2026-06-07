const fetch = require('node-fetch');
const { AIProvider } = require('./provider-interface.js');

/**
 * Local LLM Provider for on-premise or developer-hosted models (Ollama, LM Studio, vLLM, etc.).
 * Implements the same interface used by GoogleAIProvider so the rest of the stack stays provider agnostic.
 */
class LocalLLMProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.endpoint = config.endpoint;
    this.model = config.model;
    this.apiKey = config.apiKey || null;
    this.isLocal = true;

    if (!this.endpoint || !this.model) {
      throw new Error('Local LLM endpoint and model are required');
    }
  }

  async generateContractSpec(userInput, context = {}) {
    const prompt = this.buildContractSpecPrompt(userInput, context);
    const response = await this._makeRequest(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse local LLM response:', response);
      // Provide a minimal fallback structure rather than failing the entire request
      return {
        title: 'Employment Agreement',
        description: 'AI-generated employment agreement specification',
        clauses: [],
        options: {},
        tone: 'plain_english',
        formatting: 'standard_numbered'
      };
    }
  }

  buildContractSpecPrompt(userInput, context) {
    return `You are a legal contract specification generator. Convert the user's natural language request into a structured JSON contract specification.

IMPORTANT: Respond ONLY with valid JSON. No explanations, no markdown, just the JSON object.

Required JSON Structure:
{
  "title": "Contract Title",
  "description": "Brief description",
  "clauses": ["clause_id1", "clause_id2"],
  "options": {"clause_id": ["option1", "option2"]},
  "tone": "plain_english",
  "formatting": "standard_numbered"
}

Available clause IDs: employee_details, at_will_employment, job_title_and_duties, compensation, benefits, confidentiality, ip_assignment, arbitration, governing_law

User Request: ${userInput}

JSON Response:`;
  }

  async _makeRequest(prompt) {
    const isOllama = this.endpoint.includes('ollama') || this.endpoint.includes('11434');

    const requestBody = isOllama
      ? {
          model: this.model,
          prompt,
          stream: false,
          format: 'json'
        }
      : {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a legal AI assistant. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        };

    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Local LLM request failed (${response.status}): ${message}`);
    }

    const data = await response.json();

    if (isOllama) {
      return data.response;
    }

    const firstChoice = data.choices && data.choices[0];
    return (firstChoice && firstChoice.message && firstChoice.message.content) || '';
  }

  get genAI() {
    return {
      getGenerativeModel: () => ({
        generateContent: async (prompt) => {
          const responseText = await this._makeRequest(prompt);
          return {
            response: {
              text: async () => responseText
            }
          };
        }
      })
    };
  }
}

module.exports = { LocalLLMProvider };
