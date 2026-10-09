# Laboratorio de escenarios de prueba

Permite cambiar el comportamiento del sistema bajo prueba **sin modificar el código fuente**.

## Cómo activar un escenario

| Forma | Ejemplo | Uso típico |
|---|---|---|
| Interfaz | `/lab` → elegir escenario → **Aplicar escenario** | Docente o estudiante, manualmente |
| Tarjeta del catálogo | `/lab` → **Activar** en la tarjeta del escenario | Cambio rápido |
| URL | `/dashboard?scenario=SLOW_RESPONSE&delay=3000` (cualquier página) | Selenium (`open`), enlaces compartidos |
| Volver a NORMAL | `/lab` → **Volver a NORMAL**, o `?scenario=NORMAL` | Siempre disponible |

- El parámetro `scenario` no distingue mayúsculas; al aplicarse se **quita de la barra de direcciones**.
- `delay` solo aplica a `SLOW_RESPONSE`: 1000, 3000, 5000 u 8000 ms (por defecto 3000).
- La página `/lab` es **pública**: aunque el escenario impida iniciar sesión, siempre se puede volver a NORMAL.
- El escenario activo se ve siempre en la barra superior y en el inicio de sesión (`scenario-badge`, `data-scenario`).

## Alcance: un escenario por navegador

El escenario se guarda en el navegador (`localStorage`) y se envía al servidor en **cada solicitud**:

```
X-Scenario: SLOW_RESPONSE
X-Response-Delay: 3000
```

El servidor lo aplica en **un solo middleware** (`backend/src/middleware/scenario.ts`); ni los controladores ni los componentes conocen el escenario activo. Consecuencias:

- **No afecta a otros estudiantes**: cada navegador tiene su propio escenario.
- No depende de memoria compartida del servidor (necesario en Vercel: las funciones serverless no comparten estado).
- Las solicitudes simultáneas con escenarios distintos no se mezclan (verificado con pruebas automatizadas).

El servidor confirma lo que recibe en `GET /api/scenario` (panel **Configuración recibida por el servidor**, con `currentScenario`, `responseDelay`, `serviceAvailability`, `routeDataConsistency` y `sessionState`).

## Escenarios

| Escenario | Etiqueta | Efecto | HTTP |
|---|---|---|---|
| `NORMAL` | NORMAL | Datos originales | 200 |
| `NO_RESULTS` | SIN RESULTADOS | Búsquedas y filtros vacíos (rutas, planificador, paraderos filtrados, cercanos, llegadas, alertas filtradas); catálogos completos disponibles | 200 |
| `INVALID_DATA` | DATOS INVÁLIDOS | Solicitudes rechazadas por datos inválidos | 400 |
| `SERVER_ERROR` | ERROR SERVIDOR | Error interno en datos e inicio de sesión (`/api/health` sigue respondiendo) | 500 |
| `SERVICE_UNAVAILABLE` | SERVICIO NO DISPONIBLE | Servicio caído, incluido `/api/health`; header `Retry-After: 30` | 503 |
| `SLOW_RESPONSE` | RESPUESTA LENTA | Toda respuesta se retrasa el tiempo configurado | 200 |
| `ROUTE_CHANGED` | RUTA MODIFICADA | R12 se desvía por Avenida Las Palmas (no pasa por Plaza del Mercado) y se publica una alerta | 200 |
| `BUS_DELAYED` | BUS RETRASADO | Buses de R12 con 8 minutos de retraso; alerta A03 activa | 200 |
| `INCONSISTENT_DATA` | DATOS INCONSISTENTES | Contradicciones deliberadas entre pantallas | 200 |
| `EMPTY_DATA` | DATOS VACÍOS | Sin rutas, paraderos, buses, alertas ni historial; el inicio de sesión funciona | 200 |
| `UNAUTHORIZED` | NO AUTORIZADO | Solicitudes rechazadas por falta de autorización; **la sesión no se cierra** | 401 |
| `SESSION_EXPIRED` | SESIÓN EXPIRADA | Toda solicitud **con sesión** se rechaza como expirada: la sesión se cierra | 401 |

Excepciones que nunca se ven afectadas: `/api/scenario` (para poder volver siempre) y el cierre de sesión.

## Qué se observa en la interfaz

| Situación | Selector |
|---|---|
| Carga en curso (`SLOW_RESPONSE`) | `loading-indicator`; botones con `data-state="loading"` |
| Error 500 | `server-error` |
| Error 503 | `service-unavailable` |
| Error 400 (`INVALID_DATA`) | `invalid-data` |
| Error 401 (`UNAUTHORIZED`) | `unauthorized` |
| Sesión expirada | inicio de sesión con `session-expired` |
| Sin resultados | `no-results` |
| Colecciones vacías | `no-results`, `buses-empty`, `history-empty`… |
| Detalle técnico de cualquier error | `error-details` → `error-details-status`, `error-details-code`, `error-details-request-id` |

Los mensajes para el usuario son amigables; el código HTTP y el código de error quedan disponibles para el análisis en **Detalles técnicos**.

## Nota para el docente: `INCONSISTENT_DATA`

Este escenario **no pasa** la validación de integridad a propósito. Contiene tres contradicciones:

1. El catálogo indica que R18 dura **12 minutos**, pero su recorrido y la búsqueda S01 → S04 indican **18 minutos**.
2. BUS103 tiene un retraso negativo: su ETA en Tiempo real es **negativa** (−3 minutos en el minuto 0).
3. Una alerta de retraso de R22 está activa, pero la ruta y sus buses no reportan retraso.

## Agregar un escenario

1. Agrega el identificador y su definición en `backend/src/scenario/scenarios.ts`.
2. Define su efecto en **un** lugar: una falla en `forcedFailure` (`middleware/scenario.ts`) o un conjunto de datos en `scenario/datasets.ts` (se valida al iniciar la API, salvo que se indique lo contrario).
3. Agrega el identificador y su etiqueta en `frontend/src/types/scenario.ts`.
4. Agrega pruebas en `backend/src/scenarios.test.ts` y ejecuta `npm run check`.
