const express = require('express');
const { pool } = require('./db/pool');
const { asyncHandler } = require('../middleware/errorHandler');
const { getAIProvider } = require('./utils/ai-provider-factory.js');

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
router.post('/interpret', asyncHandler(async (req, res) => {
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
  const aiProvider = await getAIProvider(req.user?.userId, { model });

  // Generate contract specification using AI
  const aiGeneratedSpec = await aiProvider.generateContractSpec(userInput, context);

  res.json({
    success: true,
    contractSpec: aiGeneratedSpec,
    userInput: userInput,
    provider: aiProvider.getProviderInfo()
  });
}));

/**
 * Chat Session Management for Conversational AI
 * POST /api/ai/chat/start - Start new chat session
 * POST /api/ai/chat/message - Send message to existing session
 * GET /api/ai/chat/:sessionId - Get chat history
 */

// Start new chat session
router.post('/chat/start', asyncHandler(async (req, res) => {
  const { contractType = 'employment_agreement' } = req.body;
  const userId = req.user.userId;

  const sessionData = {
    user_id: userId,
    contract_type: contractType,
    conversation_state: JSON.stringify({
      step: 'contract_type',
      extractedParams: {},
      messages: [
        {
          id: 1,
          type: 'bot',
          content: "Hi! I'm your AI legal assistant. I'll help you create a professional employment contract through a simple conversation. What type of employment agreement do you need?",
          timestamp: new Date().toISOString()
        }
      ]
    })
  };

  const result = await pool.query(
    `INSERT INTO chat_sessions (user_id, contract_type, conversation_state, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id, created_at`,
    [sessionData.user_id, sessionData.contract_type, sessionData.conversation_state]
  );

  res.json({
    success: true,
    sessionId: result.rows[0].id,
    conversationState: JSON.parse(sessionData.conversation_state),
    createdAt: result.rows[0].created_at
  });
}));

/**
 * Performs an intelligent analysis of a single turn in a conversation.
 * This function contains the core "brain" of the conversational AI.
 * @param {string} userInput - The user's latest message.
 * @param {object} conversationContext - The current state of the conversation.
 * @param {object} aiProvider - An instance of an AI provider.
 * @returns {Promise<object>} - A structured JSON object with the AI's analysis.
 */
async function analyzeConversationTurn(userInput, conversationContext, aiProvider) {
  // Check for EXPLICIT force generation keywords
  const forceGenerationKeywords = [
    'generate contract', 'generate the contract', 'generate contract now',
    'create contract', 'create the contract', 'create contract now',
    'generate it now', 'create it now', 'ready to generate'
  ];
  const shouldForceGenerate = forceGenerationKeywords.some(keyword =>
    userInput.toLowerCase().includes(keyword.toLowerCase())
  );

  // Count conversation turns to prevent endless loops
  const messages = conversationContext.messages || [];
  const conversationTurns = Math.floor(messages.length / 2);
  const maxTurns = 12;
  const shouldAutoGenerate = conversationTurns >= maxTurns;

  // TOKEN OPTIMIZATION: Send only recent messages, not full history
  // Reduces token usage by 70-80% while preserving conversation quality
  const optimizedContext = {
    messages: messages.slice(-6), // Last 3 turns (6 messages: 3 user + 3 bot)
    extractedParams: conversationContext.extractedParams || {},
    contractType: conversationContext.contractType || 'employment_agreement',
    jurisdiction: conversationContext.jurisdiction || 'California',
    turnCount: conversationTurns,
    totalMessages: messages.length
  };

  console.log(`🔧 Token Optimization: Sending ${optimizedContext.messages.length} recent messages instead of ${messages.length} total messages`);
  console.log(`📊 Accumulated parameters: ${Object.keys(optimizedContext.extractedParams).length} keys`);

  // Build the intelligent analysis prompt
  const analysisPrompt = `You are an expert employment law attorney and legal AI assistant specializing in comprehensive, employer-protective employment contracts. Your role is to guide users through creating strategic, compliant employment contracts by:

1. **Strategic Analysis**: Analyze what they've provided vs. critical employer protections missing
2. **Risk Assessment**: Identify potential legal risks, compliance issues, and vulnerabilities
3. **Protective Measures**: Suggest specific clauses for IP protection, non-compete, confidentiality, severance terms
4. **Compliance Assurance**: Ensure California employment law compliance and best practices
5. **Comprehensive Coverage**: Don't just collect basics - ensure strategic employer protections

**STRATEGIC EMPLOYER PROTECTIONS TO IDENTIFY:**
- IP assignment and invention clauses
- Non-compete and non-solicitation terms (where legally enforceable)
- Confidentiality and trade secret protection
- Termination procedures and severance terms
- Performance review processes and probation periods
- PTO payout policies and accrual rules
- Remote work security and equipment policies
- Expense reimbursement timelines and procedures
- Equity vesting schedules and treatment upon termination
- Background check and reference requirements
- Dispute resolution and arbitration clauses

**CRITICAL INSTRUCTIONS - READ CAREFULLY:**
- **NEVER** set readyToGenerate to true unless the user's EXACT words include "generate contract", "create contract", "generate the contract", or "create the contract"
- Phrases like "let's proceed", "move forward", "let's start", "continue" DO NOT mean generate - they mean continue the conversation
- Even if user provides comprehensive details in one message, DO NOT generate - always ask clarifying questions first
- Continue conversational guidance for at least 3-4 exchanges to gather details and confirm requirements
- Ask follow-up questions about: compensation details, benefits, work arrangement, termination terms, and legal protections
- Focus on strategic elements and suggest protective clauses they might not have considered
- Always confirm final details before suggesting generation
- The ONLY way to generate is if user explicitly says one of the exact trigger phrases above

**Conversation Status:**
- Turn: ${conversationTurns}/${maxTurns}
- Total messages exchanged: ${messages.length}
- Parameters collected: ${Object.keys(optimizedContext.extractedParams).length}

**Recent conversation context (last 3 turns):**
${JSON.stringify(optimizedContext, null, 2)}

**User's latest input:** "${userInput}"
**Force generation requested:** ${shouldForceGenerate}
**Auto-generate threshold reached:** ${shouldAutoGenerate}

**Your task:** As a strategic employment law expert, analyze this input and respond with a JSON object containing:

RESPOND ONLY WITH VALID JSON:
{
  "nextQuestion": "Your strategic legal guidance or intelligent follow-up question (or generation confirmation)",
  "extractedInfo": {"key": "value"},
  "analysis": "Your legal analysis of what they've provided, strategic gaps, and employer protection needs",
  "suggestions": ["Strategic legal suggestion 1 with rationale", "Employer protection suggestion 2"],
  "missingInfo": ["Critical missing element 1", "Strategic protection gap 2"],
  "riskAssessment": "Detailed legal risk analysis including compliance and strategic vulnerabilities",
  "recommendedClauses": ["ip_assignment", "confidentiality_2_years", "performance_reviews", "severance_standard"],
  "recommendedRiskLevel": "conservative|moderate|aggressive",
  "recommendedStance": "pro_employee|neutral|pro_employer",
  "strategicProtections": ["Specific employer protection 1", "Legal safeguard 2"],
  "complianceNotes": ["CA law requirement 1", "Employment standard 2"],
  "readyToGenerate": false,
  "contractParams": {},
  "suggestedClauses": ["Specific clause recommendations based on role and situation"],
  "progressIndicator": "${shouldForceGenerate || shouldAutoGenerate ? '100' : Math.min(90, Math.round(15 + (conversationTurns / maxTurns) * 75))}% complete"
}

${shouldForceGenerate || shouldAutoGenerate ? `**GENERATION TRIGGERED - SET readyToGenerate to true and extract all contractParams.**

EXTRACT THESE PARAMETERS FROM THE ACCUMULATED DATA:
- Use extractedParams: ${JSON.stringify(optimizedContext.extractedParams, null, 2)}
- Review recent conversation messages for any additional details
- Focus on: Company/employer name, employee name, job title, salary, start date, work arrangement, benefits, legal protections
- Default jurisdiction: California

Update the "contractParams" object in your JSON response with all extracted values merged with existing extractedParams.
` : ''}

Focus on being an intelligent legal consultant, not a form-filler. Ask smart questions about gaps, suggest protective clauses they might not have considered, and ensure legal compliance.`;

  const model = aiProvider.genAI.getGenerativeModel({ model: aiProvider.model });
  const aiResult = await model.generateContent(analysisPrompt);
  const aiText = await aiResult.response.text();

  try {
    const cleanText = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let aiResponse = JSON.parse(cleanText);

    // DETERMINISTIC OVERRIDE - don't trust LLM when user explicitly requested generation
    if (shouldForceGenerate || shouldAutoGenerate) {
      console.log('Force generation triggered - overriding LLM response');
      aiResponse.readyToGenerate = true;
      aiResponse.progressIndicator = '100% complete';

      // Ensure we have params (extract from conversation if LLM didn't)
      if (!aiResponse.contractParams || Object.keys(aiResponse.contractParams).length === 0) {
        console.log('Extracting params from conversation context');
        const messages = conversationContext.messages || conversationContext.previousMessages || [];
        // Basic extraction - merge with any AI-extracted info
        aiResponse.contractParams = {
          ...(aiResponse.extractedInfo || {}),
          'Governing Law': 'California',
          'Jurisdiction': 'California',
          'Contract Type': 'Employment Agreement'
        };
      }

      // Single consolidated message about missing items (not 6 separate questions)
      if (aiResponse.missingInfo && aiResponse.missingInfo.length > 0) {
        aiResponse.nextQuestion = `I'll generate your contract now with the information provided. Note: These optional clauses weren't discussed (you can add them later if needed): ${aiResponse.missingInfo.slice(0, 5).join(', ')}${aiResponse.missingInfo.length > 5 ? '...' : ''}. Generating contract...`;
      } else {
        aiResponse.nextQuestion = "Perfect! Generating your professional employment contract now...";
      }
    }

    return aiResponse;
  } catch (parseError) {
    console.error('Failed to parse AI response in analyzeConversationTurn:', aiText, parseError);
    // Return a structured fallback response
    return {
      nextQuestion: "I'm having a little trouble processing that. Could you please rephrase or provide more details about the contract you'd like to create?",
      analysis: "AI parsing error. Unable to analyze input.",
      suggestions: [],
      missingInfo: ["All contract details"],
      readyToGenerate: false,
      progressIndicator: conversationContext.progressIndicator || "0% complete"
    };
  }
}

// Send message to chat session
router.post('/chat/message', asyncHandler(async (req, res) => {
  const { sessionId, message, conversationState } = req.body;
  const userId = req.user.userId;

  // Verify session belongs to user
  const sessionResult = await pool.query(
    'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );

  if (sessionResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Chat session not found'
    });
  }

  // ✅ NEW: Handle state-only saves (no AI processing for auto-save)
  if (!message || message.trim() === '') {
    console.log('State-only save (no message) - skipping AI processing');
    await pool.query(
      'UPDATE chat_sessions SET conversation_state = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(conversationState), sessionId]
    );

    return res.json({
      success: true,
      sessionId,
      conversationState: conversationState,
      timestamp: new Date().toISOString(),
      saveOnly: true
    });
  }

  // Add user message to conversation state before sending to AI
  const updatedStateWithUserMessage = {
    ...conversationState,
    messages: [
      ...(conversationState.messages || []),
      { id: Date.now(), type: 'user', content: message, timestamp: new Date().toISOString() }
    ]
  };

  // Use the unified, intelligent analysis for every message
  // Process message with AI if needed
  const aiProvider = await getAIProvider(userId, { model: 'gemini-2.0-flash-exp' });
  const aiAnalysis = await analyzeConversationTurn(message, updatedStateWithUserMessage, aiProvider);

  // Construct the final conversation state to be saved
  const finalConversationState = {
    ...updatedStateWithUserMessage, // Start with the state that includes the user's message
    // Merge newly extracted params with existing ones
    extractedParams: {
      ...updatedStateWithUserMessage.extractedParams,
      ...aiAnalysis.extractedInfo,
      ...aiAnalysis.contractParams, // Ensure final params are included if generation is ready
    },
    // Add the AI's response to the message history
    messages: [
      ...updatedStateWithUserMessage.messages,
      { id: Date.now() + 1, type: 'bot', content: aiAnalysis.nextQuestion, timestamp: new Date().toISOString() }
    ],
    // Carry over the rest of the analysis for the frontend to use
    ...aiAnalysis
  };

  // Update conversation state with AI response
  await pool.query(
    'UPDATE chat_sessions SET conversation_state = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(finalConversationState), sessionId]
  );

  res.json({
    success: true,
    sessionId,
    conversationState: finalConversationState,
    timestamp: new Date().toISOString()
  });
}));

// Save chat with custom name
router.post('/chat/save', asyncHandler(async (req, res) => {
  const { sessionId, name } = req.body;
  const userId = req.user.userId;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Chat name is required' });
  }

  const result = await pool.query(
    `UPDATE chat_sessions
        SET name = $1,
            is_saved = TRUE,
            updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING id`,
    [name.trim(), sessionId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Chat session not found' });
  }

  res.json({ success: true, message: 'Chat saved successfully' });
}));

// Get recent chat sessions for the user
router.get('/chat/recent', asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    `SELECT id, contract_type, conversation_state, created_at, updated_at
     FROM chat_sessions
     WHERE user_id = $1
     ORDER BY updated_at DESC
     LIMIT 5`,
    [userId]
  );

  res.json({
    success: true,
    sessions: result.rows
  });
}));

// Get saved chats for dashboard view
router.get('/chat/saved', asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    `SELECT id, name, contract_type, conversation_state, created_at, updated_at
       FROM chat_sessions
      WHERE user_id = $1 AND is_saved = TRUE
      ORDER BY updated_at DESC`,
    [userId]
  );

  res.json({
    success: true,
    chats: result.rows
  });
}));

// Get chat history
router.get('/chat/:sessionId', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.userId;

  const result = await pool.query(
    'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Chat session not found'
    });
  }

  const session = result.rows[0];
  res.json({
    success: true,
    session: {
      id: session.id,
      contractType: session.contract_type,
      conversationState: JSON.parse(session.conversation_state),
      createdAt: session.created_at,
      updatedAt: session.updated_at
    }
  });
}));

// Intelligent contract requirements analysis
router.post('/analyze-contract-requirements', asyncHandler(async (req, res) => {
  const { userInput, conversationContext, analysisType } = req.body;
  const userId = req.user.userId;

  // This endpoint now acts as a wrapper around the core analysis function
  const aiProvider = await getAIProvider(userId, { model: 'gemini-2.0-flash-exp' });
  const aiAnalysis = await analyzeConversationTurn(userInput, conversationContext, aiProvider);

  res.json({
    success: true,
    ...aiAnalysis
  });
}));

// Legal language enhancement and polish
router.post('/enhance-contract-language', asyncHandler(async (req, res) => {
  const { contractContent, contractParams, aiAnalysis } = req.body;
  const userId = req.user.userId;

  const aiProvider = await getAIProvider(userId, { model: 'gemini-2.5-pro' });

  // Build legal enhancement prompt
    const enhancementPrompt = `You are a senior legal expert specializing in employment contract drafting. Your task is to enhance and polish the provided contract content with professional legal language, ensuring:

1. **Professional Legal Terminology**: Replace casual language with precise legal terms
2. **Clause Structure**: Ensure proper legal clause formatting and numbering
3. **Enforceability**: Strengthen language for maximum legal enforceability  
4. **Compliance**: Ensure adherence to employment law standards
5. **Clarity**: Maintain readability while adding legal precision

**Original Contract Content:**
${contractContent}

**Contract Parameters:**
${JSON.stringify(contractParams, null, 2)}

**AI Analysis Context:**
${JSON.stringify(aiAnalysis, null, 2)}

**Instructions:**
- Enhance the contract with sophisticated legal language
- Add proper legal formatting and section structure
- Include standard legal provisions and boilerplate language
- Ensure all clauses are professionally worded
- Add appropriate legal disclaimers and enforceability language
- Maintain the original intent while elevating the professional quality

**Return the enhanced contract content as a complete, polished legal document.**`;

    // Get AI enhancement
    const model = aiProvider.genAI.getGenerativeModel({ model: aiProvider.model });
    const aiResult = await model.generateContent(enhancementPrompt);
    const enhancedContract = await aiResult.response.text();

  res.json({
    success: true,
    enhancedContract: enhancedContract.trim(),
    enhancements: [
      "Professional legal terminology applied",
      "Clause structure and formatting improved",
      "Enforceability language strengthened",
      "Legal compliance verified",
      "Standard legal provisions added"
    ]
  });
}));

/**
 * Direct AI interpretation function for internal use
 * Avoids HTTP overhead by calling AI logic directly
 *
 * @param {string} userInput - Natural language input
 * @param {object} context - Additional context (optional)
 * @param {string} model - AI model to use (default: gemini-2.5-pro)
 * @returns {Promise<object>} - AI-generated contract specification
 */
async function interpretWithAI(userInput, context = {}, model = 'gemini-2.5-pro', userId = null) {
  if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
    throw new Error('userInput is required and must be a non-empty string');
  }

  const aiProvider = await getAIProvider(userId, { model });
  const aiGeneratedSpec = await aiProvider.generateContractSpec(userInput, context);

  return {
    success: true,
    contractSpec: aiGeneratedSpec,
    userInput: userInput,
    provider: aiProvider.getProviderInfo()
  };
}

module.exports = { router, interpretWithAI };
