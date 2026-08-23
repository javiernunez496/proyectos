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
│   └── logo.svg      Logo de la estrella, recreado en vectorial
├── .gitignore
└── README.md
```

## Cómo verla

Doble clic en `index.html`, o desde la terminal:

```bash
start index.html
```

Cualquier cambio se ve recargando el navegador con F5.

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

- [ ] Dirección exacta (puse *Luco 423B*, sin confirmar)
- [ ] Teléfono (puse *(72) 263 4462*, sin confirmar)
- [ ] Correo electrónico institucional (el actual es inventado)
- [ ] Horario de atención
- [ ] Años de trayectoria, matrícula y número de profesionales
- [ ] Qué niveles imparte realmente y con qué edades
- [ ] Nombres reales de los profesionales del equipo
- [ ] Noticias reales (hoy son de ejemplo, apuntando al Facebook)

## Pendientes técnicos

- [ ] Reemplazar `img/logo.svg` por el logo oficial si el colegio tiene el archivo original
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
