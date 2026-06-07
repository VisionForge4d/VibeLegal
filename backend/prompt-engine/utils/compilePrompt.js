const fs = require('fs');
const path = require('path');

/**
 * Load a Markdown clause file and return its main content.
 */
function loadClause(clauseKey, clauseDir) {
  const filePath = path.join(clauseDir, `${clauseKey}.md`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Clause not found: ${clauseKey}`);
    return `[[ Missing clause: ${clauseKey} ]]`;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('---\n').pop().trim(); // Strip frontmatter
}

/**
 * Compile a full prompt from a base template, variables, and clauses.
 */
function compilePrompt({ templatePath, variables, clauseKeys, clauseDir }) {
  let template = fs.readFileSync(templatePath, 'utf8');

  // Inject variables
  Object.entries(variables).forEach(([key, value]) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    console.log(`🔧 Injected variable: ${key} = ${value}`);
    template = template.replace(pattern, value);
  });

  // Inject clauses
  clauseKeys.forEach((clauseKey) => {
    const clauseContent = loadClause(clauseKey, clauseDir);
    const pattern = new RegExp(`{{\\s*clause:${clauseKey}\\s*}}`, 'g');
    console.log(`🧩 Injected clause: ${clauseKey}`);
    template = template.replace(pattern, clauseContent);
  });

  return template;
}

module.exports = { compilePrompt };
