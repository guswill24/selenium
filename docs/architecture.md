# Arquitectura

Mi Ruta es una aplicación web de transporte público **simulada**: no usa mapas externos, GPS ni datos reales. Todo es determinista para que cada estudiante obtenga los mismos resultados en cada ejecución.

## Qué es y qué problema resuelve

| Pregunta | Respuesta |
|---|---|
| ¿Qué es? | Un **sistema bajo prueba (SUT)** educativo con apariencia de aplicación de movilidad urbana |
| ¿Para quién? | Estudiantes y docente del curso Calidad de Software (UNAD) |
| ¿Qué simula? | Rutas, paraderos, planificación de recorridos, mapa, tiempos de llegada, alertas, historial y administración |
| ¿Qué problema del usuario representa? | La incertidumbre al desplazarse: qué ruta tomar, dónde está el paradero, cuánto esperar, si hay cambios en el servicio |
| ¿Qué problema del curso resuelve? | Ofrece un sistema **estable, reproducible y preparado para Selenium IDE**, con fallas controladas que se activan sin tocar el código |

## Vista general

```
Navegador (Selenium IDE)
   │
   ▼
Frontend  React + TypeScript + Vite + Tailwind CSS      frontend/
   │  fetch a rutas relativas /api/...  + headers X-Scenario, X-Response-Delay, Authorization
   ▼
API       Express 5 + TypeScript                         backend/
   │  middleware de escenario → controlador → servicio
   ▼
Datos     Archivos JSON de solo lectura                  data/
```

- En desarrollo, el servidor de Vite (puerto 5173) reenvía `/api` a la API (puerto 3001). Ver `frontend/vite.config.ts`.
- En producción, frontend y API compartirán el mismo origen (ver [deployment-vercel.md](deployment-vercel.md)).
- No hay base de datos ni servicios externos.

## Frontend (`frontend/src/`)

| Carpeta | Contenido |
|---|---|
| `pages/` | Una página por pantalla (`LoginPage`, `RoutesPage`, `LabPage`…) |
| `components/` | Componentes reutilizables por dominio (`routes/`, `stops/`, `map/`, `admin/`…) y genéricos (`ui/`, `form/`, `feedback/`, `layout/`) |
| `layouts/` | Marco de la aplicación (`AppLayout`) y del inicio de sesión (`AuthLayout`) |
| `routes/` | Enrutador (React Router), menú y protección por sesión y rol (`guards.tsx`) |
| `context/` | Estado global con React Context: sesión (`AuthProvider`) y escenario (`ScenarioProvider`) |
| `services/` | Cliente HTTP (`apiClient.ts`) y almacenamiento local (historial, administración, escenario) |
| `hooks/`, `utils/`, `types/` | Lógica reutilizable, utilidades y tipos |

Pantallas: `/login`, `/lab` (pública), `/dashboard`, `/routes`, `/stops`, `/planner`, `/map`, `/live`, `/alerts`, `/history`, `/profile`, `/admin` y `/monitoring` (estas dos solo para el rol ADMIN).

## Backend (`backend/src/`)

| Carpeta / archivo | Responsabilidad |
|---|---|
| `app.ts` | Ensambla middleware y rutas; no abre un puerto (reutilizable fuera del servidor local) |
| `server.ts` | Solo desarrollo local: `app.listen` en `PORT` (3001 por defecto) |
| `middleware/` | Identificador de solicitud, **escenario de prueba**, autenticación y manejo de errores |
| `routes/apiRouter.ts` | Definición de todos los endpoints |
| `controllers/` | Leen y validan parámetros, llaman al servicio y responden |
| `services/` | Lógica de negocio pura sobre los datos (búsqueda, planificación, llegadas…) |
| `scenario/` | Catálogo de escenarios y conjuntos de datos alternativos |
| `data/` | Carga, esquemas (zod) e integridad de los fixtures |
| `auth/` | Firma y verificación de tokens de sesión |

Detalle de endpoints: [api.md](api.md).

## Datos (`data/`)

Archivos JSON de **solo lectura** (`users`, `routes`, `stops`, `buses`, `alerts`, `schedules`, `history`, `points-of-interest`). Se importan de forma estática y se validan al iniciar la API: si un archivo es inválido, la API no inicia. Ver [data.md](data.md).

## Flujo de una solicitud

1. La página llama a un servicio del frontend, que usa `apiRequest` (`services/apiClient.ts`).
2. El cliente agrega el escenario activo (`X-Scenario`, `X-Response-Delay`) y la sesión (`Authorization: Bearer …`).
3. La API aplica el escenario en **un solo middleware** (`middleware/scenario.ts`): retraso, falla forzada o conjunto de datos alternativo.
4. El controlador valida parámetros y llama al servicio.
5. La respuesta usa siempre el mismo formato (`{ data }` o `{ error }`); la interfaz muestra el resultado o un estado con selector estable (`route-results`, `no-results`, `server-error`…).

## Estado y persistencia

| Dato | Dónde vive | Consecuencia |
|---|---|---|
| Sesión | `localStorage` (`mi-ruta:session`) con token firmado | Sobrevive a recargar la página |
| Escenario activo | `localStorage` (`mi-ruta:scenario`) | Un escenario por navegador; no afecta a otros estudiantes |
| Historial nuevo | `localStorage` (`mi-ruta:history:<usuario>`) | Ver [history.md](history.md) |
| Cambios de administración | `localStorage` (`mi-ruta:admin-demo`) | Modo demostración; ver [admin.md](admin.md) |
| Datos originales | `data/*.json` | Nunca se modifican |

La API no guarda estado entre solicitudes. Esto es intencional: permite ejecutarla como funciones serverless, que no comparten memoria.

## Decisiones de diseño

| Decisión | Motivo |
|---|---|
| Datos JSON en lugar de base de datos | Proyecto sencillo y reproducible, centrado en calidad |
| Escenario enviado en cada solicitud (no guardado en el servidor) | Aislamiento entre estudiantes y compatibilidad con serverless |
| Sesión con token firmado y sin estado | Mismo motivo; limitación documentada en [api.md](api.md) |
| `data-testid` en todo elemento importante | Selectores estables para Selenium IDE; ver [testability-matrix.md](testability-matrix.md) |
| Rutas relativas `/api/...` | Mismo código en local y en producción |
