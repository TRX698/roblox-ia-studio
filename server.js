// Serveur du site RobloxIA Studio : sert la page + relaie les demandes vers l'API Claude.
// La clé API reste côté serveur (variable d'environnement), jamais dans la page.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.MODEL || "claude-sonnet-5-5";
const PUBLIC = path.join(__dirname, "public");

const MODES = {
  script: "Tu génères des scripts Luau (Script serveur, LocalScript ou ModuleScript). Précise où placer chaque script dans l'Explorer.",
  anim: "Tu génères des animations : TweenService pour les objets et interfaces, Animator:LoadAnimation avec un ID d'animation pour les personnages. Explique comment créer l'animation dans l'Animation Editor si besoin.",
  gui: "Tu génères des interfaces (ScreenGui, Frame, TextButton...) construites par code dans un LocalScript placé dans StarterGui, avec UICorner, UIListLayout et tweens.",
  map: "Tu génères des maps : un script Luau qui construit le décor avec Instance.new (Parts, lumières, Terrain). Tout est rangé dans un Folder nommé Map. Il sera exécuté une fois dans Studio via le plugin.",
  sound: "Tu ajoutes des sons : Sound dans SoundService ou dans des Parts (Volume, Looped, SoundGroup). Utilise rbxassetid://0 en placeholder et dis de remplacer les ID."
};
const BASE = "Tu es un expert Roblox Studio et Luau. Réponds dans la langue de l'utilisateur, de façon courte. Mets chaque code dans un bloc ```lua. Code propre, commenté, compatible Roblox actuel. ";

// Limite simple : 20 demandes / 10 min par IP
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 600000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 20;
}

function send(res, code, body, type = "application/json") {
  res.writeHead(code, { "Content-Type": type });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

async function chat(req, res) {
  if (!KEY) return send(res, 500, { error: "Clé API manquante côté serveur." });
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (limited(ip)) return send(res, 429, { error: "Trop de demandes, réessaie dans quelques minutes." });

  let raw = "";
  for await (const c of req) { raw += c; if (raw.length > 30000) return send(res, 413, { error: "Message trop long." }); }
  let data;
  try { data = JSON.parse(raw); } catch { return send(res, 400, { error: "Requête invalide." }); }

  const mode = MODES[data.mode] ? data.mode : "script";
  const msgs = (Array.isArray(data.messages) ? data.messages : [])
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12).map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return send(res, 400, { error: "Message vide." });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 2500, system: BASE + MODES[mode], messages: msgs })
    });
    const j = await r.json();
    if (!r.ok) return send(res, 502, { error: "Erreur de l'IA : " + (j.error && j.error.message || r.status) });
    const text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    send(res, 200, { text });
  } catch (e) {
    send(res, 502, { error: "Impossible de joindre l'IA." });
  }
}

const FILES = { "/": ["index.html", "text/html; charset=utf-8"], "/IAStudio.server.lua": ["IAStudio.server.lua", "text/plain; charset=utf-8"] };

http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (req.method === "POST" && url === "/api/chat") return chat(req, res);
  const f = FILES[url];
  if (req.method === "GET" && f) return send(res, 200, fs.readFileSync(path.join(PUBLIC, f[0])), f[1]);
  send(res, 404, "Introuvable", "text/plain");
}).listen(PORT, () => console.log("RobloxIA Studio sur http://localhost:" + PORT));
