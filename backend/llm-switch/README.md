# LLM Switch (v0.2) — inside `lab/llm-switch`

Multi‑provider LLM adapter with OpenAI + Groq + LM Studio + mock. Ships with Docker (nginx proxy), DRY\_RUN validation, and CI hooks.

---

## Repo Structure

```
lab/
  llm-switch/
    docker-compose.yml
    proxy/
      nginx.conf
    server/
      src/
      package.json
      tsconfig.json
      Dockerfile
    web/
      src/
      index.html
      vite.config.ts
      package.json
      Dockerfile
```

---

## Quickstart (Local Dev)

**Terminal A — server**

```bash
cd lab/llm-switch/server
npm ci
npm run build
npm start   # or: npx tsx watch src/index.ts
```

**Terminal B — web**

```bash
cd lab/llm-switch/web
npm ci
npm run dev   # http://localhost:5173 (proxies /api → :5000)
```

---

## Quickstart (Docker, with nginx proxy)

From `lab/llm-switch`:

```bash
cp .env.example .env   # edit as needed (keep DRY_RUN=1 first run)
docker compose up -d --build
# Web:  http://localhost:8080
# API:  http://localhost:8080/api
```

**Health check**

```bash
curl -s http://localhost:8080/api/health | jq
```

---

## Environment

Create `lab/llm-switch/.env` from `.env.example`:

```ini
DRY_RUN=1
PORT=5000

LMSTUDIO_BASE_URL=http://localhost:1234
LMSTUDIO_API_KEY=

OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=

GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_API_KEY=
```

* **DRY\_RUN=1** → no upstream calls; `/api/llm` returns validation JSON.
* **DRY\_RUN=0** → real calls; set the corresponding API key(s).

---

## UI

`web/src/components/LLMSwitchPanel.tsx` includes providers: `mock`, `lmstudio`, `openai`, `groq`. Model remains manual input.

---

## Validate Calls (No Real APIs)

**OpenAI (DRY\_RUN=1)**

```bash
curl -s http://localhost:8080/api/llm -H 'Content-Type: application/json' -d '{
  "provider":"openai",
  "model":"gpt-4o-mini",
  "messages":[{"role":"user","content":"Say hi in 5 words"}]
}' | jq
```

**Groq (DRY\_RUN=1)**

```bash
curl -s http://localhost:8080/api/llm -H 'Content-Type: application/json' -d '{
  "provider":"groq",
  "model":"llama-3.1-8b-instant",
  "messages":[{"role":"user","content":"Say hi in 5 words"}]
}' | jq
```

---

## Go Live (One Provider)

1. Edit `.env`:

```ini
DRY_RUN=0
OPENAI_API_KEY=sk-...    # or GROQ_API_KEY=...
```

2. Recreate server only:

```bash
docker compose up -d --build server
```

3. Re‑run the same curl; expect a real model response.

---

## CI (baseline)

`.github/workflows/ci.yml` (optional) runs install/build/test for `server` and build for `web` with `DRY_RUN=1`.

---

## Add‑a‑Provider Pattern

1. Create `server/src/providers/<name>.ts` exporting `call<Name>(model, messages, signal)`.
2. Map `(model, messages)` to the target chat schema.
3. Respect `ENV.DRY_RUN` — return validation without network.
4. Add to switch in `server/src/index.ts`.
5. Add UI option.
6. Add Vitest for URL/headers + a DRY\_RUN Supertest.

---

## Troubleshooting

**Proxy restarting w/ permission denied on `/etc/nginx/nginx.conf` (Fedora/SELinux):**

* Ensure compose mount uses `:Z`:

```yaml
volumes:
  - ./proxy/nginx.conf:/etc/nginx/nginx.conf:ro,Z
```

* Then:

```bash
docker compose up -d --build proxy
docker exec -it llm-switch-proxy-1 nginx -t
```

**Server crash: `Cannot find module 'dotenv/config'`:**

```bash
npm -C server i dotenv
docker compose up -d --build server
```

**Permission denied to docker socket:** add user to `docker` group and relogin, or use `sudo`.

---

## Release Checklist (v0.2)

* [ ] `npm -C server ci && npm -C server run build`
* [ ] `npm -C web ci && npm -C web run build`
* [ ] `docker compose up -d --build`
* [ ] `curl -s http://localhost:8080/api/health | jq`
* [ ] Flip DRY\_RUN=0 + key, test live request
* [ ] Tag: `git tag v0.2-live && git push --tags`

---

## License

MIT (adjust if you need different terms).
