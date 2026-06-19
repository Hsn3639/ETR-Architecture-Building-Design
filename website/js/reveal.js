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
    var sel = ".section-title, .section-sub, .card, .step, .q-section, .callout, .about-grid > *, .careers-meta, .q-cat, .hero h1, .hero p, .hero .tag, .hero-cta, .work-item, .impact-item, .net-node, .statement .tag, .statement-h, .statement-lead";
    var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!nodes.length) return;
    if (REDUCE || !("IntersectionObserver" in window)) { nodes.forEach(function (n) { n.classList.add("in"); }); return; }
    nodes.forEach(function (n, i) { n.setAttribute("data-reveal", ""); n.style.transitionDelay = (Math.min(i % 6, 5) * 90) + "ms"; });
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

  /* ---- scroll effects (native scroll for instant response) ----
     We do NOT hijack the wheel — native scrolling is immediate and smooth.
     A rAF-throttled scroll listener drives the parallax + progress bar, and
     CSS `scroll-behavior: smooth` (with scroll-margin offsets) handles anchors.
     Parallax is desktop-only; everything is off for reduced-motion. */
  function scrollFx() {
    if (REDUCE) return;
    var desktop = !(window.matchMedia && window.matchMedia("(pointer: coarse)").matches) && window.innerWidth >= 820;

    /* scroll-progress bar (accent gradient) */
    var bar = document.createElement("div"); bar.className = "scroll-progress"; document.body.appendChild(bar);

    /* parallax: images drift within their fixed frames (desktop only) */
    var pxEls = desktop ? Array.prototype.slice.call(document.querySelectorAll(".work-frame picture, .svc-img picture")) : [];

    function maxY() { return Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight); }
    function applyParallax() {
      var vh = window.innerHeight;
      for (var i = 0; i < pxEls.length; i++) {
        var p = pxEls[i], r = p.parentElement.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) continue;
        var progress = ((r.top + r.height / 2) - vh / 2) / vh;   // -1 (above) .. 1 (below)
        p.style.transform = "translate3d(0," + (-progress * r.height * 0.08).toFixed(1) + "px,0)";
      }
    }

    var ticking = false;
    function update() {
      ticking = false;
      var my = maxY();
      bar.style.width = (my > 0 ? (window.scrollY / my) * 100 : 0) + "%";
      if (pxEls.length) applyParallax();
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---- architecture-tool cursor trail (desktop, motion-safe) ----
     A chain of small drafting-tool icons eases after the pointer. */
  function cursorTools() {
    if (REDUCE) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    if (window.innerWidth < 820) return;
    var TOOLS = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.2" r="1.5"/><path d="M12 5.7 7 20"/><path d="M12 5.7 17 20"/><path d="M9.2 13h5.6"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 15 9"/><path d="M13 7 17 11"/><path d="M5 19l-1 1 2-1z"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19 20 19 4 6Z"/><path d="M7 16v-3M10 16v-2"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16h18"/><path d="M4.5 16a7.5 7.5 0 0 1 15 0"/><path d="M12 16v-5"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="9" width="19" height="6" rx="1"/><path d="M6 9v2.5M9 9v3.5M12 9v2.5M15 9v3.5M18 9v2.5"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="6" height="12"/><rect x="12" y="5" width="7" height="16"/><path d="M6 12h2M6 15h2M15 8h2M15 11h2M15 14h2"/></svg>'
    ];
    var layer = document.createElement("div"); layer.className = "cursor-tools"; document.body.appendChild(layer);
    var nodes = [];
    for (var i = 0; i < TOOLS.length; i++) {
      var s = document.createElement("span"); s.className = "ct-item"; s.innerHTML = TOOLS[i];
      s.style.setProperty("--o", (0.6 - i * 0.07).toFixed(2));
      layer.appendChild(s);
      nodes.push({ el: s, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, idle;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY; layer.classList.add("on");
      clearTimeout(idle); idle = setTimeout(function () { layer.classList.remove("on"); }, 900);
    }, { passive: true });
    (function loop() {
      var px = mx, py = my;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += (px - n.x) * 0.30; n.y += (py - n.y) * 0.30;
        n.el.style.transform = "translate(" + (n.x - 14) + "px," + (n.y - 14) + "px) rotate(" + (i * 16 - 20) + "deg)";
        px = n.x; py = n.y;
      }
      requestAnimationFrame(loop);
    })();
  }

  function init() { a11y(); reveal(); header(); menu(); transitions(); scrollFx(); cursorTools(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
