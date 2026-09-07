(function(){
"use strict";

/* ---------------- idioma ---------------- */
/* La página está escrita en español y el inglés vive en un diccionario. Se hizo
   así, y no con dos diccionarios simétricos, por dos razones: el código sigue
   leyéndose en el idioma en que está escrito el proyecto, y una traducción que
   falte cae en el original en vez de dejar un hueco en blanco.

   T("texto") traduce cadenas sueltas del JavaScript. Los bloques del HTML van
   marcados con data-i18n: su versión española se guarda al arrancar y se
   restaura al volver a español. */
var LANG_KEY = "dcg-lang";
var lang = (function(){
  try {
    var v = localStorage.getItem(LANG_KEY);
    if (v === "es" || v === "en") return v;
  } catch(e){}
  return /^en/i.test(navigator.language || "") ? "en" : "es";
})();

function T(s, vars){
  var out = (lang === "en" && EN[s] != null) ? EN[s] : s;
  if (vars) out = out.replace(/\{(\w+)\}/g, function(m, k){
    return vars[k] != null ? String(vars[k]) : m;
  });
  return out;
}
// Locale para números: separadores de miles y decimales cambian con el idioma.
function loc(){ return lang === "en" ? "en-US" : "es"; }
function num(n){ return Number(n).toLocaleString(loc()); }
function dec(s){ return lang === "en" ? s : String(s).replace(".", ","); }
/* ---------------- diccionario inglés ---------------- */
/* Solo el inglés: el español es el original y vive en el propio código y en el
   HTML. Lo que no esté aquí sale en español, que es un fallo visible pero no
   roto. Las llaves {x} las rellena T(). */

var EN = {
  // medidor y lista del mazo
  "Mazo legal": "Legal deck",
  "Sobra 1 carta": "1 card too many",
  "Sobran {d} cartas": "{d} cards too many",
  "Falta 1 carta": "1 card missing",
  "Faltan {d} cartas": "{d} cards missing",
  "vacío": "empty",
  "1 carta": "1 card",
  "{n} cartas": "{n} cards",
  "Nombre de la carta": "Card name",
  "Coste de la carta": "Card cost",
  "Quitar copia": "Remove a copy",
  "Añadir copia": "Add a copy",
  "Eliminar esta carta del mazo": "Remove this card from the deck",
  "+ Añadir carta a {g}": "+ Add card to {g}",
  "× Cerrar el buscador": "× Close the search",

  // Digi-Egg
  "Nombre del Digi-Egg": "Digi-Egg name",
  "Eliminar este huevo": "Remove this Digi-Egg",
  "mazo aparte, no cuenta para las 50": "separate deck, does not count toward the 50",
  "+ Añadir Digi-Egg": "+ Add Digi-Egg",
  "El mazo de huevos ya tiene {n} cartas": "The egg deck already has {n} cards",
  "El mazo de huevos ya tiene {n} cartas.": "The egg deck already has {n} cards.",

  // diagnóstico
  "Mano sin ningún Lv.3": "Hand with no Lv.3",
  "No puedes subir de crianza a tiempo.": "You cannot raise out of the breeding area in time.",
  "Sin Lv.3 y sin Tamer": "No Lv.3 and no Tamer",
  "Mano muerta: nada que hacer en el turno 1.": "Dead hand: nothing to do on turn 1.",
  "Solo Lv.5 / 6 / 7": "Only Lv.5 / 6 / 7",
  "Ladrillo: 5 cartas que no puedes pagar.": "Brick: 5 cards you cannot pay for.",

  // curva de costes
  "El mazo está vacío.": "The deck is empty.",

  // comparar mazos
  "Cartas en el mazo": "Cards in deck",
  "Línea completa": "Full line",
  "Mano sin Lv.3": "Hand with no Lv.3",
  "Sin Lv.3 ni Tamer": "No Lv.3 or Tamer",
  "Solo Lv.5/6/7": "Only Lv.5/6/7",
  "≥1 {g} en mano": "≥1 {g} in hand",
  "Referencia": "Reference",
  "Ponle un nombre": "Give it a name",
  "Este mazo": "This deck",
  "Métrica": "Metric",
  "Diferencia": "Difference",
  "Fijar este mazo como referencia": "Set this deck as the reference",
  "Sustituir la referencia por este mazo": "Replace the reference with this deck",
  "Fija este mazo como referencia, carga otro con el importador o el buscador, y aquí verás qué se gana y qué se pierde. Como todo es combinatoria exacta, la diferencia es la diferencia real entre los dos mazos, no ruido de un muestreo.":
    "Set this deck as the reference, load another one with the importer or the search box, and this is where you will see what you gain and what you lose. Because it is all exact combinatorics, the difference is the real difference between the two decks, not sampling noise.",
  "Lista de la referencia volcada. Pulsa «Cargar lista» para montarla.":
    "Reference list dropped in. Press «Load list» to build it.",

  // línea completa
  "de abrir con {x} en la misma mano de {n}.": "of opening with {x} in the same hand of {n}.",
  "Elige arriba qué niveles debe traer la línea.": "Choose above which levels the line needs.",

  // gráfico por turno
  "Turno {t} · {n} cartas vistas": "Turn {t} · {n} cards seen",
  "Ver tabla": "Show table",
  "Ocultar tabla": "Hide table",

  // seguridad
  "Alguna de las {s} lo frena": "One of the {s} stops it",
  "{w} de {N} cartas del mazo son Digimon con {dp} DP o más.":
    "{w} of the {N} cards in the deck are Digimon with {dp} DP or more.",

  // simulador
  "Pulsa <b>Barajar y robar</b> para repartir una mano de este mazo.":
    "Press <b>Shuffle and draw</b> to deal a hand from this deck.",
  "Revelar seguridad": "Reveal security",
  "Ocultar seguridad": "Hide security",
  "Barajar 1.000 veces": "Shuffle 1,000 times",
  "· {n} manos": "· {n} hands",
  "· 1 mano": "· 1 hand",
  "Con algún Lv.3": "With at least one Lv.3",
  "Con algún Tamer": "With at least one Tamer",
  "Con la línea completa": "With the full line",
  "Mano muerta": "Dead hand",
  "exacto {p}": "exact {p}",

  // buscador de cartas
  "Ninguna carta coincide.": "No card matches.",
  "…y {n} más. Afina la búsqueda.": "…and {n} more. Narrow the search.",
  "Todas las expansiones": "All sets",
  "Nombre o ID de la carta…": "Card name or ID…",
  "Buscar carta por nombre o ID": "Search for a card by name or ID",
  "Añadir carta en blanco": "Add a blank card",
  "Cerrar": "Close",
  "Cerrar el selector": "Close the card picker",
  "Ya hay {n} copias de {c}.": "There are already {n} copies of {c}.",
  "Promo": "Promo",
  "Booster": "Booster",
  "Extra Booster": "Extra Booster",
  "Starter Deck": "Starter Deck",
  "Advanced Booster": "Advanced Booster",
  "Reboot Booster": "Reboot Booster",
  "Limited": "Limited",

  // importador
  "sin ID de carta": "no card ID",
  "sin número de copias, se asume 1": "no copy count, assuming 1",
  "no está en el catálogo": "not in the catalogue",
  "carta sin nivel: fuera del mazo": "card with no level: outside the deck",
  "más de {n} copias, se recorta a {n}": "more than {n} copies, trimmed to {n}",
  "el mazo de huevos no pasa de {m} cartas, se recorta a {s}":
    "the egg deck cannot go past {m} cards, trimmed to {s}",
  "sin cargar": "not loaded",
  "aviso": "warning",
  "{n} cartas distintas": "{n} distinct cards",
  "{n} copias": "{n} copies",
  "El mazo tiene <b>{n}</b> copias, no 50. Ajusta la lista o las copias en el editor.":
    "The deck has <b>{n}</b> copies, not 50. Adjust the list or the copies in the editor.",
  "El mazo de huevos tiene <b>{n}</b> cartas, más de {m}.":
    "The egg deck has <b>{n}</b> cards, more than {m}.",
  "Pega una lista primero.": "Paste a list first.",
  "No se reconoció ninguna carta.": "No card was recognised.",
  "Mazo cargado.": "Deck loaded.",
  "Mazo cargado · 1 línea sin cargar": "Deck loaded · 1 line not loaded",
  "Mazo cargado · {n} líneas sin cargar": "Deck loaded · {n} lines not loaded",
  "Lista copiada al portapapeles y volcada aquí arriba.":
    "List copied to the clipboard and dropped in above.",
  "Lista volcada aquí arriba; cópiala a mano.": "List dropped in above; copy it by hand.",
  "Esta copia se compiló sin catálogo, así que no puede resolver los IDs.":
    "This copy was built without the catalogue, so it cannot resolve IDs.",
  "Compilado sin catálogo: ejecuta tools/fetch-cards.ps1 y vuelve a construir.":
    "Built without the catalogue: run tools/fetch-cards.ps1 and build again.",

  // guardar y exportar
  "(sin nombre)": "(no name)",
  "Guardando…": "Saving…",
  "Guardado. Esta versión del mazo es la que verá quien abra la página.":
    "Saved. This version of the deck is what anyone opening the page will see.",
  "Alguien guardó antes que tú; la página se recargará con esa versión.":
    "Someone saved before you; the page will reload with that version.",
  "Solo lectura: no puedes guardar en esta página.":
    "Read only: you cannot save on this page.",
  "No se pudo guardar. Vuelve a intentarlo.": "Could not save. Try again.",
  "Descarga cancelada.": "Download cancelled.",
  "CSV descargado.": "CSV downloaded.",
  "Este navegador no ha dejado descargar el CSV.":
    "This browser would not let the CSV download."
};

/* Bloques del HTML, por su data-i18n. El español no está aquí: se captura del
   propio documento al arrancar. */
var EN_HTML = {
  "eyebrow-top": "Digimon Card Game · Deck analysis",
  "lede": "Measure how a deck behaves before you sit down to play it: what you open with, how well the evolution line holds, what goes to security and how it all shifts turn by turn. <b>Exact hypergeometric</b> maths, not simulation.",
  "lbl-idioma": "Language",
  "lbl-tema": "Theme",
  "th-claro": "Light",
  "th-oscuro": "Dark",
  "lbl-cartas-mazo": "Cards in deck",
  "empty-note": "<b>Start by loading a deck.</b> Paste your list into «Load a list» just below, or build it card by card with the search box in each level of the deck list. Until there are cards, everything else sits at zero: there is nothing to work out yet.",
  "intro-note": "<b>No number here is tied to one particular deck.</b> Paste your list or build it with the search box, and everything below —opening hand, evolution line, security, turn by turn— is recalculated over those 50 cards. Since it is exact combinatorics and not simulation, two decks can be compared with no sampling noise in the way.",
  "imp-title": "Load a list",
  "imp-sub": "Paste the game's standard format and the whole deck is rebuilt",
  "imp-note": "One line per card: <span class=\"mono\">copies · name · ID</span>. Lines starting with <span class=\"mono\">//</span> are ignored, and a name split across two lines is joined back on its own. Level, cost and DP come from the catalogue, so the name does not matter: the ID rules.",
  "imp-load": "Load list",
  "imp-copy": "Copy the current deck",
  "imp-clear": "Clear",
  "deck-title": "Deck list",
  "deck-sub": "≥1 &nbsp;·&nbsp; ≥2 copies in hand",
  "lbl-mano": "Hand",
  "mull-no": "No",
  "mull-si": "Yes",
  "btn-reset": "Reset",
  "th-grupos": "<th>Group</th><th>Copies</th><th>≥1 in hand</th><th>With mulligan</th><th>Spread</th>",
  "dist-legend": "<span><i style=\"background:var(--track)\"></i> 0 copies</span><span><i style=\"background:var(--o1)\"></i> 1</span><span><i style=\"background:var(--o2)\"></i> 2</span><span><i style=\"background:var(--o3)\"></i> 3+</span>",
  "curve-title": "Cost curve",
  "curve-sub": "Copies by play cost",
  "curve-afford": "Opening with something costing ≤ N",
  "curve-note": "Cards typed by hand come in at cost 0 until you set it, so they show up in the first bar. Digi-Eggs do not count: they are neither paid for nor drawn.",
  "marg-title": "Impact of one copy",
  "marg-sub": "Where the next slot pays off",
  "th-marg": "<th>Group</th><th>Copies</th><th>≥1 in hand</th><th>With +1</th><th>With −1</th><th>Line</th>",
  "marg-note": "The deck stays at 50: giving a copy to one group means taking it from another. The <b>Line</b> column assumes it comes from a group outside the line; if you take it from another link, the real gain is smaller.",
  "sim-title": "Hand simulator",
  "sim-draw": "Shuffle and draw",
  "lbl-mano2": "Hand",
  "lbl-seguridad": "Security",
  "lbl-frecuencia": "Observed frequency",
  "sim-reset": "Reset count",
  "line-title": "Full line in hand",
  "line-need": "The line needs at least one of each",
  "line-mull-lbl": "With mulligan",
  "line-turns": "Cumulative probability by turn",
  "line-casc": "What each link costs you, in the opening hand",
  "sec-title": "What goes to security",
  "lbl-cartas": "Cards",
  "sec-note": "<b>Dealing security does not change your opening hand.</b> The 5 come off the same shuffled deck, so your hand is still 5 random cards out of the 50: it makes no difference whether you deal security before or after. They are not wasted either — Tamers and Options with a security effect go off down there, and a Digimon stops an attack if its DP holds.",
  "th-sec": "<th>Group</th><th>≥1 in security</th><th>Expected</th><th>Still in deck</th>",
  "wall-title": "Security wall",
  "lbl-atacante": "Attacker",
  "wall-1": "The top check stops it",
  "chart-title": "Probability of having seen it, turn by turn",
  "go-1": "Going 1st",
  "go-2": "Going 2nd",
  "cmp-title": "Compare decks",
  "ref-load": "Load the reference",
  "ref-clear": "Forget",
  "f-title": "How it is worked out",
  "f-p1": "It is easier to count the hands that do <em>not</em> hold the card and subtract. With <span class=\"mono\">k</span> copies in a deck of <span class=\"mono\">N</span> cards and a hand of <span class=\"mono\">n</span>:",
  "f-p2": "With 4 copies of a card in 50: out of the <span class=\"mono\">C(50,5) = 2,118,760</span> possible hands, <span class=\"mono\">C(46,5) = 1,370,754</span> hold none. That leaves <span class=\"mono\">35.30 %</span> for at least one to turn up.",
  "f-p3": "The <b>with mulligan</b> column assumes you reshuffle whenever that group fails to turn up, and works out to <span class=\"mono\">1 − (1 − p)²</span>. The turn-by-turn chart uses the same formula with a larger <span class=\"mono\">n</span>: you draw 1 card per turn, and the player going first skips their first draw.",
  "btn-save": "Save deck",
  "btn-csv": "Download CSV",
  "legal": "This website is a non-profit fan-made tool and is not affiliated with, endorsed by or associated with Bandai or Toei Animation. Card images and Digimon trademarks are the property of their respective owners."
};

// Atributos, por su data-i18n-aria.
var EN_ARIA = {
  "aria-idioma": "Page language",
  "aria-tema": "Page theme",
  "aria-lista": "Deck list as text",
  "aria-mano-menos": "Reduce hand size",
  "aria-mano-mas": "Increase hand size",
  "aria-mulligan": "Consider mulligan",
  "aria-sec-menos": "Fewer security cards",
  "aria-sec-mas": "More security cards",
  "aria-dp-menos": "Less DP",
  "aria-dp-mas": "More DP",
  "aria-orden": "Play order",
  "aria-chart": "Cumulative probability of seeing at least one card from each group, by turn"
};

/* El español del HTML, tal y como venía. Se captura antes de tocar nada, así
   que volver a español es restaurar exactamente lo que escribió el template. */
var ES_HTML = {}, ES_ARIA = {};
(function(){
  var els = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < els.length; i++) ES_HTML[els[i].getAttribute("data-i18n")] = els[i].innerHTML;
  var as = document.querySelectorAll("[data-i18n-aria]");
  for (var j = 0; j < as.length; j++) ES_ARIA[as[j].getAttribute("data-i18n-aria")] = as[j].getAttribute("aria-label");
})();

function applyLang(){
  document.documentElement.setAttribute("lang", lang === "en" ? "en" : "es");

  var els = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < els.length; i++){
    var k = els[i].getAttribute("data-i18n");
    var v = (lang === "en" && EN_HTML[k] != null) ? EN_HTML[k] : ES_HTML[k];
    if (v != null) els[i].innerHTML = v;
  }
  var as = document.querySelectorAll("[data-i18n-aria]");
  for (var j = 0; j < as.length; j++){
    var ka = as[j].getAttribute("data-i18n-aria");
    var va = (lang === "en" && EN_ARIA[ka] != null) ? EN_ARIA[ka] : ES_ARIA[ka];
    if (va != null) as[j].setAttribute("aria-label", va);
  }

  // Los que no son estáticos: su texto lo decide el estado, no el template.
  // El separador de miles va dentro de la cadena: cada idioma escribe el suyo.
  document.getElementById("sim1k").textContent = T("Barajar 1.000 veces");
  document.getElementById("reveal-btn").textContent =
    sim.reveal ? T("Ocultar seguridad") : T("Revelar seguridad");
  document.getElementById("tbl-toggle").textContent =
    showTable ? T("Ocultar tabla") : T("Ver tabla");

  setPressed("lang-es", lang === "es");
  setPressed("lang-en", lang === "en");
}

function setLang(l){
  if (lang === l) return;
  lang = (l === "en") ? "en" : "es";
  try { localStorage.setItem(LANG_KEY, lang); } catch(e){}
  // Los avisos sueltos son de una acción ya pasada y no se vuelven a pintar:
  // dejarlos ahí en el idioma anterior se lee como un fallo. Mejor limpiarlos.
  impSay("");
  msg("");
  applyLang();
  renderAll();
}
document.getElementById("lang-es").addEventListener("click", function(){ setLang("es"); });
document.getElementById("lang-en").addEventListener("click", function(){ setLang("en"); });

/* ---------------- estado ---------------- */
var GROUPS = ["Lv.3","Lv.4","Lv.5","Lv.6","Lv.7","Tamer","Option"];
var GVAR = {"Lv.3":"--s-lv3","Lv.4":"--s-lv4","Lv.5":"--s-lv5","Lv.6":"--s-lv6",
            "Lv.7":"--s-lv7","Tamer":"--s-tamer","Option":"--s-option","Lv.2":"--s-lv2"};

/* Los Digi-Egg (Lv.2) son un mazo aparte: hasta 5 cartas, con el mismo tope de
   4 copias por carta, y no cuentan para las 50. Por eso viven en S.eggs y no en
   S.cards: nunca se roban, así que no entran en ningún cálculo de probabilidad
   ni en el simulador. Todo lo que hay debajo de esto sigue mirando solo S.cards. */
var EGG_GROUP = "Lv.2";
var EGG_MAX   = 5;   // cartas en el mazo de huevos
var COPY_MAX  = 4;   // copias de una misma carta, igual que en las 50
function gcol(g){ return "var(" + (GVAR[g] || "--muted") + ")"; }
function gcolResolved(g){
  return getComputedStyle(document.documentElement).getPropertyValue(GVAR[g] || "--muted").trim() || "#888";
}

/* El tema elegido vive como atributo del <html>, pero no debe viajar en la copia
   que se guarda: quien la abra tiene su propia preferencia. */
var themeAttr = document.documentElement.getAttribute("data-theme");
if (themeAttr) document.documentElement.removeAttribute("data-theme");
var PRISTINE = "<!doctype html>\n" + document.documentElement.outerHTML;
if (themeAttr) document.documentElement.setAttribute("data-theme", themeAttr);
function withDefaults(o){
  if (typeof o.sec !== "number") o.sec = 5;
  if (typeof o.dp !== "number") o.dp = 8000;
  if (!o.line) o.line = ["Lv.3","Lv.4","Lv.5","Lv.6"];
  if (!o.series) o.series = ["Lv.3","Lv.4","Lv.5","Lv.6","Lv.7"];
  // Los mazos guardados antes de que existieran los huevos no traen la clave.
  if (!Array.isArray(o.eggs)) o.eggs = [];
  return o;
}
var INITIAL = withDefaults(JSON.parse(document.getElementById("deck-state").textContent));
var S = withDefaults(JSON.parse(JSON.stringify(INITIAL)));
var showTable = false;

/* ---------------- matemática ---------------- */
var LF = [0];
for (var i = 1; i <= 1500; i++) LF[i] = LF[i-1] + Math.log(i);
function logC(n,k){
  if (k < 0 || n < 0 || k > n) return -Infinity;
  return LF[n] - LF[k] - LF[n-k];
}
/* Con el mazo vacío estos logaritmos salen −Infinity por los dos lados y la
   resta da NaN, así que no basta con comparar contra −Infinity: cualquier
   resultado que no sea finito es una probabilidad que no existe, y vale 0. */
function pExact(k,x,N,n){
  var v = logC(k,x) + logC(N-k, n-x) - logC(N,n);
  return isFinite(v) ? Math.exp(v) : 0;
}
function pNone(k,N,n){
  if (N - k < n) return 0;
  var v = logC(N-k,n) - logC(N,n);
  return isFinite(v) ? Math.exp(v) : 0;
}
function pAtLeast(k,x,N,n){
  var s = 0;
  for (var i = 0; i < x; i++) s += pExact(k,i,N,n);
  return Math.max(0, Math.min(1, 1 - s));
}

/* ---------------- derivados ---------------- */
function totalCards(){ var t=0; for (var i=0;i<S.cards.length;i++) t += S.cards[i].q; return t; }
function groupCount(g){ var t=0; for (var i=0;i<S.cards.length;i++) if (S.cards[i].g===g) t += S.cards[i].q; return t; }
// Sin mazo no hay mano que acotar, y enseñar "1" haría dudar de un ajuste que
// el usuario no ha tocado: se muestra la mano que tiene elegida.
function handSize(){ var N = totalCards(); return N ? Math.min(S.hand, N) : S.hand; }
function eggCards(){ var t=0; for (var i=0;i<S.eggs.length;i++) t += S.eggs[i].q; return t; }

function fmt(p){ return dec((p*100).toFixed(2)) + " %"; }
function fmt1(p){ return dec((p*100).toFixed(1)) + " %"; }

/* ---------------- ilustraciones ---------------- */
/* Las del mazo vienen incrustadas en el HTML; las de una lista que se cargue
   después se piden al servidor, que en un artefacto publicado está bloqueado
   por CSP. En cualquiera de los dos fallos queda el marco vacío, nunca un
   hueco roto.

   Van como regla CSS y no como <img> a propósito: la lista se vuelve a pintar
   entera en cada clic de + o −, y así el navegador decodifica cada carta una
   sola vez en lugar de 22 data URIs por pulsación. */
var IMG_HOST = "https://images.digimoncard.io/images/cards/";
var CARD_IMG = (function(){
  try { return JSON.parse(document.getElementById("card-img").textContent) || {}; }
  catch(e){ return {}; }
})();

var artSheet = (function(){
  var rules = [], el = document.createElement("style");
  for (var id in CARD_IMG){
    if (Object.prototype.hasOwnProperty.call(CARD_IMG, id)){
      rules.push("." + artClassName(id) + '{background-image:url("' + CARD_IMG[id] + '")}');
    }
  }
  el.textContent = rules.join("\n");
  document.head.appendChild(el);
  return el;
})();

function artClassName(id){ return "art-" + String(id).replace(/[^A-Za-z0-9-]/g, "_"); }

var artRemote = {};
function artClass(c){
  if (!c || !c.id) return "";
  var cls = artClassName(c.id);
  if (!CARD_IMG[c.id] && !artRemote[cls]){
    artRemote[cls] = true;
    try {
      artSheet.sheet.insertRule(
        "." + cls + '{background-image:url("' + IMG_HOST + encodeURIComponent(c.id) + '.jpg")}',
        artSheet.sheet.cssRules.length);
    } catch(e){}
  }
  return cls;
}

/* ---------------- render: cabecera ---------------- */
var notches = document.getElementById("notches");
for (var j = 0; j < 10; j++) notches.appendChild(document.createElement("i"));

function renderMeter(){
  var N = totalCards();
  document.getElementById("deck-n").textContent = N;
  var f = document.getElementById("gauge-fill");
  f.style.width = Math.min(100, N/50*100) + "%";
  f.classList.toggle("over", N > 50);
  var st = document.getElementById("deck-status");
  var ok = (N === 50);
  st.className = "meter-status " + (ok ? "ok" : "bad");
  var d = Math.abs(50 - N);
  st.querySelector("span").textContent = ok ? T("Mazo legal")
    : (N > 50 ? (d === 1 ? T("Sobra 1 carta") : T("Sobran {d} cartas", { d:d }))
              : (d === 1 ? T("Falta 1 carta") : T("Faltan {d} cartas", { d:d })));

  var e = eggCards();
  document.getElementById("egg-n").textContent = e;
  document.getElementById("egg-meter").classList.toggle("bad", e > EGG_MAX);
}

/* ---------------- render: lista del mazo ---------------- */
var focusIdx = null;
var focusEgg = null;

function cardRow(c, idx, N, n){
  var p1 = c.q ? pAtLeast(c.q,1,N,n) : 0;
  var p2 = c.q >= 2 ? pAtLeast(c.q,2,N,n) : 0;

  var r = document.createElement("div");
  r.className = "row" + (c.q === 0 ? " zero" : "");
  r.innerHTML =
    '<div class="thumb ' + artClass(c) + '"></div>'
  + '<div class="info">'
  +   '<input class="nm" type="text" placeholder="' + T("Nombre de la carta") + '" aria-label="' + T("Nombre de la carta") + '">'
  +   '<div class="meta"><span class="g"></span><span>· ' + T("coste") + '</span>'
  +     '<input class="cost" type="number" min="0" max="20" step="1" aria-label="' + T("Coste de la carta") + '">'
  +     '<span class="dp"></span><span class="cid"></span></div>'
  + '</div>'
  + '<div class="step">'
  +   '<button aria-label="Quitar copia">\u2212</button>'
  +   '<div class="q mono">' + c.q + '</div>'
  +   '<button aria-label="Anadir copia">+</button>'
  + '</div>'
  + '<button class="del" title="' + T("Eliminar esta carta del mazo") + '" aria-label="' + T("Eliminar esta carta del mazo") + '">\u00d7</button>'
  + '<div class="pcell">'
  +   '<div class="pbar"><i style="width:' + (p1*100).toFixed(1) + '%"></i></div>'
  +   '<div class="pnum">' + (c.q ? fmt1(p1) : "\u2014") + '</div>'
  +   '<div class="pnum dim" style="min-width:44px">' + (c.q >= 2 ? fmt1(p2) : "\u2014") + '</div>'
  + '</div>';

  var nm = r.querySelector("input.nm");
  nm.value = c.n;
  nm.dataset.i = idx;
  nm.addEventListener("input", function(){ c.n = this.value; });

  var cost = r.querySelector("input.cost");
  cost.value = c.c;
  cost.addEventListener("input", function(){
    var v = parseInt(this.value, 10);
    c.c = isNaN(v) ? 0 : Math.max(0, Math.min(20, v));
  });

  r.querySelector(".meta .g").textContent = c.g;
  r.querySelector(".meta .dp").textContent = c.dp ? "\u00b7 " + num(c.dp) + " DP" : "";
  // El ID desambigua: en este mazo hay dos Jupitermon, dos Aegiomon y dos Elecmon.
  r.querySelector(".meta .cid").textContent = c.id || "";

  var btns = r.querySelectorAll(".step button");
  btns[0].disabled = c.q <= 0;
  btns[1].disabled = c.q >= COPY_MAX;
  btns[0].addEventListener("click", function(){ bump(idx,-1); });
  btns[1].addEventListener("click", function(){ bump(idx, 1); });

  r.querySelector(".del").addEventListener("click", function(){
    S.cards.splice(idx, 1);
    renderAll();
  });

  return r;
}

/* Fila de huevo. Deliberadamente sin las columnas de probabilidad: los Digi-Egg
   no se roban, así que un "≥1 en mano" ahí sería un número inventado. Tampoco
   llevan coste ni DP, que en el juego no existen para esta carta. */
function eggRow(c, idx){
  var total = eggCards();

  var r = document.createElement("div");
  r.className = "row" + (c.q === 0 ? " zero" : "");
  r.innerHTML =
    '<div class="thumb ' + artClass(c) + '"></div>'
  + '<div class="info">'
  +   '<input class="nm" type="text" placeholder="' + T("Nombre del Digi-Egg") + '" aria-label="' + T("Nombre del Digi-Egg") + '">'
  +   '<div class="meta"><span class="g"></span><span class="cid"></span></div>'
  + '</div>'
  + '<div class="step">'
  +   '<button aria-label="' + T("Quitar copia") + '">−</button>'
  +   '<div class="q mono">' + c.q + '</div>'
  +   '<button aria-label="' + T("Añadir copia") + '">+</button>'
  + '</div>'
  + '<button class="del" title="' + T("Eliminar este huevo") + '" aria-label="' + T("Eliminar este huevo") + '">×</button>';

  var nm = r.querySelector("input.nm");
  nm.value = c.n;
  nm.dataset.e = idx;
  nm.addEventListener("input", function(){ c.n = this.value; });

  r.querySelector(".meta .g").textContent = EGG_GROUP;
  r.querySelector(".meta .cid").textContent = c.id || "";

  var btns = r.querySelectorAll(".step button");
  btns[0].disabled = c.q <= 0;
  // Dos topes a la vez: 4 copias de esta carta y 5 cartas en el mazo de huevos.
  btns[1].disabled = c.q >= COPY_MAX || total >= EGG_MAX;
  btns[0].addEventListener("click", function(){ bumpEgg(idx,-1); });
  btns[1].addEventListener("click", function(){ bumpEgg(idx, 1); });

  r.querySelector(".del").addEventListener("click", function(){
    S.eggs.splice(idx, 1);
    renderAll();
  });

  return r;
}

function renderEggs(host){
  var total = eggCards();

  var box = document.createElement("div");
  box.className = "eggblock";

  var h = document.createElement("div");
  h.className = "grp-head";
  h.innerHTML = '<i class="sw" style="background:' + gcol(EGG_GROUP) + '"></i>'
    + '<span class="nm"></span><span class="cap"></span><span class="ct"></span>';
  h.querySelector(".nm").textContent = EGG_GROUP + " · Digi-Egg";
  h.querySelector(".cap").textContent = T("mazo aparte, no cuenta para las 50");
  var ct = h.querySelector(".ct");
  ct.textContent = total + "/" + EGG_MAX;
  ct.classList.toggle("over", total > EGG_MAX);
  box.appendChild(h);

  S.eggs.forEach(function(c, i){ box.appendChild(eggRow(c, i)); });

  var abierto = (picker && picker.anchor === EGG_GROUP);
  var add = document.createElement("button");
  add.className = "addgrp" + (abierto ? " open" : "");
  add.textContent = abierto ? T("× Cerrar el buscador") : T("+ Añadir Digi-Egg");
  add.disabled = !abierto && total >= EGG_MAX;
  add.title = add.disabled ? T("El mazo de huevos ya tiene {n} cartas", { n:EGG_MAX }) : "";
  add.addEventListener("click", function(){
    if (!CARD_DB.__n){
      S.eggs.push({ n:"", g:EGG_GROUP, c:0, dp:0, q:1 });
      focusEgg = S.eggs.length - 1;
      renderAll();
      return;
    }
    abrirPicker(EGG_GROUP, EGG_G, true);
  });
  box.appendChild(add);
  if (abierto) box.appendChild(renderPicker());

  host.appendChild(box);
}

function renderDeck(){
  var N = totalCards(), n = handSize();
  var host = document.getElementById("decklist");
  host.textContent = "";

  GROUPS.forEach(function(g, gi){
    var gc = groupCount(g);
    var rows = [];
    S.cards.forEach(function(c, i){ if (c.g === g) rows.push([c, i]); });

    var h = document.createElement("div");
    h.className = "grp-head";
    h.innerHTML = '<i class="sw" style="background:' + gcol(g) + '"></i>'
      + '<span class="nm"></span><span class="ct"></span>';
    h.querySelector(".nm").textContent = g;
    h.querySelector(".ct").textContent = rows.length
      ? (gc === 1 ? T("1 carta") : T("{n} cartas", { n:gc }))
      : T("vac\u00edo");
    host.appendChild(h);

    rows.forEach(function(e){ host.appendChild(cardRow(e[0], e[1], N, n)); });

    var abierto = (picker && picker.anchor === g);
    var add = document.createElement("button");
    add.className = "addgrp" + (abierto ? " open" : "");
    add.textContent = (abierto ? T("\u00d7 Cerrar el buscador") : T("+ A\u00f1adir carta a {g}", { g:g }));
    add.addEventListener("click", function(){
      // Sin cat\u00e1logo compilado no hay nada que buscar: fila en blanco y a mano.
      if (!CARD_DB.__n){
        S.cards.push({ n:"", g:g, c:0, dp:0, q:1 });
        focusIdx = S.cards.length - 1;
        renderAll();
        return;
      }
      abrirPicker(g, gi, false);
    });
    host.appendChild(add);
    if (abierto) host.appendChild(renderPicker());
  });

  renderEggs(host);

  if (focusIdx !== null){
    var el = host.querySelector('input.nm[data-i="' + focusIdx + '"]');
    if (el){ el.focus(); }
    focusIdx = null;
  }
  if (focusEgg !== null){
    var ee = host.querySelector('input.nm[data-e="' + focusEgg + '"]');
    if (ee){ ee.focus(); }
    focusEgg = null;
  }
  // Añadir una carta rehace toda la lista, así que hay que devolver el cursor
  // al buscador para poder seguir añadiendo sin volver a pinchar.
  if (picker){
    var pq = host.querySelector(".pk-q");
    if (pq){ pq.focus(); pq.setSelectionRange(pq.value.length, pq.value.length); }
  }
}

function bump(idx, d){
  var c = S.cards[idx];
  c.q = Math.max(0, Math.min(COPY_MAX, c.q + d));
  renderAll();
}

function bumpEgg(idx, d){
  var c = S.eggs[idx];
  var q = Math.max(0, Math.min(COPY_MAX, c.q + d));
  // Además del tope por carta, el mazo de huevos no puede pasar de 5.
  if (d > 0){
    var sinEsta = eggCards() - c.q;
    q = Math.min(q, Math.max(0, EGG_MAX - sinEsta));
  }
  c.q = q;
  renderAll();
}

/* ---------------- render: tabla de grupos ---------------- */
function renderGroups(){
  var N = totalCards(), n = handSize();
  var tb = document.getElementById("gbody");
  tb.textContent = "";
  GROUPS.forEach(function(g){
    var k = groupCount(g);
    if (!k) return;
    var p1 = pAtLeast(k,1,N,n);
    var mull = 1 - Math.pow(1 - p1, 2);
    var d0 = pExact(k,0,N,n), d1 = pExact(k,1,N,n), d2 = pExact(k,2,N,n);
    var d3 = Math.max(0, 1 - d0 - d1 - d2);

    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td><div class="gname"><i class="sw" style="background:' + gcol(g) + '"></i><span></span></div></td>'
    + '<td class="mono">' + k + '</td>'
    + '<td class="big">' + fmt1(p1) + '</td>'
    + '<td class="mono" style="color:var(--muted)">' + (S.mull ? fmt1(mull) : "—") + '</td>'
    + '<td><div class="dist" title="0: ' + fmt1(d0) + ' · 1: ' + fmt1(d1) + ' · 2: ' + fmt1(d2) + ' · 3+: ' + fmt1(d3) + '">'
    +   '<i style="width:' + (d1*100).toFixed(2) + '%; background:var(--o1)"></i>'
    +   '<i style="width:' + (d2*100).toFixed(2) + '%; background:var(--o2)"></i>'
    +   '<i style="width:' + (d3*100).toFixed(2) + '%; background:var(--o3)"></i>'
    + '</div></td>';
    tr.querySelector(".gname span").textContent = g;
    tb.appendChild(tr);
  });
}

/* ---------------- render: diagnóstico ---------------- */
function renderTiles(){
  var N = totalCards(), n = handSize();
  var lv3 = groupCount("Lv.3"), tam = groupCount("Tamer");
  var heavy = groupCount("Lv.5") + groupCount("Lv.6") + groupCount("Lv.7");

  var sinLv3 = pExact(lv3, 0, N, n);
  var muerta = (N - lv3 - tam >= n) ? Math.exp(logC(N-lv3-tam, n) - logC(N,n)) : 0;
  var ladrillo = (heavy >= n) ? Math.exp(logC(heavy, n) - logC(N,n)) : 0;

  function sev(p, warnAt, critAt){ return p >= critAt ? "v-crit" : (p >= warnAt ? "v-warn" : "v-good"); }

  var tiles = [
    { lbl:T("Mano sin ningún Lv.3"), val:sinLv3, cls:sev(sinLv3,.22,.32), sub:T("No puedes subir de crianza a tiempo.") },
    { lbl:T("Sin Lv.3 y sin Tamer"), val:muerta, cls:sev(muerta,.06,.12), sub:T("Mano muerta: nada que hacer en el turno 1.") },
    { lbl:T("Solo Lv.5 / 6 / 7"), val:ladrillo, cls:sev(ladrillo,.01,.03), sub:T("Ladrillo: 5 cartas que no puedes pagar.") }
  ];
  var host = document.getElementById("tiles");
  host.textContent = "";
  tiles.forEach(function(t){
    var d = document.createElement("div");
    d.className = "tile";
    d.innerHTML = '<div class="lbl"></div><div class="val ' + t.cls + '">' + fmt1(t.val) + '</div><div class="sub"></div>';
    d.querySelector(".lbl").textContent = t.lbl;
    d.querySelector(".sub").textContent = t.sub;
    host.appendChild(d);
  });
}

/* ---------------- curva de costes ---------------- */
/* El coste ya estaba guardado en cada carta y solo se usaba para la casilla de
   "ladrillo". Aquí sirve para lo de siempre —ver la forma del mazo— y para lo
   que de verdad decide un turno 1: la probabilidad de abrir con algo pagable. */
function renderCurve(){
  var N = totalCards(), n = handSize();

  var porCoste = [], maxC = 0, maxQ = 0;
  S.cards.forEach(function(c){
    if (!c.q) return;
    var k = Math.max(0, Math.min(20, c.c | 0));
    porCoste[k] = (porCoste[k] || 0) + c.q;
    if (k > maxC) maxC = k;
    if (porCoste[k] > maxQ) maxQ = porCoste[k];
  });

  var host = document.getElementById("curve");
  host.textContent = "";
  if (!maxQ){
    host.innerHTML = '<div class="pk-empty">' + T("El mazo está vacío.") + '</div>';
    document.getElementById("afford").textContent = "";
    return;
  }

  for (var k = 0; k <= maxC; k++){
    var q = porCoste[k] || 0;
    var fila = document.createElement("div");
    fila.className = "cbar" + (q ? "" : " zero");
    fila.innerHTML = '<span class="cb-k mono"></span>'
      + '<span class="cb-track"><i style="width:' + (q / maxQ * 100).toFixed(1) + '%"></i></span>'
      + '<span class="cb-q mono"></span>';
    fila.querySelector(".cb-k").textContent = k;
    fila.querySelector(".cb-q").textContent = q || "";
    host.appendChild(fila);
  }

  // Acumulado: cuántas cartas se pueden pagar con N o menos, y con qué
  // probabilidad aparece al menos una en la mano inicial.
  var af = document.getElementById("afford");
  af.textContent = "";
  var acum = 0;
  for (var t = 0; t <= Math.min(maxC, 9); t++){
    acum += (porCoste[t] || 0);
    if (!acum) continue;               // aún no hay nada tan barato
    var p = pAtLeast(acum, 1, N, n);
    var chip = document.createElement("div");
    chip.className = "afchip";
    chip.innerHTML = '<span class="af-k mono"></span><span class="af-p mono"></span><span class="af-n"></span>';
    chip.querySelector(".af-k").textContent = "≤ " + t;
    chip.querySelector(".af-p").textContent = fmt1(p);
    chip.querySelector(".af-n").textContent = acum === 1 ? T("1 carta") : T("{n} cartas", { n:acum });
    af.appendChild(chip);
    if (p > 0.999) break;              // a partir de aquí ya es siempre que sí
  }
}

/* ---------------- impacto de una copia ---------------- */
/* Lo que la página no decía: qué cambiar. El tamaño del mazo se mantiene en 50,
   así que esto es el valor de mover un hueco de un grupo a otro. Ojo: por carta
   no tendría sentido calcularlo, porque el efecto sobre el grupo depende solo
   del total del grupo, y el efecto sobre la carta suelta ya está en la lista. */
function fmtPP(d){
  if (Math.abs(d) < 5e-4) return dec("0.0") + " pp";   // por debajo de 0,05 pp ya no se ve
  return (d > 0 ? "+" : "−") + dec((Math.abs(d) * 100).toFixed(1)) + " pp";
}

function renderMarginal(){
  var N = totalCards(), n = handSize();
  var tb = document.getElementById("marginal");
  tb.textContent = "";
  if (N < 2) return;

  var base = lineCounts();
  var pLinea = base.length ? pAllGroups(base, N, n) : 0;

  var filas = GROUPS.map(function(g){
    var k = groupCount(g);
    var p0 = k ? pAtLeast(k, 1, N, n) : 0;
    var pMas = pAtLeast(k + 1, 1, N, n);
    var pMenos = k > 0 ? (k - 1 ? pAtLeast(k - 1, 1, N, n) : 0) : 0;

    var dl = 0, i = S.line.indexOf(g);
    if (i >= 0 && base.length){
      var c2 = base.slice();
      c2[i] = c2[i] + 1;
      dl = pAllGroups(c2, N, n) - pLinea;
    }
    return { g:g, k:k, p0:p0, pMas:pMas, pMenos:pMenos, dl:dl };
  });

  filas.sort(function(a, b){
    if (b.dl !== a.dl) return b.dl - a.dl;
    return (b.pMas - b.p0) - (a.pMas - a.p0);
  });

  filas.forEach(function(f, idx){
    var tr = document.createElement("tr");
    if (idx === 0 && (f.dl > 0 || f.pMas > f.p0)) tr.className = "best";
    tr.innerHTML =
      '<td><span class="gname"><i class="sw" style="background:' + gcol(f.g) + '"></i><span></span></span></td>'
    + '<td class="mono">' + f.k + '</td>'
    + '<td class="big">' + (f.k ? fmt1(f.p0) : "—") + '</td>'
    + '<td>' + fmt1(f.pMas) + ' <span class="dd up">' + fmtPP(f.pMas - f.p0) + '</span></td>'
    + '<td>' + (f.k ? fmt1(f.pMenos) + ' <span class="dd down">' + fmtPP(f.pMenos - f.p0) + '</span>' : "—") + '</td>'
    + '<td>' + (f.dl > 0 ? '<span class="dd up">' + fmtPP(f.dl) + '</span>' : "—") + '</td>';
    tr.querySelector(".gname span").textContent = f.g;
    tb.appendChild(tr);
  });
}

/* ---------------- comparar mazos ---------------- */
/* El encabezado promete que dos mazos se pueden comparar sin ruido de muestreo;
   esto es lo que cumple la promesa. Se guarda una foto de las métricas, no el
   mazo entero, más la lista para poder volver a él. */
var REF_KEY = "dcg-ref";
var refDeck = (function(){
  try { return JSON.parse(localStorage.getItem(REF_KEY)) || null; } catch(e){ return null; }
})();

function guardarRef(){
  try { localStorage.setItem(REF_KEY, JSON.stringify(refDeck)); } catch(e){}
}

// dir: +1 si subir es mejor, -1 si subir es peor, 0 si es solo una cuenta.
// Las etiquetas se traducen al pintar, no aquí: esta lista se crea una sola vez
// y el idioma puede cambiar después.
var CMP_FILAS = [
  { k:"__N",      lbl:"Cartas en el mazo", dir:0, pct:false },
  { k:"__eggs",   lbl:"Digi-Egg",          dir:0, pct:false },
  { k:"linea",    lbl:"Línea completa",    dir:1, pct:true },
  { k:"sinLv3",   lbl:"Mano sin Lv.3",     dir:-1, pct:true },
  { k:"muerta",   lbl:"Sin Lv.3 ni Tamer", dir:-1, pct:true },
  { k:"ladrillo", lbl:"Solo Lv.5/6/7",     dir:-1, pct:true }
];

function metrics(){
  var N = totalCards(), n = handSize();
  var m = { __N:N, __eggs:eggCards() };
  GROUPS.forEach(function(g){
    var k = groupCount(g);
    m["g:" + g] = k ? pAtLeast(k, 1, N, n) : 0;
  });
  var counts = lineCounts();
  m.linea = counts.length ? pAllGroups(counts, N, n) : 0;
  var lv3 = groupCount("Lv.3"), tam = groupCount("Tamer");
  var heavy = groupCount("Lv.5") + groupCount("Lv.6") + groupCount("Lv.7");
  m.sinLv3 = pExact(lv3, 0, N, n);
  m.muerta = (N - lv3 - tam >= n) ? Math.exp(logC(N - lv3 - tam, n) - logC(N, n)) : 0;
  m.ladrillo = (heavy >= n) ? Math.exp(logC(heavy, n) - logC(N, n)) : 0;
  return m;
}

function renderCompare(){
  var host = document.getElementById("cmp");
  host.textContent = "";
  document.getElementById("ref-clear").hidden = !refDeck;
  document.getElementById("ref-load").hidden = !refDeck;
  document.getElementById("ref-set").textContent = refDeck
    ? T("Sustituir la referencia por este mazo") : T("Fijar este mazo como referencia");

  if (!refDeck){
    var v = document.createElement("p");
    v.className = "note";
    v.style.padding = "0";
    v.textContent = T("Fija este mazo como referencia, carga otro con el importador o el buscador, y aquí verás qué se gana y qué se pierde. Como todo es combinatoria exacta, la diferencia es la diferencia real entre los dos mazos, no ruido de un muestreo.");
    host.appendChild(v);
    return;
  }

  var cab = document.createElement("div");
  cab.className = "cmp-head";
  cab.innerHTML = '<span class="eyebrow">' + T("Referencia") + '</span>'
    + '<input class="cmp-nm" type="text" aria-label="' + T("Ponle un nombre") + '">'
    + '<span class="cmp-when mono"></span>';
  var nm = cab.querySelector(".cmp-nm");
  nm.value = refDeck.nombre || "";
  nm.placeholder = T("Ponle un nombre");
  nm.addEventListener("input", function(){ refDeck.nombre = this.value; guardarRef(); });
  cab.querySelector(".cmp-when").textContent = refDeck.cuando || "";
  host.appendChild(cab);

  var act = metrics(), ref = refDeck.m || {};

  var filas = CMP_FILAS.slice();
  GROUPS.forEach(function(g){
    filas.splice(2 + GROUPS.indexOf(g), 0, { k:"g:" + g, lbl:T("≥1 {g} en mano", { g:g }), dir:1, pct:true, g:g, listo:true });
  });

  var wrap = document.createElement("div");
  wrap.style.overflowX = "auto";
  var t = document.createElement("table");
  t.className = "gtable";
  t.innerHTML = "<thead><tr><th>" + T("Métrica") + "</th><th>" + T("Referencia")
    + "</th><th>" + T("Este mazo") + "</th><th>" + T("Diferencia") + "</th></tr></thead>";
  var tb = document.createElement("tbody");

  filas.forEach(function(f){
    var a = ref[f.k], b = act[f.k];
    if (typeof a !== "number" || typeof b !== "number") return;
    var d = b - a;
    var muestra = f.pct ? fmt1 : function(x){ return String(x); };
    // Mismo umbral para pintar y para redondear: si la diferencia no llega a
    // verse en el número, tampoco debe salir en color.
    var eps = f.pct ? 5e-4 : 1e-9;
    var igual = Math.abs(d) < eps;
    var cls = (f.dir && !igual) ? (d * f.dir > 0 ? "v-good" : "v-crit") : "";

    var tr = document.createElement("tr");
    tr.innerHTML = '<td class="cmp-lbl"></td>'
      + '<td class="mono">' + muestra(a) + '</td>'
      + '<td class="big">' + muestra(b) + '</td>'
      + '<td class="' + cls + '">' + (igual ? "=" : (f.pct ? fmtPP(d) : (d > 0 ? "+" : "−") + Math.abs(d))) + '</td>';
    var lbl = tr.querySelector(".cmp-lbl");
    if (f.g){
      lbl.innerHTML = '<span class="gname"><i class="sw" style="background:' + gcol(f.g) + '"></i><span></span></span>';
      lbl.querySelector(".gname span").textContent = f.listo ? f.lbl : T(f.lbl);
    } else {
      lbl.textContent = f.listo ? f.lbl : T(f.lbl);
    }
    tb.appendChild(tr);
  });

  t.appendChild(tb);
  wrap.appendChild(t);
  host.appendChild(wrap);
}

document.getElementById("ref-set").addEventListener("click", function(){
  var d = new Date();
  refDeck = {
    nombre: (refDeck && refDeck.nombre) || "",
    cuando: d.toLocaleDateString("es") + " " + d.toTimeString().slice(0,5),
    m: metrics(),
    lista: deckToList()
  };
  guardarRef();
  renderAll();
});
document.getElementById("ref-clear").addEventListener("click", function(){
  refDeck = null;
  try { localStorage.removeItem(REF_KEY); } catch(e){}
  renderAll();
});
document.getElementById("ref-load").addEventListener("click", function(){
  if (!refDeck || !refDeck.lista) return;
  var imp = document.getElementById("importer");
  if (imp) imp.open = true;
  document.getElementById("imp-text").value = refDeck.lista;
  impSay(T("Lista de la referencia volcada. Pulsa «Cargar lista» para montarla."));
  document.getElementById("imp-text").scrollIntoView({ block:"center" });
});

/* ---------------- gráfico por turno ---------------- */
var TURNS = 10;
function seenAt(turn){
  // cartas vistas al final de la fase de robo del turno indicado
  var extra = S.first ? (turn - 1) : turn;
  return Math.min(totalCards(), handSize() + Math.max(0, extra));
}
function seriesData(){
  var N = totalCards();
  return GROUPS.filter(function(g){ return groupCount(g) > 0; }).map(function(g){
    var k = groupCount(g);
    var pts = [];
    for (var t = 1; t <= TURNS; t++) pts.push(pAtLeast(k, 1, N, seenAt(t)));
    return { g:g, k:k, pts:pts, on:S.series.indexOf(g) !== -1, col:gcolResolved(g) };
  });
}

var PAD = { l:46, r:74, t:16, b:34 };
var W = 960, H = 330;
function xAt(t){ return PAD.l + (t-1) / (TURNS-1) * (W - PAD.l - PAD.r); }
function yAt(p){ return PAD.t + (1-p) * (H - PAD.t - PAD.b); }

function renderChart(){
  var data = seriesData();
  var svg = document.getElementById("chart");
  var ink2 = getComputedStyle(document.documentElement).getPropertyValue("--ink-2").trim();
  var muted = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
  var line = getComputedStyle(document.documentElement).getPropertyValue("--line").trim();
  var surf = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim();

  var s = "";
  // rejilla + eje Y
  [0,.25,.5,.75,1].forEach(function(p){
    var y = yAt(p);
    s += '<line x1="' + PAD.l + '" y1="' + y.toFixed(1) + '" x2="' + (W-PAD.r) + '" y2="' + y.toFixed(1)
       + '" stroke="' + line + '" stroke-width="1"/>';
    s += '<text x="' + (PAD.l-10) + '" y="' + (y+4).toFixed(1) + '" text-anchor="end" fill="' + muted
       + '" font-family="IBM Plex Mono, monospace" font-size="11">' + (p*100) + '%</text>';
  });
  // eje X
  for (var t = 1; t <= TURNS; t++){
    var x = xAt(t);
    s += '<text x="' + x.toFixed(1) + '" y="' + (H-PAD.b+20) + '" text-anchor="middle" fill="' + muted
       + '" font-family="IBM Plex Mono, monospace" font-size="11">' + t + '</text>';
  }
  s += '<text x="' + PAD.l + '" y="' + (H-2) + '" fill="' + muted
     + '" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.4">TURNO</text>';

  // líneas
  var on = data.filter(function(d){ return d.on; });
  on.forEach(function(d){
    var path = d.pts.map(function(p,i){ return (i ? "L" : "M") + xAt(i+1).toFixed(1) + " " + yAt(p).toFixed(1); }).join(" ");
    s += '<path d="' + path + '" fill="none" stroke="' + d.col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    d.pts.forEach(function(p,i){
      s += '<circle cx="' + xAt(i+1).toFixed(1) + '" cy="' + yAt(p).toFixed(1) + '" r="3.2" fill="' + d.col
         + '" stroke="' + surf + '" stroke-width="2"/>';
    });
  });
  // etiquetas directas, separadas para que no colisionen
  var labels = on.map(function(d){ return { g:d.g, col:d.col, y:yAt(d.pts[TURNS-1]) }; })
                 .sort(function(a,b){ return a.y - b.y; });
  for (var i = 1; i < labels.length; i++){
    if (labels[i].y - labels[i-1].y < 15) labels[i].y = labels[i-1].y + 15;
  }
  labels.forEach(function(l){
    s += '<text x="' + (W-PAD.r+12) + '" y="' + (l.y+4).toFixed(1) + '" fill="' + l.col
       + '" font-family="IBM Plex Sans, sans-serif" font-size="12" font-weight="600">' + l.g + '</text>';
  });
  if (!on.length){
    s += '<text x="' + (W/2) + '" y="' + (H/2) + '" text-anchor="middle" fill="' + muted
       + '" font-family="IBM Plex Sans, sans-serif" font-size="13">Activa un grupo abajo para dibujarlo</text>';
  }
  // capa de hover
  s += '<line id="cross" x1="0" y1="' + PAD.t + '" x2="0" y2="' + (H-PAD.b) + '" stroke="' + ink2
     + '" stroke-width="1" stroke-dasharray="3 3" opacity="0"/>';
  s += '<rect id="hit" x="' + PAD.l + '" y="' + PAD.t + '" width="' + (W-PAD.l-PAD.r) + '" height="' + (H-PAD.t-PAD.b)
     + '" fill="transparent" style="cursor:crosshair"/>';
  svg.innerHTML = s;

  wireHover(on);
  renderLegend(data);
  renderChartTable(data);
}

function wireHover(on){
  var svg = document.getElementById("chart");
  var hit = svg.querySelector("#hit");
  var cross = svg.querySelector("#cross");
  var tip = document.getElementById("tip");
  var wrap = document.getElementById("chart-wrap");
  if (!hit) return;

  function move(ev){
    var box = svg.getBoundingClientRect();
    var px = (ev.clientX - box.left) / box.width * W;
    var t = Math.round((px - PAD.l) / (W - PAD.l - PAD.r) * (TURNS-1)) + 1;
    t = Math.max(1, Math.min(TURNS, t));
    cross.setAttribute("x1", xAt(t)); cross.setAttribute("x2", xAt(t));
    cross.setAttribute("opacity", "1");

    var html = '<div class="t-h">' + T("Turno {t} · {n} cartas vistas", { t:t, n:seenAt(t) }) + '</div>';
    on.forEach(function(d){
      html += '<div class="t-r"><span class="t-n"><i style="background:' + d.col + '"></i>' + d.g + '</span><b>'
            + fmt1(d.pts[t-1]) + '</b></div>';
    });
    tip.innerHTML = html;
    tip.style.opacity = "1";
    var wb = wrap.getBoundingClientRect();
    var lx = (xAt(t) / W) * box.width + (box.left - wb.left);
    var tw = tip.offsetWidth;
    tip.style.left = Math.max(4, Math.min(wb.width - tw - 4, lx - tw/2)) + "px";
    tip.style.top = "14px";
  }
  hit.addEventListener("mousemove", move);
  hit.addEventListener("mouseleave", function(){
    tip.style.opacity = "0"; cross.setAttribute("opacity","0");
  });
}

function renderLegend(data){
  var host = document.getElementById("legend");
  host.textContent = "";
  data.forEach(function(d){
    var b = document.createElement("button");
    b.className = "chip";
    b.setAttribute("aria-pressed", d.on ? "true" : "false");
    b.innerHTML = '<i style="background:' + d.col + '"></i><span></span>';
    b.querySelector("span").textContent = d.g + " (" + d.k + ")";
    b.addEventListener("click", function(){
      var i = S.series.indexOf(d.g);
      if (i === -1) S.series.push(d.g); else S.series.splice(i,1);
      renderChart();
    });
    host.appendChild(b);
  });
}

function renderChartTable(data){
  var host = document.getElementById("tblview");
  host.hidden = !showTable;
  if (!showTable) return;
  var h = '<table><thead><tr><th>Grupo</th><th>Copias</th>';
  for (var t = 1; t <= TURNS; t++) h += "<th>T" + t + "</th>";
  h += "</tr></thead><tbody>";
  data.forEach(function(d){
    h += '<tr><td>' + d.g + '</td><td class="mono">' + d.k + '</td>';
    d.pts.forEach(function(p){ h += '<td class="mono">' + fmt1(p) + "</td>"; });
    h += "</tr>";
  });
  h += "</tbody></table>";
  host.innerHTML = h;
}

/* ---------------- línea completa ---------------- */
function secSize(){ return Math.max(0, Math.min(S.sec, Math.max(0, totalCards() - handSize()))); }

// P(al menos una de CADA grupo) por inclusión-exclusión sobre grupos disjuntos
function pAllGroups(counts, N, n){
  var m = counts.length;
  if (!m) return 1;
  var tot = 0;
  for (var mask = 0; mask < (1 << m); mask++){
    var k = 0, bits = 0;
    for (var i = 0; i < m; i++) if (mask & (1 << i)) { k += counts[i]; bits++; }
    var term = (N - k >= n) ? Math.exp(logC(N - k, n) - logC(N, n)) : 0;
    tot += (bits % 2 ? -1 : 1) * term;
  }
  return Math.max(0, Math.min(1, tot));
}
function lineCounts(){
  return S.line.map(function(g){ return groupCount(g); });
}

function renderLine(){
  var N = totalCards(), n = handSize();
  var host = document.getElementById("line-chips");
  host.textContent = "";
  GROUPS.forEach(function(g){
    if (!groupCount(g)) return;
    var on = S.line.indexOf(g) !== -1;
    var b = document.createElement("button");
    b.className = "chip";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.innerHTML = '<i style="background:' + gcol(g) + '"></i><span></span>';
    b.querySelector("span").textContent = g;
    b.addEventListener("click", function(){
      var i = S.line.indexOf(g);
      if (i === -1) S.line.push(g); else S.line.splice(i, 1);
      renderAll();
    });
    host.appendChild(b);
  });

  var counts = lineCounts();
  var p = counts.length ? pAllGroups(counts, N, n) : 0;
  document.getElementById("line-p").textContent = counts.length ? fmt1(p) : "—";
  document.getElementById("line-cap").textContent = counts.length
    ? T("de abrir con {x} en la misma mano de {n}.", { x:S.line.join(" + "), n:n })
    : T("Elige arriba qué niveles debe traer la línea.");
  document.getElementById("line-mull").textContent = counts.length ? fmt1(1 - Math.pow(1 - p, 2)) : "—";

  var strip = document.getElementById("line-turns");
  strip.textContent = "";
  var steps = [["MANO", n]];
  for (var t = 1; t <= 7; t++) steps.push(["T" + t, seenAt(t)]);
  steps.forEach(function(st, i){
    var pt = counts.length ? pAllGroups(counts, N, st[1]) : 0;
    var d = document.createElement("div");
    d.className = "ts";
    if (!i) d.style.background = "var(--accent-soft)";
    d.innerHTML = '<div class="t"></div><div class="p"></div>';
    d.querySelector(".t").textContent = st[0];
    d.querySelector(".p").textContent = counts.length ? (pt * 100).toFixed(0) + "%" : "—";
    d.title = st[1] === 1 ? T("1 carta") : T("{n} cartas", { n:st[1] });
    strip.appendChild(d);
  });

  // cascada: lo que cuesta cada eslabón añadido
  var chain = ["Lv.3","Lv.4","Lv.5","Lv.6","Lv.7"].filter(function(g){ return groupCount(g) > 0; });
  var casc = document.getElementById("line-cascade");
  casc.textContent = "";
  for (var L = 2; L <= chain.length; L++){
    var pre = chain.slice(0, L);
    var pp = pAllGroups(pre.map(function(g){ return groupCount(g); }), N, n);
    var row = document.createElement("div");
    row.className = "casc-row";
    row.innerHTML = '<span class="lbl"></span><span class="bar"><i></i></span><b></b>';
    row.querySelector(".lbl").textContent = pre.join(" → ");
    row.querySelector("i").style.width = (pp * 100).toFixed(1) + "%";
    row.querySelector("b").textContent = fmt1(pp);
    casc.appendChild(row);
  }
}

/* ---------------- seguridad ---------------- */
function renderSecurity(){
  var N = totalCards(), n = handSize(), sec = secSize();
  document.getElementById("sec-n").textContent = S.sec;
  document.getElementById("wall-any-lbl").textContent = T("Alguna de las {s} lo frena", { s:sec });

  var tb = document.getElementById("secbody");
  tb.textContent = "";
  GROUPS.forEach(function(g){
    var k = groupCount(g);
    if (!k) return;
    var pSec = sec ? pAtLeast(k, 1, N, sec) : 0;
    var esp = sec ? sec * k / N : 0;
    var top = n + sec;
    var enMazo = (N - k >= top) ? Math.exp(logC(N - k, top) - logC(N, top)) : 0;

    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td><div class="gname"><i class="sw" style="background:' + gcol(g) + '"></i><span></span></div></td>'
    + '<td class="big">' + fmt1(pSec) + '</td>'
    + '<td class="mono" style="color:var(--muted)">' + esp.toFixed(2).replace(".", ",") + '</td>'
    + '<td class="mono" style="color:var(--muted)">' + fmt1(enMazo) + '</td>';
    tr.querySelector(".gname span").textContent = g;
    tb.appendChild(tr);
  });

  // muro: un Digimon de seguridad frena si su DP iguala o supera al atacante (el empate mata a los dos)
  var dp = S.dp, walls = 0;
  S.cards.forEach(function(c){ if (c.dp && c.dp >= dp) walls += c.q; });
  document.getElementById("dp-n").textContent = num(dp);
  document.getElementById("wall-1").textContent = N ? fmt1(walls / N) : "—";
  document.getElementById("wall-any").textContent = sec ? fmt1(pAtLeast(walls, 1, N, sec)) : "—";
  document.getElementById("wall-note").textContent =
    T("{w} de {N} cartas del mazo son Digimon con {dp} DP o más.", { w:walls, N:N, dp:num(dp) });
}

/* ---------------- simulador ---------------- */
var sim = { hand:[], sec:[], reveal:false, runs:0, hit:{lv3:0, tamer:0, line:0, dead:0}, sig:null };
function deckSig(){
  return S.cards.map(function(c){ return c.g + ":" + c.q; }).join("|")
       + "#" + handSize() + "#" + S.line.slice().sort().join(",");
}

function pool(){
  var out = [];
  S.cards.forEach(function(c){ for (var i = 0; i < c.q; i++) out.push(c); });
  return out;
}
function drawHand(){
  var a = pool();
  for (var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  var n = handSize(), sec = secSize();
  sim.hand = a.slice(0, n);
  sim.sec  = a.slice(n, n + sec);
  tallyOne(sim.hand);
  renderSim();
}
function tallyOne(hand){
  var has = {};
  hand.forEach(function(c){ has[c.g] = true; });
  sim.runs++;
  if (has["Lv.3"]) sim.hit.lv3++;
  if (has["Tamer"]) sim.hit.tamer++;
  if (!has["Lv.3"] && !has["Tamer"]) sim.hit.dead++;
  var ok = S.line.length > 0;
  S.line.forEach(function(g){ if (!has[g]) ok = false; });
  if (ok) sim.hit.line++;
}
function simBatch(runs){
  var gi = [], N = 0;
  S.cards.forEach(function(c){
    var idx = GROUPS.indexOf(c.g);
    for (var i = 0; i < c.q; i++){ gi.push(idx); N++; }
  });
  var n = Math.min(handSize(), N);
  if (!N) return;
  var need = S.line.map(function(g){ return GROUPS.indexOf(g); });
  var seen = new Int32Array(GROUPS.length);
  for (var r = 0; r < runs; r++){
    seen.fill(0);
    for (var i = 0; i < n; i++){
      var j = i + Math.floor(Math.random() * (N - i));
      var t = gi[i]; gi[i] = gi[j]; gi[j] = t;
      seen[gi[i]]++;
    }
    sim.runs++;
    if (seen[0]) sim.hit.lv3++;
    if (seen[5]) sim.hit.tamer++;
    if (!seen[0] && !seen[5]) sim.hit.dead++;
    var ok = need.length > 0;
    for (var q = 0; q < need.length; q++) if (!seen[need[q]]) { ok = false; break; }
    if (ok) sim.hit.line++;
  }
  renderSim();
}

function pcard(c, hidden){
  var d = document.createElement("div");
  // La carta boca abajo mantiene el mismo alto que la de cara, para que
  // revelar la seguridad no dé un salto de maquetación.
  if (hidden){
    d.className = "pcard back";
    d.innerHTML = '<div class="pimg"><span>⚡</span></div>'
                + '<div class="pn">Boca abajo</div><div class="pm">seguridad</div>';
    return d;
  }
  d.className = "pcard";
  d.style.borderTopColor = gcol(c.g);
  d.innerHTML = '<div class="pimg ' + artClass(c) + '"></div>'
              + '<div class="pn"></div><div class="pm"></div>';
  d.querySelector(".pn").textContent = c.n || T("(sin nombre)");
  d.querySelector(".pm").textContent = c.g + " · " + c.c + (c.dp ? " · " + (c.dp/1000) + "k" : "");
  if (c.id) d.title = c.n + " · " + c.id;
  return d;
}

function renderSim(){
  var N = totalCards(), n = handSize(), sec = secSize();
  var sg = deckSig();
  if (sim.sig !== null && sim.sig !== sg && sim.runs){
    sim.runs = 0; sim.hit = {lv3:0, tamer:0, line:0, dead:0};
  }
  sim.sig = sg;
  document.getElementById("hand-lbl").textContent = "· " + n;
  document.getElementById("sec-lbl").textContent = "· " + sec;

  var hh = document.getElementById("sim-hand");
  var ss = document.getElementById("sim-sec");
  hh.textContent = ""; ss.textContent = "";
  if (!sim.hand.length){
    hh.innerHTML = '<div class="note" style="padding:0">'
      + T("Pulsa <b>Barajar y robar</b> para repartir una mano de este mazo.") + '</div>';
  } else {
    sim.hand.forEach(function(c){ hh.appendChild(pcard(c, false)); });
    sim.sec.forEach(function(c){ ss.appendChild(pcard(c, !sim.reveal)); });
  }

  var v = document.getElementById("verdicts");
  v.textContent = "";
  if (sim.hand.length){
    var has = {};
    sim.hand.forEach(function(c){ has[c.g] = true; });
    var checks = [["Lv.3", !!has["Lv.3"]], ["Tamer", !!has["Tamer"]]];
    var lineOk = S.line.length > 0;
    S.line.forEach(function(g){ if (!has[g]) lineOk = false; });
    checks.push([T("Línea completa"), lineOk]);
    checks.forEach(function(c){
      var b = document.createElement("span");
      b.className = "vd " + (c[1] ? "yes" : "no");
      b.textContent = (c[1] ? "✓ " : "✗ ") + c[0];
      v.appendChild(b);
    });
  }

  document.getElementById("runs-lbl").textContent =
    sim.runs === 1 ? T("· 1 mano") : T("· {n} manos", { n:num(sim.runs) });

  var lv3 = groupCount("Lv.3"), tam = groupCount("Tamer");
  var exactDead = (N - lv3 - tam >= n) ? Math.exp(logC(N - lv3 - tam, n) - logC(N, n)) : 0;
  var rows = [
    [T("Con algún Lv.3"), sim.hit.lv3, pAtLeast(lv3, 1, N, n)],
    [T("Con algún Tamer"), sim.hit.tamer, pAtLeast(tam, 1, N, n)],
    [T("Con la línea completa"), sim.hit.line, S.line.length ? pAllGroups(lineCounts(), N, n) : 0],
    [T("Mano muerta"), sim.hit.dead, exactDead]
  ];
  var host = document.getElementById("tally");
  host.textContent = "";
  rows.forEach(function(r){
    var obs = sim.runs ? r[1] / sim.runs : 0;
    var d = document.createElement("div");
    d.className = "tl";
    d.innerHTML = '<div class="k"></div><div class="v"><b></b><em></em></div>';
    d.querySelector(".k").textContent = r[0];
    d.querySelector("b").textContent = sim.runs ? fmt1(obs) : "—";
    d.querySelector("em").textContent = T("exacto {p}", { p: fmt1(r[2]) });
    host.appendChild(d);
  });
}

/* ---------------- controles ---------------- */
function setPressed(id, v){ document.getElementById(id).setAttribute("aria-pressed", v ? "true" : "false"); }

/* ---------------- tema ---------------- */
/* Tres estados, no dos: sin elección la página sigue al sistema, que es lo que
   ya hacía. «Claro» y «Oscuro» la fijan y se recuerdan en este navegador. */
var THEME_KEY = "dcg-theme";

function currentTheme(){ return document.documentElement.getAttribute("data-theme") || "auto"; }

function renderTheme(){
  var t = currentTheme();
  setPressed("theme-auto",  t === "auto");
  setPressed("theme-light", t === "light");
  setPressed("theme-dark",  t === "dark");
}

function setTheme(t){
  if (t === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
  try {
    if (t === "auto") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, t);
  } catch(e){}   // navegador sin almacenamiento: el tema vale para esta pestaña
  renderTheme();
  renderChart();  // el gráfico dibuja con colores ya resueltos, no con variables
}

document.getElementById("theme-auto").addEventListener("click", function(){ setTheme("auto"); });
document.getElementById("theme-light").addEventListener("click", function(){ setTheme("light"); });
document.getElementById("theme-dark").addEventListener("click", function(){ setTheme("dark"); });

document.getElementById("hand-minus").addEventListener("click", function(){
  S.hand = Math.max(1, S.hand - 1); renderAll();
});
document.getElementById("hand-plus").addEventListener("click", function(){
  S.hand = Math.min(12, S.hand + 1); renderAll();
});
document.getElementById("mull-on").addEventListener("click", function(){ S.mull = true; renderAll(); });
document.getElementById("mull-off").addEventListener("click", function(){ S.mull = false; renderAll(); });
document.getElementById("go-first").addEventListener("click", function(){ S.first = true; renderAll(); });
document.getElementById("go-second").addEventListener("click", function(){ S.first = false; renderAll(); });
document.getElementById("tbl-toggle").addEventListener("click", function(){
  showTable = !showTable;
  this.setAttribute("aria-pressed", showTable ? "true" : "false");
  this.textContent = showTable ? T("Ocultar tabla") : T("Ver tabla");
  renderChart();
});
document.getElementById("reset-btn").addEventListener("click", function(){
  S = withDefaults(JSON.parse(JSON.stringify(INITIAL))); renderAll();
});
document.getElementById("sec-minus").addEventListener("click", function(){ S.sec = Math.max(0, S.sec - 1); renderAll(); });
document.getElementById("sec-plus").addEventListener("click", function(){ S.sec = Math.min(15, S.sec + 1); renderAll(); });
document.getElementById("dp-minus").addEventListener("click", function(){ S.dp = Math.max(1000, S.dp - 1000); renderSecurity(); });
document.getElementById("dp-plus").addEventListener("click", function(){ S.dp = Math.min(30000, S.dp + 1000); renderSecurity(); });
document.getElementById("draw-btn").addEventListener("click", drawHand);
document.getElementById("reveal-btn").addEventListener("click", function(){
  sim.reveal = !sim.reveal;
  this.setAttribute("aria-pressed", sim.reveal ? "true" : "false");
  this.textContent = sim.reveal ? T("Ocultar seguridad") : T("Revelar seguridad");
  renderSim();
});
document.getElementById("sim1k").addEventListener("click", function(){ simBatch(1000); });
document.getElementById("sim-reset").addEventListener("click", function(){
  sim.runs = 0; sim.hit = {lv3:0, tamer:0, line:0, dead:0}; renderSim();
});

/* ---------------- importar / exportar listas ---------------- */
/* El formato es el estándar del juego: una línea por carta, "copias nombre ID".
   El ID es lo único que importa —el nivel, el coste y los DP salen del
   catálogo—, así que un nombre mal escrito o partido en dos líneas no rompe
   nada. Sin catálogo el importador se apaga en vez de adivinar. */

/* Índices de grupo que usa el catálogo compilado. Los tres primeros valores los
   fija build.mjs / dev/compilar.ps1: si cambian allí, cambian aquí. */
var EGG_G       = GROUPS.length;       // 7 · Lv.2, va al mazo de huevos
var OUT_OF_DECK = GROUPS.length + 1;   // 8 · ni en las 50 ni en los huevos

var CARD_ROWS = [];   // el catálogo entero, en orden, para el selector
var CARD_DB = (function(){
  var by = {}, el = document.getElementById("card-db"), rows = [];
  try { rows = JSON.parse(el.textContent) || []; } catch(e){ rows = []; }
  for (var i = 0; i < rows.length; i++) by[rows[i][0].toUpperCase()] = rows[i];
  by.__n = rows.length;
  CARD_ROWS = rows;
  return by;
})();

/* ---------------- selector de cartas ---------------- */
/* El catálogo entero ya viaja dentro de la página, así que añadir una carta no
   tiene por qué ser escribir el nombre a mano: se busca por nombre o por ID, y
   se puede acotar a una expansión.

   La expansión sale del propio ID —BT24-101 es de BT24— porque así están
   numeradas las cartas. Los 66 prefijos distintos del catálogo son exactamente
   las 66 expansiones, de modo que esto no cuesta ni un byte de datos extra. */
var SET_FAMILIES = { BT:"Booster", EX:"Extra Booster", ST:"Starter Deck",
                     AD:"Advanced Booster", RB:"Reboot Booster", LM:"Limited",
                     P:"Promo" };
var SET_ORDER = ["BT","EX","ST","AD","RB","LM","P"];

function setCode(id){
  var m = String(id).match(/^([A-Z]{1,3}\d{0,2})-/);
  return m ? m[1] : "";
}
function setLabel(code){
  var fam = code.match(/^([A-Z]+)/);
  var nombre = fam ? SET_FAMILIES[fam[1]] : null;
  return nombre ? code + " · " + T(nombre) : code;
}
function setSortKey(code){
  var m = code.match(/^([A-Z]+)(\d*)$/);
  var fam = m ? m[1] : code;
  var num = (m && m[2]) ? parseInt(m[2], 10) : 0;
  var fi = SET_ORDER.indexOf(fam);
  return (fi < 0 ? 99 : fi) * 1000 + num;
}

// El código de expansión de cada fila, calculado una sola vez: filtrar 4412
// cartas en cada tecla no es momento de andar lanzando expresiones regulares.
var CARD_SETC = CARD_ROWS.map(function(r){ return setCode(r[0]); });

var SET_LIST = (function(){
  var vistos = {}, out = [];
  for (var i = 0; i < CARD_SETC.length; i++){
    var c = CARD_SETC[i];
    if (c && !vistos[c]){ vistos[c] = true; out.push(c); }
  }
  out.sort(function(a,b){ return setSortKey(a) - setSortKey(b); });
  return out;
})();

/* Estado del selector abierto. Vive fuera del DOM porque renderDeck() rehace la
   lista entera en cada cambio, y el panel tiene que sobrevivir a eso: si no,
   añadir una carta cerraría el selector y habría que reabrirlo para la siguiente. */
var picker = null;   // { anchor, gIndex, isEgg, q, set, msg }
var PICK_MAX = 60;   // filas pintadas; el resto se cuenta pero no se dibuja

function abrirPicker(anchor, gIndex, isEgg){
  // Volver a pulsar el mismo botón lo cierra.
  if (picker && picker.anchor === anchor){ picker = null; }
  else picker = { anchor:anchor, gIndex:gIndex, isEgg:isEgg, q:"", set:"", msg:"" };
  renderAll();
}

function pickerFiltrar(){
  var q = picker.q.trim().toUpperCase();
  var res = [], total = 0;
  for (var i = 0; i < CARD_ROWS.length; i++){
    var r = CARD_ROWS[i];
    if (picker.gIndex !== null && r[2] !== picker.gIndex) continue;
    if (picker.set && CARD_SETC[i] !== picker.set) continue;
    if (q && r[1].toUpperCase().indexOf(q) < 0 && r[0].indexOf(q) < 0) continue;
    total++;
    if (res.length < PICK_MAX) res.push(r);
  }
  return { filas: res, total: total };
}

// Añade del catálogo. Si la carta ya está, sube una copia en vez de duplicar la
// fila. Devuelve un aviso cuando no se puede, o null si entró.
function addFromCatalog(rec){
  var esHuevo = (rec[2] === EGG_G);
  var arr = esHuevo ? S.eggs : S.cards;

  if (esHuevo && eggCards() >= EGG_MAX){
    return T("El mazo de huevos ya tiene {n} cartas.", { n: EGG_MAX });
  }
  for (var i = 0; i < arr.length; i++){
    if (arr[i].id === rec[0]){
      if (arr[i].q >= COPY_MAX) return T("Ya hay {n} copias de {c}.", { n: COPY_MAX, c: rec[1] });
      arr[i].q++;
      return null;
    }
  }
  arr.push({ n:rec[1], g: esHuevo ? EGG_GROUP : GROUPS[rec[2]],
             c:rec[3], dp:rec[4], q:1, id:rec[0] });
  return null;
}

function renderPickerLista(host){
  var r = pickerFiltrar();
  host.textContent = "";

  if (!r.total){
    var v = document.createElement("div");
    v.className = "pk-empty";
    v.textContent = T("Ninguna carta coincide.");
    host.appendChild(v);
    return r;
  }

  r.filas.forEach(function(rec){
    var esHuevo = (rec[2] === EGG_G);
    var b = document.createElement("button");
    b.className = "pk-row";
    b.innerHTML =
      '<span class="thumb ' + artClass({ id:rec[0] }) + '"></span>'
    + '<span class="pk-info"><span class="pk-nm"></span>'
    +   '<span class="pk-meta"><span class="pk-g"></span><span class="cid"></span></span></span>'
    + '<span class="pk-add">+</span>';
    b.querySelector(".pk-nm").textContent = rec[1];
    b.querySelector(".cid").textContent = rec[0];

    var g = esHuevo ? EGG_GROUP : (GROUPS[rec[2]] || "—");
    var bits = [g];
    if (rec[3]) bits.push("coste " + rec[3]);
    if (rec[4]) bits.push(num(rec[4]) + " DP");
    b.querySelector(".pk-g").textContent = bits.join(" · ");

    b.addEventListener("click", function(){
      picker.msg = addFromCatalog(rec) || "";
      renderAll();
    });
    host.appendChild(b);
  });

  if (r.total > r.filas.length){
    var mas = document.createElement("div");
    mas.className = "pk-empty";
    mas.textContent = T("…y {n} más. Afina la búsqueda.", { n: r.total - r.filas.length });
    host.appendChild(mas);
  }
  return r;
}

function renderPicker(){
  var box = document.createElement("div");
  box.className = "picker";

  var head = document.createElement("div");
  head.className = "pk-head";
  head.innerHTML =
    '<input class="pk-q" type="search" placeholder="' + T("Nombre o ID de la carta…") + '" aria-label="' + T("Buscar carta por nombre o ID") + '">'
  + '<select class="pk-set" aria-label="Expansión"></select>'
  + '<button class="pk-x" title="' + T("Cerrar") + '" aria-label="' + T("Cerrar el selector") + '">×</button>';
  box.appendChild(head);

  var sel = head.querySelector(".pk-set");
  var op0 = document.createElement("option");
  op0.value = ""; op0.textContent = T("Todas las expansiones");
  sel.appendChild(op0);
  SET_LIST.forEach(function(c){
    var o = document.createElement("option");
    o.value = c; o.textContent = setLabel(c);
    sel.appendChild(o);
  });
  sel.value = picker.set;

  var lista = document.createElement("div");
  lista.className = "pk-list";
  box.appendChild(lista);

  var foot = document.createElement("div");
  foot.className = "pk-foot";
  foot.innerHTML = '<span class="pk-count"></span>'
    + '<button class="btn ghost tiny pk-blank">' + T("Añadir carta en blanco") + '</button>';
  box.appendChild(foot);

  var q = head.querySelector(".pk-q");
  var cuenta = foot.querySelector(".pk-count");

  function repintar(){
    var r = renderPickerLista(lista);
    var txt = r.total === 1 ? T("1 carta") : T("{n} cartas", { n: r.total });
    cuenta.textContent = picker.msg ? picker.msg : txt;
    cuenta.classList.toggle("warn", !!picker.msg);
  }

  q.value = picker.q;
  q.addEventListener("input", function(){
    picker.q = this.value; picker.msg = "";
    repintar();
  });
  q.addEventListener("keydown", function(e){
    if (e.key === "Escape"){ picker = null; renderAll(); }
  });
  sel.addEventListener("change", function(){
    picker.set = this.value; picker.msg = "";
    repintar();
  });
  head.querySelector(".pk-x").addEventListener("click", function(){
    picker = null; renderAll();
  });
  foot.querySelector(".pk-blank").addEventListener("click", function(){
    if (picker.isEgg){
      if (eggCards() >= EGG_MAX){ picker.msg = T("El mazo de huevos ya tiene {n} cartas.", { n:EGG_MAX }); repintar(); return; }
      S.eggs.push({ n:"", g:EGG_GROUP, c:0, dp:0, q:1 });
      focusEgg = S.eggs.length - 1;
    } else {
      S.cards.push({ n:"", g:GROUPS[picker.gIndex], c:0, dp:0, q:1 });
      focusIdx = S.cards.length - 1;
    }
    picker = null;
    renderAll();
  });

  repintar();
  return box;
}

// Los IDs van de "P-194" a "BT24-101": una o dos letras, hasta dos dígitos de
// set, guion y el número de carta.
var ID_RE = /\b([A-Z]{1,3}\d{0,2}-\d{1,3})\b/;

function parseList(text){
  var out = [], issues = [];
  var lines = String(text).split(/\r?\n/);
  var pend = null;   // línea con copias pero sin ID todavía: el nombre sigue abajo

  function dropPending(){
    if (!pend) return;
    issues.push({ kind:"bad", ln:pend.ln, line:pend.raw, why:T("sin ID de carta") });
    pend = null;
  }

  for (var i = 0; i < lines.length; i++){
    var ln = i + 1;
    var line = lines[i].trim();
    if (!line || line.indexOf("//") === 0 || line.charAt(0) === "#") continue;

    var idm = line.toUpperCase().match(ID_RE);
    var qm  = line.match(/^(\d{1,2})\s*[xX]?\s+/);

    if (!idm){
      // Copias sin ID: o el nombre sigue en la línea de abajo, o la anterior
      // se quedó huérfana y hay que decirlo.
      if (qm) { dropPending(); pend = { q:parseInt(qm[1],10), ln:ln, raw:line }; }
      else if (pend) pend.raw += " " + line;          // el nombre venía partido
      else issues.push({ kind:"bad", ln:ln, line:line, why:T("sin ID de carta") });
      continue;
    }

    // Con ID y copias propias, lo que hubiera pendiente nunca llegó a tener ID.
    if (qm) dropPending();
    var q = qm ? parseInt(qm[1], 10) : (pend ? pend.q : 1);
    if (!qm && !pend) issues.push({ kind:"warn", ln:ln, line:line, why:T("sin número de copias, se asume 1") });
    pend = null;
    out.push({ id: idm[1], q: q, ln: ln, line: line });
  }
  dropPending();
  return { entries: out, issues: issues };
}

// Convierte lo parseado en cartas del mazo. Junta las repetidas por ID, aparta
// los Digi-Egg en su propio mazo y deja fuera el resto, diciendo siempre por qué.
function resolveList(parsed){
  var cards = [], eggs = [], byId = {}, issues = parsed.issues.slice();

  parsed.entries.forEach(function(e){
    var rec = CARD_DB[e.id.toUpperCase()];
    if (!rec){
      issues.push({ kind:"bad", ln:e.ln, line:e.line, why:T("no está en el catálogo") });
      return;
    }
    if (rec[2] === OUT_OF_DECK){
      issues.push({ kind:"warn", ln:e.ln, line:e.line, why:T("carta sin nivel: fuera del mazo") });
      return;
    }
    var prev = byId[rec[0]];
    if (prev){ prev.q += e.q; return; }
    var esHuevo = (rec[2] === EGG_G);
    var c = { n:rec[1], g:esHuevo ? EGG_GROUP : GROUPS[rec[2]], c:rec[3], dp:rec[4],
              q:e.q, id:rec[0], ln:e.ln };
    byId[rec[0]] = c;
    (esHuevo ? eggs : cards).push(c);
  });

  function capCopias(c){
    if (c.q > COPY_MAX){
      issues.push({ kind:"warn", ln:c.ln, line:c.q + " " + c.n + " " + c.id,
                    why:T("más de {n} copias, se recorta a {n}", { n: COPY_MAX }) });
      c.q = COPY_MAX;
    }
  }
  cards.forEach(capCopias);
  eggs.forEach(capCopias);

  // El mazo de huevos tiene además un tope propio de 5 cartas en total. Se
  // recorta por el final para no descartar en silencio lo que puso primero.
  var acum = 0;
  eggs.forEach(function(c){
    var sitio = Math.max(0, EGG_MAX - acum);
    if (c.q > sitio){
      issues.push({ kind:"warn", ln:c.ln, line:c.q + " " + c.n + " " + c.id,
                    why:T("el mazo de huevos no pasa de {m} cartas, se recorta a {s}", { m: EGG_MAX, s: sitio }) });
      c.q = sitio;
    }
    acum += c.q;
  });

  issues.sort(function(a,b){ return (a.ln || 0) - (b.ln || 0); });
  cards.forEach(function(c){ delete c.ln; });
  eggs.forEach(function(c){ delete c.ln; });
  cards.sort(function(a,b){
    var d = GROUPS.indexOf(a.g) - GROUPS.indexOf(b.g);
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });
  eggs.sort(function(a,b){ return a.id.localeCompare(b.id); });
  return { cards: cards, eggs: eggs, issues: issues };
}

// El mazo actual, en el mismo formato que se pega arriba. Los huevos van al
// final, en su propio bloque, como en las listas del juego.
function deckToList(){
  var w = 0;
  S.cards.concat(S.eggs).forEach(function(c){ if (c.q && c.n.length > w) w = c.n.length; });

  function bloque(arr){
    return arr.slice().sort(function(a,b){
      return (a.id || "zz").localeCompare(b.id || "zz");
    }).filter(function(c){ return c.q; }).map(function(c){
      var name = c.n + new Array(Math.max(1, w - c.n.length + 2)).join(" ");
      return c.q + " " + name + " " + (c.id || "?");
    });
  }

  var lines = ["// Digimon DeckList", ""].concat(bloque(S.cards));
  var huevos = bloque(S.eggs);
  if (huevos.length) lines = lines.concat(["", "// Digi-Egg"], huevos);
  return lines.join("\n");
}

var impText   = document.getElementById("imp-text");
var impMsg    = document.getElementById("imp-msg");
var impReport = document.getElementById("imp-report");

function impSay(t){ impMsg.textContent = t; }

function renderReport(res, loaded){
  impReport.textContent = "";
  if (!res) return;

  var total = 0, kinds = {};
  res.cards.forEach(function(c){ total += c.q; kinds[c.g] = (kinds[c.g]||0) + c.q; });
  var totalEggs = 0;
  res.eggs.forEach(function(c){ totalEggs += c.q; });

  var tally = document.createElement("div");
  tally.className = "imp-tally";
  var bits = [T("{n} cartas distintas", { n: "<b>" + res.cards.length + "</b>" }),
              T("{n} copias", { n: "<b>" + total + "</b>" })];
  GROUPS.forEach(function(g){ if (kinds[g]) bits.push(g + " <b>" + kinds[g] + "</b>"); });
  if (totalEggs) bits.push("Digi-Egg <b>" + totalEggs + "</b>");
  tally.innerHTML = bits.join(" <span style='color:var(--line-strong)'>·</span> ");
  impReport.appendChild(tally);

  if (res.issues.length){
    var ul = document.createElement("ul");
    ul.className = "imp-issues";
    res.issues.forEach(function(is){
      var li = document.createElement("li");
      li.innerHTML = '<span class="tag ' + is.kind + '"></span><span><code></code> <span class="why"></span></span>';
      li.querySelector(".tag").textContent = is.kind === "bad" ? T("sin cargar") : T("aviso");
      li.querySelector("code").textContent = is.line;
      li.querySelector(".why").textContent = is.why;
      ul.appendChild(li);
    });
    impReport.appendChild(ul);
  }

  if (loaded && total !== 50){
    var w = document.createElement("div");
    w.className = "imp-tally";
    w.innerHTML = "<span style='color:var(--crit)'>"
      + T("El mazo tiene <b>{n}</b> copias, no 50. Ajusta la lista o las copias en el editor.", { n: total })
      + "</span>";
    impReport.appendChild(w);
  }

  // El mazo de huevos se cuenta aparte: 5 es el tope, pero 0 también es legal.
  if (loaded && totalEggs > EGG_MAX){
    var we = document.createElement("div");
    we.className = "imp-tally";
    we.innerHTML = "<span style='color:var(--crit)'>"
      + T("El mazo de huevos tiene <b>{n}</b> cartas, más de {m}.", { n: totalEggs, m: EGG_MAX })
      + "</span>";
    impReport.appendChild(we);
  }
}

document.getElementById("imp-load").addEventListener("click", function(){
  if (!CARD_DB.__n){
    impSay(T("Esta copia se compiló sin catálogo, así que no puede resolver los IDs."));
    return;
  }
  var text = impText.value;
  if (!text.trim()){ impSay(T("Pega una lista primero.")); renderReport(null); return; }

  var res = resolveList(parseList(text));
  if (!res.cards.length && !res.eggs.length){
    impSay(T("No se reconoció ninguna carta."));
    renderReport(res, false);
    return;
  }
  // La lista rehace el mazo entero, huevos incluidos: si no trae ninguno, se
  // queda sin huevos, que es lo que dice la lista.
  S.cards = res.cards;
  S.eggs = res.eggs;
  renderAll();
  var bad = res.issues.filter(function(i){ return i.kind === "bad"; }).length;
  impSay(!bad ? T("Mazo cargado.")
    : (bad === 1 ? T("Mazo cargado · 1 línea sin cargar")
                 : T("Mazo cargado · {n} líneas sin cargar", { n: bad })));
  renderReport(res, true);
});

document.getElementById("imp-copy").addEventListener("click", function(){
  var txt = deckToList();
  impText.value = txt;
  renderReport(null);
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(
      function(){ impSay(T("Lista copiada al portapapeles y volcada aquí arriba.")); },
      function(){ impSay(T("Lista volcada aquí arriba; cópiala a mano.")); }
    );
  } else {
    impSay(T("Lista volcada aquí arriba; cópiala a mano."));
  }
});

document.getElementById("imp-clear").addEventListener("click", function(){
  impText.value = ""; impSay(T("")); renderReport(null); impText.focus();
});

if (!CARD_DB.__n){
  impSay(T("Compilado sin catálogo: ejecuta tools/fetch-cards.ps1 y vuelve a construir."));
  document.getElementById("imp-load").disabled = true;
}

/* ---------------- guardar / exportar ---------------- */
function msg(t){ document.getElementById("save-msg").textContent = t; }

var saveBtn = document.getElementById("save-btn");
var csvBtn = document.getElementById("csv-btn");
saveBtn.disabled = true; csvBtn.disabled = true;

var CSV_NOMBRE = "digimon-analytics.csv";

// Arma el CSV. Separado de la descarga porque el contenido es el mismo dentro
// y fuera de Claude; lo único que cambia es cómo se le entrega al usuario.
function csvTexto(){
  var N = totalCards(), n = handSize();
  var rows = [["carta","grupo","coste","copias","p_al_menos_1","p_al_menos_2"]];
  S.cards.forEach(function(c){
    rows.push([c.n || T("(sin nombre)"), c.g, c.c, c.q,
      c.q ? (pAtLeast(c.q,1,N,n)*100).toFixed(4) : "0",
      c.q >= 2 ? (pAtLeast(c.q,2,N,n)*100).toFixed(4) : "0"]);
  });
  rows.push([]);
  rows.push(["grupo","","","copias","p_al_menos_1","p_con_mulligan"]);
  GROUPS.forEach(function(g){
    var k = groupCount(g); if (!k) return;
    var p1 = pAtLeast(k,1,N,n);
    rows.push([g,"","",k,(p1*100).toFixed(4),((1-Math.pow(1-p1,2))*100).toFixed(4)]);
  });
  // Los huevos van en su propio bloque y sin probabilidades: no se roban.
  var eggRows = S.eggs.filter(function(c){ return c.q; });
  if (eggRows.length){
    rows.push([]);
    rows.push(["digi-egg (mazo aparte, no cuenta para las 50)","","","copias","",""]);
    eggRows.forEach(function(c){
      rows.push([c.n || T("(sin nombre)"), EGG_GROUP, "", c.q, "", ""]);
    });
  }
  return rows.map(function(r){
    return r.map(function(v){ return '"' + String(v).replace(/"/g,'""') + '"'; }).join(",");
  }).join("\n");
}

(async function(){
  var artifact = null, downloads = null;
  try { artifact = await window.claude.use("artifact"); } catch(e){}
  try { downloads = await window.claude.use("downloads"); } catch(e){}

  if (artifact){
    saveBtn.disabled = false;
    saveBtn.addEventListener("click", async function(){
      saveBtn.disabled = true; msg(T("Guardando…"));
      var json = JSON.stringify(S).replace(/</g, "\\u003c");
      var out = PRISTINE.replace(
        /(<script type="application\/json" id="deck-state">)[\s\S]*?(<\/script>)/,
        "$1\n" + json + "\n$2"
      );
      try {
        await artifact.publish(out);
        msg(T("Guardado. Esta versión del mazo es la que verá quien abra la página."));
      } catch(err){
        var code = err && err.code;
        if (code === "conflict") msg(T("Alguien guardó antes que tú; la página se recargará con esa versión."));
        else if (code === "not_granted" || code === "not_writer") { msg(T("Solo lectura: no puedes guardar en esta página.")); return; }
        else msg(T("No se pudo guardar. Vuelve a intentarlo."));
        saveBtn.disabled = false;
      }
    });
  } else {
    saveBtn.remove();
  }

  // El CSV no depende de Claude: se arma igual, y solo cambia por dónde sale.
  csvBtn.disabled = false;
  csvBtn.addEventListener("click", async function(){
    var datos = "﻿" + csvTexto();
    if (downloads){
      try { await downloads.save({ filename:CSV_NOMBRE, data:datos }); }
      catch(e){ msg(T("Descarga cancelada.")); }
      return;
    }
    // Servida como página normal: descarga del navegador de toda la vida.
    try {
      var url = URL.createObjectURL(new Blob([datos], { type:"text/csv;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = url;
      a.download = CSV_NOMBRE;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      msg(T("CSV descargado."));
    } catch(e){
      msg(T("Este navegador no ha dejado descargar el CSV."));
    }
  });
})();

/* ---------------- ciclo de render ---------------- */
function renderAll(){
  S.hand = Math.max(1, Math.min(12, S.hand));
  var vacio = !totalCards();
  document.getElementById("empty-note").hidden = !vacio;
  document.getElementById("intro-note").hidden = vacio;
  setPressed("mull-on", S.mull); setPressed("mull-off", !S.mull);
  setPressed("go-first", S.first); setPressed("go-second", !S.first);
  document.getElementById("hand-n").textContent = handSize();
  renderTheme();
  renderMeter();
  renderDeck();
  renderGroups();
  renderTiles();
  renderCurve();
  renderMarginal();
  renderCompare();
  renderLine();
  renderSecurity();
  renderSim();
  renderChart();
}
applyLang();
renderAll();

// Arrancar sin mazo es lo normal: se abre el importador, que es por donde se
// empieza. Solo al cargar la página, para no reabrirlo si el usuario lo cierra.
if (!totalCards()){
  var imp = document.getElementById("importer");
  if (imp) imp.open = true;
}

var mq = window.matchMedia("(prefers-color-scheme: dark)");
if (mq.addEventListener) mq.addEventListener("change", renderChart);

})();
