# ETR — Architecture & Building Design

Climate-smart, heritage-rooted architecture and building-design practice for the
Libyan and international markets — grounded in peer-reviewed building science and
the founder's own research on desert and Libyan architecture.

## What's in this repo

| Path | Purpose |
|------|---------|
| `website/index.html` | Multilingual **homepage** (services, why-us, process, CTA) |
| `website/questionnaire.html` | **Smart questionnaire** + plan upload → instant preliminary estimate |
| `website/contact-about.html` | **Contact + About** page (founder bio, credentials, contact form) |
| `website/js/config.js` | Central config — Formspree endpoint, contact email, chat API URL |
| `server/` | Optional **backend**: AI concierge chat, lead capture, plan-image estimate (Claude) |
| `docs/SETUP.md` | Integration guide — Formspree, backend, local run, launch checklist |
| `website/research-evidence.html` | Public **Research & Evidence** page — the science behind our services |
| `website/js/i18n.js` | Shared 7-language engine (EN/AR/FR/ES/RU/ZH/IT) + RTL |
| `website/js/home-i18n.js` · `quote-i18n.js` | Page-specific translations extending the shared dictionary |
| `website/js/quote.js` | Instant-estimate logic + lead delivery (Formspree or mailto) |
| `website/js/chatbot.js` | Multilingual concierge chatbot widget (all pages) |
| `website/css/style.css` | Site styling (desert/heritage palette, responsive, RTL) |
| `docs/research/knowledge-base.md` | Referenced **knowledge base** — findings + how ETR applies them |
| `docs/research/reading-list.md` | **Legal source register** — DOIs and free/open-access links |

All pages share one language switcher (English, Arabic, French, Spanish, Russian,
Chinese, Italian) with automatic right-to-left layout for Arabic.

## Preview the site

Open `website/research-evidence.html` in a browser, or serve locally:

```bash
cd website && python3 -m http.server 8000
# then visit http://localhost:8000/research-evidence.html
```

## Configuration

- **Lead delivery** (`website/js/quote.js`): set `FORMSPREE_ENDPOINT` to a Formspree
  form URL to receive questionnaire submissions by email with no backend. If left
  blank, the form falls back to a pre-filled `mailto:` to `CONTACT_EMAIL`.
- **Estimate rates** (`website/js/quote.js`, `RATES`): illustrative MENA-benchmarked
  costs (USD/m²). Libya publishes no official cost data — **tune these to live local
  quotes before launch.**
- **Chatbot → real AI** (`website/js/chatbot.js`): replace the `handleFreeText()`
  body with a `fetch()` to your LLM backend to enable free-form AI replies.

## Principles

- **Evidence-based:** every public claim links to a legal, open-access or
  author-shared source.
- **Location-aware:** recommendations adapt to local climate (coastal vs. inland,
  humidity, heat).
- **Honest AI:** AI outputs are preliminary estimates, reviewed by a qualified
  architect/engineer before any commitment.

## Roadmap (next)

- Bilingual (Arabic / English) homepage and smart client questionnaire
- Plan-upload → 3-tier instant estimate ("Estimate Ladder")
- Climate-Material Advisor & marble/finishing selector
- Power-Outage Resilience Score
- AI concierge chatbot + client portal
