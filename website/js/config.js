/* ETR site configuration — edit these values to wire up integrations.
 * This file is loaded first on every page; quote.js, chatbot.js and contact.js
 * all read from window.ETR_CONFIG.
 */
window.ETR_CONFIG = {
  // --- Lead delivery (questionnaire + contact form) ---
  // Paste your Formspree form URL here to receive submissions by email with no
  // backend, e.g. "https://formspree.io/f/abcdwxyz". Leave blank to fall back to
  // opening the visitor's email client (mailto). See docs/SETUP.md.
  FORMSPREE_ENDPOINT: "",

  // Where mailto fallbacks and the contact page send to.
  CONTACT_EMAIL: "hsn.importazioni@outlook.com",

  // --- AI concierge chatbot ---
  // Set to your backend chat endpoint (see server/) to enable real AI replies,
  // e.g. "http://localhost:8787/api/chat". Leave blank to use the built-in
  // rule-based guided assistant.
  CHAT_API_URL: ""
};
