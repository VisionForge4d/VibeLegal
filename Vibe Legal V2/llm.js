const axios = require('axios');

class LLMAdapter {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'null';
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.groqModel = process.env.GROQ_MODEL || 'llama-3-8b-instant';
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3:8b';
  }

  async polish(contractText, requirements = '') {
    if (this.provider === 'null') {
      console.log('LLM provider is null, returning unpolished contract');
      return contractText;
    }

    const prompt = `Polish and improve the following legal contract. Make it more professional and ensure proper legal language while maintaining all essential clauses and compliance requirements. Requirements: ${requirements}\n\nContract:\n${contractText}`;

    try {
      switch (this.provider) {
        case 'groq':
          return await this.polishWithGroq(prompt);
        case 'ollama':
          return await this.polishWithOllama(prompt);
        default:
          throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('LLM polish error:', error);
      return contractText; // Return original if polish fails
    }
  }

  async polishWithGroq(prompt) {
    if (!this.groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: this.groqModel,
        messages: [
          {
            role: 'system',
            content: 'You are a legal document assistant that polishes contracts. Maintain all compliance requirements and legal disclaimers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  async polishWithOllama(prompt) {
    const response = await axios.post(`${this.ollamaHost}/api/generate`, {
      model: this.ollamaModel,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 2000
      }
    });

    return response.data.response;
  }
}

module.exports = LLMAdapter;

