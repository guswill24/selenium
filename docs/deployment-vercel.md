# Despliegue en Vercel

> **Estado: Pendiente – Fase 20 (Preparación Vercel).** Este documento describe la estrategia prevista y lo que ya está preparado en el código. La configuración concreta de Vercel (archivo `vercel.json`, punto de entrada de la API como función y pasos verificados en un despliegue real) **todavía no existe** y se completará en la Fase 20. Hasta entonces, no sigas estos pasos como si estuvieran probados.

## Objetivo

Una sola aplicación pública (por ejemplo, `https://mi-ruta-calidad.vercel.app`) donde:

- el frontend se sirve como sitio estático, y
- la API responde en el **mismo origen** bajo `/api/...`,

sin modificar el código fuente entre local y producción, sin base de datos y sin Docker.

## Lo que ya está preparado

| Aspecto | Estado actual | Dónde |
|---|---|---|
| Rutas relativas | El frontend llama a `/api/...`; la URL base solo cambia si se define `VITE_API_BASE_URL` | `frontend/src/services/apiClient.ts` |
| API separada del servidor | `app.ts` ensambla la aplicación sin abrir un puerto; `server.ts` (con `listen`) es solo para desarrollo local | `backend/src/` |
| Sin estado en el servidor | Sesión con token firmado; escenario enviado en cada solicitud; cambios de administración e historial nuevo en el navegador | [architecture.md](architecture.md#estado-y-persistencia) |
| Datos incluidos en el código | Los fixtures de `data/` se importan de forma estática (no se leen del disco en tiempo de ejecución) | `backend/src/data/fixtures.ts` |
| Build del frontend | `npm run build` compila el frontend con Vite (salida estándar de Vite en `frontend/dist/`) | `frontend/package.json` |
| Archivos excluidos de Git | `node_modules/`, `dist/`, `.vercel/`, `.env` | `.gitignore` |

## Estrategia prevista (Pendiente – Fase 20)

| Paso | Descripción | Estado |
|---|---|---|
| Punto de entrada de la API | Exponer la aplicación de `backend/src/app.ts` como función Node.js de Vercel que atienda `/api/*` | Pendiente – Fase 20 |
| Configuración del proyecto | Comando de build, directorio de salida del frontend y redirección de rutas del navegador (`/routes`, `/lab`…) a `index.html` | Pendiente – Fase 20 |
| Variables de entorno | Definir `AUTH_SECRET` en Vercel (ver abajo) | Pendiente – Fase 20 |
| Archivo `.env.example` | Documentar las variables opcionales | Pendiente – Fase 20 |
| Verificación | Comprobar en la URL publicada: `/api/health`, inicio de sesión, escenarios y recarga directa de páginas internas | Pendiente – Fase 20 |

La decisión final entre funciones Node.js de Vercel y otra forma de alojar Express se documentará en la Fase 20, como pide el enunciado.

## Variables de entorno

Todas son **opcionales**: el sistema funciona sin definir ninguna.

| Variable | Dónde se usa | Por defecto | Uso |
|---|---|---|---|
| `AUTH_SECRET` | API | Secreto de demostración público | Clave de firma de los tokens de sesión. En un despliegue público se recomienda definir uno propio |
| `SESSION_TTL_MINUTES` | API | `120` | Duración de la sesión en minutos |
| `PORT` | API local y proxy de Vite | `3001` | Puerto de la API en desarrollo |
| `VITE_API_BASE_URL` | Frontend (en la compilación) | vacío → rutas relativas | Solo si la API estuviera en otro origen. En producción se prefiere dejarla vacía |

Las variables `VITE_*` se leen del archivo `.env` de la **raíz** del repositorio (`envDir: '..'` en `frontend/vite.config.ts`). El archivo `.env` no se sube a Git.

## Desarrollo, build, preview y producción

| Modo | Comando | Cómo llega el frontend a la API |
|---|---|---|
| Desarrollo | `npm run dev` | Proxy de Vite: `5173/api` → `localhost:3001` |
| Build | `npm run build` | — (verifica tipos del backend y compila el frontend) |
| Preview | `npm run preview` (puerto 4173) | El mismo proxy de Vite; requiere la API en ejecución por separado (`npm run start -w backend`) |
| Producción (Vercel) | Pendiente – Fase 20 | Mismo origen: `/api/...` atendido por la función de la API |

## Limitaciones conocidas en un despliegue serverless

Son consecuencias de diseño, ya contempladas en el código:

- Ningún cambio se guarda en el servidor: la administración funciona en modo demostración ([admin.md](admin.md)) y el historial nuevo vive en el navegador ([history.md](history.md)).
- Cerrar sesión no revoca el token en el servidor; vence por tiempo ([api.md](api.md#autenticación-y-cuenta)).
- `SLOW_RESPONSE` retrasa las respuestas hasta 8 segundos; el límite de duración de las funciones del plan de Vercel deberá revisarse en la Fase 20.
- No se deben ejecutar pruebas de carga contra el despliegue público ([testability-matrix.md](testability-matrix.md#matriz)).
