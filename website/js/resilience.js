/* ETR Climate Resilience Toolkit — client-side, science-based heuristic.
 * Returns a qualitative resilience read + passive-first fixes tailored to
 * climate + concern. Educational; never a binding assessment.
 */
(function () {
  function lang() { return document.documentElement.lang || "en"; }
  function dict() { return (typeof I18N !== "undefined" && (I18N[lang()] || I18N.en)) || {}; }

  // Fix sets per climate, ordered by impact. Concern bumps a relevant fix to the top.
  var COASTAL = ["rt_f_shade", "rt_f_roof", "rt_f_salt", "rt_f_vent", "rt_f_seal", "rt_f_mass"];
  var INLAND  = ["rt_f_mass", "rt_f_shade", "rt_f_court", "rt_f_evap", "rt_f_roof", "rt_f_vent"];
  var CONCERN_BOOST = {
    heat:  { coastal: "rt_f_shade", inland: "rt_f_mass" },
    power: { coastal: "rt_f_seal",  inland: "rt_f_court" },
    cost:  { coastal: "rt_f_roof",  inland: "rt_f_evap" }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("rt-form");
    var result = document.getElementById("rt-result");
    if (!form || !result) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = dict();
      var climate = form.elements["climate"].value;     // coastal | inland
      var concern = form.elements["concern"].value;      // heat | power | cost
      var base = (climate === "coastal" ? COASTAL : INLAND).slice();

      // Move the concern-relevant fix to the front.
      var boost = CONCERN_BOOST[concern] && CONCERN_BOOST[concern][climate];
      if (boost) { base = [boost].concat(base.filter(function (k) { return k !== boost; })); }
      var picks = base.slice(0, 3);

      // Score label: inland dry climates have the highest passive headroom.
      var scoreKey = climate === "inland" ? "rt_score_high" : (concern === "power" ? "rt_score_good" : "rt_score_mod");

      document.getElementById("rt-score").textContent = d[scoreKey] || "";
      var ul = document.getElementById("rt-fixes");
      ul.innerHTML = "";
      picks.forEach(function (k) {
        var li = document.createElement("li");
        li.setAttribute("data-i18n", k);
        li.textContent = d[k] || "";
        ul.appendChild(li);
      });

      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Re-translate a visible result when the language changes.
    var sel = document.getElementById("lang-select");
    if (sel) sel.addEventListener("change", function () {
      setTimeout(function () {
        if (result.hidden) return;
        var d = dict();
        document.querySelectorAll("#rt-fixes li[data-i18n]").forEach(function (li) {
          var k = li.getAttribute("data-i18n"); if (d[k]) li.textContent = d[k];
        });
        // score label has no stored key; leave i18n.js to handle static labels
      }, 0);
    });
  });
})();
