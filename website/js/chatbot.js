/* ETR concierge chatbot — self-contained, multilingual (7 languages), front-end only.
 * A guided assistant that greets visitors, qualifies the project, gives a rough
 * ballpark, and routes to the full estimator or to contact. It is rule-based by
 * design; to upgrade to real AI replies, POST the conversation to your LLM
 * backend inside handleFreeText() (a clearly-marked hook is provided).
 *
 * It reads the active language from <html lang> and works on any page that
 * includes this script (it injects its own DOM and listens to #lang-select).
 */
(function () {
  var CFG = (typeof window !== "undefined" && window.ETR_CONFIG) || {};
  var CONTACT_EMAIL = CFG.CONTACT_EMAIL || "hsn.importazioni@outlook.com";
  var CHAT_API_URL = CFG.CHAT_API_URL || ""; // set in config.js to enable real AI replies

  // Rough mid-point build cost (USD/m²) for the ballpark only — see quote.js for the
  // documented, finish-aware rates used by the full estimator.
  var MID = { res: 600, villa: 880, comm: 720, ind: 430, herit: 820, mixed: 720 };
  var LOCALE = { en: "en-US", ar: "ar", fr: "fr-FR", es: "es-ES", ru: "ru-RU", zh: "zh-CN", it: "it-IT" };

  var CB = {
    en: {
      launch: "Chat with ETR", title: "ETR Assistant", close: "Close",
      greeting: "Hi! I'm the ETR assistant. What are you planning to build?",
      t_res: "Residential", t_villa: "Villa", t_comm: "Commercial", t_ind: "Industrial", t_herit: "Heritage", t_mixed: "Mixed-use",
      ask_area: "Great choice. Roughly how many square metres (m²)?",
      area_invalid: "Please enter a number of m², e.g. 250.",
      ballpark: "Here's a very rough ballpark for a {type} of {area} m²:",
      after: "For a precise, science-based estimate, open our full questionnaire.",
      cta_full: "Open full estimator", cta_contact: "Talk to us",
      disclaimer: "Rough guide only — not a quote.",
      placeholder: "Type your answer…", send: "Send", restart: "Start over"
    },
    ar: {
      launch: "تحدّث مع ETR", title: "مساعد ETR", close: "إغلاق",
      greeting: "مرحباً! أنا مساعد ETR. ماذا تخطّط أن تبني؟",
      t_res: "سكني", t_villa: "فيلا", t_comm: "تجاري", t_ind: "صناعي", t_herit: "تراث", t_mixed: "متعدد الاستخدامات",
      ask_area: "اختيار ممتاز. كم تبلغ المساحة تقريباً بالمتر المربع (م²)؟",
      area_invalid: "يرجى إدخال مساحة بالمتر المربع، مثل ٢٥٠.",
      ballpark: "إليك تقديراً تقريبياً جداً لـ {type} بمساحة {area} م²:",
      after: "للحصول على تقدير دقيق قائم على العلم، افتح استبياننا الكامل.",
      cta_full: "افتح المُقدِّر الكامل", cta_contact: "تواصل معنا",
      disclaimer: "دليل تقريبي فقط — وليس عرض سعر.",
      placeholder: "اكتب إجابتك…", send: "إرسال", restart: "ابدأ من جديد"
    },
    fr: {
      launch: "Discuter avec ETR", title: "Assistant ETR", close: "Fermer",
      greeting: "Bonjour ! Je suis l'assistant ETR. Que prévoyez-vous de construire ?",
      t_res: "Résidentiel", t_villa: "Villa", t_comm: "Commercial", t_ind: "Industriel", t_herit: "Patrimoine", t_mixed: "Mixte",
      ask_area: "Excellent choix. Environ combien de mètres carrés (m²) ?",
      area_invalid: "Veuillez saisir un nombre de m², par ex. 250.",
      ballpark: "Voici une estimation très approximative pour un projet {type} de {area} m² :",
      after: "Pour une estimation précise et fondée sur la science, ouvrez notre questionnaire complet.",
      cta_full: "Ouvrir l'estimateur complet", cta_contact: "Nous contacter",
      disclaimer: "Indication approximative — pas un devis.",
      placeholder: "Tapez votre réponse…", send: "Envoyer", restart: "Recommencer"
    },
    es: {
      launch: "Chatear con ETR", title: "Asistente ETR", close: "Cerrar",
      greeting: "¡Hola! Soy el asistente de ETR. ¿Qué planea construir?",
      t_res: "Residencial", t_villa: "Villa", t_comm: "Comercial", t_ind: "Industrial", t_herit: "Patrimonio", t_mixed: "Uso mixto",
      ask_area: "Buena elección. ¿Aproximadamente cuántos metros cuadrados (m²)?",
      area_invalid: "Introduzca un número de m², p. ej. 250.",
      ballpark: "Aquí tiene una estimación muy aproximada para un proyecto {type} de {area} m²:",
      after: "Para una estimación precisa y basada en la ciencia, abra nuestro cuestionario completo.",
      cta_full: "Abrir el estimador completo", cta_contact: "Hablar con nosotros",
      disclaimer: "Guía aproximada — no es un presupuesto.",
      placeholder: "Escriba su respuesta…", send: "Enviar", restart: "Empezar de nuevo"
    },
    ru: {
      launch: "Чат с ETR", title: "Ассистент ETR", close: "Закрыть",
      greeting: "Здравствуйте! Я ассистент ETR. Что вы планируете строить?",
      t_res: "Жильё", t_villa: "Вилла", t_comm: "Коммерция", t_ind: "Промышленность", t_herit: "Наследие", t_mixed: "Смешанное",
      ask_area: "Отличный выбор. Примерно сколько квадратных метров (м²)?",
      area_invalid: "Введите площадь в м², например 250.",
      ballpark: "Вот очень приблизительная оценка для объекта «{type}» площадью {area} м²:",
      after: "Для точной оценки на научной основе откройте наш полный опросник.",
      cta_full: "Открыть полный калькулятор", cta_contact: "Связаться с нами",
      disclaimer: "Только грубый ориентир — не смета.",
      placeholder: "Введите ответ…", send: "Отправить", restart: "Начать заново"
    },
    zh: {
      launch: "与 ETR 对话", title: "ETR 助手", close: "关闭",
      greeting: "您好！我是 ETR 助手。您打算建造什么？",
      t_res: "住宅", t_villa: "别墅", t_comm: "商业", t_ind: "工业", t_herit: "遗产", t_mixed: "综合用途",
      ask_area: "很好。大约多少平方米（m²）？",
      area_invalid: "请输入平方米数，例如 250。",
      ballpark: "以下是 {area} m² {type}项目的非常粗略的估算：",
      after: "如需基于科学的精确估算，请打开我们的完整问卷。",
      cta_full: "打开完整估算器", cta_contact: "联系我们",
      disclaimer: "仅供粗略参考——并非报价。",
      placeholder: "输入您的回答…", send: "发送", restart: "重新开始"
    },
    it: {
      launch: "Chatta con ETR", title: "Assistente ETR", close: "Chiudi",
      greeting: "Ciao! Sono l'assistente ETR. Cosa hai intenzione di costruire?",
      t_res: "Residenziale", t_villa: "Villa", t_comm: "Commerciale", t_ind: "Industriale", t_herit: "Patrimonio", t_mixed: "Uso misto",
      ask_area: "Ottima scelta. All'incirca quanti metri quadri (m²)?",
      area_invalid: "Inserisci un numero di m², es. 250.",
      ballpark: "Ecco una stima molto approssimativa per un progetto {type} di {area} m²:",
      after: "Per una stima precisa e basata sulla scienza, apri il nostro questionario completo.",
      cta_full: "Apri lo stimatore completo", cta_contact: "Parla con noi",
      disclaimer: "Solo indicazione di massima — non è un preventivo.",
      placeholder: "Scrivi la tua risposta…", send: "Invia", restart: "Ricomincia"
    }
  };

  function lang() { var l = document.documentElement.lang || "en"; return CB[l] ? l : "en"; }
  function t() { return CB[lang()]; }
  function money(usd) {
    try { return new Intl.NumberFormat(LOCALE[lang()] || "en-US",
      { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usd); }
    catch (e) { return "$" + Math.round(usd).toLocaleString(); }
  }

  var state = { step: "type", type: null, area: null };
  var els = {};

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function bubble(text, who) {
    var b = el("div", "cb-msg cb-" + who, text);
    els.log.appendChild(b);
    els.log.scrollTop = els.log.scrollHeight;
    return b;
  }

  function clearQuick() { els.quick.innerHTML = ""; }
  function quickBtn(label, onClick) {
    var b = el("button", "cb-chip", label);
    b.type = "button";
    b.addEventListener("click", onClick);
    els.quick.appendChild(b);
  }

  function askType() {
    state.step = "type";
    bubble(t().greeting, "bot");
    clearQuick();
    var types = ["res", "villa", "comm", "ind", "herit", "mixed"];
    types.forEach(function (k) {
      quickBtn(t()["t_" + k], function () {
        state.type = k;
        bubble(t()["t_" + k], "user");
        askArea();
      });
    });
  }

  function askArea() {
    state.step = "area";
    clearQuick();
    bubble(t().ask_area, "bot");
    els.input.focus();
  }

  function showBallpark() {
    var mid = MID[state.type] * state.area;
    var lo = money(mid * 0.8), hi = money(mid * 1.2);
    var typeLabel = t()["t_" + state.type];
    bubble(t().ballpark.replace("{type}", typeLabel).replace("{area}", state.area), "bot");
    bubble(lo + "  –  " + hi, "bot");
    bubble(t().disclaimer + " " + t().after, "bot");
    clearQuick();
    var a = el("a", "cb-chip cb-chip-cta", t().cta_full); a.href = "questionnaire.html"; els.quick.appendChild(a);
    var c = el("a", "cb-chip", t().cta_contact); c.href = "mailto:" + CONTACT_EMAIL; els.quick.appendChild(c);
    quickBtn(t().restart, restart);
    state.step = "done";
  }

  var history = []; // {role, content} for the live-AI path

  function handleFreeText(text) {
    // Guided flow always handles the "area" step locally so the ballpark works offline.
    if (state.step === "area") {
      var n = parseFloat((text || "").replace(/[^0-9.]/g, ""));
      if (!n || n <= 0) { bubble(t().area_invalid, "bot"); return; }
      state.area = Math.round(n);
      showBallpark();
      return;
    }
    // Live-AI path: if a backend is configured, send the message there.
    if (CHAT_API_URL) {
      askAI(text);
      return;
    }
    // Otherwise, gently steer back into the guided flow.
    bubble(t().greeting, "bot");
    askType();
  }

  function askAI(text) {
    history.push({ role: "user", content: text });
    var typing = bubble("…", "bot");
    fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, lang: lang() })
    }).then(function (r) { return r.json(); }).then(function (data) {
      var reply = (data && data.reply) || "";
      typing.textContent = reply || t().area_invalid;
      if (reply) history.push({ role: "assistant", content: reply });
    }).catch(function () {
      typing.textContent = t().cta_contact + ": " + CONTACT_EMAIL;
    });
  }

  function onSend() {
    var text = els.input.value.trim();
    if (!text) return;
    bubble(text, "user");
    els.input.value = "";
    handleFreeText(text);
  }

  function restart() {
    state = { step: "type", type: null, area: null };
    els.log.innerHTML = "";
    askType();
  }

  function applyChrome() {
    els.launch.setAttribute("aria-label", t().launch);
    els.launch.title = t().launch;
    els.titleEl.textContent = t().title;
    els.input.placeholder = t().placeholder;
    els.sendBtn.textContent = t().send;
    els.closeBtn.setAttribute("aria-label", t().close);
  }

  function build() {
    var launch = el("button", "cb-launch"); launch.type = "button"; launch.innerHTML = "💬";
    var panel = el("div", "cb-panel"); panel.hidden = true;
    var header = el("div", "cb-header");
    var titleEl = el("span", "cb-title");
    var closeBtn = el("button", "cb-close"); closeBtn.type = "button"; closeBtn.innerHTML = "×";
    header.appendChild(titleEl); header.appendChild(closeBtn);
    var log = el("div", "cb-log");
    var quick = el("div", "cb-quick");
    var inputRow = el("div", "cb-inputrow");
    var input = el("input", "cb-input"); input.type = "text";
    var sendBtn = el("button", "cb-send"); sendBtn.type = "button";
    inputRow.appendChild(input); inputRow.appendChild(sendBtn);
    panel.appendChild(header); panel.appendChild(log); panel.appendChild(quick); panel.appendChild(inputRow);

    var wrap = el("div", "cb-wrap");
    wrap.appendChild(panel); wrap.appendChild(launch);
    document.body.appendChild(wrap);

    els = { launch: launch, panel: panel, titleEl: titleEl, closeBtn: closeBtn,
            log: log, quick: quick, input: input, sendBtn: sendBtn };

    launch.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden && !log.children.length) askType();
    });
    closeBtn.addEventListener("click", function () { panel.hidden = true; });
    sendBtn.addEventListener("click", onSend);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") onSend(); });

    var sel = document.getElementById("lang-select");
    if (sel) sel.addEventListener("change", function () { setTimeout(applyChrome, 0); });

    applyChrome();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
