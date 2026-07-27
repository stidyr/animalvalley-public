/* =========================================================================
   120 år — festleker
   Vanilla JS. Ingen bygg, ingen innlogging. Slippes rett i GitHub Pages.

   LEDERBORD:
   - "local"  = alt i denne telefonens localStorage. Kjører med én gang,
                fint for testing. MEN deles IKKE mellom gjester.
   - "worker" = delt lederbord via Cloudflare Worker (se worker.js + README).
                Dette er det du vil ha under selve festen.
   ========================================================================= */

const CONFIG = {
  LEDERBORD: "worker",                      // "local" | "worker"
  WORKER_URL: "https://api.animalvalley.no/party120", // brukes kun i "worker"
  PARTY_ID: "120-2026",                     // bytt hvis dere kjører flere fester
  JUBILANTER: "Stian, Kristian og Torstein",
  DATO: "29. august 2026",
  EMOJIS: ["🏔️","🎮","🥖","🎿","🚲","🛠️","🧗","🗺️","🕹️","🍺","🧀","🌲","🎲","⚙️","🧭"],
  TOL_ESTIMAT: 1.0,                         // 100% bom = 0 poeng, eksakt = 10
};

/* ── helpers ───────────────────────────────────────────────────────────── */
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ── state ─────────────────────────────────────────────────────────────── */
const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const K = {
  player:   `p120.player.${CONFIG.PARTY_ID}`,
  answers:  `p120.answers.${CONFIG.PARTY_ID}`,
  seenIntro:`p120.intro.${CONFIG.PARTY_ID}`,
  board:    `p120.board.${CONFIG.PARTY_ID}`,     // kun local-modus
  outcomes: `p120.outcomes.${CONFIG.PARTY_ID}`,  // spåkone-utfall
  adminToken: `p120.admintoken.${CONFIG.PARTY_ID}`,
};

// ?token=... i URL-en lagres til telefonen husker den (kun nødvendig én gang)
const tokenParam = new URLSearchParams(location.search).get("token");
if (tokenParam) LS.set(K.adminToken, tokenParam);

let state = {
  route: "welcome",
  introStep: 0,
  cat: null,
  draftName: "",
  draftEmoji: CONFIG.EMOJIS[0],
  player: LS.get(K.player, null),
  answers: LS.get(K.answers, {}),
  outcomes: LS.get(K.outcomes, {}),   // { challengeId: "Ja"/"Nei"/... }
  board: [],
  isAdmin: new URLSearchParams(location.search).get("admin") === "1",
  adminToken: LS.get(K.adminToken, ""),
};

// hopp forbi intro hvis spiller finnes
if (state.player) state.route = "menu";

/* ── scoring ───────────────────────────────────────────────────────────── */
function scoreEstimat(guess, fasit) {
  const relErr = Math.abs(guess - fasit) / Math.max(Math.abs(fasit), 1);
  return Math.round(10 * Math.max(0, 1 - relErr / CONFIG.TOL_ESTIMAT));
}

function pointsFor(ch, ans) {
  if (!ans) return 0;
  switch (ch.type) {
    case "quiz": return ans.value === ch.fasit ? 10 : 0;
    case "estimat": return scoreEstimat(Number(ans.value), ch.fasit);
    case "kode": return String(ans.value).trim().toUpperCase() === String(ch.fasit).toUpperCase() ? 10 : 0;
    case "gjort": return ans.value ? 10 : 0;
    case "spa": {
      const outcome = state.outcomes[ch.id];
      if (outcome == null) return 0;
      return ans.value === outcome ? 10 : 0;
    }
    case "spa-estimat": {
      const outcome = state.outcomes[ch.id];
      if (outcome == null) return 0;
      return scoreEstimat(Number(ans.value), Number(outcome));
    }
    default: return 0;
  }
}

function myTotals() {
  const cat = {};
  let total = 0;
  for (const ch of CHALLENGES) {
    const p = pointsFor(ch, state.answers[ch.id]);
    total += p;
    cat[ch.kat] = (cat[ch.kat] || 0) + p;
  }
  return { total, cat };
}

/* ── lederbord (local / worker) ────────────────────────────────────────── */
async function pushScore() {
  if (!state.player) return;
  const { total, cat } = myTotals();
  const entry = { id: state.player.id, name: state.player.name,
                  emoji: state.player.emoji, total, cat };
  if (CONFIG.LEDERBORD === "worker") {
    try {
      await fetch(`${CONFIG.WORKER_URL}/score?party=${CONFIG.PARTY_ID}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (e) { /* stille – lederbord kan hentes senere */ }
  } else {
    const board = LS.get(K.board, {});
    board[entry.id] = entry;
    LS.set(K.board, board);
  }
}

async function fetchBoard() {
  if (CONFIG.LEDERBORD === "worker") {
    try {
      const r = await fetch(`${CONFIG.WORKER_URL}/board?party=${CONFIG.PARTY_ID}`);
      const data = await r.json();
      if (data.outcomes) { state.outcomes = data.outcomes; LS.set(K.outcomes, data.outcomes); }
      return data.players || [];
    } catch (e) { return []; }
  } else {
    const board = LS.get(K.board, {});
    return Object.values(board);
  }
}

async function setOutcome(chId, value) {           // admin
  state.outcomes = { ...state.outcomes, [chId]: value };
  LS.set(K.outcomes, state.outcomes);
  if (CONFIG.LEDERBORD === "worker") {
    try {
      await fetch(`${CONFIG.WORKER_URL}/outcome?party=${CONFIG.PARTY_ID}&token=${encodeURIComponent(state.adminToken || "")}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chId, value }),
      });
    } catch (e) {}
  }
  await pushScore();
}

async function resetBoard() {                     // admin — sletter hele lederbordet
  if (CONFIG.LEDERBORD !== "worker") { LS.set(K.board, {}); return true; }
  try {
    const r = await fetch(`${CONFIG.WORKER_URL}/reset?party=${CONFIG.PARTY_ID}&token=${encodeURIComponent(state.adminToken || "")}`, {
      method: "POST",
    });
    return r.ok;
  } catch (e) { return false; }
}

/* ── answer helpers ────────────────────────────────────────────────────── */
function saveAnswer(chId, value, locked = true) {
  state.answers = { ...state.answers, [chId]: { value, locked } };
  LS.set(K.answers, state.answers);
  pushScore();
}

/* ── render ────────────────────────────────────────────────────────────── */
const app = document.getElementById("app");
const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };

function go(route, extra = {}) { state = { ...state, route, ...extra }; render(); }

async function render() {
  app.innerHTML = "";
  const view = {
    welcome: viewWelcome, intro: viewIntro, signup: viewSignup,
    menu: viewMenu, cat: viewCat, board: viewBoard,
  }[state.route] || viewWelcome;
  app.appendChild(await view());   // viewBoard er async, resten synkron
  window.scrollTo(0, 0);
}

/* ── screens ───────────────────────────────────────────────────────────── */
function viewWelcome() {
  const c = el(`<div>
    <div class="hero">
      <div class="eyebrow">Tre × 40</div>
      <div class="big">120</div>
      <h1>år på ett rom</h1>
      <p class="sub">${CONFIG.JUBILANTER} · ${CONFIG.DATO}</p>
    </div>
    <div class="card">
      <p style="margin-bottom:14px">Småleker gjennom kvelden. Samle poeng når du vil,
      klatre på lederbordet. Ingen stress — plukk opp mobilen når du gidder.</p>
      <button id="start">Kom i gang</button>
    </div>
    <p class="tally">Ingen innlogging. Ingenting lagres om deg utenfor festen.</p>
  </div>`);
  c.querySelector("#start").onclick = () =>
    go(LS.get(K.seenIntro, false) ? "signup" : "intro", { introStep: 0 });
  return c;
}

const INTRO = [
  { icon: "🎯", t: "Slik funker det",
    b: "Fem kategorier med små oppgaver. De ligger åpne hele kvelden — gjør dem i den rekkefølgen du vil, når du vil." },
  { icon: "🏅", t: "Poeng",
    b: "Hver oppgave gir 10 poeng. Unntaket er <b>Estimering</b>: der teller hvor nær du gjetter — nærmest får mest." },
  { icon: "🏔️", t: "Lederbordet",
    b: "Ett samlet lederbord + egne vinnere i hver kategori. Du kan lede «Sosial» selv om noen andre eier «Estimering»." },
];

function viewIntro() {
  const s = INTRO[state.introStep];
  const last = state.introStep === INTRO.length - 1;
  const c = el(`<div>
    <div class="step-icon">${s.icon}</div>
    <div class="card">
      <h2 style="margin-bottom:10px">${s.t}</h2>
      <p>${s.b}</p>
    </div>
    <div class="progress-dots">
      ${INTRO.map((_, i) => `<span class="${i === state.introStep ? "on" : ""}"></span>`).join("")}
    </div>
    <button id="next">${last ? "Lag spiller" : "Videre"}</button>
    ${state.introStep > 0 ? `<button class="ghost" id="prev" style="margin-top:10px">Tilbake</button>` : ""}
  </div>`);
  c.querySelector("#next").onclick = () => {
    if (last) { LS.set(K.seenIntro, true); go("signup"); }
    else go("intro", { introStep: state.introStep + 1 });
  };
  const prev = c.querySelector("#prev");
  if (prev) prev.onclick = () => go("intro", { introStep: state.introStep - 1 });
  return c;
}

function viewSignup() {
  const c = el(`<div>
    <button class="back" id="back">← tilbake</button>
    <h2 style="margin-bottom:4px">Hvem er du?</h2>
    <p class="muted" style="font-size:14px">Vises på lederbordet.</p>
    <label class="field">Navn eller kallenavn</label>
    <input type="text" id="name" maxlength="20" placeholder="F.eks. Kari, DJ Surdeig…" />
    <label class="field">Velg avatar</label>
    <div class="emoji-grid" id="emojis">
      ${CONFIG.EMOJIS.map(e => `<button data-e="${e}" class="${e === state.draftEmoji ? "sel" : ""}">${e}</button>`).join("")}
    </div>
    <button id="done" style="margin-top:10px">Inn på festen</button>
  </div>`);
  c.querySelector("#back").onclick = () => go("welcome");
  const nameInput = c.querySelector("#name");
  nameInput.value = state.draftName; // sett via .value, ikke innerHTML
  nameInput.oninput = (e) => state.draftName = e.target.value;
  c.querySelectorAll("#emojis button").forEach(b => b.onclick = () => {
    state.draftEmoji = b.dataset.e;
    c.querySelectorAll("#emojis button").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel");
  });
  c.querySelector("#done").onclick = () => {
    const name = (state.draftName || "").trim();
    if (!name) { nameInput.focus(); nameInput.style.borderColor = "var(--danger)"; return; }
    state.player = { id: "u" + Math.random().toString(36).slice(2, 9), name, emoji: state.draftEmoji };
    LS.set(K.player, state.player);
    pushScore();
    go("menu");
  };
  return c;
}

function viewMenu() {
  const { total } = myTotals();
  const counts = {};
  for (const ch of CHALLENGES) {
    counts[ch.kat] = counts[ch.kat] || { done: 0, all: 0 };
    counts[ch.kat].all++;
    if (state.answers[ch.id]) counts[ch.kat].done++;
  }
  const tiles = Object.entries(KATEGORIER).map(([key, k]) => `
    <button class="tile" data-cat="${key}">
      <span class="em">${k.emoji}</span>
      <span class="t-main">
        <span class="t-name">${k.navn}</span><br/>
        <span class="t-sub">${k.stikk}</span>
      </span>
      <span class="t-count">${counts[key].done}/${counts[key].all}</span>
    </button>`).join("");

  const c = el(`<div>
    <div class="topbar">
      <div class="who">
        <span class="av">${state.player.emoji}</span>
        <div><div style="font-weight:600">${esc(state.player.name)}</div>
        <div class="muted" style="font-size:12px">dine poeng</div></div>
      </div>
      <span class="score-pill">${total}</span>
    </div>

    <button id="board" style="background:var(--teal);margin-bottom:18px">🏔️ Se lederbordet</button>

    <div class="tiles">${tiles}</div>
    ${state.isAdmin ? `<button class="ghost" id="admin" style="margin-top:16px">🔧 Admin: gjør opp spådommer</button>
    <button class="ghost" id="reset" style="margin-top:8px;color:var(--danger)">🗑️ Nullstill lederbord</button>` : ""}
    <p class="tally">Poeng lagres på telefonen din. Bytt kategori når du vil.</p>
  </div>`);
  c.querySelector("#board").onclick = () => go("board");
  c.querySelectorAll(".tile").forEach(t => t.onclick = () => go("cat", { cat: t.dataset.cat }));
  const admin = c.querySelector("#admin");
  if (admin) admin.onclick = () => go("cat", { cat: "spa" });
  const reset = c.querySelector("#reset");
  if (reset) reset.onclick = async () => {
    if (!confirm("Slette HELE lederbordet? Dette kan ikke angres.")) return;
    const ok = await resetBoard();
    alert(ok ? "Lederbordet er nullstilt." : "Noe gikk galt — sjekk admin-token.");
  };
  return c;
}

function viewCat() {
  const k = KATEGORIER[state.cat];
  const list = CHALLENGES.filter(ch => ch.kat === state.cat);
  const c = el(`<div>
    <button class="back" id="back">← meny</button>
    <div class="section-title"><span style="font-size:26px">${k.emoji}</span><h2>${k.navn}</h2></div>
    <p class="muted" style="margin-bottom:16px">${k.stikk}</p>
    <div id="qs"></div>
  </div>`);
  c.querySelector("#back").onclick = () => go("menu");
  const qs = c.querySelector("#qs");
  list.forEach(ch => qs.appendChild(renderChallenge(ch)));
  return c;
}

function renderChallenge(ch) {
  const ans = state.answers[ch.id];
  const done = !!ans && ans.locked;
  const wrap = el(`<div class="q ${done ? "done" : ""}">
    <div class="q-text">${ch.sporsmal}</div>
    ${ch.hint ? `<div class="q-hint">${ch.hint}</div>` : ""}
    ${!done && ch.type !== "gjort" && ch.type !== "spa" && ch.type !== "spa-estimat" ? `<div class="q-once">⚠️ Bare ett forsøk</div>` : ""}
    <div class="body"></div>
  </div>`);
  const body = wrap.querySelector(".body");

  const lockResult = () => {
    // Les alltid fra state, ikke fra den fangede ans-variabelen som kan være null
    const currentAns = state.answers[ch.id];
    const p = pointsFor(ch, currentAns);
    body.innerHTML = "";
    if (ch.type === "estimat") {
      const guessNum = Number(currentAns.value);
      const fasitStr = ch.enhet ? `${ch.fasit} ${ch.enhet}` : String(ch.fasit);
      const guessStr = ch.enhet ? `${guessNum} ${ch.enhet}` : String(guessNum);
      const div = el(`<div class="result pts"></div>`);
      div.textContent = `Ditt gjett: ${guessStr} · Fasit: ${fasitStr} · ${p}/10 poeng`;
      body.appendChild(div);
      if (ch.funfact) {
        const ff = el(`<div class="q-hint"></div>`);
        ff.textContent = ch.funfact;
        body.appendChild(ff);
      }
    } else if (ch.type === "spa") {
      const div = el(`<div class="result"></div>`);
      div.textContent = `Låst inn: ${currentAns.value} — gjøres opp til slutt.`;
      body.appendChild(div);
    } else if (ch.type === "spa-estimat") {
      const outcome = state.outcomes[ch.id];
      if (outcome == null) {
        const div = el(`<div class="result"></div>`);
        div.textContent = `Låst inn: ${Number(currentAns.value)}${ch.enhet ? " " + ch.enhet : ""} — gjøres opp til slutt.`;
        body.appendChild(div);
      } else {
        const guessStr = `${Number(currentAns.value)}${ch.enhet ? " " + ch.enhet : ""}`;
        const fasitStr = `${outcome}${ch.enhet ? " " + ch.enhet : ""}`;
        const div = el(`<div class="result pts"></div>`);
        div.textContent = `Ditt gjett: ${guessStr} · Fasit: ${fasitStr} · ${p}/10 poeng`;
        body.appendChild(div);
      }
    } else if (ch.type === "gjort") {
      body.appendChild(el(`<div class="result ok">✓ Registrert · 10 poeng</div>`));
    } else {
      const riktig = p > 0;
      const div = el(`<div class="result ${riktig ? "ok" : "no"}"></div>`);
      div.textContent = riktig ? "Riktig · 10 poeng" : `Feil · 0 poeng. Riktig svar: ${ch.fasit}`;
      body.appendChild(div);
      if (ch.funfact) {
        const ff = el(`<div class="q-hint"></div>`);
        ff.textContent = ch.funfact;
        body.appendChild(ff);
      }
    }
    wrap.classList.add("done");
  };

  if (done) { lockResult(); return wrap; }

  // ── input pr type ──
  if (ch.type === "quiz" || ch.type === "spa") {
    const box = el(`<div class="choices"></div>`);
    (ch.valg || []).forEach(v => {
      const b = el(`<button>${v}</button>`);
      b.onclick = () => { saveAnswer(ch.id, v, true); lockResult(); refreshHeaderScore(); };
      box.appendChild(b);
    });
    body.appendChild(box);
  }
  else if (ch.type === "estimat") {
    const row = el(`<div class="inline-row">
      <input type="number" inputmode="decimal" placeholder="Ditt tall${ch.enhet ? " ("+ch.enhet+")" : ""}" />
      <button>Lås</button></div>`);
    const input = row.querySelector("input");
    row.querySelector("button").onclick = () => {
      if (input.value === "") { input.focus(); return; }
      saveAnswer(ch.id, input.value, true); lockResult(); refreshHeaderScore();
    };
    body.appendChild(row);
  }
  else if (ch.type === "kode") {
    const row = el(`<div class="inline-row">
      <input type="text" placeholder="Skriv koden" />
      <button>Sjekk</button></div>`);
    const input = row.querySelector("input");
    const params = new URLSearchParams(location.search);
    if (params.get("kode")) input.value = params.get("kode");
    row.querySelector("button").onclick = () => {
      const val = input.value.trim();
      if (!val) { input.focus(); return; }
      const ok = val.toUpperCase() === String(ch.fasit).toUpperCase();
      if (ok) { saveAnswer(ch.id, val, true); lockResult(); refreshHeaderScore(); }
      else {
        let msg = row.parentElement.querySelector(".result");
        if (!msg) { msg = el(`<div class="result no"></div>`); body.appendChild(msg); }
        msg.textContent = "Nope — feil kode. Let videre.";
      }
    };
    body.appendChild(row);
  }
  else if (ch.type === "spa-estimat") {
    const row = el(`<div class="inline-row">
      <input type="number" inputmode="decimal" placeholder="Ditt tall${ch.enhet ? " ("+ch.enhet+")" : ""}" />
      <button>Lås</button></div>`);
    const input = row.querySelector("input");
    row.querySelector("button").onclick = () => {
      if (input.value === "") { input.focus(); return; }
      saveAnswer(ch.id, input.value, true); lockResult(); refreshHeaderScore();
    };
    body.appendChild(row);
  }
  else if (ch.type === "gjort") {
    const b = el(`<button class="small">Gjort ✓</button>`);
    b.onclick = () => { saveAnswer(ch.id, true, true); lockResult(); refreshHeaderScore(); };
    body.appendChild(b);
  }

  // admin-kontroll for spåkone (ja/nei)
  if (ch.type === "spa" && state.isAdmin) {
    const adminRow = el(`<div style="margin-top:10px">
      <div class="q-hint">Admin — sett utfall:</div>
      <div class="choices" style="margin-top:6px"></div></div>`);
    const box = adminRow.querySelector(".choices");
    (ch.valg || []).forEach(v => {
      const cur = state.outcomes[ch.id] === v;
      const b = el(`<button class="${cur ? "picked" : ""}">Utfall: ${v}</button>`);
      b.onclick = async () => { await setOutcome(ch.id, v); go("cat", { cat: "spa" }); };
      box.appendChild(b);
    });
    body.appendChild(adminRow);
  }

  // admin-kontroll for spåkone (estimat)
  if (ch.type === "spa-estimat" && state.isAdmin) {
    const cur = state.outcomes[ch.id];
    const adminRow = el(`<div style="margin-top:10px">
      <div class="q-hint">Admin — sett fasit:${cur != null ? " (nå: " + cur + (ch.enhet ? " " + ch.enhet : "") + ")" : ""}</div>
      <div class="inline-row" style="margin-top:6px"></div></div>`);
    const row = adminRow.querySelector(".inline-row");
    const inp = el(`<input type="number" inputmode="decimal" placeholder="Fasit${ch.enhet ? " ("+ch.enhet+")" : ""}" />`);
    const btn = el(`<button>Sett</button>`);
    btn.onclick = async () => {
      if (!inp.value) return;
      await setOutcome(ch.id, inp.value);
      go("cat", { cat: "spa" });
    };
    row.appendChild(inp);
    row.appendChild(btn);
    body.appendChild(adminRow);
  }
  return wrap;
}

function refreshHeaderScore() { /* meny re-renderes ved retur; her no-op */ }

async function viewBoard() {
  const c = el(`<div>
    <button class="back" id="back">← meny</button>
    <div class="section-title"><span style="font-size:26px">🏔️</span><h2>Lederbordet</h2></div>
    <p class="muted" id="mode" style="font-size:13px;margin-bottom:14px"></p>
    <div id="climb"><p class="muted">Henter stillingen…</p></div>
    <div class="section-title"><h2 style="font-size:18px">Kategori-ledere</h2></div>
    <div class="cat-leaders" id="cats"></div>
  </div>`);
  c.querySelector("#back").onclick = () => go("menu");
  c.querySelector("#mode").textContent = CONFIG.LEDERBORD === "worker"
    ? "Delt lederbord — oppdateres live."
    : "Testmodus (kun denne telefonen). Sett LEDERBORD='worker' for delt.";

  // sørg for at egen score er pushet, hent så
  await pushScore();
  let players = await fetchBoard();

  // fallback: vis i det minste deg selv i local-modus
  if (!players.length && state.player) {
    const { total, cat } = myTotals();
    players = [{ ...state.player, total, cat }];
  }

  players.sort((a, b) => b.total - a.total);
  const climb = c.querySelector("#climb");
  climb.innerHTML = "";
  const list = el(`<div class="climb"></div>`);
  players.forEach((p, i) => {
    const me = state.player && p.id === state.player.id;
    const safeEmoji = CONFIG.EMOJIS.includes(p.emoji) ? p.emoji : "🏔️";
    const rung = el(`<div class="rung ${i === 0 ? "top" : ""} ${me ? "me" : ""}">
      <span class="rank">${i + 1}</span>
      <span class="av">${safeEmoji}</span>
      <span class="nm">${esc(p.name)}${me ? " (deg)" : ""}</span>
      <span class="pts">${Number(p.total) || 0}</span>
    </div>`);
    list.appendChild(rung);
  });
  climb.appendChild(list);

  // kategori-ledere
  const cats = c.querySelector("#cats");
  Object.entries(KATEGORIER).forEach(([key, k]) => {
    let best = null;
    players.forEach(p => {
      const v = (p.cat && p.cat[key]) || 0;
      if (v > 0 && (!best || v > best.v)) best = {
        name: p.name, emoji: CONFIG.EMOJIS.includes(p.emoji) ? p.emoji : "🏔️", v
      };
    });
    cats.appendChild(el(`<div class="cat-leader">
      <span class="lead-who">${k.emoji} <b>${k.navn}</b></span>
      <span>${best
        ? `${best.emoji} ${esc(best.name)} · <span class="mono" style="color:var(--amber)">${best.v}</span>`
        : "<span class='muted'>ingen ennå</span>"}</span>
    </div>`));
  });
  return c;
}

render();
