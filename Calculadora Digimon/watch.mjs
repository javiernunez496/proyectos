#!/usr/bin/env node
// Reconstruye al vuelo cuando cambias src/ o data/. Sin dependencias.
import { watch } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
let pending = null;

function build() {
  try {
    execFileSync(process.execPath, [join(root, "build.mjs")], { stdio: "inherit" });
  } catch {
    console.error("La compilación falló. Corrige el error y guarda otra vez.");
  }
}

build();
for (const dir of ["src", "data"]) {
  watch(join(root, dir), { recursive: true }, () => {
    clearTimeout(pending);
    pending = setTimeout(build, 120);
  });
}
console.log("Vigilando src/ y data/. Ctrl+C para salir.");
