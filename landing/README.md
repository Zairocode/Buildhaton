# Landing de Cimiento

Sitio estático, sin build. En el servidor basta con `git pull` y servir esta carpeta.

```
landing/
├── index.html        una sola página
├── 404.html          página de error
├── css/estilo.css    todo el estilo
├── js/app.js         animación (GSAP)
├── vendor/           GSAP y ScrollTrigger servidos desde aquí, no desde un CDN
├── img/              logo de Cimiento (SVG), hexágono de la Cámara, favicon
├── pics/             las fotos de obra
└── check.py          verifica que nada apunte a un archivo que no existe
```

## Servirlo

Nginx, Apache o cualquier hosting estático apuntando a `landing/` como raíz.
La única condición es que los errores 404 devuelvan `404.html`.

```nginx
root /ruta/al/repo/landing;
error_page 404 /404.html;
```

Para verlo en local:

```bash
python -m http.server 8080 --directory landing
```

## Cambiar las fotos

Los fondos se llaman por su papel en la página, no por el archivo original:

| Archivo | Dónde sale |
|---|---|
| `pics/hero.webp` | portada |
| `pics/escombro.webp` | el problema, y el 404 |
| `pics/cimentacion.webp` | qué hacemos |
| `pics/obra.webp` | la comparación entre municipios |
| `pics/interior.webp` | integración con la VAC |
| `pics/ladera.webp` | las cifras |
| `pics/equipo.webp` | quiénes somos |

**Importante:** el blanco y negro y el oscurecido vienen *dentro* del archivo, no los
aplica el CSS. Una foto a color puesta tal cual va a desentonar con el resto. Pasala
siempre por esto:

```python
from PIL import Image, ImageEnhance
im = Image.open("original.jpg").convert("L")            # blanco y negro
im = ImageEnhance.Contrast(im).enhance(1.12)
im = ImageEnhance.Brightness(im).enhance(0.78)          # así se lee el texto encima
im.thumbnail((1900, 1900), Image.LANCZOS)               # 1500 si tiene mucho detalle fino
im.convert("RGB").save("landing/pics/hero.webp", "WEBP", quality=70, method=6)
```

Se hornea en el archivo a propósito: filtrar siete imágenes de pantalla completa en cada
cuadro del scroll hacía que la página se arrastrara en el celular.

Si falta alguna, la sección muestra un fondo de hormigón generado por CSS en vez de
romperse.

## El formulario de contacto

El botón **Sumarme al proyecto** (cierre de "quiénes somos") y el enlace **Escribinos**
del pie apuntan al mismo Google Form. Si cambia, son dos `href` en `index.html`.

## Antes de publicar

```bash
python landing/check.py
```

Falla si el HTML apunta a un archivo que no existe, si una etiqueta quedó sin cerrar
o si el CSS tiene llaves descuadradas. Los avisos sobre fotos faltantes no detienen nada.

## Notas

- **Tipografías:** Archivo, Instrument Sans e IBM Plex Mono, desde Google Fonts. Si el
  servidor no tiene salida a internet, hay que descargarlas y servirlas localmente.
- **El parallax solo corre en pantallas de 860 px para arriba.** En celular se
  desactiva: mover siete capas grandes durante el scroll traba los equipos de gama media.
- **GSAP** está incluido en `vendor/` a propósito: en un evento con mala señal, un CDN
  caído deja la página sin animación. Igual el contenido se lee sin JavaScript.
- **El logotipo de la Cámara** aparece únicamente dentro de la insignia del premio,
  junto al texto que lo acredita. No hay aviso legal aparte: se quitó de la letra chica
  del pie por decisión de diseño.
