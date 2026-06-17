/* ETR site configuration — edit these values to wire up integrations.
 * This file is loaded first on every page; quote.js, chatbot.js and contact.js
 * all read from window.ETR_CONFIG.
 */
window.ETR_CONFIG = {
  // --- Lead delivery (questionnaire + contact form) ---
  // TODO(ETR): paste your Formspree form URL between the quotes to start
  // receiving questionnaire / contact / careers / network submissions by email.
  //   1. Create a free form at https://formspree.io (send to CONTACT_EMAIL below)
  //   2. Copy its endpoint, e.g. "https://formspree.io/f/abcdwxyz"
  //   3. Paste it here and save — done. (See docs/SETUP.md.)
  // Leave blank to use the email-client (mailto) fallback.
  FORMSPREE_ENDPOINT: "",  // <-- paste "https://formspree.io/f/XXXXXXXX" here

  // Where mailto fallbacks and the contact page send to.
  CONTACT_EMAIL: "hsn.importazioni@outlook.com",
  CONTACT_PHONE: "+218922763420",

  // --- AI concierge chatbot ---
  // Set to your backend chat endpoint (see server/) to enable real AI replies,
  // e.g. "http://localhost:8787/api/chat". Leave blank to use the built-in
  // rule-based guided assistant.
  CHAT_API_URL: "",

  // Set to your backend plan-estimate endpoint to have an uploaded plan image
  // analysed by AI, e.g. "http://localhost:8787/api/estimate-plan". Leave blank
  // to skip plan analysis (the form still works).
  ESTIMATE_API_URL: ""
};
