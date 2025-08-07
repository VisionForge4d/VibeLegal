# Handoff Anchor — VibeLegal
🗓 Last touched: 2025-07-27

---

## 🌟 Current Focus

- [x] Backend & frontend working with contract generation
- [x] Groq integration functional via OpenAI-style API
- [ ] Final cleanup (console logs, untracked files)
- [ ] Prepping for stable release

---

## 📁 Folder Structure Notes

> ✅ Use `frontend-template/` as the official frontend moving forward.  
> `frontend/` may be legacy or deprecated.

---

## 📊 Environment Variable Template (`backend/.env.example`)

```env
PORT=5000
DATABASE_URL=postgresql://postgres:<yourpassword>@localhost:5432/vibelegal
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

> NOTE: The real `.env` is ignored by git. Use `.env.example` to clone configs.

---

## 🔧 Stack & Toolchain

| Layer      | Tool                    |
|------------|-------------------------|
| Frontend   | Vite + React (inside `frontend-template/`) |
| Backend    | Express.js              |
| Auth       | JWT (`jsonwebtoken`)    |
| AI         | Groq API (`axios` OpenAI-style POST) |
| DB         | PostgreSQL + `pg` lib   |
| Devtools   | Nodemon, dotenv, console logger |
| Infra      | `.env`, curl, bash, Git |

---

## 🚀 Local Dev Quickstart

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (template)
cd frontend-template
npm install
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: Usually starts on `http://localhost:5173` or higher

---

## 📦 Useful Endpoints

```bash
GET     /api/health             # health check
POST    /api/register           # user signup
POST    /api/login              # user login
POST    /api/generate-contract  # protected route
```

> JWT auth token is required for contract generation.  
> Contracts auto-track usage count in DB.

---

## 📝 Next Steps

- [ ] Review & remove lingering `console.log()` calls
- [ ] Git add + commit `.gitignore` and `.env.example`
- [ ] Tag a release version or prep `make release`
- [ ] Remove test `.json`, screenshots, or deprecated folders (e.g., `frontend/` if unused)

---

## 🧠 Context Notes

- Contract generation works via POST to `/api/generate-contract`
- You must be logged in to receive a JWT token
- Basic plan users get 25 contracts/month max
- Groq is used under the hood with `llama3-70b-8192` or `mixtral-*`
- Error handling includes rate limits, quota errors, and token invalidation

