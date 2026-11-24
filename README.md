# liapilates

Portfolio editorial y media kit de liapilates (@liapilates21). Es un sitio estático, en español, pensado para publicarse en GitHub Pages. No tiene backend, base de datos ni dependencias de ejecución.

La dirección visual se llama Edición: portada de revista, mucho papel, filetes finos y una frase de marca con protagonismo. Donde aún no hay una fotografía de Lia, la página muestra un marco con el rótulo «Fotografía pendiente». No se usan fotos de otras personas, ni marcas, tarifas o estadísticas inventadas.

## Tecnologías

- HTML semántico, CSS y JavaScript en módulos ES.
- Fuentes autoalojadas: Fraunces y Outfit, ambas con licencia SIL Open Font License. Los textos están en `assets/fonts/`.
- Sin GSAP, sin iconos de terceros y sin peticiones externas en tiempo de ejecución. Las animaciones usan CSS y `IntersectionObserver`.
- Los datos que cambian viven en JSON y la página los pinta con el DOM, sin `innerHTML`.

## Estructura

```
index.html
favicon.svg
robots.txt
sitemap.xml
.nojekyll
css/          variables, reset, global, components, sections, animations, responsive
js/           main, navigation, animations, gallery, lightbox, content, safe
data/         site.json, gallery.json, rates.json
assets/       fonts, images, videos, files
legal/        aviso-legal, privacidad, cookies
```

## Ver la web en local

Los módulos ES no funcionan abriendo el HTML con `file://`. Desde la raíz del proyecto:

```bash
python -m http.server 8080
```

Después abre `http://localhost:8080`. Si no tienes Python, sirve la carpeta con cualquier servidor estático.

## Cómo añadir fotografías

1. Exporta la imagen en WebP o AVIF, con el tamaño justo. Incluye también ancho y alto reales.
2. Guárdala en `assets/images/`. El nombre solo puede usar letras, números, puntos, guiones y barras: `assets/images/fuerza-01.webp`.
3. Edita la pieza en `data/gallery.json`:

```json
{
  "id": "fit-fuerza",
  "category": "fitness",
  "type": "image",
  "orientation": "landscape",
  "placeholder": false,
  "src": "assets/images/fuerza-01.webp",
  "alt": "Descripción concreta de lo que se ve, sin inventar el contexto.",
  "width": 1600,
  "height": 1000,
  "caption": "Entrenamiento de fuerza"
}
```

`category` admite `fitness`, `moda` o `lifestyle`. `orientation` admite `portrait` o `landscape`. Si `alt` está vacío o `placeholder` sigue en `true`, la web mantiene el marco pendiente. Así no se publica una imagen sin texto alternativo.

La fotografía principal y el retrato de «Sobre mí» se cambian en `data/site.json`, en `hero` y `portrait`, con las mismas reglas. Cuando `hero.src` tenga una imagen real, conviene añadir en `index.html` un preload:

```html
<link rel="preload" as="image" href="assets/images/hero.webp">
```

## Cómo añadir vídeos

Guarda el archivo en `assets/videos/` (MP4 o WebM) y, si hay cartela, el póster en `assets/images/`. En la galería:

```json
{
  "id": "reel-01",
  "category": "fitness",
  "type": "video",
  "orientation": "portrait",
  "placeholder": false,
  "src": "assets/videos/reel-01.mp4",
  "poster": "assets/images/reel-01.webp",
  "alt": "Descripción del Reel.",
  "width": 1080,
  "height": 1920,
  "caption": "Reel de fuerza"
}
```

El visor usa el reproductor nativo. No incrustes YouTube, Vimeo ni Instagram: eso metería terceros, cookies y un cambio de la política de privacidad.

## Cómo actualizar las tarifas

Edita `data/rates.json`. Un precio `null` se muestra como «A consultar». Un número positivo se formatea en euros:

```json
{ "id": "reel", "name": "Reel patrocinado", "summary": "Texto del formato.", "price": 350 }
```

No escribas un importe hasta que Lia lo confirme. La moneda está en `currency`.

## Cómo actualizar el resto del contenido

Todo está en `data/site.json`.

- `contact.email`: solo se publica si es un email válido.
- `contact.mediaKit`: ruta tipo `assets/files/media-kit.pdf`. El enlace de descarga aparece solo entonces.
- `contact.instagram` y `contact.instagramHandle`: el perfil actual es `https://www.instagram.com/liapilates21/` y `@liapilates21`.
- `desiredCategories`: territorios con los que quiere trabajar. No son colaboraciones hechas.
- `completedCollaborations`: lista vacía hasta que haya un acuerdo real. Cada pieza es `{ "name": "Marca", "note": "Qué se hizo, sin exagerar." }`.
- `logoSlots`: `{ "name": "", "src": "assets/images/logo.svg", "alt": "Logotipo de Marca" }`. Un logo no debe presentarse como colaboración si no la hay; la página ya avisa de eso.
- `audience`: rellena `value` solo con cifras reales. Si el valor va vacío, se lee «Pendiente».
- `campaigns`: `{ "title": "", "year": "", "summary": "" }`. La sección aparece sola cuando hay al menos un título.
- `testimonials`: `{ "quote": "", "author": "" }`. Sin autor no se publica. No inventes citas.

Los textos fijos de portada, «Sobre mí» y las modalidades de colaboración están en `index.html`.

## Publicar en GitHub Pages

1. Sustituye `https://PENDIENTE-DOMINIO/` por la URL real, con barra final si es la raíz, en `index.html`, `legal/aviso-legal.html`, `legal/privacidad.html`, `legal/cookies.html`, `robots.txt` y `sitemap.xml`.
2. Sube el repositorio a GitHub. En Settings → Pages, publica la rama `main` y la carpeta raíz (`/`).
3. El archivo `.nojekyll` evita que Pages ignore carpetas que empiecen por guion bajo.
4. La imagen social está en `assets/images/og.png` (1200×630), generada con `npm run export:og` desde `scripts/og-template.html` (mismas fuentes y tokens que la web en `css/variables.css`). Las meta `og:image` y `twitter:image` apuntan al PNG.

## Información que falta

No está inventada y hay que pedirla antes de dar el sitio por cerrado:

- Nombre completo de la titular, NIF/NIE, domicilio y email profesional.
- Dominio definitivo.
- Biografía en palabras de Lia.
- Fotografías y vídeos propios, con su texto alternativo.
- Tarifas.
- Media kit en PDF.
- Cifras de audiencia: alcance, interacciones, impresiones, engagement, perfil, geografía y edades.
- Colaboraciones ya realizadas, si las hay, y permiso para mostrar logotipos.
- Revisión de los borradores legales por un profesional. Publicarlos con los marcadores `[NOMBRE COMPLETO DE LA TITULAR]`, `[NIF/NIE]`, `[DOMICILIO]`, `[EMAIL PROFESIONAL]` y `[DOMINIO]` no cumple la LSSI-CE.

## Seguridad en un sitio estático

- No hay claves ni credenciales en el repositorio.
- Los enlaces externos llevan `rel="noopener noreferrer"` y solo se admiten HTTPS hacia Instagram y LinkedIn (`js/safe.js`).
- Las rutas de imágenes, vídeos y archivos solo se aceptan si empiezan por `assets/images/`, `assets/videos/` o `assets/files/` y no contienen `..`.
- CSP estricta en meta (sin scripts inline: `js/enable-js.js`) y archivo `_headers` con HSTS, `X-Frame-Options`, COOP, CORP y CSP con `frame-ancestors` para despliegues que sí envíen cabeceras (Cloudflare Pages, Netlify, etc.). En **GitHub Pages** solo aplican la meta CSP y `_headers` se ignora; `frame-ancestors` no se puede usar en meta (solo cabecera HTTP), así que ahí conviene un proxy o cambiar de hosting si el clickjacking es un requisito estricto.
- `robots.txt` desindexa `assets/files/` (informes PDF).
- Cookie técnica `lia_consent` con `SameSite=Lax` y `Secure` en HTTPS.

## SEO

- Título, descripción, canonical, `hreflang`, Open Graph, Twitter Card y JSON-LD (`WebSite` + `ProfilePage`).
- `sitemap.xml` con `lastmod`, prioridades y `robots.txt`.
- Al publicar, rellena `seo.siteUrl` en `data/site.json` (HTTPS sin barra final) y sustituye `PENDIENTE-DOMINIO` en canonical, `sitemap.xml`, `robots.txt` y JSON-LD.

## Accesibilidad (WCAG 2.1 / 2.2 AA, objetivo mínimo)

- Contraste AA en texto y foco visible (`:focus-visible`).
- Bloque de salto, jerarquía de encabezados, `lang="es"`, regiones con `aria-label`, menú con `aria-expanded` / `aria-controls`, diálogos nativos (cookies, lightbox) con gestión de foco.
- Objetivos táctiles ≥44 px en navegación, cookies y pie.
- `prefers-reduced-motion`: sin precarga animada ni motion decorativo; contenido usable sin JS.
- Pendiente de cierre legal (titular, NIF, domicilio) y dominio definitivo para LSSI-CE; no afecta al marcado técnico AA del front.
