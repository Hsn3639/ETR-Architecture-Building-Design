/* ETR — subtle scroll reveal. Auto-targets common blocks; no markup edits needed.
 * Respects prefers-reduced-motion (the CSS handles the fallback).
 */
(function () {
  // Inject a keyboard skip-link + a #main landmark (no per-page markup needed).
  function a11y() {
    if (document.querySelector(".skip-link")) return;
    var target = document.querySelector("main") || document.querySelector("section");
    if (target && !target.id) target.id = "main";
    if (!target) return;
    var link = document.createElement("a");
    link.className = "skip-link";
    link.href = "#" + (target.id || "main");
    link.textContent = "Skip to content";
    document.body.insertBefore(link, document.body.firstChild);
  }

  function init() {
    a11y();
    var sel = ".section-title, .section-sub, .card, .step, .q-section, .callout, .about-grid > *, .careers-meta, .q-cat, .hero h1, .hero p, .hero .tag, .hero-cta";
    var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    nodes.forEach(function (n, i) {
      n.setAttribute("data-reveal", "");
      n.style.transitionDelay = (Math.min(i % 6, 5) * 60) + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
