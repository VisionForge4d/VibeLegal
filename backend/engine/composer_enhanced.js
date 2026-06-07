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

  // Find the best matching variation
  for (const [variationKey, variation] of Object.entries(clause.variations)) {
    if (variation.risk_level === risk_tolerance && variation.legal_stance === legal_stance) {
      console.log(`✅ Exact match for ${clauseKey}: ${variationKey} (${variation.risk_level}/${variation.legal_stance})`);
      return variation;
    }
  }

  // Fallback: try to match just risk level
  for (const [variationKey, variation] of Object.entries(clause.variations)) {
    if (variation.risk_level === risk_tolerance) {
      console.log(`🟡 Risk-level match for ${clauseKey}: ${variationKey} (${variation.risk_level})`);
      return variation;
    }
  }

  // Last fallback: return first variation
  const firstVariation = Object.values(clause.variations)[0];
  console.log(`⚪ Using default for ${clauseKey}: ${firstVariation.risk_level}/${firstVariation.legal_stance}`);
  return firstVariation;
}

async function composeContractEnhanced(userInput) {
  try {
    console.log("🚀 Master Input Brief Enhanced Composer with preferences:", userInput.preferences);
    const userParameters = userInput.parameters || {};
    console.log("📊 Parameters received:", Object.keys(userParameters).length);
    console.log("🎯 Key parameters:", Object.keys(userParameters).filter(k => userParameters[k] && userParameters[k] !== '').slice(0, 10));
    const parameterDefaults = buildParameterDefaults(userParameters);
    const enhancedClauses = JSON.parse(await fs.readFile(CLAUSES_ENHANCED_PATH, 'utf-8'));
    const originalClauses = JSON.parse(await fs.readFile(CLAUSES_ORIGINAL_PATH, 'utf-8'));
    const scaffold = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'contract_employment_agreement.json'), 'utf-8'));

    const clauseMetadata = [];
    const contractBody = scaffold.clauses.map((clauseKey, index) => {
      console.log("🎯 Processing clause:", clauseKey);
      let selectedVariation = selectClauseVariation(clauseKey, userInput.preferences, enhancedClauses);
      let source = 'enhanced';
      
      if (!selectedVariation) {
        console.log("🔄 Using original clause for:", clauseKey);
        selectedVariation = originalClauses.clauses[clauseKey] || { 
          clause: `[Missing clause: ${clauseKey}]`, 
          title: clauseKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        };
        source = 'original';
      } else {
        console.log("✅ Using enhanced clause for:", clauseKey);
      }

      // Track clause metadata
      clauseMetadata.push({
        key: clauseKey,
        title: selectedVariation.title || clauseKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        source: source,
        risk_level: selectedVariation.risk_level || 'unknown',
        legal_stance: selectedVariation.legal_stance || 'unknown',
        legal_justification: selectedVariation.legal_justification || 'Standard legal provision'
      });

      const populatedClause = populatePlaceholders(selectedVariation.clause, userParameters, parameterDefaults);
      const title = selectedVariation.title || enhancedClauses.clauses[clauseKey]?.title || clauseKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      return `## ${index + 1}. ${title}\n\n${populatedClause}\n\n`;
    }).join('');

    return {
      content: contractBody,
      metadata: {
        version: "enhanced_v3.0.0_master_input_brief",
        clause_count: scaffold.clauses.length,
        risk_profile: userInput.preferences?.risk_tolerance || 'moderate',
        legal_stance: userInput.preferences?.legal_stance || 'neutral',
        enhanced_clauses_used: clauseMetadata.filter(c => c.source === 'enhanced').length,
        original_clauses_used: clauseMetadata.filter(c => c.source === 'original').length,
        clause_breakdown: clauseMetadata,
        jurisdiction: "California",
        contract_type: "Employment Agreement",
        parameter_extraction: {
          total_parameters_provided: Object.keys(userParameters).filter(k => userParameters[k] && userParameters[k] !== '').length,
          parameters_used: Object.keys(parameterDefaults).filter(k => {
            const providedValue = userParameters[k];
            const defaultValue = parameterDefaults[k];
            return providedValue && providedValue !== '' && !(typeof defaultValue === 'string' && defaultValue.startsWith('['));
          }).length,
          master_input_brief_coverage: Math.round(
            (Object.keys(parameterDefaults).filter(k => {
              const providedValue = userParameters[k];
              const defaultValue = parameterDefaults[k];
              return providedValue && providedValue !== '' && !(typeof defaultValue === 'string' && defaultValue.startsWith('['));
            }).length / Object.keys(parameterDefaults).length) * 100
          ) + '%'
        },
        strategic_protections: {
          confidentiality: !!(userParameters['Confidentiality'] || userParameters['Confidentiality Duration']),
          ip_assignment: !!(userParameters['IP Assignment']),
          non_compete: !!(userParameters['Non-Compete'] || userParameters['Non-Compete Period']),
          non_solicitation: !!(userParameters['Non-Solicitation'] || userParameters['Non-Solicitation Period']),
          severance: !!(userParameters['Severance Policy']),
          equity_terms: !!(userParameters['Equity Compensation'] || userParameters['Vesting Schedule']),
          probation_terms: !!(userParameters['Probation Period'] || userParameters['Probationary Period Length']),
          performance_reviews: !!(userParameters['Performance Reviews'])
        }
      }
    };
  } catch (error) {
    console.error('❌ Enhanced Master Input Brief system error:', error);
    console.log('🔄 Falling back to original composer');
    const { composeContract } = require('./composer.js');
    const fallbackResult = await composeContract(userInput);
    return {
      content: fallbackResult,
      metadata: {
        version: "fallback_original",
        error: "Enhanced system unavailable",
        fallback_used: true
      }
    };
  }
}

function buildParameterDefaults(parameters = {}) {
  return {
    // CORE EMPLOYMENT DETAILS
    'Employee Name': parameters['Employee Name'] || parameters['Other Party Name'] || parameters.otherPartyName || '[Employee Name]',
    'Other Party Name': parameters['Other Party Name'] || parameters['Employee Name'] || parameters.otherPartyName || '[Employee Name]',
    'Company Name': parameters['Company Name'] || parameters['Client Name'] || parameters.clientName || '[Company Name]',
    'Client Name': parameters['Client Name'] || parameters['Company Name'] || parameters.clientName || '[Company Name]',
    'Job Title': parameters['Job Title'] || parameters.jobTitle || 'Employee',
    'Reports To': parameters['Reports To'] || parameters.reportsTo || 'designated supervisor',
    'Supervisor Name': parameters['Supervisor Name'] || parameters['Reports To'] || 'designated supervisor',
    'Supervisor Title': parameters['Supervisor Title'] || 'Manager',

    // COMPENSATION & BENEFITS
    'Annual Salary': parameters['Annual Salary'] || parameters['Salary Amount'] || parameters.amount || '$85,000',
    'Salary Amount': parameters['Salary Amount'] || parameters['Annual Salary'] || parameters.amount || '$85,000',
    'Hourly Rate': parameters['Hourly Rate'] || parameters.hourlyRate || '$40.00/hour',
    'Employment Type': parameters['Employment Type'] || 'Full-time',
    'Work Hours': parameters['Work Hours'] || '40 hours per week',
    'Bonus Structure': parameters['Bonus Structure'] || parameters.bonus || 'Performance-based bonus eligibility',
    'Equity Compensation': parameters['Equity Compensation'] || parameters.equity || '',
    'Vesting Schedule': parameters['Vesting Schedule'] || parameters.vesting || '',

    // BENEFITS DETAILS
    'Health Insurance': parameters['Health Insurance'] || 'Comprehensive health insurance coverage',
    'Dental Insurance': parameters['Dental Insurance'] || parameters.dental || '',
    'Vision Insurance': parameters['Vision Insurance'] || parameters.vision || '',
    'Retirement Benefits': parameters['Retirement Benefits'] || '401(k) plan with company matching',
    'PTO Policy': parameters['PTO Policy'] || parameters['Annual PTO Days'] || '15 days paid time off annually',
    'Annual PTO Days': parameters['Annual PTO Days'] || parameters['PTO Policy'] || '15',
    'Sick Leave': parameters['Sick Leave'] || 'Accrued sick leave per California law',

    // EMPLOYMENT TERMS
    'Start Date': parameters['Start Date'] || new Date().toLocaleDateString(),
    'Probation Period': parameters['Probation Period'] || parameters['Probationary Period Length'] || '90 days',
    'Probationary Period Length': parameters['Probationary Period Length'] || parameters['Probation Period'] || '90 days',
    'Performance Reviews': parameters['Performance Reviews'] || 'Annual performance evaluations',
    'Notice Period': parameters['Notice Period'] || '2 weeks written notice',
    'Severance Policy': parameters['Severance Policy'] || parameters.severance || '',

    // WORK ARRANGEMENT
    'Work Arrangement': parameters['Work Arrangement'] || parameters.workArrangement || 'On-site with remote work flexibility',
    'Work Location': parameters['Work Location'] || parameters.workLocation || 'Company offices and approved remote locations',

    // LEGAL PROTECTIONS
    'Confidentiality': parameters['Confidentiality'] || 'Confidentiality and non-disclosure obligations',
    'Confidentiality Duration': parameters['Confidentiality Duration'] || '2 years post-termination',
    'IP Assignment': parameters['IP Assignment'] || 'Assignment of work-related intellectual property',
    'Non-Compete Period': parameters['Non-Compete Period'] || parameters['Non-Compete'] || '',
    'Non-Compete': parameters['Non-Compete'] || parameters['Non-Compete Period'] || '',
    'Non-Solicitation Period': parameters['Non-Solicitation Period'] || parameters['Non-Solicitation'] || '1 year',
    'Non-Solicitation': parameters['Non-Solicitation'] || 'Non-solicitation of employees and clients',
    'Expense Reimbursement': parameters['Expense Reimbursement'] || 'Reimbursement for approved business expenses within 30 days',

    // STANDARD LEGAL DETAILS
    'Company Registration': parameters['Company Registration'] || 'C0000000',
    'Employee SSN': '[To be provided by employee]', // Never require SSN in template
    'Company Address': parameters['Company Address'] || '123 Business Street, [City], CA [ZIP]',
    'Employee Address': parameters['Employee Address'] || '[Employee Address]',
    'State': parameters['State'] || parameters['Governing Law'] || parameters.jurisdiction || 'California',
    'Governing Law': parameters['Governing Law'] || parameters['State'] || 'California',
    'Jurisdiction': parameters['Jurisdiction'] || parameters['Governing Law'] || 'California',
    'Date': parameters['Date'] || new Date().toLocaleDateString(),
    'exempt/non-exempt': parameters['exempt/non-exempt'] || 'exempt',
    'Company Type': parameters['Company Type'] || 'corporation',
    'State of Incorporation': parameters['State of Incorporation'] || parameters['State'] || 'California',
    'Arbitration Provider, e.g., JAMS': 'JAMS',
    'Specify County, e.g., Los Angeles County': parameters['Specify County, e.g., Los Angeles County'] || 'Los Angeles County',

    // ADDITIONAL STRATEGIC PARAMETERS
    'Pay Period': parameters['Pay Period'] || parameters.payPeriod || 'year',
    'hour/year': parameters['hour/year'] || 'year'
  };
}

function populatePlaceholders(text, parameters = {}, parameterDefaultsOverride) {
  const parameterDefaults = parameterDefaultsOverride || buildParameterDefaults(parameters);
  const safeParameters = parameters || {};

  console.log('🎯 Master Input Brief - Processing parameters:', Object.keys(safeParameters).length, 'parameters');
  console.log('📋 Available parameters:', Object.keys(safeParameters).filter(k => safeParameters[k] && safeParameters[k] !== '').slice(0, 10));

  return text.replace(/\[([\w\s/.,]+)\]/g, (match, placeholderName) => {
    const key = placeholderName.trim();

    if (Object.prototype.hasOwnProperty.call(parameterDefaults, key)) {
      const defaultValue = parameterDefaults[key];
      if (defaultValue && defaultValue !== '' && !(typeof defaultValue === 'string' && defaultValue.startsWith('['))) {
        return defaultValue;
      }
    }

    const lowerKey = key.toLowerCase();
    const condensedKey = key.replace(/\s+/g, '');
    const directValue = safeParameters[key] ?? safeParameters[lowerKey] ?? safeParameters[condensedKey];
    if (directValue !== undefined && directValue !== null && directValue !== '') {
      return directValue;
    }

    const keyVariations = [
      lowerKey,
      condensedKey,
      key.replace(/\s+/g, '_'),
      key.replace(/_/g, ' '),
      key.replace(/([a-z])([A-Z])/g, '$1 $2')
    ];

    for (const variation of keyVariations) {
      const variationValue = safeParameters[variation];
      if (variationValue !== undefined && variationValue !== null && variationValue !== '') {
        console.log(`📝 Found parameter variation: ${key} -> ${variation} = ${variationValue}`);
        return variationValue;
      }
    }

    if (Object.prototype.hasOwnProperty.call(parameterDefaults, key)) {
      return parameterDefaults[key];
    }

    console.warn(`⚠️  Missing parameter: ${key} (available: ${Object.keys(safeParameters).slice(0, 5).join(', ')}...)`);
    return `[${key}]`;
  });
}

module.exports = { composeContractEnhanced };
