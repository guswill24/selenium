# Despliegue en Vercel

> **Estado: Fase 20 – Preparación Vercel.** El repositorio incluye la configuración de Vercel (`vercel.json`), el punto de entrada de la API como función (`api/index.ts`) y `.env.example`. La configuración se validó localmente con `vercel build` (sin iniciar sesión ni desplegar); el primer despliegue real lo realiza el responsable del proyecto siguiendo esta guía.

## Objetivo

Una sola aplicación pública (por ejemplo, `https://mi-ruta-calidad.vercel.app`) donde:

- el frontend se sirve como sitio estático, y
- la API responde en el **mismo origen** bajo `/api/...`,

sin modificar el código fuente entre local y producción, sin base de datos y sin Docker.

## Decisión: función Node.js de Vercel que reutiliza la aplicación Express

| Opción | Resultado |
|---|---|
| **Elegida:** un solo proyecto con *Root Directory* = raíz del repositorio; frontend estático + `api/index.ts` como función Node.js | Mismo origen, un solo despliegue, cero cambios de código entre local y Vercel |
| Proyecto con *Root Directory* = `backend` | Descartada. Falla con `sh: tsc: command not found` (TypeScript es dependencia de la raíz), el build del backend no genera archivos (`tsc --noEmit`) y los fixtures de `data/` quedan fuera de la carpeta |
| Detección automática de Express (archivo `app.ts`/`server.ts`/`index.ts` en la raíz) | Descartada. Convierte todo el proyecto en una función y obliga a servir el frontend desde `public/`; no encaja con un monorepo con Vite |
| Servidor Express tradicional (`app.listen`) en otro proveedor | Descartada. Exige dos orígenes, CORS y un servidor permanente |

Cómo funciona:

- `api/index.ts` solo importa la aplicación de `backend/src/app.ts` y la exporta. No duplica lógica: la misma aplicación atiende `npm run dev` (vía `backend/src/server.ts`, que hace `listen`) y Vercel.
- `vercel.json` reescribe `/api/*` hacia esa función. La función recibe la URL original, así que las rutas de Express no cambian.
- Las demás rutas que no correspondan a un archivo estático se reescriben a `/index.html`, para que una recarga directa de `/routes` o `/lab` funcione (React Router). Vercel revisa primero los archivos estáticos, por lo que `/assets/*.js` y `/assets/*.css` no se ven afectados.
- Vercel compila el TypeScript de la función con el `tsconfig.json` de la raíz (que extiende el del backend) y empaqueta solo los archivos que la función usa, incluidos los JSON de `data/` (`includeFiles` en `vercel.json`).

Comportamiento verificado en la documentación de Vercel (consultada en octubre de 2026):

| Tema | Lo que dice Vercel | Fuente |
|---|---|---|
| Funciones en `/api` | Un archivo en `/api` con un manejador Node.js `(request, response)` es una función; TypeScript es compatible y se configura con el `tsconfig.json` de la raíz | [Node.js runtime](https://vercel.com/docs/functions/runtimes/node-js) |
| Express | `express.static()` se ignora; los estáticos deben servirse por la CDN | [Express on Vercel](https://vercel.com/docs/frameworks/backend/express) |
| Reescrituras | El sistema de archivos tiene prioridad sobre las reescrituras | [vercel.json – rewrites](https://vercel.com/docs/project-configuration/vercel-json#rewrites) |
| `functions` | `maxDuration` e `includeFiles` por archivo de función | [vercel.json – functions](https://vercel.com/docs/project-configuration/vercel-json#functions) |
| Duración | Con Fluid compute (predeterminado), plan Hobby: 300 s por defecto y como máximo | [Max duration](https://vercel.com/docs/functions/configuring-functions/duration) |

## Archivos de configuración

| Archivo | Propósito |
|---|---|
| `vercel.json` | Instalación (`npm install` en la raíz: workspaces y TypeScript), build (`npm run build`), salida (`frontend/dist`), función `api/index.ts` (`maxDuration: 30`, incluye `data/**`) y reescrituras |
| `api/index.ts` | Punto de entrada de la función: exporta la aplicación Express |
| `tsconfig.json` (raíz) | Opciones de TypeScript que usa Vercel para compilar la función (extiende `backend/tsconfig.json`) |
| `.env.example` | Variables de entorno disponibles, todas opcionales |

`"framework": null` en `vercel.json` equivale al preset **Other**: el build y la salida los define el propio archivo, no el panel de Vercel.

## Configuración del proyecto en Vercel (panel)

Si ya creaste el proyecto con *Root Directory* = `backend`, cámbialo; esa configuración es la causa del error `tsc: command not found`.

| Ajuste (Settings → Build and Deployment) | Valor |
|---|---|
| **Root Directory** | Vacío (raíz del repositorio). **No** `backend` ni `frontend` |
| Framework Preset | `Other` (lo fija `vercel.json`) |
| Build Command / Output Directory / Install Command | Sin sobrescribir en el panel: se toman de `vercel.json` |
| Node.js Version | 22.x o superior. `engines` en `package.json` (`>=22.12.0`) hace que Vercel use la versión más reciente disponible (hoy 24.x), con un aviso en el log |

| Variable (Settings → Environment Variables) | Valor recomendado |
|---|---|
| `AUTH_SECRET` | Un valor propio, largo y aleatorio (Production y Preview). Sin ella se usa el secreto público de demostración y la función escribe un aviso en los logs |
| `SESSION_TTL_MINUTES` | Opcional (por defecto `120`) |
| `VITE_API_BASE_URL` | **No definir.** Vacía, el frontend usa rutas relativas `/api/...` |

Los cambios de variables de entorno se aplican en el **siguiente** despliegue.

## Cómo desplegar

**Desde el panel (recomendado):**

1. Sube el repositorio a GitHub (ver [git-github.md](git-github.md)).
2. En Vercel: **Add New → Project → Import** el repositorio.
3. Deja *Root Directory* en la raíz y *Framework Preset* en `Other`.
4. Agrega `AUTH_SECRET` en *Environment Variables*.
5. **Deploy**. Cada `git push` a la rama principal crea un despliegue de producción; las demás ramas, despliegues de vista previa.

**Desde la CLI** (opcional):

```bash
npx vercel login      # una sola vez
npx vercel link       # vincula la carpeta con el proyecto (crea .vercel/, ignorado por Git)
npx vercel            # despliegue de vista previa
npx vercel --prod     # despliegue de producción
```

Para reproducir el build de Vercel sin desplegar: `npx vercel pull` y luego `npx vercel build` (requiere el proyecto vinculado).

## Verificar después del despliegue

| Comprobación | Resultado esperado |
|---|---|
| `https://<tu-app>.vercel.app/api/health` | `200` con `{"status":"ok"}` |
| `https://<tu-app>.vercel.app/api/no-existe` | `404` en JSON (`ENDPOINT_NOT_FOUND`), no la página del frontend |
| Abrir `https://<tu-app>.vercel.app/lab` y recargar (F5) | Se muestra la página de escenarios, no un 404 de Vercel |
| Iniciar sesión con `pasajero.demo` | Entra al panel de inicio |
| Activar `SERVER_ERROR` en `/lab` y abrir **Rutas** | Mensaje de error controlado (HTTP 500); volver a `NORMAL` restaura el sistema |
| Activar `SLOW_RESPONSE` con 8000 ms | La respuesta tarda unos 8 s y llega con `200` |

## Desarrollo, build, preview y producción

| Modo | Comando | Cómo llega el frontend a la API |
|---|---|---|
| Desarrollo | `npm run dev` | Proxy de Vite: `5173/api` → `localhost:3001` |
| Build | `npm run build` | — (verifica tipos del backend y compila el frontend en `frontend/dist/`) |
| Preview | `npm run preview` (puerto 4173) | El mismo proxy de Vite; requiere la API en ejecución por separado (`npm run start -w backend`) |
| Producción (Vercel) | `git push` o `npx vercel --prod` | Mismo origen: `/api/...` atendido por la función `api/index.ts` |

## Variables de entorno

Todas son **opcionales**: el sistema funciona sin definir ninguna. Plantilla: [`.env.example`](../.env.example).

| Variable | Dónde se usa | Por defecto | Uso |
|---|---|---|---|
| `AUTH_SECRET` | API | Secreto de demostración público | Clave de firma de los tokens de sesión. En un despliegue público, define uno propio |
| `SESSION_TTL_MINUTES` | API | `120` | Duración de la sesión en minutos |
| `PORT` | API local y proxy de Vite | `3001` | Puerto de la API en desarrollo (Vercel lo ignora) |
| `VITE_API_BASE_URL` | Frontend (en la compilación) | vacío → rutas relativas | Solo si la API estuviera en otro origen. En producción, déjala vacía |

- Las variables `VITE_*` se leen del archivo `.env` de la **raíz** del repositorio (`envDir: '..'` en `frontend/vite.config.ts`).
- La API **no** carga archivos `.env`: lee el entorno del proceso (la terminal en local, *Environment Variables* en Vercel).
- El archivo `.env` no se sube a Git.

## Estado del servidor y limitaciones en serverless

En Vercel cada solicitud puede atenderla una instancia distinta, y las instancias se reciclan sin aviso. Revisión del estado del servidor:

| Estado | ¿Dónde vive? | Riesgo en Vercel |
|---|---|---|
| Escenario activo y retraso de `SLOW_RESPONSE` | Navegador; se envía en cada solicitud (`X-Scenario`, `X-Response-Delay`) | Ninguno: no depende de la memoria del servidor ([scenarios.md](scenarios.md)) |
| Sesión | Token firmado (sin almacén en el servidor) | Ninguno, siempre que todas las instancias usen el mismo `AUTH_SECRET` (lo garantiza la variable del proyecto) |
| Cambios de administración | Navegador (modo demostración) | Ninguno ([admin.md](admin.md)) |
| Historial nuevo | `localStorage` del navegador | Ninguno ([history.md](history.md)) |
| Simulación en tiempo real | Calculada a partir del `tick` que envía el cliente | Ninguno: mismo `tick`, mismo resultado ([realtime.md](realtime.md)) |
| Datos por escenario (`ROUTE_CHANGED`, `EMPTY_DATA`…) | Caché de solo lectura en memoria, derivada de los fixtures | Ninguno: cada instancia la reconstruye igual al arrancar |

Limitaciones conocidas:

- Ningún cambio se guarda en el servidor: los fixtures de `data/` son de solo lectura.
- Cerrar sesión no revoca el token en el servidor; vence por tiempo ([api.md](api.md#autenticación-y-cuenta)).
- Si no se define `AUTH_SECRET`, los tokens se firman con un secreto público: cualquiera podría fabricar una sesión. Es aceptable solo porque los datos son ficticios.
- `SLOW_RESPONSE` retrasa hasta 8 s. `vercel.json` fija `maxDuration: 30` para la función, dentro del límite de todos los planes.
- El primer acceso tras un periodo sin tráfico puede tardar un poco más (arranque en frío). No afecta los resultados, pero conviene tenerlo en cuenta al medir tiempos con Selenium.
- No se deben ejecutar pruebas de carga contra el despliegue público ([testability-matrix.md](testability-matrix.md#matriz)).
