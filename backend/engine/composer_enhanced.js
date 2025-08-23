const { promises: fs } = require('fs');
const path = require('path');

const CLAUSES_ENHANCED_PATH = path.join(__dirname, '..', 'clause_library_enhanced.json');
const CLAUSES_ORIGINAL_PATH = path.join(__dirname, '..', 'clause_library.json');

function selectClauseVariation(clauseKey, preferences = {}, clauses) {
  const clause = clauses.clauses[clauseKey];
  if (!clause || !clause.variations) {
    return null; // Signal that we need fallback
  }

  const { risk_tolerance = 'low', legal_stance = 'neutral' } = preferences;

  for (const [variationKey, variation] of Object.entries(clause.variations)) {
    if (variation.risk_level === risk_tolerance && variation.legal_stance === legal_stance) {
    console.log(`🔍 Checking variation ${variationKey}: risk_level=${variation.risk_level}, legal_stance=${variation.legal_stance} vs preferences: risk_tolerance=${risk_tolerance}, legal_stance=${legal_stance}`);
      return variation;
    }
  }

  return Object.values(clause.variations)[0];
}

async function composeContractEnhanced(userInput) {
  try {
    console.log("🚀 Enhanced composer called with preferences:", userInput.preferences);
    const enhancedClauses = JSON.parse(await fs.readFile(CLAUSES_ENHANCED_PATH, 'utf-8'));
    const originalClauses = JSON.parse(await fs.readFile(CLAUSES_ORIGINAL_PATH, 'utf-8'));
    const scaffold = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'contract_employment_agreement.json'), 'utf-8'));

    const contractBody = scaffold.clauses.map((clauseKey, index) => {
      console.log("🎯 Trying enhanced clause for:", clauseKey);
      let selectedVariation = selectClauseVariation(clauseKey, userInput.preferences, enhancedClauses);
      
      if (!selectedVariation) {
        console.log("🔄 Using original clause for:", clauseKey);
        selectedVariation = originalClauses.clauses[clauseKey] || { 
          clause: `[Missing clause: ${clauseKey}]`, 
          title: clauseKey 
        };
      } else {
        console.log("✅ Using enhanced clause for:", clauseKey);
      }

      const populatedClause = populatePlaceholders(selectedVariation.clause, userInput.parameters);
      const title = selectedVariation.title || enhancedClauses.clauses[clauseKey]?.title || clauseKey;
      
      return `${index + 1}. **${title}**\n\n${populatedClause}\n`;
    }).join('\n');

    return {
      content: contractBody,
      metadata: {
        version: "enhanced_hybrid",
        clause_count: scaffold.clauses.length,
        enhanced_clauses: Object.keys(enhancedClauses.clauses),
        risk_profile: userInput.preferences?.risk_tolerance || 'standard'
      }
    };
  } catch (error) {
    console.log('Enhanced system unavailable, using original');
    const { composeContract } = require('./composer.js');
    return await composeContract(userInput);
  }
}

function populatePlaceholders(text, parameters) {
  return text.replace(/\[([\w\s/]+)\]/g, (match, placeholderName) => {
    const key = placeholderName.trim();
    return parameters[key] !== undefined ? parameters[key] : `[!!MISSING_DATA: ${key}!!]`;
  });
}

module.exports = { composeContractEnhanced };
