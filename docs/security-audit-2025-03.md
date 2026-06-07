# VibeLegal Security & Quality Audit (March 2025)

## Critical Issues (Immediate Fix Required)

1. **[Payment & Subscription Logic] Unauthenticated subscription tier escalation**
   - **File:** `backend/src/subscription-service.js` (lines 244-271)
   - **Impact:** Financial, Security Breach
   - **Description:** The `/api/user/update-tier` endpoint is exposed to any authenticated end user and writes the requested `tier` directly into the `users` table without validation or payment verification. An attacker can self-upgrade to the `pro` or `enterprise` tiers (or an arbitrary string) and gain unlimited premium features without paying.
   - **Proof of Concept:**
     ```bash
     curl -X POST https://<your-api-host>/api/user/update-tier \
       -H "Authorization: Bearer <user_jwt>" \
       -H "Content-Type: application/json" \
       -d '{"tier":"enterprise","stripeSubscriptionId":"fake"}'
     ```
     The response is `{ "success": true, ... }`, and the attacker’s account now enjoys enterprise entitlements.
   - **Recommended Fix:** Restrict tier changes to trusted sources (e.g., Stripe webhooks or admin-only endpoints), whitelist acceptable tier values, and verify the Stripe subscription/customer IDs before persisting changes.

## High Priority Issues

1. **[Payment & Subscription Logic] Contract quota limits unenforced on backend**
   - **Files:** `backend/server.js` (lines 369-389), `backend/src/subscription-service.js` (lines 275-320)
   - **Impact:** Financial
   - **Description:** Basic tier users are limited to five contracts per month in business logic, but the `/api/save-contract` endpoint never checks the user’s quota before inserting. Attackers can generate and save unlimited contracts (and increment their usage counter afterward), effectively bypassing plan enforcement.
   - **Recommended Fix:** Before saving a contract, query the user’s plan limits (`getTierLimits`) and reject the request when the quota is exceeded. Consider enforcing this in the database with constraints or stored procedures for defense in depth.

2. **[Payment & Subscription Logic] Stripe webhook signature verification broken**
   - **Files:** `backend/server.js` (lines 41-46), `backend/src/subscription-service.js` (lines 200-243)
   - **Impact:** Financial, Operational
   - **Description:** Express’s global `express.json()` body parser runs before the Stripe webhook route. Consequently, `req.body` is already parsed (and no longer a raw buffer) when `stripe.webhooks.constructEvent` executes, causing signature verification failures and rejecting legitimate events.
   - **Recommended Fix:** Mount the `/api/user/webhook/stripe` route *before* `express.json()`, or gate the JSON parser to skip requests with the Stripe webhook path. Ensure the webhook receives the raw request body so Stripe signatures validate and subscription status stays authoritative.

3. **[Deployment Blocker / Legal] Admin audit log migration breaks referential integrity**
   - **Files:** `backend/database.sql` (lines 7-18), `backend/admin-dashboard-migration.sql` (lines 18-37)
   - **Impact:** Legal Liability, Deployment Blocker
   - **Description:** Core tables still use `SERIAL` integer primary keys, but the admin migration creates `admin_actions.admin_user_id UUID REFERENCES users(id)`. The type mismatch causes the migration to fail (or, worse, silently disable FK enforcement), leaving the audit trail inoperable—a critical compliance risk before launch.
   - **Recommended Fix:** Align key types. Either migrate users to UUIDs or update the admin migration to reference `INTEGER` keys. Re-run migrations to ensure the audit log table and FK constraints are created successfully.

## Medium Priority Issues

1. **[Business Logic] Enhanced contract composer always falls back**
   - **File:** `backend/engine/composer_enhanced.js` (lines 80-113)
   - **Impact:** Feature Regression
   - **Description:** The enhanced composer references `parameters` and `parameterDefaults` outside their scope, throwing a `ReferenceError` and forcing every call into the legacy fallback path. Enhanced clause selection, analytics, and metadata never execute.
   - **Recommended Fix:** Replace those references with `userInput.parameters` and expose the needed defaults within scope before building metadata.

2. **[Business Logic / Admin UX] Impersonation flow response mismatch**
   - **Files:** `backend/src/admin-service.js` (lines 257-312), `frontend/src/components/admin/UserImpersonation.jsx` (lines 55-70)
   - **Impact:** Operational
   - **Description:** The backend returns `token`, but the frontend expects `impersonation_token`, so admins cannot actually impersonate users. The modal silently refuses to proceed, undermining support workflows.
   - **Recommended Fix:** Harmonize the response schema (e.g., rename the backend property to `impersonation_token` or adjust the frontend to read `token`) and add regression tests for the impersonation flow.

## Low Priority Observations

1. **[Security Hardening] CORS allow-all configuration**
   - **File:** `backend/server.js` (lines 41-45)
   - **Impact:** Low
   - **Description:** When `CORS_ORIGIN` is unset, the API reflects any origin while allowing credentials. Although JWTs live in `Authorization` headers, narrowing the allowed origin list reduces the blast radius of potential future XSS issues.
   - **Recommendation:** Configure explicit production origins and disable credential sharing for wildcard origins.

2. **[Observability] Raw AI responses logged to console**
   - **File:** `backend/src/ai-providers/google-ai-provider.js` (line 28)
   - **Impact:** Low (PII leakage in logs)
   - **Description:** `console.log("Raw AI response", …)` emits full model output, potentially including sensitive contract data, to logs.
   - **Recommendation:** Remove or sanitize the log before production deployment.

## Follow-Up / Monitoring

- Verify database migrations on a clean instance after fixing the key-type mismatch.
- Add automated tests for tier enforcement and webhook processing to prevent regressions.
- Consider rate limiting critical endpoints (`/api/login`, `/api/generate-contract`, `/api/user/update-tier`) to mitigate brute force and abuse.

