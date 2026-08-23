# Página web — Colegio San Martín

Sitio web institucional hecho con HTML, CSS y JavaScript puro (sin frameworks ni dependencias).

## Estructura

```
Pag Colegio/
├── index.html        Estructura y contenido de la página
├── css/
│   └── styles.css    Todo el diseño (colores, tipografía, responsive)
├── js/
│   └── main.js       Menú móvil, contadores animados, validación del formulario
├── img/              Imágenes (logo, fotos del colegio)
├── .gitignore        Archivos que git debe ignorar
└── README.md         Este archivo
```

## Cómo verla

Abre `index.html` con doble clic, o desde la terminal:

```bash
start index.html
```

No hace falta servidor ni compilación: cualquier cambio se ve recargando el navegador (F5).

## Secciones

| Sección | Ancla | Qué contiene |
|---|---|---|
| Hero | `#inicio` | Titular y llamadas a la acción |
| Estadísticas | — | Cifras con animación al hacer scroll |
| Nosotros | `#nosotros` | Historia y valores del colegio |
| Niveles | `#niveles` | Inicial, primaria y secundaria |
| Noticias | `#noticias` | Últimas novedades |
| Contacto | `#contacto` | Formulario y datos de contacto |

## Personalizar

- **Colores**: edita las variables al inicio de `css/styles.css` (bloque `:root`).
- **Textos**: todo está en `index.html`, en español y con comentarios que marcan cada sección.
- **Logo**: coloca la imagen en `img/` y reemplaza el `<span class="nav__logo-icon">SM</span>`.

## Pendientes

- [ ] Reemplazar textos y datos de ejemplo por los reales del colegio
- [ ] Añadir imágenes propias en `img/`
- [ ] Conectar el formulario de contacto a un backend (el envío hoy es simulado)
- [ ] Publicar en GitHub Pages

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
