# Alertas

## Niveles y tipos

| Nivel (`level`) | Etiqueta | Uso |
|---|---|---|
| `CRITICAL` | Crítica | Interrupción total de un servicio |
| `WARNING` | Advertencia | Cambios o problemas que afectan el viaje |
| `INFO` | Informativa | Información útil que no afecta el servicio |
| `NORMAL` | Normal | Estado general sin novedades |

Tipos (`type`): `DELAY` (Retraso), `ROUTE_CHANGE` (Cambio de ruta), `INTERRUPTION` (Interrupción), `INFORMATION` (Información).

El nivel se comunica siempre con **texto, ícono y borde de color**; nunca solo con color.

## Alertas activas en el escenario NORMAL

| Id | Nivel | Tipo | Ruta | Título |
|---|---|---|---|---|
| A05 | Crítica | Interrupción | R30 | Ruta R30 suspendida |
| A04 | Advertencia | Cambio de ruta | R22 | Mantenimiento en paradero Estadio Municipal |
| A02 | Informativa | Información | — | Horario de fin de semana |
| A01 | Normal | Información | — | Servicio en operación |

Inactivas: **A03** (*"Ruta R12 presenta retraso de 8 minutos."*) y A06.

> **Coherencia de datos.** A03 está inactiva en NORMAL porque los buses de R12 no tienen retraso (BUS102 muestra *ETA 5 minutos*). Mostrar un retraso que el resto del sistema contradice sería un defecto. El escenario **BUS_DELAYED** activa A03 junto con el retraso real de R12. La validación de datos rechaza cualquier alerta de retraso activa sobre una ruta que no esté en estado `DELAYED`.

## Dónde aparecen

- **Aviso del servicio** (`alert-service`): banda bajo la barra superior en todas las páginas (excepto `/alerts`) con la alerta más grave (crítica o advertencia). Se puede cerrar (`btn-dismiss-service-alert`); permanece cerrada solo en la pestaña actual.
- **Inicio**: cantidad de alertas activas (`dashboard-alerts-count`) y enlace a la página.
- **Página `/alerts`**: contadores por nivel que también filtran, filtros por nivel, tipo y ruta, y el listado.

## Filtros

Los filtros viven en la URL: `/alerts?level=WARNING&type=ROUTE_CHANGE&route=R22`. Valores desconocidos en la URL se ignoran. En la API, un valor desconocido responde 400 con detalle por campo.

## Fechas

Las fechas se muestran como `DD/MM/AAAA HH:mm` leyendo directamente el texto ISO de los datos (`2026-03-01T22:00:00-05:00` → `01/03/2026 22:00`). No se convierten con la zona horaria del equipo, para que todos los estudiantes vean exactamente el mismo valor.

## Selectores principales

| Elemento | Selector |
|---|---|
| Aviso del servicio | `alert-service` (`data-alert-id`, `data-level`), `alert-service-title`, `alert-service-message`, `link-service-alerts`, `btn-dismiss-service-alert` |
| Contadores por nivel | `alert-level-filter-<NIVEL>` (`aria-pressed`, `data-count`), `alert-count-<NIVEL>` |
| Filtros | `input-alert-level`, `input-alert-type`, `input-alert-route`, `btn-clear-alert-filters` |
| Listado | `alerts-list` (`data-count`), `alerts-count`, `no-results` |
| Tarjeta | `alert-card-<id>` (`data-level`, `data-type`), `alert-level-<id>`, `alert-type-<id>`, `alert-title-<id>`, `alert-message-<id>`, `alert-route-<id>`, `alert-date-<id>` |
