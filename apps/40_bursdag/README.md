# 120 år — festleker

Selvbetjent poeng-fest på mobil. Fem kategorier, ett lederbord + kategori-vinnere.
Ren statisk frontend (vanilla JS, ingen bygg) + valgfri Cloudflare Worker for delt lederbord.

## Filer
- `index.html`, `styles.css`, `app.js` — appen (statisk, GitHub Pages)
- `challenges.js` — **alt innhold**. Rediger her.
- `worker.js` — Cloudflare Worker for delt lederbord (KV)

## Kjør lokalt / test
Åpne `index.html` i nettleser, eller server mappa:
```
npx serve .        # eller: python3 -m http.server
```
Standard er `LEDERBORD: "local"` → lederbordet lever kun på din telefon.
Perfekt for å teste flyten før festen.

## Før festen — sjekkliste
1. **challenges.js**: bytt alle `TODO`/`← sett …` med ekte fasit.
   Særlig de personlige estimatene og jubilant-triviaen.
2. **app.js › CONFIG**: fyll inn `JUBILANTER`, `DATO`.
3. Skru på delt lederbord (under).

## Delt lederbord (Cloudflare Worker)
1. Lag KV-namespace og bind den som `PARTY120` i `wrangler.toml`:
   ```toml
   name = "party120"
   main = "worker.js"
   compatibility_date = "2026-01-01"
   [[kv_namespaces]]
   binding = "PARTY120"
   id = "<din-kv-id>"
   ```
2. `wrangler deploy`. Rut f.eks. `api.animalvalley.no/party120/*` til workeren.
3. I `app.js › CONFIG`: sett `LEDERBORD: "worker"` og riktig `WORKER_URL`.

## Under festen
- Del lenka (evt. som QR på veggen). Gjester lager navn + avatar, ferdig.
- **Spåkone gjøres opp av vert:** åpne `…/party-120/?admin=1`, gå inn i
  Spåkone-kategorien, sett utfall mot slutten. Alle scores oppdateres.

## Kjent svakhet (bevisst valg)
Klienten regner ut egen score og pusher den — juks er teknisk trivielt.
Greit for en low key-fest. Vil du herde: flytt fasit + scoring inn i
workeren og valider svar server-side (svarene ligger da ikke i klienten).
