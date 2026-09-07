# Colegio Diferencial Mostazal — sitio web

Sitio web institucional del **Colegio de Educación Especial Mostazal** (RBD 15747),
San Francisco de Mostazal, Región de O'Higgins.

Hecho con HTML, CSS y JavaScript puro: sin frameworks, sin dependencias y sin compilación.

## Estructura

```
Pag Colegio/
├── index.html        Estructura y contenido de la página
├── css/
│   └── styles.css    Todo el diseño (paleta del logo, responsive)
├── js/
│   └── main.js       Menú móvil, contadores animados, validación del formulario
├── img/
│   ├── logo.svg          Estrella del logo (favicon, barra superior, hero)
│   ├── logo-completo.svg Versión horizontal compacta con el nombre
│   └── logo-banner.svg   Logo institucional completo (fondo, estela y laurel)
├── ver-pagina.bat    Doble clic: abre la web con recarga automática
├── dev/
│   └── servidor.ps1  Servidor local de desarrollo (solo para trabajar)
├── .gitignore
└── README.md
```

## Cómo verla

**Recomendado — doble clic en `ver-pagina.bat`.**

Abre la página en `http://localhost:8080` y **se recarga sola cada vez que
guardas un archivo**: no hay que apretar F5. Para detenerlo, cierra la ventana
negra o pulsa Ctrl+C dentro de ella.

No necesita instalar nada (usa PowerShell, que ya viene con Windows).
Si el puerto 8080 está ocupado, busca el siguiente libre y lo dice en pantalla.

**Alternativa rápida — doble clic en `index.html`.**

La abre directamente desde el disco (`file://`). Funciona igual, pero hay que
recargar a mano con F5 después de cada cambio.

## Secciones

| Sección | Ancla | Contenido |
|---|---|---|
| Hero | `#inicio` | Estrella animada, lema y llamadas a la acción |
| Cifras | — | Números que se animan al hacer scroll |
| Nosotros | `#nosotros` | Quiénes somos y sellos del colegio |
| Niveles | `#niveles` | Parvularia especial, básica especial y formación laboral |
| Equipo | `#equipo` | Profesionales del equipo multidisciplinario |
| Noticias | `#noticias` | Novedades, con enlace al Facebook |
| Contacto | `#contacto` | Formulario y datos institucionales |

## Paleta

Tomada del logo. Está toda en el bloque `:root` de `css/styles.css`:

| Variable | Color | Uso |
|---|---|---|
| `--celeste` | `#5bc0f0` | Fondo del hero, badges |
| `--azul` | `#1b72c4` | Barra de navegación, títulos |
| `--amarillo` | `#ffd93b` | Botones principales, estrella |
| `--rojo` | `#ee4b2b` | Acentos y etiquetas |

## ⚠️ Datos POR CONFIRMAR con el colegio

Estos datos salieron de búsquedas públicas o son texto de ejemplo.
**Hay que verificarlos antes de publicar el sitio.** En `index.html` están
marcados con comentarios `<!-- REVISAR -->`.

- [x] ~~Dirección~~ confirmada: Calle El Roble 145, Villa Padelpa
- [ ] Teléfono (puse *(72) 263 4462*, sin confirmar)
- [ ] Correo electrónico institucional (el actual es inventado)
- [ ] Horario de atención
- [ ] Años de trayectoria, matrícula y número de profesionales
- [ ] Qué niveles imparte realmente y con qué edades
- [ ] Nombres reales de los profesionales del equipo
- [ ] Noticias reales (hoy son de ejemplo, apuntando al Facebook)

## Pendientes técnicos

- [ ] Validar el logo actualizado con la dirección del colegio
- [ ] Añadir fotos reales del colegio en `img/`
- [ ] Conectar el formulario de contacto (hoy solo valida, no envía nada)
- [ ] Publicar en GitHub Pages

## Enlaces

- Facebook institucional: https://www.facebook.com/COLEGIODIFERENCIALMOSTAZAL/

## Comandos de git más usados

```bash
git status
```

```bash
git add .
```

```bash
git commit -m "Descripción del cambio"
```

## Flujo de ramas

```
master   ← versión estable, la que se publica
  └── dev   ← integración y pruebas
        └── feature/...   ← una rama por cada cosa nueva (locales)
```

**Regla:** nunca trabajes directo sobre `master`. Cada cambio nace en una rama
propia, se prueba en `dev`, y solo cuando funciona se lleva a `master`.

Crear una rama para algo nuevo:

```bash
git switch dev
```

```bash
git switch -c feature/galeria-de-fotos
```

Al terminar, integrarla a `dev`:

```bash
git switch dev
```

```bash
git merge feature/galeria-de-fotos
```

Y cuando `dev` esté probado y estable, pasarlo a `master`:

```bash
git switch master
```

```bash
git merge dev
```

Ver en qué rama estás y cuáles existen:

```bash
git branch
```
