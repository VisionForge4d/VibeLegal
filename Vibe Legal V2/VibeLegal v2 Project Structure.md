# VibeLegal v2 Project Structure

```
vibelegal-v2/
├── app/                          # Node.js/Express Backend
│   ├── package.json             # Backend dependencies
│   ├── server.js                # Main server file
│   ├── routes/
│   │   ├── contracts.js         # New contract generation API
│   │   └── adapter_legacy.js    # Legacy API adapter
│   ├── services/
│   │   ├── llm.js              # LLM adapter (Groq/Ollama)
│   │   ├── assemble.js         # Contract assembler
│   │   ├── renderPDF.js        # PDF renderer
│   │   └── renderDOCX.js       # DOCX renderer
│   └── database.sql            # Database schema
├── web/                         # Vite React Frontend
│   ├── package.json            # Frontend dependencies
│   ├── src/
│   │   ├── App.jsx             # Main app component
│   │   ├── lib/
│   │   │   └── api.js          # API client
│   │   └── components/
│   │       ├── Login.jsx       # Authentication
│   │       ├── Dashboard.jsx   # User dashboard
│   │       └── ContractGenerator.jsx # Contract form
│   └── dist/                   # Built frontend (after build)
├── jurisdictions/              # Jurisdiction packs
│   ├── us_ca/                  # California pack
│   │   ├── clause_library.json
│   │   ├── contract_employment_agreement.json
│   │   ├── disclaimer.md
│   │   ├── exhibit_a_ip_notice.md
│   │   ├── ruleset.yaml
│   │   ├── exhibits.map.json
│   │   └── examples/
│   └── us_tx/                  # Texas pack (scaffold)
│       ├── clause_library.json
│       ├── contract_employment_agreement.json
│       ├── disclaimer.md
│       ├── ruleset.yaml
│       ├── exhibits.map.json
│       └── examples/
├── scripts/                    # Utility scripts
│   ├── validate_pack.mjs      # Pack validation
│   ├── smoke_test.mjs         # Smoke testing
│   └── build_zip.mjs          # Build deployment package
├── schemas/                   # JSON schemas (future)
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI
├── Dockerfile                 # Docker configuration
├── render.yaml               # Render.com deployment
├── .env.example              # Environment template
├── README.md                 # Documentation
└── CONTRIBUTING.md           # Development guide
```

## Key Features Implemented

### Backend (Node.js/Express)
- ✅ Modular LLM adapter supporting Groq, Ollama, and null providers
- ✅ Pack-based contract assembler with compliance validation
- ✅ PDF and DOCX rendering services
- ✅ New API endpoint: `POST /api/contracts/generate?format=pdf|docx|json`
- ✅ Legacy adapter: `POST /api/generate-contract` (maintains compatibility)
- ✅ California compliance: non-compete detection, Exhibit A auto-attachment
- ✅ Disclaimer placement (cover/UI only, not in contract body)

### Frontend (Vite React)
- ✅ Modern React with hooks and context
- ✅ API client with environment-based URL configuration
- ✅ Contract generator with jurisdiction and format selection
- ✅ Authentication system integration
- ✅ Download functionality for PDF/DOCX formats

### Jurisdiction Packs
- ✅ California (us_ca): Full implementation with compliance rules
- ✅ Texas (us_tx): Scaffold ready for expansion
- ✅ Modular clause library system
- ✅ Contract template definitions
- ✅ Exhibit management and auto-attachment

### DevOps & Deployment
- ✅ Docker containerization with Puppeteer support
- ✅ Render.com deployment configuration
- ✅ GitHub Actions CI/CD pipeline
- ✅ Pack validation and smoke testing scripts
- ✅ Automated build and packaging system

### Compliance Features
- ✅ Non-compete clause detection and rejection (California)
- ✅ §2870 Exhibit A auto-attachment for IP assignments
- ✅ Disclaimer placement validation
- ✅ Jurisdiction-specific rule enforcement

