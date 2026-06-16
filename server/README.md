# ETR Backend

A small Express service that powers the optional live-AI features of the ETR site.
It calls the Claude API (`@anthropic-ai/sdk`, model `claude-opus-4-8` by default).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/chat` | AI concierge. Body: `{ "messages": [{role, content}], "lang": "en" }` → `{ "reply": "..." }` |
| `POST` | `/api/lead` | Capture a questionnaire/contact submission (logs it; forward to email/CRM in production) |
| `POST` | `/api/estimate-plan` | `multipart/form-data` with a `plan` image → Claude returns a **preliminary** area/room reading |
| `GET`  | `/health` | Liveness check |

## Run locally

```bash
cd server
cp .env.example .env        # then paste your real ANTHROPIC_API_KEY
npm install
npm start                   # → http://localhost:8787
```

Then point the front-end at it in `website/js/config.js`:

```js
CHAT_API_URL: "http://localhost:8787/api/chat",
```

## Notes & guardrails

- **Model:** defaults to `claude-opus-4-8`. Set `ETR_MODEL=claude-haiku-4-5` (or
  `claude-sonnet-4-6`) to lower cost for a high-volume chatbot.
- **Estimates are never binding.** The system prompt and the plan-analysis prompt
  both force Claude to label any figure as a rough, preliminary, expert-reviewed
  estimate — keep it that way.
- **Plan analysis** currently handles image plans only (PNG/JPG). PDF/CAD takeoff
  needs a dedicated AI-takeoff service (e.g. Togal/Beam/Kreo) — wire that in here
  later if you want true quantity takeoff.
- **Lead handling** is a stub that logs to stdout. For production, forward to email
  (e.g. nodemailer), a CRM, or a database inside `/api/lead`.
- **Secrets:** never commit `.env`. Set `ANTHROPIC_API_KEY` via your host's secret
  manager in production.
- **CORS** is open by default for easy local dev — lock it to your site's origin
  before going public.
