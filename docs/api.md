# API de Mi Ruta

API REST de solo lectura sobre los fixtures de `/data` (ver [data.md](data.md)).
El frontend la consume con **rutas relativas** (`/api/...`), tanto en local (proxy de Vite) como en producción.

## Convenciones

**Respuesta exitosa**

```json
{ "data": [ ... ], "meta": { "count": 4 } }
```

`meta.count` solo aparece en listas. `GET /api/health` es la excepción: responde `{ "status": "ok" }`.

**Respuesta de error**

```json
{
  "error": {
    "status": 404,
    "code": "NOT_FOUND",
    "message": "La ruta R99 no existe.",
    "requestId": "3f1c…"
  }
}
```

- `message` es apto para mostrarse al usuario; nunca incluye trazas internas.
- `requestId` coincide con el header `X-Request-Id` y sirve para relacionar una evidencia con una solicitud concreta.

**Headers en todas las respuestas**

| Header | Valor | Motivo |
|---|---|---|
| `X-Request-Id` | UUID | Trazabilidad de cada solicitud |
| `Cache-Control` | `no-store` | Cada ejecución de prueba recibe una respuesta nueva, nunca una cacheada |
| `X-Content-Type-Options` | `nosniff` | Buena práctica básica de seguridad |

## Endpoints disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Estado de la API |
| GET | `/api/routes` | Todas las rutas (activas e inactivas, con `active` y `status`) |
| GET | `/api/routes?origin=S01&destination=S03` | Búsqueda de rutas **directas** (ver abajo) |
| GET | `/api/routes/:id` | Detalle de ruta con paraderos nombrados y `stopCount` |
| GET | `/api/stops` | Paraderos con `routeIds`. Filtros opcionales: `q` (texto) y `status` |
| GET | `/api/stops/nearby?place=P02` | Los 3 paraderos más cercanos a una ubicación simulada |
| GET | `/api/stops/:id` | Detalle con `routes` (estado y destino siguiente) y `places` cercanos |
| GET | `/api/places` | Ubicaciones simuladas (puntos de interés) |
| GET | `/api/plan?origin=S01&destination=S05` | Planificación con transbordos: recomendada + alternativas |
| GET | `/api/buses?tick=0` | Estado de todos los buses en un minuto simulado (ver [realtime.md](realtime.md)) |
| GET | `/api/buses/:id?tick=0` | Estado de un bus |
| GET | `/api/arrivals?stop=S03&tick=0` | Próximas llegadas a un paradero |
| GET | `/api/alerts` | Alertas **activas**, de mayor a menor severidad y luego más recientes. Filtros: `level`, `type`, `route` |
| GET | `/api/alerts/:id` | Detalle de una alerta, incluidas las inactivas (`active: false`) |

Los identificadores no distinguen mayúsculas: `/api/routes/r12` equivale a `/api/routes/R12`.

### Búsqueda de rutas

`GET /api/routes?origin=<paradero>&destination=<paradero>` devuelve las rutas **directas** (sin transbordo) que pasan primero por el origen y luego por el destino, ordenadas de la más rápida a la más lenta.

Cada resultado incluye el **tramo consultado**, no la ruta completa: `estimatedMinutes` y `stopCount` se calculan entre el origen y el destino elegidos (ambos incluidos), y `stops` contiene solo ese tramo.

| Regla | Comportamiento |
|---|---|
| Rutas inactivas (R30) | Se excluyen |
| Paradero que no está `ACTIVE` (S08 en mantenimiento) | Ninguna ruta se detiene ahí → lista vacía |
| Sentido contrario (S03 → S01) | Lista vacía (las rutas tienen sentido) |
| Origen o destino vacío / mal formado | 400 `VALIDATION_ERROR` con detalle por campo |
| Origen igual a destino | 400 `VALIDATION_ERROR` en `destination` |
| Paradero inexistente (S99) | 404 `NOT_FOUND` |

Ejemplos de referencia: S01 → S03 devuelve R15 (9 min, 2 paraderos) y R12 (12 min, 3 paraderos).

### Paraderos

- `q` busca en código, nombre, dirección y zona, **sin distinguir mayúsculas ni tildes** (`biblioteca publica` encuentra "Biblioteca Pública"). Máximo 50 caracteres.
- `status` acepta `ACTIVE`, `MAINTENANCE` o `CLOSED`; otro valor responde 400.
- Sin coincidencias → `200` con lista vacía (no es un error).

### Paraderos cercanos (simulados)

No se usa GPS. El usuario elige una **ubicación simulada** (`/api/places`) y la API calcula la distancia en línea recta sobre las coordenadas del mapa ficticio:

- 1 unidad del mapa = **5 metros**; distancia redondeada a la decena de metros.
- Velocidad peatonal = **80 m/min**; minutos redondeados hacia arriba (mínimo 1).
- Empates de distancia se resuelven por código de paradero, para que el orden sea siempre el mismo.

Ejemplo de referencia: desde "Museo de la Ciudad" (P02) → S03 a 430 m (6 min), S08 a 990 m (13 min), S02 a 1240 m (16 min).

### Planificación de recorridos

`GET /api/plan?origin=<paradero>&destination=<paradero>` combina rutas activas para llegar al destino. A diferencia de la búsqueda de rutas, **admite transbordos**.

| Regla | Valor |
|---|---|
| Transbordos máximos | 2 (hasta 3 tramos) |
| Espera simulada por transbordo | 5 minutos (fija, para que el resultado sea reproducible) |
| Tiempo total | minutos de viaje + minutos de espera |
| Paradas totales | paraderos distintos del recorrido completo, incluidos origen y destino |
| Orden | tiempo total → menos transbordos → códigos de ruta |
| Opciones devueltas | máximo 5; la primera es la **recomendada** |
| Restricciones | no reutiliza una ruta ni repite paraderos; ignora rutas inactivas y paraderos que no están `ACTIVE` |

Cada opción tiene un `id` formado por sus rutas (`R18-R22`) y etiquetas: `DIRECT` (sin transbordos), `FASTEST` (la más rápida) y `FEWEST_TRANSFERS` (solo cuando las opciones difieren en transbordos).

Ejemplos de referencia:

| Origen → Destino | Recomendada | Alternativas |
|---|---|---|
| S01 → S05 | R18-R22: 11 + 16 + 5 = **32 min**, 5 paradas, transbordo en S07 | R15-R22 (39 min), R12-R22 (42 min) |
| S01 → S03 | R15 directa, 9 min | R12 directa (12 min) |
| S02 → S04 | R12-R22-R18: 6 + 9 + 7 + 10 = **32 min**, 2 transbordos | — |
| S05 → S01 | Sin opciones (lista vacía) | — |

> La recomendada para S01 → S05 **no** es la combinación intuitiva (R12 + R22 por el Centro): es más rápido transbordar en la Biblioteca. Es un buen caso para verificar que la prueba valida el resultado esperado y no una suposición.

### Autenticación y cuenta

| Método | Endpoint | Sesión | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | — | Body `{ username, password }` → `{ token, expiresAt, user }` (nunca incluye la contraseña) |
| POST | `/api/auth/logout` | — | Siempre `{ loggedOut: true }`; el cliente descarta el token |
| GET | `/api/auth/me` | Requerida | Usuario actual |
| PUT | `/api/profile` | Requerida | Body `{ fullName, email, phone }`; valida y devuelve el perfil actualizado **sin persistirlo** |
| GET | `/api/history` | Requerida | Historial inicial **solo del usuario autenticado**, más reciente primero |

La sesión se envía en el header `Authorization: Bearer <token>`.

**Modelo de sesión.** El token es un valor firmado con HMAC-SHA256 que contiene usuario, rol y expiración. Es *sin estado* porque la API corre como función serverless (sin memoria compartida entre instancias). Consecuencias, documentadas a propósito:

- Cerrar sesión elimina el token del navegador, pero **el servidor no puede revocarlo**: seguiría siendo válido hasta expirar.
- Modificar el contenido del token (por ejemplo, cambiar el rol a `ADMIN`) invalida la firma y la API lo rechaza.
- La duración por defecto es de 120 minutos.

**Configuración (opcional)**

| Variable | Por defecto | Uso |
|---|---|---|
| `AUTH_SECRET` | secreto de demostración público | Clave de firma de los tokens |
| `SESSION_TTL_MINUTES` | `120` | Duración de la sesión |

> **Hallazgo de seguridad intencional.** El login responde mensajes distintos para "usuario inexistente" y "contraseña incorrecta" porque la actividad requiere probar ambos casos. En un sistema real esto permite **enumerar usuarios**; lo recomendable es un mensaje genérico único. Es un buen caso para analizar en pruebas de seguridad.

### Escenarios de prueba

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/scenario` | Configuración que el servidor recibe de este navegador (headers `X-Scenario`, `X-Response-Delay`) y catálogo de escenarios |
| POST | `/api/scenario` | Body `{ "scenario": "SLOW_RESPONSE", "responseDelay": 3000 }`: valida un escenario (no lo guarda) |

Todas las respuestas incluyen `X-Scenario-Applied`. Un header de escenario inválido responde 400 `INVALID_SCENARIO`. Ver [scenarios.md](scenarios.md).

### Administración (solo rol ADMIN)

Todas requieren sesión (401 sin ella) y rol `ADMIN` (403 para pasajeros). **Validan y autorizan, pero no guardan**: la respuesta incluye `meta.persisted: false`. Ver [admin.md](admin.md).

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/admin/summary` | Indicadores derivados de los datos |
| GET | `/api/admin/schedules` | Horarios con nombre de ruta |
| GET | `/api/admin/alerts` | Todas las alertas, incluidas las inactivas |
| POST | `/api/admin/routes` | Crear ruta: 201, 400 (datos) o 409 (código existente) |
| PUT | `/api/admin/routes/:id` | Editar ruta: 200 o 400 (el código no se puede cambiar) |
| PATCH | `/api/admin/{routes\|stops\|buses\|alerts}/:id/status` | Body `{ "active": true }`: activar o desactivar |

## Errores controlados

| Situación | Ejemplo | Estado | `code` |
|---|---|---|---|
| Identificador con formato inválido | `GET /api/routes/XYZ` | 400 | `INVALID_ID` |
| Cuerpo JSON mal formado | `POST` con `{ invalid` | 400 | `INVALID_JSON` |
| Campos obligatorios o con formato inválido | login sin usuario | 400 | `VALIDATION_ERROR` (incluye `details` por campo) |
| Usuario inexistente | `nadie.demo` | 401 | `USER_NOT_FOUND` |
| Contraseña incorrecta | `pasajero.demo` + clave errada | 401 | `WRONG_PASSWORD` |
| Sin sesión | `/api/history` sin token | 401 | `UNAUTHENTICATED` |
| Token alterado o inválido | firma incorrecta | 401 | `INVALID_TOKEN` |
| Sesión expirada | token vencido | 401 | `SESSION_EXPIRED` |
| Cuenta bloqueada | `bloqueado.demo` | 403 | `ACCOUNT_LOCKED` |
| Rol insuficiente | pasajero en endpoint de administración | 403 | `FORBIDDEN` |
| Código de ruta ya existente | `POST /api/admin/routes` con `R12` | 409 | `CONFLICT` |
| Escenario inválido en headers | `X-Scenario: CHAOS` | 400 | `INVALID_SCENARIO` |
| Escenarios de falla | ver [scenarios.md](scenarios.md) | 400 / 401 / 500 / 503 | `INVALID_DATA`, `UNAUTHORIZED`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE` |
| Recurso inexistente | `GET /api/routes/R99` | 404 | `NOT_FOUND` |
| Endpoint inexistente | `GET /api/nope` | 404 | `ENDPOINT_NOT_FOUND` |
| Falla inesperada | — | 500 | `INTERNAL_ERROR` |

> La diferencia entre **400** y **404** es intencional: `XYZ` no puede ser una ruta (error del cliente al formar la solicitud), mientras que `R99` tiene un formato válido pero no existe.


## Estructura del backend

```
backend/src/
├── app.ts              # ensambla middleware y rutas (sin listen: reutilizable en Vercel)
├── server.ts           # solo desarrollo local: app.listen
├── routes/             # definición de endpoints
├── controllers/        # lectura/validación de parámetros → servicio → respuesta
├── services/           # lógica de negocio pura sobre los fixtures
├── middleware/         # requestContext, errorHandler
├── data/               # esquemas, integridad y carga de fixtures
└── utils/              # HttpError, formato de respuesta
```
