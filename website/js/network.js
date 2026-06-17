/* ETR "Join our Network" form — Formspree (if configured) or mailto fallback. */
(function () {
  var CFG = (typeof window !== "undefined" && window.ETR_CONFIG) || {};
  var FORMSPREE_ENDPOINT = CFG.FORMSPREE_ENDPOINT || "";
  var CONTACT_EMAIL = CFG.CONTACT_EMAIL || "hsn.importazioni@outlook.com";
  function lang() { return document.documentElement.lang || "en"; }
  function dict() { return (typeof I18N !== "undefined" && (I18N[lang()] || I18N.en)) || {}; }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("network-form");
    var statusEl = document.getElementById("network-status");
    if (!form || !statusEl) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = dict();
      if (!form.elements["name"].value.trim() || !form.elements["contact"].value.trim()) {
        statusEl.textContent = (d.jn_err || "Please email us at") + " " + CONTACT_EMAIL + ".";
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      var subject = d.jn_subject || "Network application — ETR";
      var body = Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\n");

      if (FORMSPREE_ENDPOINT) {
        statusEl.textContent = d.jn_sending || "Sending…";
        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(Object.assign({ subject: subject }, data))
        }).then(function (r) {
          if (r.ok) { statusEl.textContent = d.jn_sent || "Thank you!"; form.reset(); }
          else { statusEl.textContent = (d.jn_err || "Email us at") + " " + CONTACT_EMAIL + "."; }
        }).catch(function () { statusEl.textContent = (d.jn_err || "Email us at") + " " + CONTACT_EMAIL + "."; });
      } else {
        window.location.href = "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        statusEl.textContent = d.jn_sent || "";
      }
    });
  });
})();
