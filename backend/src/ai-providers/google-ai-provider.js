const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AIProvider } = require('./provider-interface.js');

class GoogleAIProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.GOOGLE_AI_API_KEY;
    this.model = config.model || 'gemini-2.5-pro';
    this.isLocal = false;
    
    if (!this.apiKey) {
      throw new Error('Google AI API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async generateContractSpec(userInput, context = {}) {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      const prompt = this.buildPrompt(userInput, context);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Strip markdown code blocks if present
      console.log("Raw AI response:", JSON.stringify(text));
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      // Parse and validate JSON response
      const contractSpec = JSON.parse(text);
      return this.validateContractSpec(contractSpec);
      
    } catch (error) {
      console.error('Google AI Provider Error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  buildPrompt(userInput, context) {
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

  validateContractSpec(spec) {
    const required = ['title', 'description', 'clauses', 'options', 'tone', 'formatting'];
    for (const field of required) {
      if (!(field in spec)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return spec;
  }

  async validateConnection() {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      await model.generateContent('test');
      return true;
    } catch (error) {
      console.error('Google AI connection failed:', error);
      return false;
    }
  }
}

module.exports = { GoogleAIProvider };
