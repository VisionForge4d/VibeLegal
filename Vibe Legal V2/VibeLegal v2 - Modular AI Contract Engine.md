# VibeLegal v2 - Modular AI Contract Engine

A pack-based, jurisdiction-compliant contract generation system with LLM adapters for Groq and Ollama.

## Architecture

```
User <-> Vite React Frontend <-> Node/Express Backend <-> LLM Provider (Groq/Ollama/None)
                                      |
                                      +-> PostgreSQL Database
                                      |
                                      +-> Jurisdiction Packs (us_ca, us_tx, ...)
```

## Quick Start

### Local Development

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd vibelegal-v2
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install dependencies**:
   ```bash
   # Backend
   cd app && npm install
   
   # Frontend
   cd ../web && npm install
   ```

3. **Setup database**:
   ```bash
   cd app
   node setup-database.js
   ```

4. **Start development servers**:
   ```bash
   # Backend (terminal 1)
   cd app && npm run dev
   
   # Frontend (terminal 2)
   cd web && npm run dev
   ```

### Validation and Testing

```bash
# Validate jurisdiction packs
cd app
npm run validate:pack us_ca
npm run validate:pack us_tx

# Run smoke tests (requires running server)
npm run test:smoke us_ca
```

### Build and Deploy

```bash
# Build deployment package
cd app
npm run build:zip

# Deploy to Render.com
# Upload the generated zip file to your Render service
```

## Configuration

### Environment Variables

- `LLM_PROVIDER`: `groq`, `ollama`, or `null` (no AI polish)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing

### LLM Providers

**Groq**:
```bash
LLM_PROVIDER=groq
GROQ_API_KEY=your-api-key
GROQ_MODEL=llama-3-8b-instant
```

**Ollama**:
```bash
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:8b
```

**No LLM** (assembler only):
```bash
LLM_PROVIDER=null
```

## API Endpoints

### New Contract API
```bash
POST /api/contracts/generate?format=json|pdf|docx
{
  "jurisdiction": "us_ca",
  "contractType": "employment_agreement",
  "userInputs": {
    "client_name": "Company Inc.",
    "employee_name": "John Doe"
  },
  "requirements": "Additional requirements",
  "enablePolish": true
}
```

### Legacy Adapter
```bash
POST /api/generate-contract
{
  "contractType": "Employment Agreement",
  "clientName": "Company Inc.",
  "otherPartyName": "John Doe",
  "jurisdiction": "California",
  "requirements": "Standard terms"
}
```

### Health Check
```bash
GET /api/health
```

## Jurisdiction Packs

Located in `jurisdictions/` directory:

```
jurisdictions/
├── us_ca/                    # California pack
│   ├── clause_library.json  # Available clauses
│   ├── contract_*.json      # Contract templates
│   ├── ruleset.yaml         # Compliance rules
│   ├── disclaimer.md        # Legal disclaimer
│   ├── exhibit_a_ip_notice.md
│   └── examples/
└── us_tx/                   # Texas pack (scaffold)
    └── ...
```

## Compliance Features

### California (us_ca)
- ✅ Non-compete clause detection and rejection
- ✅ Auto-attachment of §2870 Exhibit A for IP assignments
- ✅ Disclaimer placement (cover/UI only, not in contract body)
- ✅ At-will employment compliance

### Texas (us_tx)
- 🚧 Basic scaffold (ready for expansion)

## Development

### Adding New Jurisdictions

1. Create `jurisdictions/new_jurisdiction/` directory
2. Add required files: `clause_library.json`, `contract_*.json`, `disclaimer.md`
3. Validate: `npm run validate:pack new_jurisdiction`
4. Test: `npm run test:smoke new_jurisdiction`

### Adding New Contract Types

1. Create `contract_new_type.json` in jurisdiction directory
2. Add required clauses to `clause_library.json`
3. Update frontend contract type options
4. Validate and test

## Deployment

### Render.com

1. Build deployment package: `npm run build:zip`
2. Upload to Render service
3. Configure environment variables
4. Deploy

### Docker

```bash
docker build -t vibelegal-v2 .
docker run -p 5000:5000 --env-file .env vibelegal-v2
```

## License

ISC

