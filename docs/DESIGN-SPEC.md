# ETR — Front-end Design Spec (quiet-luxury portfolio)

Hand-coded HTML + CSS (Grid/Flexbox) + vanilla JS — no framework, no build step.
This captures the "quiet-luxury" portfolio system applied to the ETR site.

## Stack
- Static HTML per page; shared `css/style.css`; shared behaviour in `js/reveal.js`.
- i18n via `js/i18n.js` (+ per-page `*-i18n.js`), 7 languages with RTL.
- Hosting: GitHub Pages (`.github/workflows/deploy.yml`).
- **Lenis / GSAP / Barba not used** — the npm registry is blocked in the build
  environment, so their behaviours are reproduced in dependency-free vanilla JS.
  Swap in the real libraries later if desired (smooth scroll, scroll-triggers,
  page transitions).

## Design tokens (`:root` in style.css)
- Background cream `--board #efe7d6` / paper `--paper #fff` / bone `--bone`.
- Ink `--charcoal #1a1a1a`; muted `--muted`; accents `--sand #c9b27e`,
  `--amber #c98a3c`, `--terra #b4602a`.
- Type: display/headings `Space Grotesk` (`--display`/`--serif`), body
  `Inter`/`Manrope` (`--sans`). Fluid sizing via `clamp()`.
- Spacing rhythm `--sp: clamp(84px,10vw,168px)`; gutter `--gut`.

## Behaviours (js/reveal.js)
- **Scroll reveal** — fade/slide-up via IntersectionObserver (reduced-motion safe).
- **Scroll-aware header** — `.scrolled` class adds solid bg + hairline on scroll.
- **Full-screen overlay menu** — built from the nav links; `Menu`/`Close`
  triggers, staggered large serif links, Esc + scrim close, scroll-lock.
  On desktop the inline nav shows; ≤860px collapses to the overlay.
- **Page-transition wipe** — a cream panel covers on internal navigation and
  lifts on load (History via full nav; reduced-motion skips it).
- **Skip-link + `#main`** landmark for accessibility.

## Editorial project gallery (homepage `#work`)
- 12-column CSS Grid; alternating `.work-item--l` (cols 1–7) / `.work-item--r`
  (cols 6–12, offset down) for a masonry rhythm; single column ≤820px.
- Each item: image in an `overflow:hidden` frame (slow `scale(1.04)` hover) +
  metadata caption `Name · Location · Category · Year`.
- Data is currently inline; for a CMS, map each item to a collection record
  (name, location, category, year, cover image) and loop.

## To reach a pixel-faithful "quiet-luxury" clone
- Replace SVG placeholders with real **WebP** photography (`srcset`).
- Optionally adopt **Lenis** (smooth scroll) + **GSAP ScrollTrigger** (reveals)
  + **Barba.js** (transitions) once the registry is reachable.
- Confirm exact brand fonts (e.g. a high-contrast display serif) and final hexes.
