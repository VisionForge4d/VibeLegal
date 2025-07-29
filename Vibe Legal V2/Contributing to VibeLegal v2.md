# Contributing to VibeLegal v2

## Pack Standards

### Jurisdiction Pack Structure

Each jurisdiction pack must follow this structure:

```
jurisdictions/jurisdiction_code/
├── clause_library.json      # Required: All available clauses
├── contract_*.json         # Required: At least one contract template
├── disclaimer.md           # Required: Legal disclaimer text
├── ruleset.yaml           # Optional: Compliance rules
├── exhibits.map.json      # Optional: Exhibit file mappings
├── exhibit_*.md           # Optional: Exhibit files
└── examples/              # Optional: Sample contracts
    └── *.pdf
```

### Clause Library Format

```json
{
  "clauses": {
    "clause_id": {
      "title": "Human-readable title",
      "text": "Clause text with {{placeholders}}",
      "category": "employment|confidentiality|termination",
      "required": true,
      "jurisdiction_specific": true
    }
  }
}
```

### Contract Template Format

```json
{
  "title": "Contract Title",
  "description": "Brief description",
  "clauses": ["clause_id_1", "clause_id_2"],
  "options": {
    "clause_id": ["option1", "option2"]
  },
  "tone": "plain_english|formal|technical",
  "formatting": "standard_numbered|bullet_points",
  "disclaimer_path": "disclaimer.md"
}
```

### Compliance Rules (ruleset.yaml)

```yaml
compliance:
  non_compete:
    allowed: false  # For California
    message: "Non-compete clauses are unenforceable in California"
  
  required_exhibits:
    ip_assignment: "exhibit_a_ip_notice.md"
  
  required_clauses:
    - "at_will_employment"
    - "anti_discrimination"
```

## Development Workflow

### 1. Adding New Jurisdictions

1. **Create directory structure**:
   ```bash
   mkdir -p jurisdictions/new_jurisdiction/{examples}
   ```

2. **Create required files**:
   - `clause_library.json` - Start with common clauses
   - `contract_employment_agreement.json` - Basic template
   - `disclaimer.md` - Jurisdiction-specific disclaimer

3. **Validate pack**:
   ```bash
   npm run validate:pack new_jurisdiction
   ```

4. **Test functionality**:
   ```bash
   npm run test:smoke new_jurisdiction
   ```

### 2. Adding New Contract Types

1. **Research requirements**:
   - Legal requirements for the jurisdiction
   - Common clauses and structure
   - Compliance considerations

2. **Create contract template**:
   ```bash
   # Create contract_new_type.json in jurisdiction directory
   ```

3. **Add required clauses**:
   - Update `clause_library.json` with new clauses
   - Ensure proper placeholder usage

4. **Update frontend**:
   - Add contract type to dropdown options
   - Update form fields if needed

5. **Test thoroughly**:
   - Validate pack structure
   - Run smoke tests
   - Manual testing with various inputs

### 3. Compliance Implementation

#### California Specific

- **Non-compete clauses**: Must be rejected or excluded
- **§2870 IP Notice**: Auto-attach when IP assignment present
- **At-will employment**: Must be clearly stated
- **Meal/rest breaks**: Include acknowledgment clauses

#### General Principles

- Disclaimers only on cover/UI, never in contract body
- Proper placeholder replacement
- Jurisdiction-specific language and requirements
- Clear, plain English where possible

## Code Standards

### Backend Services

- Use ES6+ features consistently
- Implement proper error handling
- Add logging for debugging
- Follow REST API conventions
- Validate inputs thoroughly

### Frontend Components

- Use React hooks consistently
- Implement loading states
- Handle errors gracefully
- Follow accessibility guidelines
- Use responsive design

### Testing

- Validate all jurisdiction packs
- Test compliance rules
- Verify API endpoints
- Check file generation (PDF/DOCX)
- Test error scenarios

## Pull Request Process

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-jurisdiction-xy
   ```

2. **Make changes**:
   - Follow pack standards
   - Add tests where applicable
   - Update documentation

3. **Validate changes**:
   ```bash
   npm run validate:pack jurisdiction_code
   npm run test:smoke jurisdiction_code
   ```

4. **Submit PR**:
   - Clear description of changes
   - Include test results
   - Reference any issues

5. **CI checks must pass**:
   - Pack validation
   - Smoke tests
   - Build process

## Common Issues

### Pack Validation Failures

- **Missing required files**: Ensure all required files exist
- **Invalid JSON**: Use JSON validator
- **Missing clause references**: Check clause IDs in templates
- **Compliance violations**: Review jurisdiction-specific rules

### Contract Generation Issues

- **Missing placeholders**: Ensure all {{placeholders}} are defined
- **Compliance errors**: Check ruleset.yaml and compliance logic
- **Rendering failures**: Test PDF/DOCX generation locally

### Frontend Issues

- **API connection**: Check VITE_API_BASE_URL configuration
- **Authentication**: Verify JWT token handling
- **File downloads**: Test download functionality

## Resources

- [California Labor Code §2870](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=2870)
- [Employment Law by State](https://www.dol.gov/agencies/whd/state)
- [Contract Drafting Best Practices](https://www.americanbar.org/groups/business_law/publications/blt/)

## Questions?

- Create an issue for bugs or feature requests
- Check existing documentation first
- Include relevant error messages and logs

