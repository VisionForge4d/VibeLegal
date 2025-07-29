# Handoff Anchor — ops
🗓 Last touched: 2025-07-26 19:29:08

🎯 Current Focus:
- [ ] Document what’s complete
- [ ] Note what’s unresolved
- [ ] Identify what’s next

🔜 Next Steps:
- [ ] ...

🧠 Context Notes:
- ...
# Handoff Anchor — ops
🗓 Last touched: 2025-07-27 22:00:00

🎯 Current Focus:
- [x] Backend server working with contract generation (Groq API via LLaMA3 confirmed)
- [x] Frontend template is running locally (Vite on port 5175)
- [x] Able to generate and view contracts from UI
- [ ] Finalize basic contract saving/retrieval flow

🔜 Next Steps:
- [ ] Add `.env` file to frontend (`VITE_API_URL=http://localhost:5000`)
- [ ] Refactor contract generation error handling (UI + backend)
- [ ] Confirm frontend token is sent with `Authorization: Bearer <token>`
- [ ] Add logout functionality
- [ ] Implement basic profile/account page (for testing tier logic)
- [ ] Add API route for tier upgrades (stub is fine)
- [ ] Add `Makefile` or `dev.sh` to run backend + frontend in one command

🧠 Context Notes:
- `completion is not defined` was due to axios result not being scoped or declared; fixed by properly assigning `const completion = await axios.post(...)`.
- Running `npm run dev` in both frontend and backend is now standard.
- Server and client work if launched independently — shared port awareness is good (`5175`, `5000`).
- One prior issue was caused by a missing closing brace at the bottom of `server.js`.
- Error `EADDRINUSE` means port was already occupied; resolved by killing rogue processes or letting Vite bump ports.
- Project uses Groq `llama3-70b-8192` model for generation (working as of last run).

# Handoff Anchor — VibeLegal (Prompt Engine Integration)
🗓 Last touched: 2025-07-28

## ✅ What’s Complete

- Integrated `prompt-engine` into backend
  - `compilePrompt.js` loads templates, variables, and clauses
  - Clause injection system functional
- Added `generate-contract` route
  - Authenticated
  - Rate-limited (10 requests/min/IP)
  - Pulls clause data and variables to dynamically build prompt
  - Posts to Groq endpoint (`llama3-70b-8192`)
- `.env` reads `GROQ_API_KEY`
- Prompt testing functional (Purple Porsches test passed)
- Frontend served via `npx vite` (confirmed live)
- Dev server active via `npx nodemon server.js` (port 5000)

## ⚠️ Known Issues

- Groq key usage likely rate-limited or request-capped (hit limit?)
- `.env` key mismatch or overwritten during testing
- Vite frontend didn’t automatically open in browser
- Prompt renders visible markdown scaffolding instead of full contract in some cases (possible template fallback)

## 🧩 File Structure Merge Notes

- `prompt-engine` is now located at:  
  `VibeLegal/backend/prompt-engine/`
  - `utils/compilePrompt.js`
  - `templates/base_employment_agreement.md`
  - `clauses/*.md`

## 🛠 Suggested Next Steps

1. **Verify Groq API Key**  
   - Test with:  
     `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer <KEY>"`

2. **Improve Prompt Output**  
   - Make sure clause injection is happening correctly
   - Check for `{{ variable }}` leftovers in final prompt → sanitize output

3. **Frontend Integration**  
   - Confirm POST request from UI to `/api/generate-contract` hits backend successfully
   - Add form validation

