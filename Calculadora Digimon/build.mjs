#!/usr/bin/env node
// Une src/ + data/ en dos artefactos. Sin dependencias: solo Node.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(root, p), "utf8");

const template = read("src/template.html");
const styles = read("src/styles.css");
const app = read("src/app.js");
const deckObj = JSON.parse(read("data/deck.json"));
const deck = JSON.stringify(deckObj);

// Las ilustraciones del mazo van incrustadas para que la página siga siendo un
// archivo suelto que funciona sin conexión. Solo las de las cartas del mazo:
// las 4412 del catálogo son 473 MB. El servidor las sirve todas como .jpg pero
// mezcla formatos, así que aquí manda la extensión que dejó fetch-cards.ps1.
const MIME = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
function imageDataUri(id) {
  for (const ext of Object.keys(MIME)) {
    const file = join(root, "data/cards/images", id + ext);
    if (existsSync(file)) {
      return `data:${MIME[ext]};base64,${readFileSync(file).toString("base64")}`;
    }
  }
  return null;
}

const images = {};
const missing = [];
// Las 50 y el mazo de huevos: los Digi-Egg también se ven en la lista.
for (const c of [...deckObj.cards, ...(deckObj.eggs || [])]) {
  if (!c.id) continue;
  const uri = imageDataUri(c.id);
  if (uri) images[c.id] = uri;
  else missing.push(c.id);
}
const imagesJson = JSON.stringify(images);
if (Object.keys(images).length) {
  const kb = (Buffer.byteLength(imagesJson) / 1024).toFixed(1);
  console.log(`ilustraciones       ${Object.keys(images).length} cartas, ${kb} KB`);
}
if (missing.length) {
  console.warn(`Sin ilustración local: ${missing.join(", ")}`);
  console.warn("Ejecuta tools/fetch-cards.ps1 para descargarlas.");
}

// Catálogo para el importador de listas: con él, pegar "4 Jupitermon BT24-101"
// basta para saber que es un Lv.6 de coste 12 y 13000 DP. Va comprimido a
// [id, nombre, grupo, coste, DP] porque son 4412 cartas y viajan en el HTML.
// Estos índices los lee src/app.js tal cual: si cambian aquí, cambian allí.
const GROUPS = ["Lv.3", "Lv.4", "Lv.5", "Lv.6", "Lv.7", "Tamer", "Option"];
const EGG = GROUPS.length;             // 7 · Lv.2, va al mazo de huevos
const OUT_OF_DECK = GROUPS.length + 1; // 8 · ni en las 50 ni en los huevos
let carddb = "[]";
try {
  const index = JSON.parse(read("data/cards/index.json"));
  const rows = index.map((c) => {
    let g = OUT_OF_DECK;
    if (c.type === "Tamer") g = 5;
    else if (c.type === "Option") g = 6;
    else if (c.type === "Digi-Egg" || c.level === 2) g = EGG;
    else if (c.level >= 3 && c.level <= 7) g = c.level - 3;
    return [c.id, c.name, g, c.cost || 0, c.dp || 0];
  });
  carddb = JSON.stringify(rows);
  console.log(`catálogo            ${rows.length} cartas`);
} catch {
  // El catálogo se descarga aparte y no está versionado entero. Sin él la
  // página funciona igual, solo que el importador no sabe resolver IDs.
  console.warn("Sin data/cards/index.json: el importador quedará sin catálogo.");
  console.warn("Ejecuta tools/fetch-cards.ps1 para generarlo.");
}

// El JSON viaja dentro de un <script>, así que "<" tiene que ir escapado.
const deckSafe = deck.replace(/</g, "\\u003c");
const carddbSafe = carddb.replace(/</g, "\\u003c");

const content = template
  .replace("<!--{{DECK}}-->", () => deckSafe)
  .replace("<!--{{CARDS}}-->", () => carddbSafe)
  .replace("<!--{{IMAGES}}-->", () => imagesJson)
  .replace("<!--{{STYLES}}-->", () => styles.trimEnd())
  .replace("<!--{{APP}}-->", () => app.trimEnd());

// 1. artifact.html — solo el contenido. Claude le pone <!doctype>, <head> y <body>
//    al publicarlo, así que este archivo no debe traerlos.
mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist/artifact.html"), content);

// 2. index.html — documento completo, se abre con doble clic en cualquier navegador.
const standalone = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{color-scheme:light dark}
  body{margin:0; font:14px system-ui, -apple-system, "Segoe UI", sans-serif}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
</head>
<body>
${content}
</body>
</html>
`;
writeFileSync(join(root, "dist/index.html"), standalone);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + " KB";
console.log(`dist/index.html     ${kb(standalone)}  (documento completo)`);
console.log(`dist/artifact.html  ${kb(content)}  (para publicar en Claude)`);
