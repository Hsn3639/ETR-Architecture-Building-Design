# Image credits & licensing

All photographs on the ETR Architectural Consultants website are **license-clean**
— supplied by the client (ETR) or sourced from royalty-free libraries
(Unsplash / Pexels), which permit commercial use. No third-party copyrighted
(e.g. Pinterest / Google Images) photography is used.

Each slot keeps its original hand-drawn **SVG as an automatic fallback**
(`onerror` on the `<img>`, and a stacked background layer for the hero), so the
page still renders cleanly if a JPG ever fails to load.

| Slot | File | Subject | Source / licence |
|------|------|---------|------------------|
| Hero background | `hero-board.jpg` | Architectural hero shot | Client-supplied / royalty-free (Unsplash/Pexels) |
| Selected Work · 1 | `project-1.jpg` | Courtyard House, Benghazi — Mediterranean white facade | Client-supplied / royalty-free |
| Selected Work · 2 | `project-2.jpg` | Coastal villa | Client-supplied / royalty-free |
| Selected Work · 3 | `project-3.jpg` | City Exchange — modern office facade | Client-supplied / royalty-free |
| Selected Work · 4 | `project-4.jpg` | Restored heritage building, arched colonnade | Client-supplied / royalty-free |
| Service · Residential | `svc-residential.jpg` | Modern home exterior | Client-supplied / royalty-free |
| Service · Villas | `svc-villa.jpg` | Luxury villa terrace | Client-supplied / royalty-free |
| Service · Commercial | `svc-commercial.jpg` | Office building | Client-supplied / royalty-free |
| Service · Industrial | `svc-industrial.jpg` | Warehouse architecture | Client-supplied / royalty-free |
| Service · Heritage | `svc-heritage.jpg` | Old town arcade | Client-supplied / royalty-free |
| Service · Urban Planning | `svc-urban.jpg` | City aerial / masterplan | Client-supplied / royalty-free |

> **Attribution:** If any image was downloaded from Unsplash/Pexels, the
> licence does not require attribution but it is appreciated. Add the
> photographer name + photo URL in the "Source / licence" column when known.

## Optimisation (done)

All photos have been **resized to ≤ 2000 px on the long edge** and re-encoded
as both **optimised JPEG (q ≈ 0.82)** and **WebP (q ≈ 0.80)**. Total JPEG
payload dropped from ~52 MB to ~5 MB; WebP totals ~3.7 MB. The 14 MB heritage
original is now 821 KB (JPEG) / 773 KB (WebP).

- Each `<img>` is wrapped in a `<picture>` with a `<source type="image/webp">`,
  so WebP-capable browsers load the smaller file and others fall back to the
  optimised JPEG (and to the SVG via `onerror` if both are missing).
- The hero uses CSS `image-set()` to prefer WebP, with the JPEG as the
  fallback declaration for older browsers.
- Below-the-fold images keep `loading="lazy"` and `decoding="async"`.

> Re-encoding was performed with a headless-Chromium `<canvas>` pipeline
> (`tmp/optimize-images.js` in the build session) because Pillow / ImageMagick /
> cwebp and the npm registry were all unavailable/network-blocked.
