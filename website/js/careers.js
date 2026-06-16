/* ETR careers assessment — collects all answers and delivers them via Formspree
 * (if configured in config.js) or a pre-filled mailto. English by design.
 */
(function () {
  var CFG = (typeof window !== "undefined" && window.ETR_CONFIG) || {};
  var FORMSPREE_ENDPOINT = CFG.FORMSPREE_ENDPOINT || "";
  var CONTACT_EMAIL = CFG.CONTACT_EMAIL || "hsn.importazioni@outlook.com";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("careers-form");
    var statusEl = document.getElementById("careers-status");
    if (!form || !statusEl) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.elements["name"].value.trim() || !form.elements["contact"].value.trim()) {
        statusEl.textContent = "Please provide your name and contact.";
        return;
      }

      // Gather every named field (radios, checkboxes, text, textarea).
      var data = {};
      var fd = new FormData(form);
      fd.forEach(function (value, key) {
        if (data[key] === undefined) data[key] = value;
        else data[key] = data[key] + ", " + value; // multi-select checkboxes
      });

      var subject = "Graduate application — ETR (" + (data.name || "") + ")";
      var body = Object.keys(data).map(function (k) {
        return k + ": " + data[k];
      }).join("\n");

      if (FORMSPREE_ENDPOINT) {
        statusEl.textContent = "Submitting…";
        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(Object.assign({ subject: subject }, data))
        }).then(function (r) {
          if (r.ok) {
            statusEl.textContent = "Thank you — your application has been received. We review every submission.";
            form.reset();
            form.style.display = "none";
          } else {
            statusEl.textContent = "Couldn't submit automatically. Please email us at " + CONTACT_EMAIL + ".";
          }
        }).catch(function () {
          statusEl.textContent = "Couldn't submit automatically. Please email us at " + CONTACT_EMAIL + ".";
        });
      } else {
        // mailto fallback (note: very long bodies may be truncated by some clients)
        window.location.href = "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        statusEl.textContent = "Opening your email client… If nothing happens, email us at " + CONTACT_EMAIL + ".";
      }
    });
  });
})();
