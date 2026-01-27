# Portafolio — Ortiz Estefanis

Sitio estático que muestra los proyectos públicos del usuario GitHub `teffanis`.

Cómo usar:

1. Instala dependencias (opcional para servidor local):

   ```bash
   npm install
   npm run start
   ```

2. O simplemente abre `index.html` en tu navegador.

Notas:
- El listado de proyectos se obtiene desde la API pública de GitHub.
- Cambia la dirección de correo en `index.html` en la sección de contacto.
- Si quieres destacar repos específicos por orden o con contenidos más ricos (README, screenshots), dímelo y lo implemento.

## Despliegue (GitHub Pages)
Este sitio puede desplegarse automáticamente con GitHub Actions. He incluido un workflow (`.github/workflows/pages.yml`) que construye con `npm run build` y despliega a GitHub Pages cuando haces push a `main`.

Para probar localmente:

```bash
npm install
npm run start
```

Para construir:

```bash
npm run build
```

## Imágenes de portada (opcional)
Puedes pre-descargar imágenes locales para evitar dependencias externas y tener control total sobre las portadas.

- Para generar imágenes demo (6 imágenes):

```bash
node tools/fetch-covers.js --demo 6
```

- Para descargar por nombre de repositorio (ejemplo):

```bash
node tools/fetch-covers.js repo1 repo2 nombre-repo
```

El script guardará las imágenes en `assets/covers/` como `nombre-repo.jpg`. Si no hay imagen local, la web usa una imagen de Unsplash como fallback.

> Nota sobre licencias: las imágenes provienen de Unsplash (uso permitido), pero si prefieres imágenes propias, colócalas en `assets/covers/` con nombre igual al del repo.



## Estilo y tipografía
He adaptado el estilo visual y la tipografía para acercarme al look de referencia (bepatrickdavid.com) usando alternativas libres y seguras:

- Tipografías: **Oswald** (encabezados) y **Inter** (cuerpo y microtextos) desde Google Fonts.
- Imágenes: uso imágenes de alta resolución de Unsplash con búsqueda orientada a la estética "arquitectura" y "cielos". Si dispones de imágenes propias, reemplázalas en `assets/covers/`.

> Nota de licencia: No se han copiado fuentes o activos con licencia propietaria; en su lugar se han elegido alternativas libres para respetar derechos de autor.

## Video de fondo
Para usar el video que sugeriste (fondo en el hero), descarga el archivo y colócalo en `assets/videos/space.mp4`. Opcionalmente añade `assets/videos/space-poster.jpg` para navegadores que no reproduzcan video.

- Asegúrate de contar con la licencia adecuada para usar el video (la fuente sugerida fue https://es.vecteezy.com/video/3539128-... ).
- El sitio reproducirá el video en bucle, silenciado y en autoplay; si el usuario tiene `prefers-reduced-motion` el video estará pausado y se mostrará el poster.

## Detalle de lenguajes por proyecto
Los proyectos destacados muestran un módulo separado (50vh) que incluye un listado de los lenguajes usados por el repositorio.

- Para obtener este detalle se consulta la API `GET /repos/:owner/:repo/languages` de GitHub.
- Si la API no devuelve datos o se alcanza el rate limit, se muestra un estado "Lenguajes no disponibles". Si quieres puedo añadir soporte para un token personal de GitHub para aumentar el límite de peticiones.

## Iconos de lenguajes
En la sección "Sobre mí" muestro iconos de lenguajes usando Simple Icons desde CDN. Si prefieres usar iconos locales (mejor para disponibilidad y performance), coloca los SVG/PNG en `assets/langs/` y cambia las URLs en `index.html` por `assets/langs/<nombre>.svg`.




