ARCHITECTURE (ASCII)
```
User <-> React Frontend (Vite) <-> Node/Express Backend (server.js)
                                    |      |
                                    |      +-> PostgreSQL (via pg)
                                    |      
                                    +-> OpenAI API (via openai)
```

ISSUES (10 bullets, each: <path>: <problem> -> <fix>)

* `/home/ubuntu/vibe_legal_app/server.js`: Hardcoded OpenAI API usage -> Replace with LLM adapter (`llm.ts`) supporting Groq/Ollama.
* `/home/ubuntu/vibe_legal_app/server.js`: Direct prompt engineering in backend -> Implement a contracts engine (packs, assemble, polish) for modularity.
* `/home/ubuntu/vibe_legal_app/server.js`: Inconsistent disclaimer handling (some hardcoded, some not) -> Centralize disclaimer management and ensure it's only on cover/UI.
* `/home/ubuntu/vibe_legal_app/server.js`: Non-compete clause handling is prompt-based -> Implement linter for compliance rules (e.g., no non-compete for CA).
* `/home/ubuntu/vibe_legal_app/server.js`: Missing Exhibit A auto-attachment -> Implement logic to auto-attach §2870 Exhibit A when IP assignment is used.
* `/home/ubuntu/vibe_legal_app/server.js`: Only one API endpoint for contract generation (`/api/generate-contract`) -> Add new `POST /api/contracts/generate?format=pdf|docx` and an adapter for the legacy route.
* `/home/ubuntu/vibe_legal_app/App.jsx`: Frontend directly calls `/api/generate-contract` -> Update frontend to use new API endpoint and handle different formats.
* `/home/ubuntu/vibe_legal_app/package.json`: Missing build scripts for Vite frontend -> Add build scripts for Vite and integrate into CI/CD.
* `/home/ubuntu/vibe_legal_app/server.js`: No clear separation of concerns for contract logic -> Refactor into services (assemble, render, llm) for better organization.
* `/home/ubuntu/vibe_legal_app/server.js`: No PDF/DOCX rendering -> Implement PDF/DOCX rendering services.

PLAN (bullets)

* Create `vibelegal-v2/` directory with `app/`, `web/`, `jurisdictions/`, `ci/`, `scripts/` subdirectories.
* Migrate existing backend code to `vibelegal-v2/app/` and frontend code to `vibelegal-v2/web/`.
* Implement LLM adapter (`llm.ts`) supporting Groq and Ollama in `app/services/`.
* Define schemas for `clause_library.json`, `contract_*.json`, `ruleset.yaml`, `exhibits.map.json` in `schemas/`.
* Develop contracts engine with assembler, optional LLM polish, and PDF/DOCX renderers in `app/services/`.
* Implement compliance rules, including non-compete linter and Exhibit A auto-attachment.
* Create new API route `POST /api/contracts/generate?format=pdf|docx` and an adapter for `POST /api/generate-contract`.
* Update Vite frontend to use the new API and handle contract generation and download.
* Set up `Dockerfile`, `render.yaml`, `.env.example` for deployment.
* Configure GitHub Actions for CI/CD (install, validate packs, smoke tests, build).
* Create `scripts/build_zip.mjs` for artifact generation.
* Write `README.md` and `CONTRIBUTING.md` for documentation.

