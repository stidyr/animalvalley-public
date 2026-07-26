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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });

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
        if (!entry.id || typeof entry.total !== "number") return json({ error: "ugyldig" }, 400);
        const board = (await env.PARTY120.get(boardKey, "json")) || {};
        board[entry.id] = {
          id: entry.id, name: String(entry.name || "?").slice(0, 24),
          emoji: entry.emoji || "🏔️", total: entry.total, cat: entry.cat || {},
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

      if (path === "/outcome" && request.method === "POST") {
        const { id, value } = await request.json();
        if (!id) return json({ error: "mangler id" }, 400);
        const outcomes = (await env.PARTY120.get(outKey, "json")) || {};
        outcomes[id] = value;
        await env.PARTY120.put(outKey, JSON.stringify(outcomes));
        return json({ ok: true });
      }

      return json({ error: "ukjent rute" }, 404);
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  },
};
