# Pruebas end-to-end — estado actual y propuestas

Este documento nace de un caso concreto: verificar en navegador que agregar la
jurisdicción `xela` al motor (ver [`quetzaltenango-pot.md`](../quetzaltenango-pot.md))
funcionaba de punta a punta en el frontend. No existía ninguna infraestructura de
pruebas para hacerlo, así que el chequeo se hizo a mano con un script de Playwright
desechable. Este documento captura lo que costó, y qué convendría dejar instalado
para la próxima vez.

## Qué hay hoy

- **Motor (`motor/`):** tres self-checks (`python motor/motor.py`,
  `python motor/catalogo.py`, `python motor/fallas.py`), cada uno con un `demo()` que
  arma proyectos sintéticos y hace `assert` sobre el resultado. Rápidos, deterministas,
  sin dependencias externas. Es la red de seguridad real del proyecto — ver
  [`limitaciones-motor.md`](limitaciones-motor.md) para sus límites.
- **`api-server/`:** sin pruebas automatizadas. Se verificó manualmente en esta sesión
  levantando Flask con `flask run` y pegándole con `curl` a `/api/validate` y
  `/api/jurisdicciones`.
- **`frontend/`:** sin pruebas automatizadas, sin `vitest` ni `@testing-library/react`
  en `package.json`. Solo hay `tsc -b` (typecheck) y `eslint`.

## El problema concreto que motivó este documento

`RequisitosPanel` — el componente que muestra los requisitos según municipalidad — no
es la pantalla de entrada de la app. Para llegar a él desde cero hay que: abrir el
dashboard → pestaña "Proyectos" → "Nuevo proyecto" → llenar el formulario → "Crear y
llenar formulario" → dentro del wizard de 9 pasos, saltar al paso "Revisión y envío".

Además, el selector de municipalidad de `NuevoProyecto` carga sus opciones de forma
asíncrona desde `/api/jurisdicciones` (`useJurisdicciones()` en `estado.ts`). Un script
de Playwright ingenuo que hace `selectOption({label: "Quetzaltenango"})` apenas se
monta el `<select>` falla por *timeout*, porque Playwright trata cualquier `<option>`
como "oculto" (no cuenta como visible aunque esté en el DOM) — hay que esperar
explícitamente con `.locator('option:has-text(...)').waitFor({state: "attached"})`
sobre el `<select>` correcto, no sobre cualquier `<select>` de la página.

Ninguno de estos dos problemas es un bug: son fricción de que el camino feliz de la UI
no tiene un atajo para pruebas, y de que Playwright no distingue "existe" de "visible"
para `<option>`. Pero juntos convierten un chequeo de 30 segundos en un script de
varias iteraciones.

## Propuestas, de menor a mayor costo

### 1. Ruta de atajo para desarrollo — recomendado primero

Agregar en `main.tsx` un chequeo de query string (p. ej. `?panel=requisitos`) que monte
`<RequisitosPanel form={{}} />` directo, saltándose Portal y el wizard. Costo: ~10
líneas, cero dependencias nuevas. Sirve tanto para QA manual como para cualquier script
de navegador futuro — reduce el flujo completo a un solo `page.goto()`.

### 2. Pruebas de contrato sobre `api-server` — recomendado primero

La lógica de negocio real vive en `motor/` y se expone en `api-server/app.py`. Un
`pytest` que use `app.test_client()` de Flask y llame `/api/validate` y
`/api/jurisdicciones` in-process (sin levantar un servidor real, sin `curl`) sería
mucho más rápido que lo hecho manualmente esta sesión y se integraría naturalmente
junto a los `demo()` de `motor/`. Es la extensión más barata y de mayor valor porque
verifica exactamente donde vive la lógica, no la presentación.

### 3. Pruebas de componente con Vitest + Testing Library

Montar `RequisitosPanel` aislado, con `fetch` mockeado, y afirmar que la rama `xela`
renderiza sus 4 preguntas propias y llama a `/api/validate` con
`municipalidad: "xela"`. Más robusto que un e2e completo porque no depende de
navegador ni de temporización de red real, pero requiere instalar infraestructura de
pruebas que hoy no existe (`vitest`, `@testing-library/react`, `jsdom`) — la primera
vez que se agregue va a ser una decisión de alcance, no solo una prueba puntual.

### 4. Playwright end-to-end completo

Útil una vez que el flujo de wizard tenga una superficie estable que valga la pena
cubrir de punta a punta. Notas para cuando se retome:

- En este entorno no hay `chromium-cli` instalado, y `npx playwright install
  chromium --with-deps` falla porque requiere `sudo` sin terminal interactiva. La
  vía que sí funcionó fue `npx playwright install chromium` (sin `--with-deps`),
  asumiendo que las dependencias de sistema de Chromium ya están presentes.
- Ejecutar el script de Node **desde dentro de `frontend/`**, no desde la raíz del
  repo — si no, `import { chromium } from "playwright"` falla con
  `ERR_MODULE_NOT_FOUND` porque Node resuelve `node_modules` relativo al archivo.
- Esperar por `state: "attached"`, no por visibilidad, al interactuar con
  `<option>` dentro de un `<select>` cuyas opciones llegan por fetch asíncrono.
- No dejar `playwright` como dependencia permanente de `frontend/package.json` si
  solo se usó para un chequeo puntual — instalar en un directorio de trabajo aparte
  o revertir el `package.json`/`package-lock.json` después, como se hizo en esta
  sesión.

## Recomendación

Priorizar **1 y 2**: bajo costo, dependencias cero, y cubren exactamente la fricción
que se sintió esta sesión (navegación y verificación de la capa de negocio). Dejar
**3 y 4** para cuando el frontend tenga más superficie — hoy es un solo wizard y un
panel, y el costo de instalar un framework de pruebas todavía no se paga solo.
