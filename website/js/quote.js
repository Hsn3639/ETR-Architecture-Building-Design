/* ETR instant-estimate engine (Tier-1 of the "Estimate Ladder").
 * Client-side only. Produces a clearly-labelled PRELIMINARY range, never a binding quote.
 *
 * ----------------------------------------------------------------------------
 * RATE BASIS (read before trusting the numbers):
 * Libya does not publish official construction-cost statistics, so the rates
 * below are derived from MENA regional benchmarks (2024–2025) and set slightly
 * below Gulf levels to reflect typical Libyan market conditions. They are
 * ESTIMATES TO BE CONFIRMED with live local supplier/contractor quotes.
 * Reference points used (USD/m²):
 *   - Steel-structure shell ............ ~250–800   (industrial baseline)
 *   - KSA warehouse/logistics .......... ~689–1,184 (Gulf upper benchmark)
 *   - Gulf villa fit-out/build ......... high hundreds → ~1,400+ for luxury
 * Adjust RATES to your real cost data before going live.
 * ----------------------------------------------------------------------------
 *
 * LEAD DELIVERY (a): set FORMSPREE_ENDPOINT to a Formspree form URL to receive
 * submissions by email with no backend. If left empty, the form falls back to
 * opening the visitor's email client (mailto) pre-filled with their enquiry.
 */
(function () {
  // --- Lead delivery configuration (overridable via window.ETR_CONFIG in config.js) ---
  var CFG = (typeof window !== "undefined" && window.ETR_CONFIG) || {};
  var FORMSPREE_ENDPOINT = CFG.FORMSPREE_ENDPOINT || ""; // e.g. "https://formspree.io/f/xxxxxxxx"
  var CONTACT_EMAIL = CFG.CONTACT_EMAIL || "hsn.importazioni@outlook.com";

  // --- Illustrative base construction cost, USD/m², by project type & finish ---
  var RATES = {
    res:   { standard: 380, premium: 600, luxury: 900 },
    villa: { standard: 580, premium: 880, luxury: 1350 },
    comm:  { standard: 480, premium: 720, luxury: 1050 },
    ind:   { standard: 280, premium: 430, luxury: 620 },
    herit: { standard: 520, premium: 820, luxury: 1250 },
    mixed: { standard: 480, premium: 720, luxury: 1050 }
  };
  var COASTAL_FACTOR = 1.08;     // salt/humidity-resistant materials premium
  var RANGE = 0.15;              // +/- band on the point estimate
  var FX = { USD: 1, EUR: 0.92, LYD: 4.85 }; // illustrative conversion from USD
  var LOCALE = { en: "en-US", ar: "ar", fr: "fr-FR", es: "es-ES", ru: "ru-RU", zh: "zh-CN", it: "it-IT" };

  var last = null; // {lowUSD, highUSD, currency, coastal, summary}

  function lang() { return document.documentElement.lang || "en"; }
  function dict() { return (typeof I18N !== "undefined" && (I18N[lang()] || I18N.en)) || {}; }

  function money(usd, cur, lng) {
    var v = usd * (FX[cur] || 1);
    try {
      return new Intl.NumberFormat(LOCALE[lng] || "en-US",
        { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v);
    } catch (e) {
      return Math.round(v).toLocaleString() + " " + cur;
    }
  }

  function rangeText() {
    var lng = lang();
    return money(last.lowUSD, last.currency, lng) + "  –  " + money(last.highUSD, last.currency, lng);
  }

  function render() {
    if (!last) return;
    var rangeEl = document.getElementById("q-range");
    if (rangeEl) rangeEl.textContent = rangeText();
    var adviceEl = document.getElementById("q-advice");
    if (adviceEl) {
      var key = last.coastal ? "q_advice_coastal" : "q_advice_inland";
      adviceEl.setAttribute("data-i18n", key);
      var d = dict();
      if (d[key]) adviceEl.textContent = d[key];
    }
  }

  function buildLeadBody(form) {
    var d = dict();
    var get = function (n) { return form.elements[n] ? form.elements[n].value : ""; };
    var pains = [].slice.call(form.querySelectorAll('input[name="pain"]:checked')).map(function (c) { return c.value; });
    return [
      (d.q_l_name || "Name") + ": " + get("name"),
      (d.q_l_contact || "Contact") + ": " + get("contact"),
      (d.q_l_type || "Type") + ": " + get("type"),
      (d.q_l_location || "Location") + ": " + get("location"),
      (d.q_l_stage || "Stage") + ": " + get("stage"),
      (d.q_l_area || "Area") + ": " + get("area") + " m²",
      (d.q_l_finish || "Finish") + ": " + get("finish"),
      "Priorities: " + (pains.join(", ") || "—"),
      (d.q_result_range_label || "Estimate") + ": " + rangeText()
    ].join("\n");
  }

  function sendLead(form, statusEl) {
    var d = dict();
    var subject = d.q_lead_subject || "New project enquiry via ETR website";
    var body = buildLeadBody(form);

    if (FORMSPREE_ENDPOINT) {
      statusEl.textContent = d.q_sending || "Sending…";
      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject, message: body })
      }).then(function (r) {
        statusEl.textContent = r.ok ? (d.q_sent || "Thank you!") : (d.q_send_err || "");
      }).catch(function () {
        statusEl.textContent = d.q_send_err || "";
      });
    } else {
      // No backend configured: open the visitor's mail client, pre-filled.
      var href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      window.location.href = href;
      statusEl.textContent = d.q_sent || "";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("quote-form");
    var result = document.getElementById("q-result");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var type = form.elements["type"].value;
      var finish = form.elements["finish"].value;
      var area = parseFloat(form.elements["area"].value);
      var location = form.elements["location"].value;
      var currency = form.elements["currency"].value;

      if (!type || !RATES[type] || !area || area <= 0) {
        alert(dict().q_required_msg || "Please choose a project type and enter the built area.");
        return;
      }

      var base = RATES[type][finish] || RATES[type].standard;
      var coastal = location === "coastal";
      if (coastal) base *= COASTAL_FACTOR;
      var point = base * area;

      last = {
        lowUSD: point * (1 - RANGE),
        highUSD: point * (1 + RANGE),
        currency: currency,
        coastal: coastal
      };

      render();
      if (result) {
        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    var sendBtn = document.getElementById("q-send");
    var statusEl = document.getElementById("q-send-status");
    if (sendBtn && statusEl) {
      sendBtn.addEventListener("click", function () { sendLead(form, statusEl); });
    }

    var resetBtn = document.getElementById("q-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset();
        last = null;
        if (result) result.hidden = true;
        if (statusEl) statusEl.textContent = "";
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    // Re-format the live estimate when the visitor switches language.
    var sel = document.getElementById("lang-select");
    if (sel) sel.addEventListener("change", function () { setTimeout(render, 0); });
  });
})();
