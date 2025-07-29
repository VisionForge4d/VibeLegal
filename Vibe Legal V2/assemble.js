const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class ContractAssembler {
  constructor(jurisdictionPath) {
    this.jurisdictionPath = jurisdictionPath;
    this.clauseLibrary = this.loadClauseLibrary();
    this.ruleset = this.loadRuleset();
  }

  loadClauseLibrary() {
    const clausePath = path.join(this.jurisdictionPath, 'clause_library.json');
    if (!fs.existsSync(clausePath)) {
      throw new Error(`Clause library not found: ${clausePath}`);
    }
    return JSON.parse(fs.readFileSync(clausePath, 'utf8'));
  }

  loadRuleset() {
    const rulesetPath = path.join(this.jurisdictionPath, 'ruleset.yaml');
    if (!fs.existsSync(rulesetPath)) {
      return {}; // No ruleset is optional
    }
    return yaml.load(fs.readFileSync(rulesetPath, 'utf8'));
  }

  loadContractTemplate(contractType) {
    const templatePath = path.join(this.jurisdictionPath, `contract_${contractType}.json`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Contract template not found: ${templatePath}`);
    }
    return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  }

  validateCompliance(contractType, userInputs, jurisdiction) {
    const errors = [];

    // Check for non-compete clause in California
    if (jurisdiction === 'us_ca') {
      const contractText = JSON.stringify(userInputs).toLowerCase();
      if (contractText.includes('non-compete') || contractText.includes('noncompete')) {
        errors.push('Non-compete clauses are generally unenforceable in California');
      }
    }

    // Check for disclaimer in body
    const contractText = JSON.stringify(userInputs).toLowerCase();
    if (contractText.includes('legal disclaimer')) {
      errors.push('Legal disclaimer should not be included in contract body');
    }

    return errors;
  }

  assembleContract(contractType, userInputs, options = {}) {
    const template = this.loadContractTemplate(contractType);
    const complianceErrors = this.validateCompliance(contractType, userInputs, path.basename(this.jurisdictionPath));
    
    if (complianceErrors.length > 0) {
      throw new Error(`Compliance violations: ${complianceErrors.join(', ')}`);
    }

    let contractSections = [];
    
    // Add title
    contractSections.push(`# ${template.title}`);
    contractSections.push('');

    // Process each clause in the template
    template.clauses.forEach(clauseId => {
      const clause = this.clauseLibrary.clauses[clauseId];
      if (!clause) {
        console.warn(`Clause not found: ${clauseId}`);
        return;
      }

      let clauseText = clause.text;
      
      // Replace placeholders with user inputs
      Object.keys(userInputs).forEach(key => {
        const placeholder = `{{${key}}}`;
        clauseText = clauseText.replace(new RegExp(placeholder, 'g'), userInputs[key]);
      });

      contractSections.push(`## ${clause.title}`);
      contractSections.push(clauseText);
      contractSections.push('');
    });

    return contractSections.join('\n');
  }

  shouldAttachExhibitA(userInputs) {
    // Auto-attach Exhibit A when IP assignment is present
    return userInputs.ip_assignment === true || 
           (typeof userInputs.ip_assignment === 'string' && userInputs.ip_assignment.toLowerCase() === 'yes');
  }

  getExhibitA() {
    const exhibitPath = path.join(this.jurisdictionPath, 'exhibit_a_ip_notice.md');
    if (fs.existsSync(exhibitPath)) {
      return fs.readFileSync(exhibitPath, 'utf8');
    }
    return null;
  }
}

module.exports = ContractAssembler;

