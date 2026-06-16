# ETR — Architecture & Building Design

Climate-smart, heritage-rooted architecture and building-design practice for the
Libyan and international markets — grounded in peer-reviewed building science and
the founder's own research on desert and Libyan architecture.

## What's in this repo

| Path | Purpose |
|------|---------|
| `website/index.html` | Multilingual **homepage** (services, why-us, process, CTA) |
| `website/questionnaire.html` | **Smart questionnaire** + plan upload → instant preliminary estimate |
| `website/research-evidence.html` | Public **Research & Evidence** page — the science behind our services |
| `website/js/i18n.js` | Shared 7-language engine (EN/AR/FR/ES/RU/ZH/IT) + RTL |
| `website/js/home-i18n.js` · `quote-i18n.js` | Page-specific translations extending the shared dictionary |
| `website/js/quote.js` | Instant-estimate logic (Tier-1 "Estimate Ladder") |
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
