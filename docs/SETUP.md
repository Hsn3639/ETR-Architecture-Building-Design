# ETR Website — Setup & Integration Guide

All integration points are configured in **`website/js/config.js`**. No code changes
are needed beyond editing that one file.

```js
window.ETR_CONFIG = {
  FORMSPREE_ENDPOINT: "",                       // (1) lead delivery
  CONTACT_EMAIL: "hsn.importazioni@outlook.com", // mailto fallback + contact page
  CHAT_API_URL: ""                              // (2) live AI chatbot backend
};
```

---

## 1. Lead delivery — receive questionnaire & contact submissions by email

Out of the box, the questionnaire's **"Send this to ETR"** button and the contact
form open the visitor's email client (mailto) pre-filled with their enquiry. That
works with zero setup, but relies on the visitor having an email client.

To capture leads silently in your inbox (recommended), use **Formspree** (free tier):

1. Go to <https://formspree.io> and create a free account.
2. Create a new form. Set the destination to **hsn.importazioni@outlook.com**.
3. Copy the form's endpoint URL — it looks like `https://formspree.io/f/abcdwxyz`.
4. Paste it into `website/js/config.js`:
   ```js
   FORMSPREE_ENDPOINT: "https://formspree.io/f/abcdwxyz",
   ```
5. Done. **All four forms** — the questionnaire "Send to ETR", the Contact form,
   the Careers application, and the "Join our Network" form — POST to that one
   endpoint and arrive in your inbox; the `mailto:` fallback is used only if the
   endpoint is left blank.

Spam protection: the contact, careers and network forms include a hidden
`_gotcha` honeypot field, which Formspree silently discards when filled by bots.

> Any equivalent service (Getform, Basin, Web3Forms) works the same way — just
> paste its POST URL into `FORMSPREE_ENDPOINT`.

---

## 2. Live AI chatbot (optional — needs the backend in `server/`)

The chatbot works as a rule-based guided assistant with **no backend**. To enable
free-form AI replies powered by Claude:

1. Deploy the backend in [`server/`](../server/README.md) (it needs an Anthropic
   API key).
2. Set its public URL in `config.js`:
   ```js
   CHAT_API_URL: "https://your-backend.example.com/api/chat",
   ```
3. The chatbot will now send free-text messages to your backend and stream back
   Claude's replies. The guided "ballpark estimate" flow still works offline.

---

## 3. Run the site locally

```bash
cd website && python3 -m http.server 8000
# Homepage:       http://localhost:8000/
# Questionnaire:  http://localhost:8000/questionnaire.html
# Research:       http://localhost:8000/research-evidence.html
# Contact/About:  http://localhost:8000/contact-about.html
```

---

## 4. Deploy the site (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` publishes the static site automatically.

1. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Merge this branch into `main` (the workflow runs on push to `main`, or trigger it
   manually from the Actions tab).
3. Your site goes live at `https://<user>.github.io/<repo>/` — the root redirects to
   the homepage; `website/` and `docs/` are both served.

> The **backend (`server/`) is not deployed by Pages** — Pages is static-only. Host
> it separately (Render, Railway, Fly.io, a VM, or a serverless function), set its
> `ANTHROPIC_API_KEY`, then put its public URL in `CHAT_API_URL` / `ESTIMATE_API_URL`.

## 5. Before going public — checklist

- [ ] Set `FORMSPREE_ENDPOINT` so leads are captured.
- [ ] **Tune `RATES` in `website/js/quote.js`** with real Libyan/market cost data —
      the defaults are MENA-regional benchmarks, not confirmed local prices.
- [ ] Proofread the Arabic and Chinese translations with a native speaker.
- [ ] (Optional) Deploy `server/` and set `CHAT_API_URL` for live AI chat.
