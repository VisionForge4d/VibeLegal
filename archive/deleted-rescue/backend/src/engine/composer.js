const fs = require('fs').promises;
const path = require('path');

// --- File Paths ---
// Define paths to the legal data files. This makes it easy to manage file locations.
const clausesPath = path.join(__dirname, '..', 'legal-data', 'california_employment_clauses.json');
const scaffoldPath = path.join(__dirname, '..', 'legal-data', 'california_employment_scaffold.json');
const exhibitAPath = path.join(__dirname, '..', 'legal-data', 'EXHIBIT_A_CA_LABOR_CODE_2870.md');
const disclaimerPath = path.join(__dirname, '..', 'legal-data', 'LEGAL_DISCLAIMER.md');


/**
 * The main function to compose a contract based on user selections.
 * @param {object} userInput - The structured user input from the frontend.
 * @returns {Promise<string>} The fully composed contract as a string.
 */
async function composeContract(userInput) {
    try {
        // 1. Load all necessary legal data files in parallel for efficiency.
        const [clausesData, scaffoldData, exhibitAContent, disclaimerContent] = await Promise.all([
            fs.readFile(clausesPath, 'utf8'),
            fs.readFile(scaffoldPath, 'utf8'),
            fs.readFile(exhibitAPath, 'utf8'),
            fs.readFile(disclaimerPath, 'utf8')
        ]);

        const clauses = JSON.parse(clausesData);
        const scaffold = JSON.parse(scaffoldData);

        // 2. Build the main body of the contract.
        const contractBody = buildContractBody(scaffold, clauses, userInput);

        // 3. Assemble the final document with header, body, exhibits, and disclaimer.
        const finalContract = assembleFinalDocument(scaffold, userInput, contractBody, exhibitAContent, disclaimerContent);

        return finalContract;

    } catch (error) {
        console.error("Error composing contract:", error);
        throw new Error("Failed to compose the contract. Check server logs for details.");
    }
}

/**
 * Builds the main body of the contract by assembling clauses in the correct order.
 * @param {object} scaffold - The contract scaffold definition.
 * @param {object} clauses - The library of all available clauses.
 * @param {object} userInput - The user's selections and parameters.
 * @returns {string} The assembled contract clauses.
 */
function buildContractBody(scaffold, clauses, userInput) {
    let sectionCounter = 1; // For numbering the sections.
    const assembledClauses = [];

    // Iterate through the clause order defined in the scaffold.
    for (const clauseKey of scaffold.clause_order) {
        // Determine which variation of the clause to use (user's choice or default).
        const variationKey = userInput.options[clauseKey] || scaffold.default_options[clauseKey];
        
        // Get the clause object and the specific variation from the library.
        const clause = clauses[clauseKey];
        const variation = clause?.variations?.[variationKey];

        // If the clause and variation exist, and the clause text is not empty...
        if (variation && variation.clause) {
            // Populate placeholders in the clause text. Note: we pass the whole userInput.parameters object.
            const populatedClauseText = populatePlaceholders(variation.clause, userInput.parameters);
            
            // Format the clause with a title and section number.
            const formattedClause = `## ${sectionCounter}. ${clause.title}\n\n${populatedClauseText}\n\n`;
            assembledClauses.push(formattedClause);
            sectionCounter++;
        }
    }
    return assembledClauses.join('');
}


function populatePlaceholders(text, parameters) {
    return text.replace(/\$?\{\{(\w+)\}\}/g, (match, placeholderName) => {
        return parameters[placeholderName] !== undefined ? parameters[placeholderName] : `[!!MISSING_DATA: ${placeholderName}!!]`;
    });
}


/**
 * Assembles the final, complete contract document.
 * @param {object} scaffold - The contract scaffold definition.
 * @param {object} userInput - The user's input.
 * @param {string} contractBody - The composed body of the contract.
 * @param {string} exhibitAContent - The content of Exhibit A.
 * @param {string} disclaimerContent - The content of the legal disclaimer.
 * @returns {string} The final, formatted contract document.
 */
function assembleFinalDocument(scaffold, userInput, contractBody, exhibitAContent, disclaimerContent) {
    const { clientName, otherPartyName } = userInput.parameters;
    const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Construct the document using template literals for a clean structure.
    const fullContract = `
# ${scaffold.title}

---

This Employment Agreement (the "Agreement") is made and entered into as of ${effectiveDate} (the "Effective Date"), by and between:

**${clientName}** ("Company")

and

**${otherPartyName}** ("Employee")

---

${contractBody}

---
${exhibitAContent}

---
${disclaimerContent}
`;
    return fullContract.trim();
}


module.exports = { composeContract };
