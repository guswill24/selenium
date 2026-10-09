# Administración y monitoreo

Disponible solo para el rol **ADMIN** (`admin.demo` / `Admin2026!`). Un pasajero no ve estas opciones en el menú y, si abre la URL directamente, recibe **Acceso denegado** (`access-denied`); la API responde 403.

## Modo demostración (limitación intencional)

| Qué hace el servidor | Qué **no** hace |
|---|---|
| Verifica sesión (401) y rol (403) | No guarda ningún cambio |
| Valida los datos (400, con detalle por campo) | No modifica los archivos JSON |
| Detecta códigos repetidos del catálogo (409) | No comparte cambios entre navegadores |

Los cambios se guardan **solo en este navegador** (`localStorage`, clave `mi-ruta:admin-demo`) y se muestran en administración con las marcas *Nueva (demo)* o *Editada (demo)*. La **consulta pública** (Rutas, Planificador, Mapa, Tiempo real) sigue mostrando los datos del servidor.

Motivo: la API corre como funciones serverless sin almacenamiento compartido, y el proyecto no usa base de datos. Restablecer: **Restablecer datos de demostración** (`btn-admin-reset`) con confirmación (`confirm-admin-reset`).

## Operaciones

| Sección (`?tab=`) | Ver | Crear | Editar | Activar / desactivar |
|---|---|---|---|---|
| Rutas (`routes`) | ✅ | ✅ F14 | ✅ F15 | ✅ |
| Paraderos (`stops`) | ✅ | — | — | ✅ (operativo ↔ mantenimiento) |
| Horarios (`schedules`) | ✅ | — | — | — |
| Buses (`buses`) | ✅ | — | — | ✅ (en servicio ↔ fuera de servicio) |
| Alertas (`alerts`) | ✅ (incluye inactivas) | — | — | ✅ |

## Crear y editar rutas

URL: `/admin?tab=routes&mode=create` y `/admin?tab=routes&mode=edit&id=R12`.

| Campo | Regla |
|---|---|
| Código | `R` + 2 o 3 dígitos; no puede repetirse; no se modifica al editar |
| Nombre | 3 a 60 caracteres |
| Color | Hexadecimal `#RRGGBB` |
| Estado | Activa, Con retraso, Modificada o Suspendida (Suspendida ⇒ ruta inactiva) |
| Paraderos | 2 a 12, sin repetir, existentes; el primero en el minuto 0 y los minutos siempre crecientes |

Origen, destino y duración **se calculan** a partir de los paraderos. Las mismas reglas se validan en el navegador (errores inmediatos) y en el servidor (defensa si se omite la interfaz).

Ejemplo de referencia (F14): `R40` · "Universidad – Hospital" · S04 (0) → S07 (8) → S05 (20) ⇒ Universidad → Hospital Central, 20 minutos, 3 paraderos.

## Selectores principales

| Elemento | Selector |
|---|---|
| Pestañas | `admin-tab-routes`, `admin-tab-stops`, `admin-tab-schedules`, `admin-tab-buses`, `admin-tab-alerts` |
| Crear ruta | `admin-route-create` |
| Fila de ruta | `admin-route-row-<id>` (`data-origin` = `server` \| `edited` \| `new`, `data-active`) |
| Acciones de fila | `admin-route-view-<id>`, `admin-route-edit-<id>`, `admin-route-toggle-<id>` |
| Formulario | `admin-route-form` (`data-mode` = `create` \| `edit`); `input-route-id`, `input-route-name`, `input-route-color`, `input-route-status`, `input-route-stop-<n>`, `input-route-minutes-<n>`, `btn-add-route-stop`, `btn-remove-route-stop-<n>`, `btn-save-route`, `btn-cancel-route` |
| Errores del formulario | `error-route-id`, `error-route-name`, `error-route-color`, `error-route-stop-<n>`, `error-route-minutes-<n>` |
| Resultado | `admin-route-saved` (`-title`), `admin-route-detail`, `admin-status-changed`, `admin-status-error` |
| Otras entidades | `admin-stop-toggle-<id>`, `admin-bus-toggle-<id>`, `admin-alert-toggle-<id>`, `admin-schedule-row-<ruta>-<WEEKDAY\|WEEKEND>` |

> Los ejemplos del enunciado `admin-route-create` y `admin-route-edit` corresponden al botón **Crear ruta** y a los botones **Editar** de cada fila (`admin-route-edit-<id>`).

## Monitoreo (`/monitoring`)

| Indicador | Origen del dato |
|---|---|
| Estado del servicio | Derivado de las alertas activas (alerta crítica ⇒ "Operación con novedades") |
| Disponibilidad de la API | Verificación real de `/api/health` |
| Tiempo de respuesta | **Medición real** de este navegador sobre `/api/admin/summary`; varía entre equipos |
| Rutas, paraderos, buses, alertas, usuarios | Conteos de los datos del servidor |
| Consultas registradas | Historial inicial + consultas guardadas en este navegador |
| Puntualidad simulada | Buses sin retraso sobre buses en servicio (datos simulados, minuto 0) |
| Cambios de demostración | Cambios de administración guardados en este navegador |

Los conteos **no** incluyen los cambios de demostración. Este panel **no** es una herramienta de rendimiento ni de carga: para pruebas de carga o estrés se requieren herramientas especializadas.
