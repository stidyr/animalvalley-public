/* =========================================================================
   worker.js — delt lederbord for festleker.
   Cloudflare Worker + KV. Bind en KV-namespace som PARTY120 i wrangler.

   Ruter (party settes som ?party=120-2026):
     POST /party120/score    body {id,name,emoji,total,cat}  → lagrer spiller
     GET  /party120/board                                    → {players, outcomes}
     POST /party120/outcome  body {id,value}                 → setter spådom-utfall

   MERK: klienten regner ut sin egen score og pusher den. Trivielt å jukse
   med (POST vilkårlige poeng). For en low key-fest er det greit. Vil du
   herde: flytt CHALLENGES + scoring hit og valider svar server-side.
   ========================================================================= */

/* =========================================================================
   Secrets som må settes i Cloudflare Workers (wrangler secret put):
     ADMIN_TOKEN  — tilfeldig streng du velger, oppgi i ?token= ved admin-bruk
   ========================================================================= */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });

// Tillatte emoji fra CONFIG.EMOJIS i app.js
const ALLOWED_EMOJIS = new Set([
  "🏔️","🎮","🥖","🎿","🚲","🛠️","🧗","🗺️","🕹️","🍺","🧀","🌲","🎲","⚙️","🧭"
]);

// Strip HTML-kontrollzeichen fra navn
function sanitizeName(raw) {
  return String(raw || "?").replace(/[<>"'&]/g, "").trim().slice(0, 24) || "?";
}

// Constant-time sammenlikning for å unngå timing-angrep
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const MAX_PLAYERS = 200;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/party120/, "");
    const party = url.searchParams.get("party") || "default";
    const boardKey = `board:${party}`;
    const outKey = `outcomes:${party}`;

    try {
      if (path === "/score" && request.method === "POST") {
        const entry = await request.json();
        if (!entry.id || typeof entry.total !== "number" || !isFinite(entry.total))
          return json({ error: "ugyldig" }, 400);

        const board = (await env.PARTY120.get(boardKey, "json")) || {};

        // Avvis nye spillere hvis bordet er fullt
        if (!board[entry.id] && Object.keys(board).length >= MAX_PLAYERS)
          return json({ error: "fullt" }, 429);

        // Valider cat-verdier (skal være tall mellom 0 og 200).
        // Appen bruker kun 4 kategorier — kutt hardt for å hindre at noen
        // blåser opp KV-verdien med tusenvis av påfunne nøkler.
        const cat = {};
        for (const [k, v] of Object.entries(entry.cat || {}).slice(0, 10)) {
          if (typeof v === "number" && isFinite(v) && v >= 0 && v <= 200) cat[String(k).slice(0, 32)] = v;
        }

        board[entry.id] = {
          id: String(entry.id).slice(0, 32),
          name: sanitizeName(entry.name),
          emoji: ALLOWED_EMOJIS.has(entry.emoji) ? entry.emoji : "🏔️",
          total: Math.min(Math.max(0, entry.total), 200),
          cat,
          ts: Date.now(),
        };
        await env.PARTY120.put(boardKey, JSON.stringify(board));
        return json({ ok: true });
      }

      if (path === "/board" && request.method === "GET") {
        const board = (await env.PARTY120.get(boardKey, "json")) || {};
        const outcomes = (await env.PARTY120.get(outKey, "json")) || {};
        return json({ players: Object.values(board), outcomes });
      }

      if (path === "/reset" && request.method === "POST") {
        // Krev admin-token — sletter hele lederbordet + spådom-utfall for partyet
        const token = url.searchParams.get("token") || "";
        if (!env.ADMIN_TOKEN || !safeEqual(token, env.ADMIN_TOKEN))
          return json({ error: "ikke autorisert" }, 401);

        await env.PARTY120.delete(boardKey);
        await env.PARTY120.delete(outKey);
        return json({ ok: true });
      }

      if (path === "/outcome" && request.method === "POST") {
        // Krev admin-token
        const token = url.searchParams.get("token") || "";
        if (!env.ADMIN_TOKEN || !safeEqual(token, env.ADMIN_TOKEN))
          return json({ error: "ikke autorisert" }, 401);

        const { id, value } = await request.json();
        if (!id || typeof id !== "string") return json({ error: "mangler id" }, 400);

        const outcomes = (await env.PARTY120.get(outKey, "json")) || {};
        outcomes[String(id).slice(0, 32)] = value;
        await env.PARTY120.put(outKey, JSON.stringify(outcomes));
        return json({ ok: true });
      }

      return json({ error: "ukjent rute" }, 404);
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  },
};
