---
name: ui-ux-pro-max
description: >-
  Use for UX/usability/conversion decisions on any web or app UI — information
  architecture, user flows, forms & input UX, microcopy, states (loading/empty/
  error/success), micro-interactions, conversion optimization, trust signals,
  and usability-heuristic review. Complements the visual-design skill
  (frontend-design); reach for this when the question is "does this work well and
  convert" rather than "does this look good." Invoke for flows, forms, CTAs,
  onboarding, checkout/lead capture, or any "improve the UX / make it convert"
  request.
---

# UI/UX Pro

> Note: ETR project-authored skill capturing advanced UX practice. It is **not**
> the third-party `ui-ux-pro-max-skill` npm package (the registry and GitHub were
> unreachable from this environment). Swap in the original if you obtain it.

Goal: interfaces that are **effortless, trustworthy, and high-converting** — the
behaviour layer beneath the visuals.

## 0. Start from the job, not the screen
For each page, write the one **user goal** and the one **business goal**. If a
section serves neither, cut it. Every CTA should map to a goal.

## 1. Nielsen's 10 usability heuristics (review against these)
1. **Visibility of system status** — always show what's happening (loading, saved, sent).
2. **Match the real world** — plain language, user's terms, logical order.
3. **User control & freedom** — easy undo/back/cancel; no dead ends.
4. **Consistency & standards** — same word/action means the same thing everywhere.
5. **Error prevention** — constrain inputs, confirm destructive actions.
6. **Recognition over recall** — show options; don't make users remember.
7. **Flexibility & efficiency** — shortcuts for experts, simple path for novices.
8. **Aesthetic & minimalist** — every extra element competes with the essential.
9. **Help users with errors** — plain, specific, recovery-oriented messages.
10. **Help & documentation** — searchable, task-focused, when needed.

## 2. Information architecture & flow
- Group by user mental model, not org chart. Shallow > deep navigation.
- One primary action per screen; secondary actions visually subordinate.
- Map the **flow**: entry → steps → success. Remove every non-essential step.
- Persistent wayfinding: where am I, how do I get back, what's next.

## 3. Design every state (the most-skipped UX work)
For each data view and form, design: **empty**, **loading** (skeleton > spinner),
**partial**, **error**, **success**, **disabled**. An app is its states, not its
happy path. Empty states should teach the next action.

## 4. Forms & input UX (where conversions are won/lost)
- Ask for the **minimum**; every field has a cost. Mark optional, not required.
- One column; logical grouping; labels **above** fields (not placeholder-only).
- Right input types/keyboards (`type=email/tel/number`, `inputmode`, `autocomplete`).
- **Inline validation on blur**, not only on submit; show success too.
- Errors: specific + adjacent + recovery ("Enter a valid email, e.g. name@site.com").
- Never disable the submit button silently — explain what's missing.
- Preserve input on error; never clear a filled form.
- Touch targets ≥ 44px; visible focus; logical tab order.
- Show progress on multi-step; allow back without data loss.

## 5. Microcopy
- Buttons state the **outcome** ("Get my estimate", not "Submit").
- Set expectations near actions ("We reply within 1 business day", "No spam").
- Confirmations are specific ("Sent — we'll be in touch", not "Success!").
- Write for scanning: front-load meaning, short sentences, no jargon.

## 6. Micro-interactions & feedback
- Every action gets immediate feedback (<100ms perceived). Optimistic UI where safe.
- Motion has a job: orient, confirm, or direct attention — 150–300ms, purposeful.
- Loading: skeletons that mirror final layout reduce perceived wait.
- Respect `prefers-reduced-motion`.

## 7. Conversion optimization
- One clear primary CTA per view; repeat it after long scrolls.
- Reduce friction & risk: fewer fields, social proof, guarantees, clear pricing.
- **Trust signals** near the ask: testimonials, credentials, contact info, security.
- Lead with value/benefit, not features; answer "what's in it for me" first.
- Reduce cognitive load: defaults, smart pre-fill, progressive disclosure.
- Make the next step obvious and singular at every scroll depth.

## 8. Trust & credibility
- Real contact details, a human name/face, location, response time.
- Show proof: results, numbers, named (permissioned) clients, affiliations.
- Honesty in estimates/claims; label anything provisional. Never dark patterns.

## 9. Accessibility = usability (WCAG)
- Semantic landmarks + heading order; keyboard-complete; visible focus.
- Contrast AA (4.5:1 text); don't rely on colour alone for meaning.
- Labels/`aria` on every control; announce dynamic changes (`aria-live`).
- Hit areas ≥ 44px; captions/alt text; respects reduced motion.

## 10. Measure
- Define success metrics per flow (completion %, drop-off step, time-to-value).
- Instrument funnels; watch where users abandon; A/B the one biggest friction.
- Qualitative: 5 quick usability sessions surface most issues.

## Pre-ship UX checklist
- [ ] User goal + business goal stated per page; CTAs map to them
- [ ] Single clear primary action per screen
- [ ] Empty / loading / error / success states designed
- [ ] Forms: minimal fields, labels above, correct input types + autocomplete
- [ ] Inline validation on blur; specific, recoverable errors; input preserved
- [ ] Buttons name the outcome; expectations + trust copy near the ask
- [ ] Immediate feedback on every action; purposeful motion; reduced-motion safe
- [ ] Trust signals present (proof, contact, credentials); no dark patterns
- [ ] Keyboard + screen-reader complete; AA contrast; ≥44px targets
- [ ] Success metric defined and instrumented for the key flow
