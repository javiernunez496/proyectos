# Calculadora Digimon

Calculadora de probabilidad de mano inicial para el **Digimon Card Game**, hecha
para un mazo concreto de 50 cartas (Aegiomon → Aegiochusmon → Jupitermon).
Página estática, sin dependencias, sin servidor.

Todos los números son **combinatoria exacta** (distribución hipergeométrica), no
simulación. El simulador que trae la página existe solo para verlos converger.

## Qué calcula

| Bloque | Responde |
|---|---|
| Lista del mazo | Probabilidad de ver ≥1 y ≥2 copias de cada carta en la mano inicial |
| Resumen por grupo | Lo mismo por nivel (Lv.3 … Lv.7, Tamer, Option), con y sin mulligan, y el reparto exacto de 0/1/2/3+ copias |
| Diagnóstico | Manos sin Lv.3, manos muertas (sin Lv.3 ni Tamer) y ladrillos (5 cartas impagables) |
| Simulador | Reparte mano y seguridad, y acumula la frecuencia observada contra el valor exacto |
| Línea completa | Probabilidad de abrir con al menos una carta de cada nivel de la línea, por inclusión-exclusión |
| Seguridad | Qué acaba en las 5 de seguridad, qué sigue en el mazo, y si el muro aguanta a un atacante de X DP |
| Turno a turno | Probabilidad acumulada según avanzan los robos, distinguiendo si empiezas o no |

## Las fórmulas

Con `k` copias de una carta en un mazo de `N` y una mano de `n`:

```
P(≥1) = 1 − C(N−k, n) / C(N, n)
```

Para la línea completa, con grupos disjuntos `k₁ … kₘ`, inclusión-exclusión sobre
los subconjuntos `S` de grupos ausentes:

```
P(al menos uno de cada) = Σ (−1)^|S| · C(N − Σk_S, n) / C(N, n)
```

Los factoriales se calculan en logaritmos (`logC`) para no desbordar con mazos grandes.

La seguridad usa exactamente la misma fórmula que la mano: son dos muestras de 5
del mismo mazo barajado, así que la probabilidad de que una carta acabe en
seguridad es idéntica a la de que acabe en tu mano. La columna «sigue en el mazo»
mira las `n + s` cartas de arriba a la vez.

## Estructura

```
.
├── build.mjs           # une src/ + data/ en dist/. Sin dependencias.
├── watch.mjs           # reconstruye al guardar
├── data/
│   ├── deck.json       # el mazo: nombre, grupo, coste, DP y copias
│   ├── deck.linked.json# el mazo con el ID oficial y la imagen de cada carta
│   └── cards/          # catálogo descargado (ver «Catálogo de cartas»)
├── tools/
│   ├── fetch-cards.ps1 # descarga datos e imágenes de las 4412 cartas
│   ├── split-sets.ps1  # parte el catálogo en un archivo por expansión
│   ├── find-card.ps1   # busca en el catálogo desde la terminal
│   └── link-deck.ps1   # empareja deck.json con las cartas reales
└── src/
    ├── template.html   # el marcado, con marcadores {{DECK}} {{STYLES}} {{APP}}
    ├── styles.css      # tokens de color y todo el diseño, claro y oscuro
    └── app.js          # matemática, render e interacción
```

`dist/` está en `.gitignore` porque se regenera. La compilación produce dos archivos:

- **`dist/index.html`** — documento completo. Doble clic y se abre en el navegador.
- **`dist/artifact.html`** — solo el contenido, para publicar como artefacto en
  Claude, que le añade `<!doctype>`, `<head>` y `<body>` al publicarlo.

## Uso

Requiere Node 18 o superior. No hay que instalar nada.

```bash
npm run build     # genera dist/
npm run watch     # reconstruye cada vez que guardas
```

Después abre `dist/index.html`.

## Editar el mazo

Tres caminos, y los tres valen:

1. **Pegando una lista.** El panel «Cargar una lista» acepta el formato estándar
   del juego y rehace el mazo entero. Es lo más rápido si vienes de un deck
   builder.
2. **En la página.** Cambias copias con los `+` / `−`, editas nombres y costes,
   eliminas cartas con la `×` y añades con el botón de cada categoría. Los
   cambios viven en la pestaña; al recargar vuelve a `data/deck.json`.
3. **En `data/deck.json`.** Es la fuente de verdad. Cada carta es
   `{"n": nombre, "g": grupo, "c": coste, "dp": DP, "q": copias, "id": ID}`.
   Recompila y listo.

Los grupos válidos son `Lv.3`, `Lv.4`, `Lv.5`, `Lv.6`, `Lv.7`, `Tamer` y `Option`.
Un `dp` de `0` marca que la carta no es un Digimon, y eso es lo que usa el cálculo
del muro de seguridad para saber qué cartas pueden frenar un ataque. El `id` es
opcional para el cálculo, pero es lo que distingue dos cartas del mismo nombre
—este mazo lleva dos Jupitermon, dos Aegiomon y dos Elecmon distintos— y sale
impreso junto al coste en cada fila.

### Cargar una lista

El formato es una línea por carta, `copias · nombre · ID`:

```
// Digimon DeckList

4 Jupitermon                    BT24-101
2 Aegiochusmon                  BT24-014
1 Aegiomon                         P-194
```

Manda el ID: el nivel, el coste y los DP se leen del catálogo, así que un nombre
mal escrito no rompe nada. Las líneas que empiezan por `//` se ignoran, y si el
nombre se parte en dos líneas —a los deck builders les pasa con los nombres
largos— se vuelve a juntar solo.

Lo que no puede entrar se dice en vez de desaparecer, ordenado por número de
línea: un ID que no está en el catálogo, un huevo (no va en las 50), una línea
sin ID, o más de cuatro copias, que se recortan a cuatro. Debajo queda el
recuento por nivel y un aviso en rojo si el mazo no suma 50.

**Copiar el mazo actual** hace el viaje de vuelta: vuelca el mazo en ese mismo
formato y lo deja en el portapapeles. Da igual cuántas vueltas le des, el mazo
que sale es el que vuelve a entrar.

El catálogo de las 4412 cartas viaja incrustado en el HTML, así que esto también
funciona sin conexión. Son 151 KB comprimidos a `[id, nombre, grupo, coste, DP]`
—la página pasa de 73 KB a 224 KB—, y los añade `build.mjs` leyendo
`data/cards/index.json`. Si ese archivo no está, la página se compila igual y el
importador se apaga solo diciendo por qué.

### Las ilustraciones

Cada fila de la lista lleva su miniatura, y el simulador reparte las cartas con
su arte: la mano de cara y la seguridad boca abajo, del mismo tamaño para que
revelarla no mueva la maquetación.

`build.mjs` incrusta como data URI **solo las ilustraciones de las cartas del
mazo** —las 22 son 1 MB y dejan la página en 1,3 MB; las 4412 del catálogo son
473 MB—. Una carta que llegue después por el importador se pide a
`images.digimoncard.io`, que funciona con conexión pero está bloqueado por CSP en
un artefacto publicado. Si falla cualquiera de las dos vías queda el marco vacío,
nunca un icono roto.

Las imágenes se pintan con una regla CSS por carta, no con `<img>`. La lista se
vuelve a dibujar entera en cada clic de `+` o `−`, y así el navegador decodifica
cada ilustración una sola vez en lugar de 22 data URIs por pulsación. La regla
usa `background-image`, así que el marco no puede declarar el atajo `background`:
le ganaría por especificidad y las dejaría en blanco.

Las cartas llevan la marca de agua **SAMPLE**. No es cosa de digimoncard.io: el
servidor oficial de Bandai (`world.digimoncard.com/images/cardlist/card/<ID>.png`)
sirve exactamente la misma imagen marcada, en 430×600 y a 140 KB por carta. Nos
quedamos con la de digimoncard.io, de 300×409 y 36 KB, que a los tamaños a los
que se muestra (38 px la miniatura, 112 px la carta del simulador) da de sobra y
pesa cuatro veces menos.

Si a una carta del mazo le falta su archivo, la compilación no se rompe: avisa
con el ID y sigue. `tools/fetch-cards.ps1` lo arregla.

## Detalles del diseño

La paleta de las series pasó el validador de accesibilidad para daltonismo en
modo claro y oscuro: ninguna pareja adyacente baja del umbral de separación, y la
rampa ámbar del reparto de copias es ordinal de un solo tono. El gráfico lleva
etiquetas directas y vista de tabla, así que el color nunca es el único canal.

### Claro y oscuro

El interruptor de la cabecera tiene tres posiciones, no dos: **Auto** deja que
mande el sistema —que es lo que la página hacía siempre—, y **Claro** y **Oscuro**
la fijan. La elección se recuerda en `localStorage`, por navegador.

Se aplica desde un `<script>` al principio del documento, antes de pintar nada,
para que quien haya elegido lo contrario a su sistema no vea el destello del
tema equivocado en cada carga. Si el navegador no deja usar `localStorage`, el
botón sigue funcionando: el tema vale para esa pestaña.

El tema no viaja en «Guardar mazo». La copia que se publica se toma con el
atributo quitado y se vuelve a poner justo después, así que quien abra la página
guardada ve el suyo, no el de quien guardó.

Cambiar de tema vuelve a dibujar el gráfico. El resto de la página usa variables
CSS y se actualiza sola, pero las series se pintan con el color ya resuelto para
poder dárselo al SVG, y ese hay que volver a leerlo.

En un artefacto publicado, el visor de Claude marca el tema del lector con ese
mismo atributo `data-theme`. Son el mismo mecanismo, así que si usas el botón de
la página, tu elección manda sobre la del visor.

## Datos de las cartas

Los costes y DP se transcribieron de una captura del mazo y luego se
contrastaron contra la [API pública de digimoncard.io](https://digimoncard.io/api-documentation),
que devuelve nivel, coste, coste de evolución, color, DP, tipo y efectos sin
necesidad de clave.

## Catálogo de cartas

`tools/fetch-cards.ps1` baja el juego entero —las 4412 cartas, con su imagen— a
`data/cards/`. No hace falta Node ni Python: solo PowerShell y `curl`, que ya
vienen con Windows.

```bash
powershell -ExecutionPolicy Bypass -File tools\fetch-cards.ps1
```

```
data/cards/
├── cards.json          # todos los campos de cada carta, incluidos los efectos
├── index.json          # índice ligero: lo justo para buscar y enlazar
├── meta.json           # fecha de descarga, origen y totales
├── images/<ID>.<ext>   # una imagen por carta
└── sets/               # el catálogo partido por expansión
```

Una entrada por ID: la API repite la misma carta una vez por edición, así que se
agrupan y las ediciones quedan juntas en `printings`. El servidor de imágenes las
sirve todas como `.jpg` pero mezcla formatos, así que el script las renombra
según sus bytes reales (2108 WebP, 1748 PNG, 556 JPEG) y escribe en `image_file`
el nombre que de verdad está en disco.

Es reanudable: lo ya descargado no se vuelve a pedir. `-SkipImages` actualiza
solo los JSON, `-OnlyImages` completa lo que falte y `-Force` rehace todo.

`images/`, `cards.json` y `sets/` están en `.gitignore`: pesan unos 460 MB y se
reconstruyen con un comando. `index.json` sí se versiona, así que un clon nuevo
puede buscar cartas antes de descargar nada.

### Por expansión

Una carta pertenece a dos cosas distintas y conviene no confundirlas:

- **Su expansión de origen**, que es el prefijo de su ID: `BT24-101` es de BT-24.
  Cada carta tiene exactamente una, y las 66 expansiones suman las 4412 cartas.
- **Los productos donde aparece**, el campo `set_name`. Una carta reimpresa sale
  en varios —hay quien acumula diez—, así que estos grupos se solapan y suman
  mucho más que el catálogo.

`tools/split-sets.ps1` escribe las dos vistas en `data/cards/sets/`:

```bash
powershell -ExecutionPolicy Bypass -File tools\split-sets.ps1
```

```
data/cards/sets/
├── _sets.json          # las 66 expansiones: código, nombre oficial, nº de cartas
├── _products.json      # los 271 productos, con los IDs de cada uno
├── BT24.json           # las 102 cartas de BT-24, ficha completa
├── EX9.json            # las 74 de EX-09
└── ...
```

El nombre oficial de cada expansión sale de los datos: entre todos los productos
de sus cartas se busca el que lleva su mismo código, así que las reimpresiones
en packs promocionales no lo contaminan. Sesenta y cuatro de los 66 códigos son
un set y solo uno; los dos que no, se etiquetan como lo que son en vez de
heredar un nombre que describiría a una minoría de sus cartas:

- **`P`** — 249 promos repartidas por 96 campañas, sin set propio.
- **`LM`** — 68 cartas numeradas de corrido (`LM-001`…`LM-068`) que vienen de
  ocho Limited Card Packs distintos, de LM-01 a LM-09.

Falta ST-11 en la lista, y es correcto: sus cartas son reimpresiones numeradas
en otros sets, así que ninguna lleva ese prefijo.

### Buscar

```bash
powershell -ExecutionPolicy Bypass -File tools\find-card.ps1 jupitermon
```

El texto libre busca en nombre e ID; `-All` lo amplía a rasgos, color y set. Se
combina con `-Level`, `-Color`, `-Type`, `-Trait`, `-Cost`, `-Dp`, `-Set` y
`-Product`. `-Full` añade los textos de efecto y la ruta de la imagen, y `-Open`
la abre.

```bash
powershell -ExecutionPolicy Bypass -File tools\find-card.ps1 -Trait "Olympos XII" -Level 6 -Color yell
```

`-Set` y `-Product` son los dos criterios de la sección anterior, y por eso
están separados: `-Set EX-09` da las 74 cartas numeradas de esa expansión,
mientras que `-Product "EXTRA BOOSTER VERSUS MONSTERS"` da 79, porque el sobre
también traía reimpresiones de otros sets. `-Set` acepta el código escrito como
quieras —`BT24`, `BT-24`, `EX-09`, `ST1`— y avisa si le pasas un nombre.

### Vincular con el mazo

`tools/link-deck.ps1` empareja cada carta de `deck.json` con su carta real y
escribe `data/deck.linked.json`: el mismo mazo más `id`, `img`, `color`,
`rarity` y `traits` en cada entrada. Las 22 del mazo salen exactas por nombre,
nivel, coste y DP.

```bash
powershell -ExecutionPolicy Bypass -File tools\link-deck.ps1
```

Cuando varias reimpresiones encajan igual de bien —el mismo Patamon impreso en
cinco sets— gana la que comparte más rasgos con el resto del mazo, luego la que
no es promo y por último la del set más reciente; el resto quedan listadas en
`alts`. Dos filas del mazo con datos idénticos reciben IDs distintos, porque el
límite de cuatro copias es por número de carta y no por nombre: los ocho
Aegiomon del mazo son BT24-034 y BT25-033, no ocho veces la misma carta.

Si el criterio automático elige mal, escribe `"id": "BT19-029"` en esa carta de
`deck.json` y el enlazador lo respeta. `deck.json` nunca se modifica: sigue
siendo la fuente de verdad.

El mazo de `deck.json` ya trae sus 22 IDs escritos, así que el enlazador no
adivina nada y los reporta como fijados. Salieron de la lista real del mazo, y
sirvieron para comprobar el emparejamiento automático: acertó 21 de 22. El fallo
fue Patamon, donde eligió BT14-033 y la carta buena era P-197 —misma línea, mismo
coste, mismos DP, distinta impresión—, exactamente el caso que `alts` avisaba.

## Licencia

MIT para el código. Los nombres de cartas, los textos y las ilustraciones son
propiedad de Bandai; `data/cards/` es una copia local para uso personal, no
material redistribuible.
