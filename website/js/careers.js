/* ETR careers assessment — collects all answers and delivers them via Formspree
 * (if configured in config.js) or a pre-filled mailto. Questions are English by
 * design; chrome/status strings are localised via I18N (careers-i18n.js).
 */
(function () {
  var CFG = (typeof window !== "undefined" && window.ETR_CONFIG) || {};
  var FORMSPREE_ENDPOINT = CFG.FORMSPREE_ENDPOINT || "";
  var CONTACT_EMAIL = CFG.CONTACT_EMAIL || "hsn.importazioni@outlook.com";

  function lang() { return document.documentElement.lang || "en"; }
  function dict() { return (typeof I18N !== "undefined" && (I18N[lang()] || I18N.en)) || {}; }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("careers-form");
    var statusEl = document.getElementById("careers-status");
    if (!form || !statusEl) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = dict();
      if (!form.elements["name"].value.trim() || !form.elements["contact"].value.trim()) {
        statusEl.textContent = d.cr_need || "Please provide your name and contact.";
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        if (data[key] === undefined) data[key] = value;
        else data[key] = data[key] + ", " + value; // multi-select checkboxes
      });

      var subject = (d.cr_subject || "Graduate application — ETR") + " (" + (data.name || "") + ")";
      var body = Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\n");

      if (FORMSPREE_ENDPOINT) {
        statusEl.textContent = d.cr_submitting || "Submitting…";
        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(Object.assign({ subject: subject }, data))
        }).then(function (r) {
          if (r.ok) {
            statusEl.textContent = d.cr_sent || "Thank you — your application has been received.";
            form.reset();
            form.style.display = "none";
          } else {
            statusEl.textContent = (d.cr_err || "Couldn't submit automatically. Please email us at") + " " + CONTACT_EMAIL + ".";
          }
        }).catch(function () {
          statusEl.textContent = (d.cr_err || "Couldn't submit automatically. Please email us at") + " " + CONTACT_EMAIL + ".";
        });
      } else {
        window.location.href = "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        statusEl.textContent = (d.cr_mailto || "Opening your email client… If nothing happens, email us at") + " " + CONTACT_EMAIL + ".";
      }
    });
  });
})();
