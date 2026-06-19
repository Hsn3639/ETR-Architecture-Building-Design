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
      /* compass */ '<svg viewBox="0 0 24 24"><g fill="none" stroke="#2b2b2b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6 7.5 20"/><path d="M12 6 16.5 20"/><path d="M9.5 14h5"/></g><circle cx="12" cy="5" r="2" fill="#d8a93f" stroke="#2b2b2b" stroke-width="1"/></svg>',
      /* pencil */ '<svg viewBox="0 0 24 24"><g transform="rotate(35 12 12)" stroke="#2b2b2b" stroke-width="1.1" stroke-linejoin="round"><rect x="10" y="3.5" width="4" height="12.5" rx="0.6" fill="#ecc24a"/><polygon points="10,16 14,16 12,20.5" fill="#efe9dc"/><polygon points="11,19 13,19 12,20.8" fill="#2b2b2b" stroke="none"/><rect x="10" y="3.5" width="4" height="2.4" fill="#e89aa6"/></g></svg>',
      /* set square */ '<svg viewBox="0 0 24 24"><polygon points="4,19 20,19 4,6" fill="#cfd3d8" fill-opacity="0.92" stroke="#2b2b2b" stroke-width="1.3" stroke-linejoin="round"/><polygon points="8,17 16.5,17 8,8.5" fill="none" stroke="#2b2b2b" stroke-width="0.8" stroke-opacity="0.5"/></svg>',
      /* protractor */ '<svg viewBox="0 0 24 24"><path d="M3 16 A9 9 0 0 1 21 16 Z" fill="#cfd3d8" fill-opacity="0.92" stroke="#2b2b2b" stroke-width="1.3" stroke-linejoin="round"/><path d="M7 16 A5 5 0 0 1 17 16" fill="none" stroke="#2b2b2b" stroke-width="0.8" stroke-opacity="0.5"/><path d="M12 16v-3.5M8.2 15.2 7.4 13.4M15.8 15.2 16.6 13.4" stroke="#2b2b2b" stroke-width="0.8"/></svg>',
      /* ruler */ '<svg viewBox="0 0 24 24"><g transform="rotate(-22 12 12)"><rect x="2" y="9.5" width="20" height="5" rx="0.5" fill="#d9b985" stroke="#2b2b2b" stroke-width="1.2"/><path d="M5 9.5v2M8 9.5v2.6M11 9.5v2M14 9.5v2.6M17 9.5v2M20 9.5v2.6" stroke="#2b2b2b" stroke-width="0.8"/></g></svg>',
      /* building */ '<svg viewBox="0 0 24 24"><path d="M2.5 20 8 21.6 22 18.8 16.5 17.2Z" fill="#5b8fd0" stroke="#2b2b2b" stroke-width="1" stroke-linejoin="round"/><rect x="6" y="7.5" width="4.5" height="10.5" fill="#cfd3d8" stroke="#2b2b2b" stroke-width="1.1"/><rect x="11.5" y="4.5" width="5" height="13.5" fill="#bfc4cb" stroke="#2b2b2b" stroke-width="1.1"/><path d="M7.2 10h2M7.2 12.4h2M7.2 14.8h2M12.6 7h2.6M12.6 9.4h2.6M12.6 11.8h2.6M12.6 14.2h2.6" stroke="#2b2b2b" stroke-width="0.7"/></svg>'
    ];
    /* core CAD/BIM set — home page #services section */
    var SOFT_CORE = [
      /* AutoCAD */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swAc" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e11d3a"/><stop offset="1" stop-color="#a50f24"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swAc)"/><text x="12" y="17.2" font-family="Arial,Helvetica,sans-serif" font-size="13.5" font-weight="800" fill="#fff" text-anchor="middle">A</text></svg>',
      /* Revit */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swRv" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2a83c6"/><stop offset="1" stop-color="#155a92"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swRv)"/><text x="12" y="17.2" font-family="Arial,Helvetica,sans-serif" font-size="13.5" font-weight="800" fill="#fff" text-anchor="middle">R</text></svg>',
      /* ArchiCAD */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swAr" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1d3c69"/><stop offset="1" stop-color="#0c1f3a"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swAr)"/><path d="M7 17.5V12a5 5 0 0 1 10 0v5.5" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/></svg>',
      /* SketchUp */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swSu" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f15a2b"/><stop offset="1" stop-color="#d83f1d"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swSu)"/><path d="M12 5.5 18.5 9 12 12.5 5.5 9Z" fill="#fff"/><path d="M5.5 9v6l6.5 3.5v-6Z" fill="#fff" fill-opacity="0.7"/><path d="M18.5 9v6L12 18.5v-6Z" fill="#fff" fill-opacity="0.88"/></svg>',
      /* Rhino */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swRh" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3c3c3c"/><stop offset="1" stop-color="#191919"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swRh)"/><text x="12" y="16.6" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">Rh</text></svg>'
    ];
    /* visualisation/parametric set — dedicated Services page */
    var SOFT_VIZ = [
      /* Lumion */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swLu" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2aa6e0"/><stop offset="1" stop-color="#1577b0"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swLu)"/><text x="12" y="17.2" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">L</text></svg>',
      /* Enscape */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swEn" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f4a93a"/><stop offset="1" stop-color="#e07a16"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swEn)"/><text x="12" y="17.2" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">E</text></svg>',
      /* 3ds Max */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="sw3d" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1cb3aa"/><stop offset="1" stop-color="#0c6f6a"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#sw3d)"/><text x="12" y="16.6" font-family="Arial,Helvetica,sans-serif" font-size="9.5" font-weight="800" fill="#fff" text-anchor="middle">3D</text></svg>',
      /* V-Ray */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swVr" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#141414"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swVr)"/><text x="12" y="17.2" font-family="Arial,Helvetica,sans-serif" font-size="13.5" font-weight="800" fill="#ef3a2d" text-anchor="middle">V</text></svg>',
      /* Grasshopper */ '<svg viewBox="0 0 24 24"><defs><linearGradient id="swGh" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5aa83f"/><stop offset="1" stop-color="#2f7a2a"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="5.5" fill="url(#swGh)"/><text x="12" y="16.6" font-family="Arial,Helvetica,sans-serif" font-size="9.5" font-weight="800" fill="#fff" text-anchor="middle">GH</text></svg>'
    ];

    function buildLayer(arr, cls) {
      var l = document.createElement("div"); l.className = "cursor-tools"; document.body.appendChild(l);
      var ns = [];
      for (var i = 0; i < arr.length; i++) {
        var s = document.createElement("span"); s.className = "ct-item" + (cls ? " " + cls : "");
        s.innerHTML = arr[i]; s.style.setProperty("--o", (0.94 - i * 0.10).toFixed(2));
        l.appendChild(s); ns.push({ el: s, x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
      return { el: l, nodes: ns };
    }

    var tools = buildLayer(TOOLS, "");
    var svc = document.getElementById("services");
    // Dedicated Services page → viz set everywhere; home #services section → core set.
    var wholeSvcPage = location.pathname.indexOf("services.html") !== -1;
    var soft = buildLayer(wholeSvcPage ? SOFT_VIZ : SOFT_CORE, "ct-soft");

    var mx = window.innerWidth / 2, my = window.innerHeight / 2, inSvc = false, idle;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (wholeSvcPage) {
        inSvc = true;
      } else if (svc) {
        var r = svc.getBoundingClientRect();
        inSvc = e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right;
      } else {
        inSvc = false;
      }
      tools.el.classList.toggle("on", !inSvc);   // drafting tools (home, outside Services)
      soft.el.classList.toggle("on", inSvc);     // software logos (Services section / page)
      clearTimeout(idle); idle = setTimeout(function () { tools.el.classList.remove("on"); soft.el.classList.remove("on"); }, 900);
    }, { passive: true });

    function step(layer, rotate) {
      var px = mx, py = my;
      for (var i = 0; i < layer.nodes.length; i++) {
        var n = layer.nodes[i];
        n.x += (px - n.x) * 0.20; n.y += (py - n.y) * 0.20;
        n.el.style.transform = "translate(" + (n.x - 16) + "px," + (n.y - 16) + "px)" + (rotate ? " rotate(" + (i * 14 - 16) + "deg)" : "");
        px = n.x; py = n.y;
      }
    }
    (function loop() { step(tools, true); step(soft, false); requestAnimationFrame(loop); })();
  }

  function init() { a11y(); reveal(); header(); menu(); transitions(); scrollFx(); cursorTools(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
