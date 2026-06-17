---
name: frontend-design
description: >-
  Use when building or refining any web UI / front-end and you want a
  distinctive, premium, non-generic result. Guidance for typography, colour,
  layout/grid, spacing, motion, accessibility, responsiveness and performance —
  with a checklist to avoid "AI-generated" sameness. Invoke for landing pages,
  marketing sites, dashboards, design-system work, or any "make this look
  better / more modern / high-end" request.
---

# Frontend Design

> Note: this is an ETR project-authored skill that captures high-quality
> front-end design practice. It is **not** a verbatim copy of Anthropic's
> official `frontend-design` skill (GitHub was unreachable from this
> environment when it was created). Replace it with the official file if/when
> you can fetch it.

Goal: produce interfaces that look **intentional, distinctive, and premium** —
never default-template, never "AI slop."

## 0. First, decide the character
Before writing CSS, name the design's personality in 3 words (e.g. *editorial,
restrained, architectural* — or *playful, dense, technical*). Every later choice
(type, colour, motion) must serve those words. A page without a point of view
reads as generic.

## 1. Avoid the generic-AI defaults (the #1 cause of "slop")
Do **not** reach for these unless the brief truly calls for them:
- Fonts: Inter/Roboto/Arial *as the headline face*, system-ui everywhere.
- Colour: purple→blue gradients on white or dark; uniform `#f3f4f6` cards.
- Layout: three identical centered feature cards with a circle icon on top.
- Effects: heavy drop shadows, glassmorphism on everything, emoji as icons.
Instead make at least one **deliberate, opinionated** choice: a serif or grotesk
display face, a non-obvious accent, an asymmetric grid, a hairline aesthetic.

## 2. Typography (carries most of the "premium" signal)
- Pair a **display** face (personality) with a **clean body** face (legibility).
  Good lanes: editorial serif (Cormorant, Fraunces, Playfair) + Inter/Manrope;
  or modern grotesk (Space Grotesk, Söhne, Neue Haas) for both.
- Establish a real **type scale** (e.g. 1.25–1.333 ratio). Few sizes, used
  consistently. Headings tight (`letter-spacing: -0.02em`, `line-height: ~1.05`);
  body relaxed (`line-height: 1.6–1.7`).
- Use **uppercase micro-labels** with wide tracking (`letter-spacing: .2em`) for
  kickers/eyebrows — instant editorial polish.
- Limit line length to ~60–75ch for body text.
- Self-host fonts for production (avoid FOUT / third-party requests).

## 3. Colour
- Build a small, disciplined palette: 1 ink/charcoal, 1–2 neutrals, 1 paper,
  **one** restrained accent. Resist a second accent.
- Prefer near-blacks (`#1a1a1a`) and warm/neutral off-whites over pure `#000`/`#fff`.
- Define as CSS custom properties (`--ink`, `--paper`, `--accent`, `--line`).
- Check contrast: body text ≥ 4.5:1, large text ≥ 3:1 (WCAG AA).

## 4. Layout & grid
- Use a real grid; align everything to it. Asymmetry and generous **whitespace**
  read as confident and expensive; cramped, evenly-stuffed sections read cheap.
- Hairline 1px rules and grid lines (blueprint feel) beat boxy bordered cards.
- One clear focal point per section. Establish hierarchy with size, weight and
  space — not with colour alone.
- Full-bleed hero imagery with a readable text overlay (gradient scrim) is a
  reliable high-end move.

## 5. Spacing system
- Use a consistent scale (e.g. 4/8px base; section rhythm via `clamp()` for fluid
  spacing: `clamp(84px, 10vw, 168px)`).
- Be generous between sections; tighter within a component. Consistency > cleverness.

## 6. Motion (subtle = premium)
- Micro-interactions only: 150–300ms ease on hover (color/transform), gentle
  scroll-reveal (fade + 12–20px translate), slow image zoom on hover.
- Easing: `cubic-bezier(.22,.61,.36,1)` feels refined; avoid bounce for serious brands.
- **Always** respect `@media (prefers-reduced-motion: reduce)`.

## 7. Components
- Buttons: pick a single strong style. Sharp rectangles + uppercase tracking read
  architectural; soft pills read friendly. Don't mix arbitrarily.
- Cards: prefer hairline borders / subtle bg shift over heavy shadows. If shadow,
  keep it soft and low (`0 24px 60px rgba(0,0,0,.10)`).
- Forms: minimal — underline inputs, clear focus ring, generous touch targets (≥44px).
- Icons: a consistent line-icon set or bespoke SVG. Never emoji as UI icons.

## 8. Imagery
- Real, high-quality photography or bespoke/illustrative SVG in the palette beats
  generic stock. Keep treatment consistent (same crop ratio, duotone or subtle
  desaturation) so a set feels art-directed.
- Provide `alt` text; lazy-load below-the-fold images; use `aspect-ratio` to avoid
  layout shift.

## 9. Responsive & accessibility (non-negotiable)
- Mobile-first; test 360px, 768px, 1280px. Don't just shrink — re-flow.
- Semantic HTML (`header/nav/main/section/footer`, real headings order).
- Keyboard navigable; visible focus states; `aria-label` on icon-only controls.
- RTL support if multilingual: logical properties or `[dir="rtl"]` overrides.

## 10. Performance
- Minimize render-blocking; preconnect/preload fonts; compress/resize images.
- Avoid layout shift (reserve image/space dimensions). Keep JS lean.

## Pre-ship checklist
- [ ] Stated a clear visual personality and every choice serves it
- [ ] No generic-AI defaults (purple gradient, Inter headlines, 3 circle-icon cards)
- [ ] Deliberate type pairing + consistent scale + tracked micro-labels
- [ ] Disciplined palette (one accent) as CSS variables, AA contrast
- [ ] Aligned grid, generous whitespace, clear per-section hierarchy
- [ ] Consistent spacing scale (fluid `clamp()` section rhythm)
- [ ] Subtle, consistent motion + `prefers-reduced-motion`
- [ ] Hairline/soft-shadow components, single button style, no emoji icons
- [ ] Art-directed imagery with alt text + `aspect-ratio`
- [ ] Responsive re-flow at 360/768/1280; semantic + keyboard-accessible
- [ ] Fonts self-hosted/preloaded; no layout shift; images optimized
