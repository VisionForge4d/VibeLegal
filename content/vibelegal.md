---
title: "vibelegal"
author: "Luke @VisionForge4D"
date: "2025-07-26"
license: CC-BY-NC-4.0
---
## ⚖️ VibeLegal — AI-Powered Contract Drafting for Lawyers

**VibeLegal** is a lean MVP that enables legal professionals to generate clean, structured contracts using AI. Built with modern web tools and powered by LLMs (Groq/OpenAI), the app provides an efficient interface for secure document generation and management.

---

## 🚀 Features

### Core Capabilities
- **AI Contract Generator**  
  Draft legally formatted contracts instantly using GPT models.
  
- **Multiple Contract Types**  
  Supports:  
  - Employment Agreements  
  - Non-Disclosure Agreements (NDAs)  
  - Service Contracts  
  - Independent Contractor Agreements  
  - Purchase Agreements  

- **Secure Authentication**  
  Email/password login with JWT token-based access control.

- **Contract Management**  
  Save, view, and retrieve previously generated contracts.

- **Responsive Design**  
  Desktop + mobile optimized.

- **Legal Disclaimers**  
  Every contract includes an AI usage disclaimer.

---

## ⚙️ Tech Stack

### 🖼️ Frontend – `frontend/`
- **Framework:** React 18  
- **Styling:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)  
- **Routing:** React Router  
- **State:** Context API for auth/session  
- **Build Tool:** Vite  
- **Icons:** `lucide-react`

### 🔧 Backend – `backend/`
- **Runtime:** Node.js with Express.js  
- **Database:** PostgreSQL (via `pg`)  
- **Authentication:** JWT, bcryptjs  
- **AI API:** Groq/OpenAI GPT  
- **Security:** CORS, input validation, rate limiting

---

## 🗂️ Database Schema

### `users`
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique user email |
| password_hash | String | Bcrypt hash |
| subscription_tier | Enum | `basic` / `premium` |
| contracts_used_this_month | Int | Usage tracking |
| created_at | Timestamp | — |

### `contracts`
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to `users` |
| title | String | User-supplied name |
| contract_type | String | Type of contract |
| content | Text | Full contract body |
| created_at | Timestamp | — |

---

## 🧪 Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Groq or OpenAI API key

### Environment Setup

Create `.env` files for both frontend and backend.

#### `backend/.env` template:
PORT=5000
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/vibelegal
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key

shell
Copy
Edit

#### `frontend/.env` template:
VITE_API_URL=http://localhost:5000

yaml
Copy
Edit

---

## 🛠️ Usage

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
App should be accessible at: http://localhost:5173

🔒 Disclaimer
LEGAL DISCLAIMER: This software uses AI to generate contracts. All output should be reviewed by a qualified attorney before use. This does not constitute legal advice.

📜 License
MIT License (see LICENSE file)

✨ Status
This is a Minimum Viable Product — future improvements may include:

Editable rich text contracts

Stripe integration

Premium user tier limits

PDF exports with signature blocks

Jurisdiction-specific templates

🧠 Author
Luke @ VisionForge4D
AI Systems Architect · Builder of Sovereign Tooling
visionforge4d.gumroad.com
