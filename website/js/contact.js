/* ETR contact form handler. Posts to Formspree if configured (window.ETR_CONFIG),
 * otherwise falls back to a pre-filled mailto. Mirrors quote.js lead delivery.
 */
(function () {
  var CFG = (typeof window !== "undefined" && window.ETR_CONFIG) || {};
  var FORMSPREE_ENDPOINT = CFG.FORMSPREE_ENDPOINT || "";
  var CONTACT_EMAIL = CFG.CONTACT_EMAIL || "hsn.importazioni@outlook.com";

  function lang() { return document.documentElement.lang || "en"; }
  function dict() { return (typeof I18N !== "undefined" && (I18N[lang()] || I18N.en)) || {}; }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    var statusEl = document.getElementById("contact-status");
    if (!form || !statusEl) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = dict();
      var name = form.elements["name"].value.trim();
      var contact = form.elements["contact"].value.trim();
      var message = form.elements["message"].value.trim();
      var subject = d.ca_subject || "Website enquiry — ETR";
      var body = [
        (d.ca_f_name || "Name") + ": " + name,
        (d.ca_f_email || "Contact") + ": " + contact,
        "",
        message
      ].join("\n");

      if (FORMSPREE_ENDPOINT) {
        statusEl.textContent = d.ca_f_sending || "Sending…";
        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name: name, contact: contact, message: message, subject: subject })
        }).then(function (r) {
          statusEl.textContent = r.ok ? (d.ca_f_sent || "Thank you!") : (d.ca_f_err || "");
          if (r.ok) form.reset();
        }).catch(function () {
          statusEl.textContent = d.ca_f_err || "";
        });
      } else {
        window.location.href = "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        statusEl.textContent = d.ca_f_sent || "";
      }
    });
  });
})();
