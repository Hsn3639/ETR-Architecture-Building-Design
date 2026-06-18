/* ETR front-end enhancements (dependency-free; Lenis/GSAP/Barba equivalents):
 *   - skip-link + #main landmark (a11y)
 *   - scroll reveal (fade/slide-up)
 *   - scroll-aware header
 *   - full-screen overlay menu (built from the nav links)
 *   - page-transition wipe on internal navigation
 * All respect prefers-reduced-motion.
 */
(function () {
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function dict() { return (window.I18N && (I18N[document.documentElement.lang || "en"] || I18N.en)) || {}; }

  /* ---- a11y skip link ---- */
  function a11y() {
    if (document.querySelector(".skip-link")) return;
    var target = document.querySelector("main") || document.querySelector("section");
    if (target && !target.id) target.id = "main";
    if (!target) return;
    var link = document.createElement("a");
    link.className = "skip-link"; link.href = "#" + (target.id || "main"); link.textContent = "Skip to content";
    document.body.insertBefore(link, document.body.firstChild);
  }

  /* ---- scroll reveal ---- */
  function reveal() {
    var sel = ".section-title, .section-sub, .card, .step, .q-section, .callout, .about-grid > *, .careers-meta, .q-cat, .hero h1, .hero p, .hero .tag, .hero-cta, .work-item, .impact-item, .net-node";
    var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!nodes.length) return;
    if (REDUCE || !("IntersectionObserver" in window)) { nodes.forEach(function (n) { n.classList.add("in"); }); return; }
    nodes.forEach(function (n, i) { n.setAttribute("data-reveal", ""); n.style.transitionDelay = (Math.min(i % 6, 5) * 60) + "ms"; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---- scroll-aware header ---- */
  function header() {
    var h = document.querySelector(".site-header"); if (!h) return;
    var onScroll = function () { h.classList.toggle("scrolled", window.scrollY > 12); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- full-screen overlay menu ---- */
  function menu() {
    var nav = document.querySelector(".nav"); if (!nav || nav.querySelector(".menu-btn")) return;
    var d = dict();
    var btn = document.createElement("button");
    btn.className = "menu-btn"; btn.type = "button"; btn.textContent = d.nav_menu || "Menu"; btn.setAttribute("aria-expanded", "false");
    nav.appendChild(btn);

    var ov = document.createElement("div"); ov.className = "menu-overlay";
    var inner = document.createElement("div"); inner.className = "menu-inner";
    var close = document.createElement("button"); close.className = "menu-close"; close.type = "button"; close.textContent = d.nav_close || "Close";
    var list = document.createElement("nav"); list.className = "menu-links";
    var srcLinks = nav.querySelectorAll("a[href]");
    srcLinks.forEach(function (a, i) {
      var l = document.createElement("a");
      l.href = a.getAttribute("href"); l.textContent = a.textContent.trim();
      l.style.transitionDelay = (0.06 * i + 0.1) + "s";
      list.appendChild(l);
    });
    inner.appendChild(close); inner.appendChild(list); ov.appendChild(inner); document.body.appendChild(ov);

    function open() { ov.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); document.documentElement.style.overflow = "hidden"; }
    function shut() { ov.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); document.documentElement.style.overflow = ""; }
    btn.addEventListener("click", open);
    close.addEventListener("click", shut);
    ov.addEventListener("click", function (e) { if (e.target === ov) shut(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });
    list.addEventListener("click", function (e) { if (e.target.tagName === "A") shut(); });

    // keep overlay labels in sync when language changes
    var sel = document.getElementById("lang-select");
    if (sel) sel.addEventListener("change", function () {
      setTimeout(function () {
        var dd = dict();
        btn.textContent = dd.nav_menu || "Menu"; close.textContent = dd.nav_close || "Close";
        var clones = list.querySelectorAll("a");
        srcLinks.forEach(function (a, i) { if (clones[i]) clones[i].textContent = a.textContent.trim(); });
      }, 0);
    });
  }

  /* ---- page-transition wipe ---- */
  function transitions() {
    if (REDUCE) return;
    var panel = document.createElement("div"); panel.className = "page-wipe"; document.body.appendChild(panel);
    requestAnimationFrame(function () { document.body.classList.add("loaded"); });
    window.addEventListener("pageshow", function () { document.body.classList.add("loaded"); panel.classList.remove("cover"); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a"); if (!a) return;
      var href = a.getAttribute("href"); if (!href) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      var url; try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;   // same page (anchors etc.)
      e.preventDefault();
      panel.classList.add("cover");
      setTimeout(function () { location.href = a.href; }, 620);
    });
  }

  function init() { a11y(); reveal(); header(); menu(); transitions(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
