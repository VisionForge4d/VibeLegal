import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLAUSES_ENHANCED_PATH = path.join(__dirname, '..', 'clause_library_enhanced.json');

function selectClauseVariation(clauseKey, preferences = {}, clauses) {
  const clause = clauses.clauses[clauseKey];
  if (!clause || !clause.variations) {
    return clause;
  }

  const { risk_tolerance = 'low', legal_stance = 'neutral' } = preferences;

  for (const [variationKey, variation] of Object.entries(clause.variations)) {
    if (variation.risk_level === risk_tolerance && variation.legal_stance === legal_stance) {
      return variation;
    }
  }

  return Object.values(clause.variations)[0];
}

export async function composeContractEnhanced(userInput) {
  try {
    const enhancedClauses = JSON.parse(await fs.readFile(CLAUSES_ENHANCED_PATH, 'utf-8'));
    const scaffold = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'contract_employment_agreement.json'), 'utf-8'));

    const contractBody = scaffold.clauses.map((clauseKey, index) => {
      const selectedVariation = selectClauseVariation(clauseKey, userInput.preferences, enhancedClauses);
      const populatedClause = populatePlaceholders(selectedVariation.clause, userInput.parameters);
      return `${index + 1}. **${selectedVariation.title || enhancedClauses.clauses[clauseKey].title}**\n\n${populatedClause}\n`;
    }).join('\n');

    return {
      content: contractBody,
      metadata: {
        version: "enhanced",
        clause_count: scaffold.clauses.length,
        risk_profile: userInput.preferences?.risk_tolerance || 'standard'
      }
    };
  } catch (error) {
    console.log('Enhanced system unavailable, using original');
    const { composeContract } = await import('./composer.js');
    return await composeContract(userInput);
  }
}

function populatePlaceholders(text, parameters) {
  return text.replace(/\[([\w\s/]+)\]/g, (match, placeholderName) => {
    const key = placeholderName.trim();
    return parameters[key] !== undefined ? parameters[key] : `[!!MISSING_DATA: ${key}!!]`;
  });
}
