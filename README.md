# Proyectos

Repositorio personal de Javier Núñez. Cada carpeta es un proyecto independiente
con su propio README y sus propias instrucciones.

## Proyectos

| Carpeta | Descripción | Stack |
|---|---|---|
| [Pag Colegio](./Pag%20Colegio/) | Sitio web del Colegio Diferencial Mostazal (RBD 15747), San Francisco de Mostazal | HTML, CSS y JavaScript puro |

## Ramas

```
master   ← versión estable
  └── dev   ← integración y pruebas
        └── feature/...   ← una rama por cada cosa nueva
```

Nunca se trabaja directo sobre `master`: cada cambio nace en su propia rama,
se prueba en `dev`, y solo cuando funciona se lleva a `master`.

Como es un repositorio con varios proyectos, conviene que el mensaje de cada
commit empiece indicando a cuál pertenece:

```bash
git commit -m "Pag Colegio: corregir el menu en movil"
```
