import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
// Use import.meta.url to get the current module's URL, then convert it to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths relative to the current file's location for better portability
const CLAUSES_PATH = path.join(__dirname, '..', 'clause_library.json');
const SCAFFOLD_PATH = path.join(__dirname, '..', 'contract_employment_agreement.json');
const EXHIBIT_A_PATH = path.join(__dirname, '..', 'EXHIBITA.md');
const DISCLAIMER_PATH = path.join(__dirname, '..', 'LEGALDISCLAIMER.md');


/**
 * Populates placeholders in a text string with provided parameters.
 * @param {string} text - The text containing placeholders like [Placeholder Name].
 * @param {object} parameters - An object with keys matching the placeholder names.
 * @returns {string} The text with placeholders replaced by their corresponding values.
 */
function populatePlaceholders(text, parameters) {
    // Define required vs optional parameters with sensible defaults
    const parameterDefaults = {
        'Employee Name': parameters['Employee Name'] || parameters.otherPartyName || '[Employee Name]',
        'Company Name': parameters['Company Name'] || parameters.clientName || '[Company Name]',
        'Company Registration': parameters['Company Registration'] || 'C0000000',
        'Employee SSN': '[To be provided by employee]', // Never require SSN in template
        'Supervisor Name': parameters['Supervisor Name'] || parameters['Supervisor Title'] || 'designated supervisor',
        'Supervisor Title': parameters['Supervisor Title'] || 'Manager',
        'Work Location': parameters['Work Location'] || 'Company offices',
        'Annual Salary': parameters['Annual Salary'] || parameters['Salary Amount'] || parameters.amount || '$[SALARY]',
        'Salary Amount': parameters['Salary Amount'] || parameters['Annual Salary'] || parameters.amount || '$[SALARY]',
        'Company Address': parameters['Company Address'] || '123 Business Street, [City], CA [ZIP]',
        'Employee Address': parameters['Employee Address'] || '[Employee Address]',
        'State': parameters['State'] || parameters.jurisdiction || 'California',
        'Job Title': parameters['Job Title'] || 'Employee',
        'Date': parameters['Date'] || new Date().toLocaleDateString(),
        'exempt/non-exempt': parameters['exempt/non-exempt'] || 'exempt',
        'Company Type': parameters['Company Type'] || 'corporation',
        'Arbitration Provider, e.g., JAMS': 'JAMS',
        'Specify County, e.g., Los Angeles County': parameters['Specify County, e.g., Los Angeles County'] || 'Los Angeles County'
    };

    return text.replace(/\[([\w\s/.,]+)\]/g, (match, placeholderName) => {
        const key = placeholderName.trim();
        
        // Use parameter defaults if available
        if (parameterDefaults.hasOwnProperty(key)) {
            return parameterDefaults[key];
        }
        
        // Fallback to direct parameter lookup
        if (parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== '') {
            return parameters[key];
        }
        
        // Clean placeholder, no scary MISSING_DATA
        console.warn(`Missing required parameter: ${key}`);
        return `[${key}]`;
    });
}

/**
 * Builds the main body of the contract by assembling and populating clauses.
 * @param {object} scaffold - The contract scaffold object.
 * @param {object} clauses - The library of all available clauses.
 * @param {object} userInput - The user-provided data, including parameters.
 * @returns {string} The fully assembled and populated contract body.
 */
function buildContractBody(scaffold, clauses, userInput) {
    return scaffold.clauses.map((clauseKey, index) => {
        const clause = clauses[clauseKey];
        if (clause && clause.clause) {
            const populatedClauseText = populatePlaceholders(clause.clause, userInput.parameters);
            // Format each clause as a numbered section
            return `## ${index + 1}. ${clause.title}\n\n${populatedClauseText}\n\n`;
        }
        // Return an empty string for missing or invalid clauses to avoid errors
        return '';
    }).join('');
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

    // This constant MUST start with a backtick ` and have NO preceding characters.
    const fullContract = `
# ${scaffold.title}

---

This Agreement is made and entered into as of ${effectiveDate} (the "Effective Date"), by and between:

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


/**
 * Main function to compose the contract. It reads all necessary files,
 * processes the data, and returns the final contract document.
 * @param {object} userInput - An object containing user-defined parameters for the contract.
 * @returns {Promise<string>} A promise that resolves to the final contract string.
 */
export async function composeContract(userInput) {
    try {
        // Use Promise.all to read all files concurrently for efficiency
        const [clausesData, scaffoldData, exhibitAContent, disclaimerContent] = await Promise.all([
            fs.readFile(CLAUSES_PATH, 'utf8'),
            fs.readFile(SCAFFOLD_PATH, 'utf8'),
            fs.readFile(EXHIBIT_A_PATH, 'utf8'),
            fs.readFile(DISCLAIMER_PATH, 'utf8')
        ]);

        // Parse the JSON data
        const clauses = JSON.parse(clausesData).clauses;
        const scaffold = JSON.parse(scaffoldData);

        // Build the contract body and assemble the final document
        const contractBody = buildContractBody(scaffold, clauses, userInput);
        const finalContract = assembleFinalDocument(scaffold, userInput, contractBody, exhibitAContent, disclaimerContent);

        return finalContract;
    } catch (error) {
        // Log the detailed error and throw a more user-friendly error message
        console.error("Error composing contract:", error);
        throw new Error("Failed to compose the contract. Please check if all source files are correctly formatted and in their expected locations.");
    }
}
