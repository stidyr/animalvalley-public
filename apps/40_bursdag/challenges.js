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
  utforsker: { navn: "Utforsker", emoji: "🕵️", stikk: "Utforsk, snakk med folk og finn svar." },
  spa:       { navn: "Spåkone",   emoji: "🔮", stikk: "Spå kvelden. Gjøres opp til slutt." },
};

const CHALLENGES = [
  // ── 🧠 KUNNSKAP ──────────────────────────────────────────────
  {
    id: "k-vik-delikatesse", kat: "kunnskap", type: "quiz",
    sporsmal: "Kva er den tradisjonelle matdelikatessen frå Vik i Sogn, med eigen festival kvart år i juni?",
    valg: ["Gamalost", "Rakfisk", "Fenalår", "Smalahove"],
    fasit: "Gamalost",
    funfact: "Gamalostfestivalen i Vik har røter heilt attende til vikingtida. Vik er òg ein av landets største produsentar av bringebær.",
  },
  {
    id: "k-urnes", kat: "kunnskap", type: "quiz",
    sporsmal: "Kva er den einaste stavkyrkja i Noreg som står på UNESCOs verdsarvliste — ho ligg i Luster i Sogn?",
    valg: ["Urnes stavkyrkje", "Hopperstad stavkyrkje", "Kaupanger stavkyrkje", "Borgund stavkyrkje"],
    fasit: "Urnes stavkyrkje",
    funfact: "Urnes stavkyrkje kom på UNESCOs verdsarvliste i 1979 — same år som Bryggen i Bergen. Dei eldste tømmerstokkane i kyrkja er daterte heilt attende til år 1070.",
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
    fasit: "Kristian",
    funfact: "Kristian topper listen. Torstein sto på null høydemeter denne vinteren — helt uten randonée.",
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
    id: "k-studieretning", kat: "kunnskap", type: "quiz",
    sporsmal: "Hvilken ingeniørretning har alle tre jubilantene studert?",
    valg: ["Maskin", "Elektro", "Bygg", "Kjemi"],
    fasit: "Elektro",
    funfact: "Alle tre er utdannet elektroingeniører — Stian og Kristian med fordypning i automasjon, Torstein i elkraft.",
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
    id: "e-a4-bretting-praksis", kat: "estimat", type: "estimat",
    sporsmal: "Den ekte testen: hvor mange ganger klarer DU faktisk å brette et vanlig A4-ark på midten, brett etter brett? Det ligger ark fremme — prøv selv!",
    hint: "Tykkelsen dobles for hver bretting, så det går fortere tomt for krefter enn du tror.",
    fasit: 7, enhet: "ganger",
    funfact: "7 er den vanlige praktiske grensen for et standard A4-ark — etter det blir stabelen for tykk og liten til å få tak i. Verdensrekorden med spesialpapir (mye tynnere og enormt mye større) er brutt opp mot 13 bretter, men et A4-ark fra skriveren stopper deg lenge før det.",
  },
  {
    id: "e-papirbretting", kat: "estimat", type: "estimat",
    sporsmal: "Tenk deg (rent teoretisk — det går ikke i praksis) at du bretter et A4-papir 30 ganger. Hvor høy er stabelen? (km)",
    hint: "Et tankeeksperiment. Du klarte nettopp knapt 7-8 bretter for hånd — men gjett likevel instinktivt.",
    fasit: 107, enhet: "km",
    funfact: "107 km — omtrent avstanden fra Bergen til Sogndal. Et A4-ark er ca. 0,1 mm tykt. Dobling 30 ganger: 0,0001 m × 2³⁰ = 107 374 m. Eksponentiell vekst slår intuisjonen hver gang.",
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
    id: "e-regnsky", kat: "estimat", type: "estimat",
    sporsmal: "Det regner mye i Bergen — men hvor mye veier egentlig en stor regnsky? (kg)",
    fasit: 1000000, enhet: "kg",
    funfact: "En stor regnsky kan veie over 1 million kg. Vannet er bare spredt over et enormt volum luft, så skyen ser lett ut selv om den bærer på et helt vannbasseng.",
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
    fasit: 150, enhet: "brød",
    funfact: "I snitt bakes det 3-4 brød i uken til sammen — det lander på rundt 150 brød i 2026.",
  },
  {
    id: "e-hoydemeter", kat: "estimat", type: "estimat",
    sporsmal: "Samlet høydemeter på randonée for de tre denne vinteren?",
    fasit: 3000, enhet: "hm",
    funfact: "Rundt 800 + 2000 høydemeter til sammen — Torstein sto på null. Randonée kombinerer alpint og langrenn: du går opp på klatreski og kjører ned på ski.",
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
    id: "u-straumgjerde", kat: "utforsker", type: "quiz",
    sporsmal: "Spør en jubilant: Kven lurte kven til å tisse på straumgjerdet då dei var små?",
    valg: ["Torstein lurte Kristian", "Kristian lurte Torstein", "Stian lurte Torstein", "Ingen har prøvd dette"],
    fasit: "Torstein lurte Kristian",
    funfact: "Ein klassisk barnestrek — og Kristian fall for det. Straumgjerde og nyfikne smågutar er ein dårleg kombinasjon.",
  },

  // ── 🔮 SPÅKONE ───────────────────────────────────────────────
  // Ja/Nei-spådommer: vert åpner ?admin=1 mot slutten og setter utfall.
  {
    id: "sp-bord", kat: "spa", type: "spa",
    sporsmal: "Danser noen på bordet i løpet av natten?",
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
    sporsmal: "Når avsluttes festen? Skriv klokkeslett som tall (f.eks. 23 for kl 23:00, 2 for kl 02:00).",
    enhet: "",
  },
  {
    id: "sp-gjester", kat: "spa", type: "spa-estimat",
    sporsmal: "Hvor mange gjester møter opp totalt i løpet av kvelden?",
    enhet: "gjester",
  },
];
