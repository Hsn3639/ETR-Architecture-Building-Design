/* ETR instant-estimate engine (Tier-1 of the "Estimate Ladder").
 * Client-side only. Produces a clearly-labelled PRELIMINARY range, never a binding quote.
 * Rates are illustrative base build costs (USD per m²) and should be tuned to live market data.
 */
(function () {
  // Illustrative base construction cost, USD/m², by project type and finish level.
  const RATES = {
    res:    { standard: 400, premium: 650, luxury: 950 },
    villa:  { standard: 600, premium: 900, luxury: 1400 },
    comm:   { standard: 500, premium: 750, luxury: 1100 },
    ind:    { standard: 300, premium: 450, luxury: 650 },
    herit:  { standard: 550, premium: 850, luxury: 1300 },
    mixed:  { standard: 500, premium: 750, luxury: 1100 }
  };
  const COASTAL_FACTOR = 1.08;     // salt/humidity-resistant materials premium
  const RANGE = 0.15;              // +/- band on the point estimate
  const FX = { USD: 1, EUR: 0.92, LYD: 4.85 }; // illustrative conversion from USD
  const LOCALE = { en: "en-US", ar: "ar", fr: "fr-FR", es: "es-ES", ru: "ru-RU", zh: "zh-CN", it: "it-IT" };

  let last = null; // {lowUSD, highUSD, currency, coastal}

  function lang() { return document.documentElement.lang || "en"; }
  function dict() { return (typeof I18N !== "undefined" && I18N[lang()]) || (typeof I18N !== "undefined" && I18N.en) || {}; }

  function money(usd, cur, lng) {
    const v = usd * (FX[cur] || 1);
    try {
      return new Intl.NumberFormat(LOCALE[lng] || "en-US",
        { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v);
    } catch (e) {
      return Math.round(v).toLocaleString() + " " + cur;
    }
  }

  function render() {
    if (!last) return;
    const lng = lang();
    const rangeEl = document.getElementById("q-range");
    if (rangeEl) {
      rangeEl.textContent = money(last.lowUSD, last.currency, lng) + "  –  " + money(last.highUSD, last.currency, lng);
    }
    const adviceEl = document.getElementById("q-advice");
    if (adviceEl) {
      const key = last.coastal ? "q_advice_coastal" : "q_advice_inland";
      adviceEl.setAttribute("data-i18n", key); // so future language switches keep it in sync
      const d = dict();
      if (d[key]) adviceEl.textContent = d[key];
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("quote-form");
    const result = document.getElementById("q-result");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const type = form.elements["type"].value;
      const finish = form.elements["finish"].value;
      const area = parseFloat(form.elements["area"].value);
      const location = form.elements["location"].value;
      const currency = form.elements["currency"].value;

      if (!type || !RATES[type] || !area || area <= 0) {
        alert((dict().q_required_msg) || "Please choose a project type and enter the built area.");
        return;
      }

      let base = RATES[type][finish] || RATES[type].standard;
      const coastal = location === "coastal";
      if (coastal) base *= COASTAL_FACTOR;
      const point = base * area;

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

    const resetBtn = document.getElementById("q-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset();
        last = null;
        if (result) result.hidden = true;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    // Re-format the live estimate when the visitor switches language.
    const sel = document.getElementById("lang-select");
    if (sel) sel.addEventListener("change", function () { setTimeout(render, 0); });
  });
})();
