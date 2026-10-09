# Errores controlados

Mi Ruta produce errores **deliberados y reproducibles** (HTTP 400, 401, 403, 404, 500 y 503). El usuario ve siempre un mensaje amigable en español; el detalle técnico (código HTTP, código de error e identificador de solicitud) queda disponible para el análisis, sin trazas de pila ni detalles internos.

Los escenarios de falla se activan desde la interfaz o la URL, nunca editando el código (ver [scenarios.md](scenarios.md)).

## Formato de error de la API

Toda respuesta de error usa el mismo sobre:

```json
{
  "error": {
    "status": 404,
    "code": "NOT_FOUND",
    "message": "La ruta R99 no existe.",
    "requestId": "6a0f9dd3-1d3d-4967-88c9-cf9c1cbea4e4"
  }
}
```

| Campo | Descripción |
|---|---|
| `status` | Código HTTP (igual al de la respuesta) |
| `code` | Código estable para verificar sin depender del texto |
| `message` | Mensaje en español, apto para el usuario |
| `details` | Solo en `VALIDATION_ERROR`: lista `{ field, message }` por campo |
| `requestId` | Igual al header `X-Request-Id`; permite relacionar la respuesta con el registro del servidor |

- Los errores no previstos (excepciones del código) responden **500 `INTERNAL_ERROR`** con un mensaje genérico; el detalle solo se registra en la consola del servidor.
- Un cuerpo JSON mal formado responde **400 `INVALID_JSON`**; un cuerpo mayor a 100 KB responde **413 `PAYLOAD_TOO_LARGE`** (no un error del servidor).
- En la interfaz, una falla inesperada al dibujar una pantalla muestra `app-error` («La aplicación encontró un problema») en lugar de la pantalla técnica del framework.

## Errores por código HTTP

### 400 – Solicitud inválida

| Cómo reproducirlo | Código | Mensaje amigable | Selector |
|---|---|---|---|
| Escenario `INVALID_DATA` y abrir cualquier pantalla con datos (p. ej. `/stops`) | `INVALID_DATA` | «Los datos de la solicitud no son válidos.» | `invalid-data` |
| Escenario `INVALID_DATA` e iniciar sesión | `INVALID_DATA` | Mismo mensaje | `login-error` (`data-error-code`) |
| `/stops?selected=centro` (identificador con formato inválido) | `INVALID_ID` | «El identificador "centro" no es válido para un paradero.» | `stop-detail-request-error` |
| Formularios con campos inválidos (perfil, administración) | `VALIDATION_ERROR` | Un mensaje por campo | `error-<campo>` |
| API: `POST /api/auth/login` con cuerpo `{ bad` | `INVALID_JSON` | «El cuerpo de la solicitud no es un JSON válido.» | — (solo API) |
| API: header `X-Scenario: CHAOS` | `INVALID_SCENARIO` | «El escenario "CHAOS" no existe.» | — (solo API) |

### 401 – No autenticado o no autorizado

| Cómo reproducirlo | Código | Mensaje amigable | Selector |
|---|---|---|---|
| Iniciar sesión con usuario inexistente (`nadie.demo`) | `USER_NOT_FOUND` | Mensaje del servidor | `login-error`, `login-error-text` |
| Iniciar sesión con contraseña incorrecta | `WRONG_PASSWORD` | Mensaje del servidor | `login-error`, `login-error-text` |
| Escenario `UNAUTHORIZED` y abrir una pantalla con datos | `UNAUTHORIZED` | «No estás autorizado para realizar esta operación.» (la sesión no se cierra) | `unauthorized` |
| Escenario `SESSION_EXPIRED` con sesión iniciada | `SESSION_EXPIRED` | «Tu sesión expiró» en el inicio de sesión | `session-expired` |
| API: `GET /api/history` sin token | `UNAUTHENTICATED` | «Debes iniciar sesión para continuar.» | — (solo API) |

### 403 – Acceso prohibido

| Cómo reproducirlo | Código | Mensaje amigable | Selector |
|---|---|---|---|
| Como pasajero, abrir `/admin` o `/monitoring` | — (control en la interfaz) | «Acceso denegado» | `access-denied` |
| Iniciar sesión con `bloqueado.demo` | `ACCOUNT_LOCKED` | Mensaje del servidor | `login-error` (`data-error-code="ACCOUNT_LOCKED"`) |
| API: `GET /api/admin/summary` con el token de un pasajero | `FORBIDDEN` | «No tienes permisos para acceder a este recurso.» | — (solo API) |

### 404 – No encontrado

| Cómo reproducirlo | Código | Mensaje amigable | Selector |
|---|---|---|---|
| Abrir una dirección inexistente (`/no-existe`) | — (interfaz) | «La dirección solicitada no existe» | `page-not-found`, `not-found` |
| `/stops?selected=S99` (formato válido, paradero inexistente) | `NOT_FOUND` | «El paradero S99 no existe.» | `stop-detail-not-found-error` |
| API: `GET /api/routes/R99` | `NOT_FOUND` | «La ruta R99 no existe.» | — (solo API) |
| API: `GET /api/does-not-exist` | `ENDPOINT_NOT_FOUND` | «El endpoint GET /api/does-not-exist no existe.» | — (solo API) |

> `centro` responde **400** y `S99` responde **404** a propósito: el primero no puede ser un paradero (error al formar la solicitud); el segundo es válido pero no existe.

### 500 – Error interno

| Cómo reproducirlo | Código | Mensaje amigable | Selector |
|---|---|---|---|
| Escenario `SERVER_ERROR` y abrir cualquier pantalla con datos | `INTERNAL_ERROR` | «Error del servidor. Ocurrió un problema al procesar la solicitud…» | `server-error` |
| Escenario `SERVER_ERROR` e iniciar sesión | `INTERNAL_ERROR` | «Ocurrió un problema en el servidor…» | `login-error` |
| Escenario `SERVER_ERROR` en el inicio | `INTERNAL_ERROR` | «No fue posible consultar las alertas activas.» | `dashboard-alerts-error` |

`/api/health` sigue respondiendo con `SERVER_ERROR`: el servicio está en pie, pero falla al procesar.

### 503 – Servicio no disponible

| Cómo reproducirlo | Código | Mensaje amigable | Selector |
|---|---|---|---|
| Escenario `SERVICE_UNAVAILABLE` y abrir cualquier pantalla con datos | `SERVICE_UNAVAILABLE` | «Servicio no disponible. … Intenta nuevamente en unos minutos.» | `service-unavailable` |
| Escenario `SERVICE_UNAVAILABLE` en el inicio | `SERVICE_UNAVAILABLE` | Estado de la API «No disponible» | `api-health` (`data-state="unavailable"`) |
| Escenario `SERVICE_UNAVAILABLE` e iniciar sesión | `SERVICE_UNAVAILABLE` | «El servicio no está disponible temporalmente…» | `login-error` |

La respuesta incluye el header `Retry-After: 30`, incluso en `/api/health`.

## Cómo analizar el detalle técnico

| Dónde | Qué se observa |
|---|---|
| **Detalles técnicos** (plegado bajo cada error) | `error-details-status`, `error-details-code`, `error-details-request-id`; en secciones secundarias con prefijo (`stop-detail-error-details-…`) |
| Inicio de sesión | `login-error` con `data-error-status` y `data-error-code`; detalle en `login-error-details-…` |
| Perfil | `profile-error`; detalle en `profile-error-details-…` |
| Atributos del contenedor | `data-error-status` y `data-error-code` (independientes del texto) |
| DevTools → Red | Código HTTP, sobre JSON y headers `X-Request-Id`, `X-Scenario-Applied`, `Retry-After` |

Todos los mensajes de error usan `role="alert"`, de modo que los lectores de pantalla los anuncian (ver [accessibility.md](accessibility.md)). Para verificar texto exacto, usar `<selector>-title`, `<selector>-description` o `login-error-text`.

## Cómo se verificó

| Verificación | Alcance | Resultado |
|---|---|---|
| Pruebas automáticas del backend (Vitest) | Códigos 400, 401, 403, 404, 413, 500 y 503; formato del sobre; ausencia de mensajes internos y trazas en errores inesperados | 156 pruebas aprobadas (12 archivos) |
| Solicitudes reales a la API en ejecución | Endpoint inexistente, recurso inexistente, identificador inválido, JSON mal formado, cuerpo de 200 KB, sin token, pasajero en administración, `SERVER_ERROR`, `SERVICE_UNAVAILABLE`, `INVALID_DATA`, `UNAUTHORIZED` | Código HTTP y sobre esperados en los 11 casos; `Retry-After: 30` en 503; sin trazas ni detalles internos |
| `npm run check` | lint, tipos, datos, pruebas y compilación | Sin errores |

Se corrigió en esta fase:

- Un cuerpo mayor al límite respondía 500 y se registraba como falla del servidor; ahora responde 413 `PAYLOAD_TOO_LARGE`.
- Una falla al dibujar una pantalla mostraba la pantalla técnica del framework (con traza de pila); ahora muestra `app-error`.
- Los errores del inicio de sesión y del perfil no exponían el detalle técnico; ahora tienen **Detalles técnicos**.
- Si fallaban las alertas en el inicio, el contador desaparecía sin aviso; ahora se muestra `dashboard-alerts-error`.

## Limitaciones conocidas

- Los escenarios aplican la misma falla a todas las solicitudes de datos; no simulan fallas parciales o intermitentes.
- `app-error` no se puede provocar desde el laboratorio: protege ante defectos reales de la interfaz.
