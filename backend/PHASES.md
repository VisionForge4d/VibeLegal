# Production Readiness — Phase Tracker
Goal: Get VibeLegal to a *stable, secure, deployment-ready* MVP that generates high-quality contracts and can be sold immediately. Avoid scope creep until revenue or strong market validation.

Status: ✅ Done | 🚧 In Progress | ⏳ Planned

---

## Phase 1 — Backend Infrastructure (Deployment Critical)
**Goal:** Solid backend foundation so the app can run reliably in production.

### 1.1 Environment Validation (Joi) — ✅ Done
- Branch: `feat/prod-readiness-v2`
- PR: *Phase 1.1 — Environment Validation (Production Readiness)*
- Notes: see `backend/PROGRESS.md`

### 1.2 Security & Logging Middleware — 🚧 Next
- **Tasks:**
  - Add `helmet` (security headers)
  - Add `compression` (gzip)
  - Add `morgan` + `winston` (structured logs)
  - Add `express-request-id` (attach `req.id`)
- **Verification:**
  - All API responses include security headers
  - Requests produce structured JSON logs
- **Dependencies:** None

### 1.3 DB Pool + Health Check + Metrics — ⏳ Planned
- **Tasks:**
  - Use a single `pg.Pool` instance
  - `/api/health` → returns `ok` if DB + app alive
  - `/api/metrics` → expose Prometheus metrics
- **Verification:**
  - `curl /api/health` returns `{ status: "ok" }`
  - Prometheus metrics visible at `/api/metrics`
- **Dependencies:** 1.2

### 1.4 Centralized Error Handler — ✅ Done
- **Tasks:**
  - Create `errorHandler` middleware
  - Include `requestId` in error responses
- **Verification:**
  - Any thrown error → consistent JSON `{ error, requestId }`
- **Dependencies:** 1.2

---

## Phase 2 — Contract Quality & Data Integrity
**Goal:** MVP generates *good* contracts that lawyers wouldn’t laugh at.

### 2.1 Clause Library Review — ⏳ Planned
- Remove duplicate clauses
- Fill in missing common terms
- Mark jurisdiction tags per clause
- Verification: test generation across at least 3 contract types

### 2.2 Prompt Refinement for LLM — ⏳ Planned
- Improve composer prompt to avoid hallucinations
- Add hard constraints for clause selection
- Verification: 5/5 sample contracts pass a human “read-through” check

### 2.3 Contract Saving & Retrieval Polishing — ⏳ Planned
- Ensure contracts save with metadata (user, type, date)
- Retrieval endpoint returns latest + full history
- Verification: save, retrieve, edit, re-save works without data loss

---

## Phase 3 — Database & Auth Hardening
**Goal:** Secure user data and prevent accidental loss.

### 3.1 Migrations (node-pg-migrate) — ⏳ Planned
- Track schema in version control
- Verification: `npm run migrate up` brings DB to latest schema on fresh install

### 3.2 JWT Key Rotation — ⏳ Planned
- Support multiple signing keys
- Verification: active sessions survive key rotation

---

## Phase 4 — Frontend Deployment Readiness
**Goal:** Ensure FE can talk to BE in production without manual hacks.

### 4.1 Env Config (VITE_API_URL) — ⏳ Planned
- Use `.env` to switch between local/staging/prod API
- Verification: staging build points to staging API

### 4.2 Error Boundaries + Loading States — ⏳ Planned
- Prevent white screens on API failure
- Add toasts or inline errors
- Verification: simulate API fail → user sees friendly error

---

## Phase 5 — Monitoring & Compliance
**Goal:** See problems before users do. Keep data compliant.

### 5.1 Sentry (FE/BE) — ⏳ Planned
- Capture errors + performance metrics

### 5.2 GDPR Export/Delete Endpoints — ⏳ Planned
- User can request data export or deletion

---

## Phase 6 — Deployment
**Goal:** Publicly accessible, stable, and secure.

### 6.1 Railway Backend (staging → prod) — ⏳ Planned
- Automated deploys from `main`

### 6.2 Vercel Frontend (staging → prod) — ⏳ Planned
- Automated deploys from `main`

---

### Rules of Engagement
- **No scope creep** until Phase 1 + Phase 2 done.
- All PRs reference the relevant phase + sub-phase.
- Verification steps must be documented in `PROGRESS.md` before PR merge.
\n### Phase 1.2.1 - Security Implementation ✅ COMPLETE\n- Production security headers (Helmet)\n- Request logging (Morgan)\n- Environment validation (Joi)\n- Secure database configuration

## Phase 1.4 — Frontend–Backend Integration (Complete)
**Date:** 2025-08-13

- Deep-link view `/contracts/:id` loads and renders
- Unified state-or-fetch flow in `ContractResult.jsx`
- Correct API mapping (`contract.content`, `contract.title`)
- Save payload valid for deep links `{ title, contractType, content }`
- Routes cleaned in `App.jsx`
- Navigate-after-generate → `/contracts/${id}`

**Next:** Phase 1.5 — Deploy (Backend: Railway, Frontend: Vercel, SSL/Domain)

## Phase 1.5 — Deployment — 2025-08-13
- Backend: env validation present (backend/config/env.js); DB via `DATABASE_URL`, SSL via `PGSSL`.
- Frontend: reads `import.meta.env.VITE_API_BASE_URL`; no other functional changes.
- Next: deploy backend to Railway, set env, then point Vercel to Railway URL.
