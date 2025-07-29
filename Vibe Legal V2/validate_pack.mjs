#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

class PackValidator {
  constructor(jurisdictionPath) {
    this.jurisdictionPath = jurisdictionPath;
    this.errors = [];
    this.warnings = [];
  }

  validate() {
    console.log(`Validating pack: ${this.jurisdictionPath}`);
    
    this.validateStructure();
    this.validateClauseLibrary();
    this.validateContractTemplates();
    this.validateRuleset();
    this.validateExhibits();
    this.validateCompliance();

    this.printResults();
    return this.errors.length === 0;
  }

  validateStructure() {
    const requiredFiles = [
      'clause_library.json',
      'disclaimer.md'
    ];

    const optionalFiles = [
      'ruleset.yaml',
      'exhibits.map.json',
      'exhibit_a_ip_notice.md'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(this.jurisdictionPath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Required file missing: ${file}`);
      }
    });

    // Check for contract templates
    const files = fs.readdirSync(this.jurisdictionPath);
    const contractFiles = files.filter(f => f.startsWith('contract_') && f.endsWith('.json'));
    
    if (contractFiles.length === 0) {
      this.errors.push('No contract templates found (contract_*.json)');
    }
  }

  validateClauseLibrary() {
    const clausePath = path.join(this.jurisdictionPath, 'clause_library.json');
    if (!fs.existsSync(clausePath)) return;

    try {
      const library = JSON.parse(fs.readFileSync(clausePath, 'utf8'));
      
      if (!library.clauses || typeof library.clauses !== 'object') {
        this.errors.push('clause_library.json: Missing or invalid clauses object');
        return;
      }

      Object.entries(library.clauses).forEach(([id, clause]) => {
        if (!clause.title) {
          this.errors.push(`Clause ${id}: Missing title`);
        }
        if (!clause.text) {
          this.errors.push(`Clause ${id}: Missing text`);
        }
      });

    } catch (error) {
      this.errors.push(`clause_library.json: Invalid JSON - ${error.message}`);
    }
  }

  validateContractTemplates() {
    const files = fs.readdirSync(this.jurisdictionPath);
    const contractFiles = files.filter(f => f.startsWith('contract_') && f.endsWith('.json'));

    contractFiles.forEach(file => {
      const filePath = path.join(this.jurisdictionPath, file);
      try {
        const template = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (!template.title) {
          this.errors.push(`${file}: Missing title`);
        }
        if (!template.clauses || !Array.isArray(template.clauses)) {
          this.errors.push(`${file}: Missing or invalid clauses array`);
        }

        // Validate clause references
        if (template.clauses) {
          const clauseLibPath = path.join(this.jurisdictionPath, 'clause_library.json');
          if (fs.existsSync(clauseLibPath)) {
            const library = JSON.parse(fs.readFileSync(clauseLibPath, 'utf8'));
            template.clauses.forEach(clauseId => {
              if (!library.clauses[clauseId]) {
                this.warnings.push(`${file}: References unknown clause: ${clauseId}`);
              }
            });
          }
        }

      } catch (error) {
        this.errors.push(`${file}: Invalid JSON - ${error.message}`);
      }
    });
  }

  validateRuleset() {
    const rulesetPath = path.join(this.jurisdictionPath, 'ruleset.yaml');
    if (!fs.existsSync(rulesetPath)) return;

    try {
      const ruleset = yaml.load(fs.readFileSync(rulesetPath, 'utf8'));
      // Basic validation - ruleset structure is flexible
      if (typeof ruleset !== 'object') {
        this.errors.push('ruleset.yaml: Must be a valid YAML object');
      }
    } catch (error) {
      this.errors.push(`ruleset.yaml: Invalid YAML - ${error.message}`);
    }
  }

  validateExhibits() {
    const exhibitsPath = path.join(this.jurisdictionPath, 'exhibits.map.json');
    if (!fs.existsSync(exhibitsPath)) return;

    try {
      const exhibits = JSON.parse(fs.readFileSync(exhibitsPath, 'utf8'));
      
      Object.entries(exhibits).forEach(([key, filename]) => {
        const exhibitPath = path.join(this.jurisdictionPath, filename);
        if (!fs.existsSync(exhibitPath)) {
          this.warnings.push(`Exhibit file not found: ${filename} (referenced by ${key})`);
        }
      });

    } catch (error) {
      this.errors.push(`exhibits.map.json: Invalid JSON - ${error.message}`);
    }
  }

  validateCompliance() {
    const jurisdiction = path.basename(this.jurisdictionPath);
    
    // California-specific compliance checks
    if (jurisdiction === 'us_ca') {
      this.validateCaliforniaCompliance();
    }
  }

  validateCaliforniaCompliance() {
    const clausePath = path.join(this.jurisdictionPath, 'clause_library.json');
    if (!fs.existsSync(clausePath)) return;

    try {
      const library = JSON.parse(fs.readFileSync(clausePath, 'utf8'));
      const allText = JSON.stringify(library).toLowerCase();
      
      // Check for non-compete clauses
      if (allText.includes('non-compete') || allText.includes('noncompete')) {
        this.warnings.push('California: Non-compete language detected - ensure compliance with CA law');
      }

      // Check for IP assignment and Exhibit A
      const hasIpAssignment = Object.keys(library.clauses).some(id => 
        id.includes('ip_assignment') || id.includes('intellectual_property')
      );
      
      if (hasIpAssignment) {
        const exhibitAPath = path.join(this.jurisdictionPath, 'exhibit_a_ip_notice.md');
        if (!fs.existsSync(exhibitAPath)) {
          this.warnings.push('California: IP assignment clause found but exhibit_a_ip_notice.md missing');
        }
      }

    } catch (error) {
      // Already handled in validateClauseLibrary
    }
  }

  printResults() {
    console.log('\n=== Validation Results ===');
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ Pack validation passed!');
    } else if (this.errors.length === 0) {
      console.log('\n✅ Pack validation passed with warnings.');
    } else {
      console.log('\n❌ Pack validation failed.');
    }
  }
}

// CLI usage
const jurisdiction = process.argv[2];
if (!jurisdiction) {
  console.error('Usage: node validate_pack.mjs <jurisdiction>');
  console.error('Example: node validate_pack.mjs us_ca');
  process.exit(1);
}

const jurisdictionPath = path.join(process.cwd(), 'jurisdictions', jurisdiction);
if (!fs.existsSync(jurisdictionPath)) {
  console.error(`Jurisdiction not found: ${jurisdictionPath}`);
  process.exit(1);
}

const validator = new PackValidator(jurisdictionPath);
const success = validator.validate();

process.exit(success ? 0 : 1);

