/* ETR website backend.
 *
 * Endpoints:
 *   POST /api/chat          — AI concierge (Claude). Body: { messages:[{role,content}], lang }
 *   POST /api/lead          — capture a questionnaire/contact submission. Body: JSON
 *   POST /api/estimate-plan — upload a plan image; Claude estimates area/rooms (preliminary)
 *
 * Requires an Anthropic API key in the environment: ANTHROPIC_API_KEY.
 * See README.md.
 */
import express from "express";
import cors from "cors";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";

const PORT = process.env.PORT || 8787;
const MODEL = process.env.ETR_MODEL || "claude-opus-4-8"; // swap to claude-haiku-4-5 to cut cost
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // 15 MB

const LANG_NAME = {
  en: "English", ar: "Arabic", fr: "French", es: "Spanish",
  ru: "Russian", zh: "Chinese (Mandarin)", it: "Italian"
};

function etrSystemPrompt(lang) {
  const language = LANG_NAME[lang] || "the user's language";
  return [
    "You are Nero — the resident architect and concierge of ETR, an architecture",
    "and building-design practice for Libya and the international market, founded by",
    "Dr. Ali Hassan A. Eltrapolsi (PhD, University of Sheffield) and specialising",
    "in climate-smart, heritage-rooted, passive-cooling design.",
    "",
    "Character: you are an architect's mind made conversational — calm, precise and",
    "quietly confident. You think in light, proportion, material and climate, and you",
    "speak with an editorial, understated elegance (never flowery, never robotic).",
    "You ask one sharp question at a time rather than interrogating.",
    "",
    "Be warm and concise. Qualify the visitor's project (type, location, size,",
    "priorities), then guide them toward the full questionnaire for a precise",
    "estimate, or toward booking a consultation.",
    "",
    "Rules:",
    "- Any cost figure you give is a rough, preliminary, non-binding estimate that a",
    "  qualified architect/engineer must review. Never present a number as a quote.",
    "- For coastal/humid sites, recommend salt-resistant, moisture-tolerant materials;",
    "  for inland/desert sites, recommend thermal mass, shading and passive cooling.",
    `- Always reply in ${language}.`
  ].join("\n");
}

// ---- AI concierge chat ----
app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], lang = "en" } = req.body || {};
    const clean = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20);
    if (!clean.length) return res.status(400).json({ error: "no messages" });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: etrSystemPrompt(lang),
      messages: clean
    });
    const reply = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    res.json({ reply });
  } catch (err) {
    console.error("chat error:", err?.message || err);
    res.status(500).json({ error: "chat failed" });
  }
});

// ---- Lead capture ----
app.post("/api/lead", (req, res) => {
  const lead = req.body || {};
  // Minimal handling: log it. In production, forward to email/CRM/DB here.
  console.log("[LEAD]", new Date().toISOString(), JSON.stringify(lead));
  res.json({ ok: true });
});

// ---- Plan upload → preliminary AI estimate ----
app.post("/api/estimate-plan", upload.single("plan"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no file" });
    const lang = req.body.lang || "en";
    const mime = req.file.mimetype || "";
    if (!mime.startsWith("image/")) {
      return res.json({
        note: "Only image plans can be analysed automatically in this version. " +
              "Please use the questionnaire for PDF/CAD, or contact us."
      });
    }
    const b64 = req.file.buffer.toString("base64");
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: etrSystemPrompt(lang),
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mime, data: b64 } },
          { type: "text", text:
            "This is an architectural floor plan. Estimate the total built area in " +
            "square metres and the number of rooms, and note any climate/material " +
            "considerations. Be explicit that this is a rough preliminary reading, " +
            "not a measured takeoff." }
        ]
      }]
    });
    const analysis = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    res.json({ analysis });
  } catch (err) {
    console.error("estimate-plan error:", err?.message || err);
    res.status(500).json({ error: "analysis failed" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, model: MODEL }));

app.listen(PORT, () => console.log(`ETR backend listening on http://localhost:${PORT}`));
