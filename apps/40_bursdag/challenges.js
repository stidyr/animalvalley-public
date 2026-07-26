// challenges.js — alt innhold i festen bor her.
// Rediger fritt. Hver oppgave har en unik id (ikke endre id på oppgaver
// som allerede er i bruk under festen, ellers nulles poengene).
//
// Typer:
//   "quiz"        – ett riktig svar (flervalg). 10 poeng.
//   "estimat"     – nærmest vinner. Gradert 0–10 etter hvor nær du er.
//   "kode"        – skriv inn en kode du finner fysisk (QR/lapp). 10 poeng.
//   "gjort"       – æresystem: trykk "gjort" når du har gjort det. 10 poeng.
//   "spa"         – prediksjon Ja/Nei. Vert setter utfall via admin. 10 poeng.
//   "spa-estimat" – prediksjon med tall. Vert setter fasit via admin. Nærmest vinner.

const KATEGORIER = {
  kunnskap:  { navn: "Kunnskap",  emoji: "🧠", stikk: "Vet du det, eller vet du det ikke?" },
  estimat:   { navn: "Estimering", emoji: "📐", stikk: "Nærmest vinner. Gjett smart." },
  utforsker: { navn: "Utforsker", emoji: "🕵️", stikk: "Lei deg ut, snakk med folk og finn svarene." },
  spa:       { navn: "Spåkone",   emoji: "🔮", stikk: "Spå kvelden. Gjøres opp til slutt." },
};

const CHALLENGES = [
  // ── 🧠 KUNNSKAP ──────────────────────────────────────────────
  {
    id: "k-rcm", kat: "kunnskap", type: "quiz",
    sporsmal: "Hva står RCM for?",
    valg: ["Reliability Centered Maintenance", "Risk Control Model",
           "Rapid Component Mapping", "Reactive Corrective Maintenance"],
    fasit: "Reliability Centered Maintenance",
    funfact: "RCM ble utviklet for flyindustrien på 1960-tallet. Stian bruker metoden på offshoreanlegg i dag.",
  },
  {
    id: "k-sogndal-vgs", kat: "kunnskap", type: "quiz",
    sporsmal: "Kva vidaregåande skule gjekk alle tre jubilantane på?",
    valg: ["Sogndal vidaregåande skule", "Lærdalsfylket vgs", "Eid vidaregåande skule", "Bergen katedralskole"],
    fasit: "Sogndal vidaregåande skule",
    funfact: "Alle tre har røtene sine i indre Sogn — og møttes på den samme skolen.",
  },
  {
    id: "k-usa", kat: "kunnskap", type: "quiz",
    sporsmal: "Hvilken by studerte Stian og Kristian i under utenlandsåret i USA?",
    valg: ["Los Angeles", "San Francisco", "Santa Barbara", "San Diego"],
    fasit: "San Diego",
    funfact: "San Diego ligger rett ved grensen til Mexico, er kjent for sol og surf — og et ganske godt universitetsystem.",
  },
  {
    id: "k-jub-ski", kat: "kunnskap", type: "quiz",
    sporsmal: "Hvem av de tre jubilantene har flest høydemeter på randonée denne vinteren?",
    valg: ["Stian", "Kristian", "Torstein"],
    fasit: "Torstein",
    funfact: "Torstein topper listen — og randonée-høydemeterne teller ikke seg selv.",
  },
  {
    id: "k-jub-spill", kat: "kunnskap", type: "quiz",
    sporsmal: "Hvem av de tre har lagt flest timer i Elden Ring?",
    valg: ["Stian", "Kristian", "Torstein"],
    fasit: "Torstein",
    funfact: "Torstein er den udiskutable Elden Lord i gjengen. Det er ingen konkurranse.",
  },
  {
    id: "k-Sogn-lengst", kat: "kunnskap", type: "quiz",
    sporsmal: "Sognefjorden er Norges lengste fjord. Omtrent hvor lang?",
    valg: ["205 km", "120 km", "340 km", "88 km"],
    fasit: "205 km",
    funfact: "Sognefjorden er også Europas dypeste fjord — 1 308 meter på det dypeste, mer enn fire Eiffeltårn stablet oppå hverandre.",
  },
  {
    id: "k-halley-jubilanter", kat: "kunnskap", type: "quiz",
    sporsmal: "Alle tre jubilantene ble født samme år som en kjent komet sist var synlig fra Jorda. Hvilken?",
    valg: ["Halleys komet", "Hale-Bopp", "Enckes komet", "Swift-Tuttle"],
    fasit: "Halleys komet",
    funfact: "Halleys komet passerte i 1986 og kommer tilbake i 2061. Da er jubilantene 75 år.",
  },
  {
    id: "k-bergen", kat: "kunnskap", type: "quiz",
    sporsmal: "Bergen kalles «Byporten til fjordene». Hva kalles det historiske hanseatiske handelskvarteret i Bergen?",
    valg: ["Bryggen", "Sandviken", "Nordnes", "Møhlenpris"],
    fasit: "Bryggen",
    funfact: "Bryggen er på UNESCOs verdensarvliste siden 1979 — og er fremdeles et levende bykvarter.",
  },

  // ── 📐 ESTIMERING ────────────────────────────────────────────
  {
    id: "e-sognedybde", kat: "estimat", type: "estimat",
    sporsmal: "Hvor dypt er Sognefjorden på det dypeste? (meter)",
    fasit: 1308, enhet: "m",
    funfact: "1 308 meter — mer enn fire Eiffeltårn stablet på hverandre. Sognefjorden er Europas dypeste fjord, og dybden ble først målt nøyaktig på 1800-tallet.",
  },
  {
    id: "e-kystlinje", kat: "estimat", type: "estimat",
    sporsmal: "Hvor lang er Norges kystlinje MED alle øyer? (km)",
    hint: "Coastline-paradokset lever i beste velgående.",
    fasit: 100915, enhet: "km",
    funfact: "Med grovere målestokk er svaret bare 25 000 km. Jo mer detaljert du måler, jo lengre blir kystlinjen — Norges kystlinje er faktisk lengre enn avstanden rundt hele ekvator (40 000 km).",
  },
  {
    id: "e-papirbretting", kat: "estimat", type: "estimat",
    sporsmal: "Du bretter et A4-papir 42 ganger. Hvor høy er stabelen? (km)",
    hint: "Et annet paradoks. Gjett instinktivt.",
    fasit: 440000, enhet: "km",
    funfact: "440 000 km — avstand til Månen og tilbake. Et A4-ark er ca. 0,1 mm tykt. Dobling 42 ganger: 0,0001 m × 2⁴² = 439 804 651 km. Eksponentiell vekst slår intuisjonen hver gang.",
  },
  {
    id: "e-halley", kat: "estimat", type: "estimat",
    sporsmal: "Halleys komet var synlig i 1986. Hvilket år kommer den tilbake?",
    fasit: 2061, enhet: "",
    funfact: "2061 — da er jubilantene 75 år og kan (forhåpentligvis) se den igjen. Kometen ble observert allerede i 240 f.Kr. og er den eneste kortperiodiske kometen som er synlig med blotte øye.",
  },
  {
    id: "e-bensin86", kat: "estimat", type: "estimat",
    sporsmal: "Hva kostet omtrent én liter bensin i Norge i 1986? (kr)",
    fasit: 4.04, enhet: "kr",
    funfact: "4,04 kr i 1986. I dag koster literen rundt 20 kr — en femdobling på 40 år. Justert for inflasjon burde den «bare» kostet 13–14 kr, så bensin har blitt betydelig reelt dyrere.",
  },
  {
    id: "e-cod-disk", kat: "estimat", type: "estimat",
    sporsmal: "Hvor mye plass tar en fersk Call of Duty-installasjon på disk? (GB)",
    hint: "Med Warzone nærmer det seg 150 GB.",
    fasit: 125, enhet: "GB",
    funfact: "125 GB for grunnspilet — med Warzone nærmer det seg 150 GB. En gjennomsnittlig laptop i 2005 hadde 40–80 GB totalt. CoD er i praksis blitt et operativsystem.",
  },
  {
    id: "e-surdeig", kat: "estimat", type: "estimat",
    sporsmal: "Hvor mange gram surdeigsstarter finnes på Stians kjøkken akkurat nå?",
    fasit: 20, enhet: "g",
    funfact: "Bare 20 g — men det holder til uendelig mange brød. Surdeigsstarter er i teorien udødelig; den eldste kjente starteren skal visstnok stamme fra egyptisk tid. Stians er nok litt yngre.",
  },
  {
    id: "e-brod", kat: "estimat", type: "estimat",
    sporsmal: "Hvor mange surdeigsbrød har de tre jubilantene bakt til sammen i år?",
    fasit: 270, enhet: "brød",
    funfact: "Stian baker rundt 3 brød i uken. Legger du til Kristian og Torstein og 30 uker, tikker det opp til 270 brød. Stablet på hverandre er det omtrent 32 meter — like høyt som et 10-etasjes bygg.",
  },
  {
    id: "e-hoydemeter", kat: "estimat", type: "estimat",
    sporsmal: "Samlet høydemeter på randonée for de tre denne vinteren?",
    fasit: 4000, enhet: "hm", // TODO: sjekk ekte tall før festen
    funfact: "Randonée kombinerer alpint og langrenn — du går opp på klatreski og kjører ned på ski. Høydemeterne tar seg definitivt ikke selv, men utsikten fra toppen er alltid verdt det.",
  },

  // ── 🕵️ UTFORSKER ─────────────────────────────────────────────
  // Del 1: Finn svaret selv — se deg rundt på stedet.
  {
    id: "u-honer", kat: "utforsker", type: "quiz",
    sporsmal: "Sjekk hønsehuset: Hvor mange høner er det?",
    valg: ["1", "2", "3", "4"],
    fasit: "2",
    funfact: "To høner — og de aner ikke at det er fest.",
  },
  {
    id: "u-drinker", kat: "utforsker", type: "quiz",
    sporsmal: "Tell opp drinkoppskriftene: Hvor mange er det?",
    valg: ["2", "3", "4", "5"],
    fasit: "3",
    funfact: "Tre oppskrifter — og én av dem er alkoholfri.",
  },
  {
    id: "u-mule", kat: "utforsker", type: "quiz",
    sporsmal: "Sjekk oppskriften på Moscow Mule: Hvor mange cl vodka?",
    valg: ["4 cl", "8 cl", "5 cl", "20 cl"],
    fasit: "20 cl",
    funfact: "20 cl vodka — det er en generøs Moscow Mule. Ingerfar og lime tar seg av resten.",
  },

  // Del 3: Spør en av bursdagsbarna — de sitter på svaret.
  {
    id: "u-hyttetur", kat: "utforsker", type: "quiz",
    sporsmal: "Spør en jubilant du ikke kjenner så godt: Hvor er det årlige randonée-hytta?",
    valg: ["Røyrdotten i Jordalen", "Myrdalen i Flåm", "Turtagrø i Luster", "Stølsheimen"],
    fasit: "Røyrdotten i Jordalen",
    funfact: "Jordalen er et lite dalføre i Vaksdal. Røyrdotten er hytta — og turen dit er en fast tradisjon.",
  },
  {
    id: "u-bror", kat: "utforsker", type: "quiz",
    sporsmal: "Spør en jubilant: Hvem av de tre har bare brødre?",
    valg: ["Stian", "Kristian", "Torstein"],
    fasit: "Stian",
    funfact: "Stian vokste opp med bare brødre — noe som sikkert forklarer en del.",
  },
  {
    id: "u-grafikkort", kat: "utforsker", type: "quiz",
    sporsmal: "Spør en jubilant: Hva er skjermkortet alle tre har i PC-en?",
    valg: ["RTX 4070 Ti Super", "RTX 4080", "RX 7900 XT", "RTX 3090"],
    fasit: "RTX 4070 Ti Super",
    funfact: "RTX 4070 Ti Super — alle tre med samme GPU. De vet hva de vil ha, og de har diskutert det grundig.",
  },

  // ── 🔮 SPÅKONE ───────────────────────────────────────────────
  // Ja/Nei-spådommer: vert åpner ?admin=1 mot slutten og setter utfall.
  {
    id: "sp-bord", kat: "spa", type: "spa",
    sporsmal: "Danser noen på bordet i løpet av natten?",
    valg: ["Ja", "Nei"],
  },
  {
    id: "sp-jobb", kat: "spa", type: "spa",
    sporsmal: "Nevner noen jobb eller RCM uoppfordret før kl 22?",
    valg: ["Ja", "Nei"],
  },
  {
    id: "sp-dans", kat: "spa", type: "spa",
    sporsmal: "Blir det dans på gulvet før midnatt?",
    valg: ["Ja", "Nei"],
  },
  // Tallspådommer: nærmest vinner. Vert setter fasit via admin etter festen.
  {
    id: "sp-drinker", kat: "spa", type: "spa-estimat",
    sporsmal: "Hvor mange drinker lages det totalt i løpet av kvelden?",
    enhet: "drinker",
  },
  {
    id: "sp-klokkeslett", kat: "spa", type: "spa-estimat",
    sporsmal: "Når legger den siste gjesten ut? Skriv klokkeslett som tall (f.eks. 23 for kl 23:00, 2 for kl 02:00).",
    enhet: "",
  },
  {
    id: "sp-gjester", kat: "spa", type: "spa-estimat",
    sporsmal: "Hvor mange gjester møter opp totalt i løpet av kvelden?",
    enhet: "gjester",
  },
];
