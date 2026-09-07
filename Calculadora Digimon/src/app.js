(function(){
"use strict";

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
function pExact(k,x,N,n){
  var v = logC(k,x) + logC(N-k, n-x) - logC(N,n);
  return v === -Infinity ? 0 : Math.exp(v);
}
function pNone(k,N,n){
  if (N - k < n) return 0;
  var v = logC(N-k,n) - logC(N,n);
  return v === -Infinity ? 0 : Math.exp(v);
}
function pAtLeast(k,x,N,n){
  var s = 0;
  for (var i = 0; i < x; i++) s += pExact(k,i,N,n);
  return Math.max(0, Math.min(1, 1 - s));
}

/* ---------------- derivados ---------------- */
function totalCards(){ var t=0; for (var i=0;i<S.cards.length;i++) t += S.cards[i].q; return t; }
function groupCount(g){ var t=0; for (var i=0;i<S.cards.length;i++) if (S.cards[i].g===g) t += S.cards[i].q; return t; }
function handSize(){ return Math.min(S.hand, Math.max(1, totalCards())); }
function eggCards(){ var t=0; for (var i=0;i<S.eggs.length;i++) t += S.eggs[i].q; return t; }

function fmt(p){ return (p*100).toFixed(2).replace(".", ",") + " %"; }
function fmt1(p){ return (p*100).toFixed(1).replace(".", ",") + " %"; }

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
  var d = Math.abs(50 - N), pl = (d === 1 ? " carta" : " cartas");
  st.querySelector("span").textContent = ok ? "Mazo legal"
    : (N > 50 ? "Sobra" + (d === 1 ? "" : "n") + " " + d + pl
              : "Falta" + (d === 1 ? "" : "n") + " " + d + pl);

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
  +   '<input class="nm" type="text" placeholder="Nombre de la carta" aria-label="Nombre de la carta">'
  +   '<div class="meta"><span class="g"></span><span>· coste</span>'
  +     '<input class="cost" type="number" min="0" max="20" step="1" aria-label="Coste de la carta">'
  +     '<span class="dp"></span><span class="cid"></span></div>'
  + '</div>'
  + '<div class="step">'
  +   '<button aria-label="Quitar copia">\u2212</button>'
  +   '<div class="q mono">' + c.q + '</div>'
  +   '<button aria-label="Anadir copia">+</button>'
  + '</div>'
  + '<button class="del" title="Eliminar esta carta del mazo" aria-label="Eliminar esta carta del mazo">\u00d7</button>'
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
  r.querySelector(".meta .dp").textContent = c.dp ? "\u00b7 " + c.dp.toLocaleString("es") + " DP" : "";
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
  +   '<input class="nm" type="text" placeholder="Nombre del Digi-Egg" aria-label="Nombre del Digi-Egg">'
  +   '<div class="meta"><span class="g"></span><span class="cid"></span></div>'
  + '</div>'
  + '<div class="step">'
  +   '<button aria-label="Quitar copia">−</button>'
  +   '<div class="q mono">' + c.q + '</div>'
  +   '<button aria-label="Anadir copia">+</button>'
  + '</div>'
  + '<button class="del" title="Eliminar este huevo" aria-label="Eliminar este huevo">×</button>';

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
  h.querySelector(".cap").textContent = "mazo aparte, no cuenta para las 50";
  var ct = h.querySelector(".ct");
  ct.textContent = total + "/" + EGG_MAX;
  ct.classList.toggle("over", total > EGG_MAX);
  box.appendChild(h);

  S.eggs.forEach(function(c, i){ box.appendChild(eggRow(c, i)); });

  var abierto = (picker && picker.anchor === EGG_GROUP);
  var add = document.createElement("button");
  add.className = "addgrp" + (abierto ? " open" : "");
  add.textContent = abierto ? "× Cerrar el buscador" : "+ Añadir Digi-Egg";
  add.disabled = !abierto && total >= EGG_MAX;
  add.title = add.disabled ? "El mazo de huevos ya tiene " + EGG_MAX + " cartas" : "";
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
      ? gc + (gc === 1 ? " carta" : " cartas")
      : "vac\u00edo";
    host.appendChild(h);

    rows.forEach(function(e){ host.appendChild(cardRow(e[0], e[1], N, n)); });

    var abierto = (picker && picker.anchor === g);
    var add = document.createElement("button");
    add.className = "addgrp" + (abierto ? " open" : "");
    add.textContent = (abierto ? "\u00d7 Cerrar el buscador" : "+ A\u00f1adir carta a " + g);
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
    { lbl:"Mano sin ningún Lv.3", val:sinLv3, cls:sev(sinLv3,.22,.32), sub:"No puedes subir de crianza a tiempo." },
    { lbl:"Sin Lv.3 y sin Tamer", val:muerta, cls:sev(muerta,.06,.12), sub:"Mano muerta: nada que hacer en el turno 1." },
    { lbl:"Solo Lv.5 / 6 / 7", val:ladrillo, cls:sev(ladrillo,.01,.03), sub:"Ladrillo: 5 cartas que no puedes pagar." }
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
    host.innerHTML = '<div class="pk-empty">El mazo está vacío.</div>';
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
    chip.querySelector(".af-n").textContent = acum + (acum === 1 ? " carta" : " cartas");
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
  if (Math.abs(d) < 5e-4) return "0,0 pp";   // por debajo de 0,05 pp ya no se ve
  var v = (Math.abs(d) * 100).toFixed(1).replace(".", ",");
  return (d > 0 ? "+" : "−") + v + " pp";
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
    ? "Sustituir la referencia por este mazo" : "Fijar este mazo como referencia";

  if (!refDeck){
    var v = document.createElement("p");
    v.className = "note";
    v.style.padding = "0";
    v.textContent = "Fija este mazo como referencia, carga otro con el importador o el buscador, "
      + "y aquí verás qué se gana y qué se pierde. Como todo es combinatoria exacta, la diferencia "
      + "es la diferencia real entre los dos mazos, no ruido de un muestreo.";
    host.appendChild(v);
    return;
  }

  var cab = document.createElement("div");
  cab.className = "cmp-head";
  cab.innerHTML = '<span class="eyebrow">Referencia</span>'
    + '<input class="cmp-nm" type="text" aria-label="Nombre de la referencia">'
    + '<span class="cmp-when mono"></span>';
  var nm = cab.querySelector(".cmp-nm");
  nm.value = refDeck.nombre || "";
  nm.placeholder = "Ponle un nombre";
  nm.addEventListener("input", function(){ refDeck.nombre = this.value; guardarRef(); });
  cab.querySelector(".cmp-when").textContent = refDeck.cuando || "";
  host.appendChild(cab);

  var act = metrics(), ref = refDeck.m || {};

  var filas = CMP_FILAS.slice();
  GROUPS.forEach(function(g){
    filas.splice(2 + GROUPS.indexOf(g), 0, { k:"g:" + g, lbl:"≥1 " + g + " en mano", dir:1, pct:true, g:g });
  });

  var wrap = document.createElement("div");
  wrap.style.overflowX = "auto";
  var t = document.createElement("table");
  t.className = "gtable";
  t.innerHTML = "<thead><tr><th>Métrica</th><th>Referencia</th><th>Este mazo</th><th>Diferencia</th></tr></thead>";
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
      lbl.querySelector(".gname span").textContent = f.lbl;
    } else {
      lbl.textContent = f.lbl;
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
  impSay("Lista de la referencia volcada. Pulsa «Cargar lista» para montarla.");
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

    var html = '<div class="t-h">Turno ' + t + ' · ' + seenAt(t) + ' cartas vistas</div>';
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
    ? "de abrir con " + S.line.join(" + ") + " en la misma mano de " + n + "."
    : "Elige arriba qué niveles debe traer la línea.";
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
    d.title = st[1] + " cartas vistas";
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
  document.getElementById("wall-s").textContent = sec;

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
  document.getElementById("dp-n").textContent = dp.toLocaleString("es");
  document.getElementById("wall-1").textContent = N ? fmt1(walls / N) : "—";
  document.getElementById("wall-any").textContent = sec ? fmt1(pAtLeast(walls, 1, N, sec)) : "—";
  document.getElementById("wall-note").textContent =
    walls + " de " + N + " cartas del mazo son Digimon con " + dp.toLocaleString("es") + " DP o más.";
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
  d.querySelector(".pn").textContent = c.n || "(sin nombre)";
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
    hh.innerHTML = '<div class="note" style="padding:0">Pulsa <b>Barajar y robar</b> para repartir una mano de este mazo.</div>';
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
    checks.push(["Línea completa", lineOk]);
    checks.forEach(function(c){
      var b = document.createElement("span");
      b.className = "vd " + (c[1] ? "yes" : "no");
      b.textContent = (c[1] ? "✓ " : "✗ ") + c[0];
      v.appendChild(b);
    });
  }

  document.getElementById("runs-lbl").textContent = "· " + sim.runs.toLocaleString("es") + (sim.runs === 1 ? " mano" : " manos");

  var lv3 = groupCount("Lv.3"), tam = groupCount("Tamer");
  var exactDead = (N - lv3 - tam >= n) ? Math.exp(logC(N - lv3 - tam, n) - logC(N, n)) : 0;
  var rows = [
    ["Con algún Lv.3", sim.hit.lv3, pAtLeast(lv3, 1, N, n)],
    ["Con algún Tamer", sim.hit.tamer, pAtLeast(tam, 1, N, n)],
    ["Con la línea completa", sim.hit.line, S.line.length ? pAllGroups(lineCounts(), N, n) : 0],
    ["Mano muerta", sim.hit.dead, exactDead]
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
    d.querySelector("em").textContent = "exacto " + fmt1(r[2]);
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
  this.textContent = showTable ? "Ocultar tabla" : "Ver tabla";
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
  this.textContent = sim.reveal ? "Ocultar seguridad" : "Revelar seguridad";
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
  return nombre ? code + " · " + nombre : code;
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
    return "El mazo de huevos ya tiene " + EGG_MAX + " cartas.";
  }
  for (var i = 0; i < arr.length; i++){
    if (arr[i].id === rec[0]){
      if (arr[i].q >= COPY_MAX) return "Ya hay " + COPY_MAX + " copias de " + rec[1] + ".";
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
    v.textContent = "Ninguna carta coincide.";
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
    if (rec[4]) bits.push(rec[4].toLocaleString("es") + " DP");
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
    mas.textContent = "…y " + (r.total - r.filas.length) + " más. Afina la búsqueda.";
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
    '<input class="pk-q" type="search" placeholder="Nombre o ID de la carta…" aria-label="Buscar carta por nombre o ID">'
  + '<select class="pk-set" aria-label="Expansión"></select>'
  + '<button class="pk-x" title="Cerrar" aria-label="Cerrar el selector">×</button>';
  box.appendChild(head);

  var sel = head.querySelector(".pk-set");
  var op0 = document.createElement("option");
  op0.value = ""; op0.textContent = "Todas las expansiones";
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
    + '<button class="btn ghost tiny pk-blank">Añadir carta en blanco</button>';
  box.appendChild(foot);

  var q = head.querySelector(".pk-q");
  var cuenta = foot.querySelector(".pk-count");

  function repintar(){
    var r = renderPickerLista(lista);
    var txt = r.total + (r.total === 1 ? " carta" : " cartas");
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
      if (eggCards() >= EGG_MAX){ picker.msg = "El mazo de huevos ya tiene " + EGG_MAX + " cartas."; repintar(); return; }
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
    issues.push({ kind:"bad", ln:pend.ln, line:pend.raw, why:"sin ID de carta" });
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
      else issues.push({ kind:"bad", ln:ln, line:line, why:"sin ID de carta" });
      continue;
    }

    // Con ID y copias propias, lo que hubiera pendiente nunca llegó a tener ID.
    if (qm) dropPending();
    var q = qm ? parseInt(qm[1], 10) : (pend ? pend.q : 1);
    if (!qm && !pend) issues.push({ kind:"warn", ln:ln, line:line, why:"sin número de copias, se asume 1" });
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
      issues.push({ kind:"bad", ln:e.ln, line:e.line, why:"no está en el catálogo" });
      return;
    }
    if (rec[2] === OUT_OF_DECK){
      issues.push({ kind:"warn", ln:e.ln, line:e.line, why:"carta sin nivel: fuera del mazo" });
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
                    why:"más de " + COPY_MAX + " copias, se recorta a " + COPY_MAX });
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
                    why:"el mazo de huevos no pasa de " + EGG_MAX + " cartas, se recorta a " + sitio });
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
  var bits = ["<b>" + res.cards.length + "</b> cartas distintas",
              "<b>" + total + "</b> copias"];
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
      li.querySelector(".tag").textContent = is.kind === "bad" ? "sin cargar" : "aviso";
      li.querySelector("code").textContent = is.line;
      li.querySelector(".why").textContent = is.why;
      ul.appendChild(li);
    });
    impReport.appendChild(ul);
  }

  if (loaded && total !== 50){
    var w = document.createElement("div");
    w.className = "imp-tally";
    w.innerHTML = "<span style='color:var(--crit)'>El mazo tiene <b>" + total
      + "</b> copias, no 50. Ajusta la lista o las copias en el editor.</span>";
    impReport.appendChild(w);
  }

  // El mazo de huevos se cuenta aparte: 5 es el tope, pero 0 también es legal.
  if (loaded && totalEggs > EGG_MAX){
    var we = document.createElement("div");
    we.className = "imp-tally";
    we.innerHTML = "<span style='color:var(--crit)'>El mazo de huevos tiene <b>" + totalEggs
      + "</b> cartas, más de " + EGG_MAX + ".</span>";
    impReport.appendChild(we);
  }
}

document.getElementById("imp-load").addEventListener("click", function(){
  if (!CARD_DB.__n){
    impSay("Esta copia se compiló sin catálogo, así que no puede resolver los IDs.");
    return;
  }
  var text = impText.value;
  if (!text.trim()){ impSay("Pega una lista primero."); renderReport(null); return; }

  var res = resolveList(parseList(text));
  if (!res.cards.length && !res.eggs.length){
    impSay("No se reconoció ninguna carta.");
    renderReport(res, false);
    return;
  }
  // La lista rehace el mazo entero, huevos incluidos: si no trae ninguno, se
  // queda sin huevos, que es lo que dice la lista.
  S.cards = res.cards;
  S.eggs = res.eggs;
  renderAll();
  var bad = res.issues.filter(function(i){ return i.kind === "bad"; }).length;
  impSay("Mazo cargado" + (bad ? " · " + bad + (bad === 1 ? " línea sin cargar" : " líneas sin cargar") : "."));
  renderReport(res, true);
});

document.getElementById("imp-copy").addEventListener("click", function(){
  var txt = deckToList();
  impText.value = txt;
  renderReport(null);
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(
      function(){ impSay("Lista copiada al portapapeles y volcada aquí arriba."); },
      function(){ impSay("Lista volcada aquí arriba; cópiala a mano."); }
    );
  } else {
    impSay("Lista volcada aquí arriba; cópiala a mano.");
  }
});

document.getElementById("imp-clear").addEventListener("click", function(){
  impText.value = ""; impSay(""); renderReport(null); impText.focus();
});

if (!CARD_DB.__n){
  impSay("Compilado sin catálogo: ejecuta tools/fetch-cards.ps1 y vuelve a construir.");
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
    rows.push([c.n || "(sin nombre)", c.g, c.c, c.q,
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
      rows.push([c.n || "(sin nombre)", EGG_GROUP, "", c.q, "", ""]);
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
      saveBtn.disabled = true; msg("Guardando…");
      var json = JSON.stringify(S).replace(/</g, "\\u003c");
      var out = PRISTINE.replace(
        /(<script type="application\/json" id="deck-state">)[\s\S]*?(<\/script>)/,
        "$1\n" + json + "\n$2"
      );
      try {
        await artifact.publish(out);
        msg("Guardado. Esta versión del mazo es la que verá quien abra la página.");
      } catch(err){
        var code = err && err.code;
        if (code === "conflict") msg("Alguien guardó antes que tú; la página se recargará con esa versión.");
        else if (code === "not_granted" || code === "not_writer") { msg("Solo lectura: no puedes guardar en esta página."); return; }
        else msg("No se pudo guardar. Vuelve a intentarlo.");
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
      catch(e){ msg("Descarga cancelada."); }
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
      msg("CSV descargado.");
    } catch(e){
      msg("Este navegador no ha dejado descargar el CSV.");
    }
  });
})();

/* ---------------- ciclo de render ---------------- */
function renderAll(){
  S.hand = Math.max(1, Math.min(12, S.hand));
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
renderAll();

var mq = window.matchMedia("(prefers-color-scheme: dark)");
if (mq.addEventListener) mq.addEventListener("change", renderChart);

})();
