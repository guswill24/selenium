# Historial de consultas

## Qué se guarda y cuándo

Se registra una consulta solo ante una **acción explícita** del usuario:

| Acción | Origen (`data-source`) | Ruta registrada |
|---|---|---|
| Seleccionar una ruta en **Rutas** (`btn-select-route-<id>`) | `ROUTES` | `R12` |
| Elegir una opción en el **Planificador** (`btn-choose-trip-<id>`) | `PLANNER` | `R18-R22` |

Buscar sin seleccionar **no** registra nada. Repetir la misma selección de forma consecutiva solo actualiza la fecha (no crea duplicados). Tras registrar, aparece el aviso `history-saved-notice` con `history-saved-entry` (`data-entry-id`).

Cada registro contiene: fecha, origen, destino, ruta seleccionada y tiempo estimado.

## Persistencia

| Parte | Dónde vive | Detalle |
|---|---|---|
| Historial inicial | API (`GET /api/history`) | Solo del usuario autenticado; de solo lectura |
| Consultas nuevas y eliminaciones | `localStorage` del navegador (`mi-ruta:history:<usuario>`) | Separado por usuario; hasta 50 registros |

Consecuencias, a propósito:

- El historial **sobrevive a recargar la página y a cerrar sesión**, pero no pasa a otro navegador ni a otro equipo.
- Cada usuario ve solo lo suyo en el mismo navegador.
- Los archivos JSON del servidor **nunca** se modifican.

## Identificadores

- `H01`, `H02`… historial inicial (fixtures).
- `L001`, `L002`… consultas registradas en este navegador, en orden. Tras **Restaurar historial inicial** la numeración vuelve a `L001`, para que una prueba pueda repetirse desde el mismo estado.

## Fechas

Las consultas nuevas usan la **hora real del equipo** (con su zona horaria); por eso su valor exacto no es reproducible. Verifica el formato (`DD/MM/AAAA HH:mm`), no el valor. Las fechas del historial inicial sí son fijas.

## Acciones

| Acción | Selector | Resultado |
|---|---|---|
| Repetir consulta | `history-repeat-<id>` | Abre Rutas (con la ruta seleccionada) o el Planificador |
| Eliminar una | `btn-delete-history-<id>` | Aviso `history-deleted` |
| Borrar todo | `btn-clear-history` → diálogo `confirm-clear-history` | `-confirm` borra (aviso `history-cleared`); `-cancel` o **Escape** cancela |
| Restaurar | `btn-restore-history` | Vuelve al historial inicial (aviso `history-restored`) |

El diálogo de confirmación es un `<dialog>` nativo: el foco inicia en **Cancelar** (la opción segura) y vuelve al botón que lo abrió al cerrarse.

## Selectores de cada registro

`history-list` (`data-count`), `history-count`, `history-entry-<id>` (`data-source`), `history-route-<id>`, `history-date-<id>`, `history-origin-<id>`, `history-destination-<id>`, `history-time-<id>` (`data-minutes`), `history-source-<id>`, `history-empty`.
