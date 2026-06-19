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

  /* ---- smooth inertia scroll (Lenis-style, dependency-free) ----
     Eases the real window scroll toward a target so the wheel/keys/anchors
     glide. Uses native scroll (not transform) so the sticky header, fixed
     chatbot and reveal observers keep working. Off for reduced-motion, touch
     and small screens (native scrolling is better there). */
  function smoothScroll() {
    if (REDUCE) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    if (window.innerWidth < 820) return;

    var target = window.scrollY || window.pageYOffset || 0;
    var current = target;
    var EASE = 0.085;          // per-60fps-frame smoothing factor (lower = more glide)

    function maxY() { return Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight); }
    function clamp(v) { return Math.max(0, Math.min(v, maxY())); }

    /* ---- scroll-progress bar (accent gradient) ---- */
    var bar = document.createElement("div"); bar.className = "scroll-progress"; document.body.appendChild(bar);

    /* ---- parallax: images drift within their fixed frames ---- */
    var pxEls = Array.prototype.slice.call(document.querySelectorAll(".work-frame picture, .svc-img picture"));
    pxEls.forEach(function (p) { p.classList.add("is-parallax"); });
    function applyParallax() {
      var vh = window.innerHeight;
      for (var i = 0; i < pxEls.length; i++) {
        var p = pxEls[i], frame = p.parentElement, r = frame.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) continue;
        var progress = ((r.top + r.height / 2) - vh / 2) / vh;   // -1 (above) .. 1 (below)
        var shift = -progress * r.height * 0.08;                 // up to ~8% drift
        p.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
      }
    }

    /* ---- single persistent rAF: eases scroll + drives parallax + progress ---- */
    var last = (typeof performance !== "undefined" ? performance.now() : Date.now());
    function frame(now) {
      var dt = Math.min(64, now - last); last = now;
      var t = 1 - Math.pow(1 - EASE, dt / 16.667);               // frame-rate-independent easing
      if (Math.abs(target - current) > 0.4) {
        current += (target - current) * t;
        window.scrollTo(0, current);
      } else {
        current = target;
      }
      applyParallax();
      var my = maxY();
      bar.style.width = (my > 0 ? (current / my) * 100 : 0) + "%";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function innerScrollable(node) {
      while (node && node !== document.body && node.nodeType === 1) {
        if (node.scrollHeight > node.clientHeight + 2) {
          var oy = getComputedStyle(node).overflowY;
          if (oy === "auto" || oy === "scroll") return true;
        }
        node = node.parentElement;
      }
      return false;
    }

    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;                                              // pinch-zoom
      if (document.documentElement.style.overflow === "hidden") return;  // menu open / scroll-locked
      if (innerScrollable(e.target)) return;                             // let panels (chat log) scroll
      e.preventDefault();
      target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 16 : 1));
    }, { passive: false });

    // keep target in sync when the user drags the scrollbar / find-in-page jumps
    window.addEventListener("scroll", function () {
      if (Math.abs(window.scrollY - current) > 2 && Math.abs(target - current) < 1) { target = current = window.scrollY; }
    }, { passive: true });
    window.addEventListener("resize", function () { target = clamp(target); }, { passive: true });

    // smooth in-page anchor links
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var hash = a.getAttribute("href");
      if (!hash || hash === "#" || hash.length < 2) return;
      var el; try { el = document.querySelector(hash); } catch (_) { return; }
      if (!el) return;
      e.preventDefault();
      target = clamp(el.getBoundingClientRect().top + window.scrollY - 90);
      if (history.replaceState) history.replaceState(null, "", hash);
    });

    // smooth keyboard scrolling
    window.addEventListener("keydown", function (e) {
      var t = e.target, tag = (t && t.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || (t && t.isContentEditable)) return;
      if (document.documentElement.style.overflow === "hidden") return;
      var page = window.innerHeight * 0.9, d = null;
      if (e.key === "PageDown" || (e.key === " " && !e.shiftKey)) d = page;
      else if (e.key === "PageUp" || (e.key === " " && e.shiftKey)) d = -page;
      else if (e.key === "ArrowDown") d = 90;
      else if (e.key === "ArrowUp") d = -90;
      else if (e.key === "Home") { target = 0; e.preventDefault(); return; }
      else if (e.key === "End") { target = maxY(); e.preventDefault(); return; }
      if (d !== null) { target = clamp(target + d); e.preventDefault(); }
    });
  }

  function init() { a11y(); reveal(); header(); menu(); transitions(); smoothScroll(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
