# Production Readiness — Phase Tracker
Goal: Get VibeLegal to a *stable, secure, deployment-ready* MVP that generates high-quality contracts and can be sold immediately. Avoid scope creep until revenue or strong market validation.

Status Legend: ✅ Done | 🚧 In Progress | ⏳ Planned

---

## Phase 1 — Backend Infrastructure (Deployment Critical)
**Goal:** Establish a solid backend foundation so the app can run reliably and securely in production.

### 1.1 Environment Validation (Joi) — ✅ Done
- Branch: `feat/prod-readiness-v2`
- PR: *Phase 1.1 — Environment Validation (Production Readiness)*
- Notes: see `backend/PROGRESS.md`

### 1.2 Security & Logging Middleware — 🚧 Next
- **Tasks:**
  - Add `helmet` (HTTP security headers)
  - Add `compression` (gzip)
  - Add `morgan` + `winston` (structured logs)
  - Add `express-request-id` (attach `req.id`)
- **Verification:**
  - All API responses include security headers
  - Requests produce structured JSON logs
- **Dependencies:** None

### 1.3 DB Pool + Health Check + Metrics — ⏳ Planned
- **Tasks:**
  - Implement a single, shared `pg.Pool` instance for database connections.
  - Create `/api/health` endpoint to check app and database status.
  - Create `/api/metrics` endpoint to expose Prometheus metrics.
- **Verification:**
  - `curl /api/health` returns `{ status: "ok" }`
  - Prometheus metrics visible at `/api/metrics`
- **Dependencies:** 1.2

### 1.4 Centralized Error Handler — ✅ Done
- **Tasks:**
  - Create `errorHandler` middleware
  - Include `requestId` in all structured error responses
- **Verification:**
  - Any thrown error → consistent JSON `{ error, requestId }`
- **Dependencies:** 1.2

---

## Phase 2 — Contract Quality & Data Integrity
**Goal:** Ensure the MVP generates high-quality contracts and handles data with integrity.

### 2.1 Clause Library Review — ⏳ Planned
- Remove duplicate clauses
- Fill in missing common terms
- Mark jurisdiction tags per clause
- Verification: test generation across at least 3 contract types

### 2.2 Prompt Refinement for LLM — ⏳ Planned
- Improve core composer prompt to reduce hallucinations and improve accuracy.
- Add hard constraints for clause selection logic.
- Verification: 5/5 sample contracts pass a human “read-through” check

### 2.3 Contract Saving & Retrieval Polishing — ⏳ Planned
- Ensure contracts are saved with all required metadata (e.g., user, type, date).
- Implement retrieval endpoints for both a single contract and a user's contract history.
- Verification: save, retrieve, edit, re-save works without data loss

---

## Phase 3 — Database & Auth Hardening
**Goal:** Secure user data and prevent accidental loss.

### 3.1 Migrations (node-pg-migrate) — ⏳ Planned
- Track schema in version control
- Verification: `npm run migrate up` successfully brings a fresh database to the latest schema.

### 3.2 JWT Key Rotation — ⏳ Planned
- Implement support for multiple active signing keys (JWKS).
- Verification: Active user sessions remain valid after a key rotation event.

---

## Phase 4 — Frontend Deployment Readiness
**Goal:** Ensure FE can talk to BE in production without manual hacks.

### 4.1 Env Config (VITE_API_URL) — ⏳ Planned
- Use `.env` files (`.env.local`, `.env.production`) to manage `VITE_API_URL`.
- Verification: staging build points to staging API

### 4.2 Error Boundaries + Loading States — ⏳ Planned
- Prevent white screens on API failure
- Add toasts or inline errors
- Verification: simulate API fail → user sees friendly error

---

## Phase 5 — Monitoring & Compliance
**Goal:** See problems before users do. Keep data compliant.

### 5.1 Sentry Integration (FE/BE) — ⏳ Planned
- Integrate Sentry SDK for automated error and performance monitoring.

### 5.2 User Data Portability (GDPR) — ⏳ Planned
- Implement endpoints for users to request an export or deletion of their data.

---

## Phase 6 — Deployment
**Goal:** Publicly accessible, stable, and secure.

### 6.1 Railway Backend (staging → prod) — ⏳ Planned
- Configure automated deployments from the `main` branch to Railway.

### 6.2 Vercel Frontend (staging → prod) — ⏳ Planned
- Configure automated deployments from the `main` branch to Vercel.

---

### Rules of Engagement
- **No scope creep** until Phase 1 + Phase 2 done.
- All PRs reference the relevant phase + sub-phase.
- Verification steps must be documented in the PR description before merging.
