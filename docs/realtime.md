# Información en tiempo real (simulada)

Mi Ruta **no** usa GPS ni datos reales. El "tiempo real" es una simulación **determinista**: el mismo minuto simulado produce siempre el mismo estado, para que todos los estudiantes obtengan resultados reproducibles.

## Modelo

| Concepto | Regla |
|---|---|
| Tick | 1 tick = 1 minuto simulado. Rango válido: 0 a 1440 |
| Reloj simulado | Tick 0 = **07:30** (UTC−05:00); tick N = 07:30 + N minutos |
| Ciclo de un bus | Espera 3 min en el primer paradero, recorre la ruta y vuelve a empezar (el viaje de regreso no se modela) |
| Posición | Interpolada entre dos paraderos según el minuto en la ruta |
| ETA | Minutos hasta el **próximo paradero** + retraso. En terminal incluye la espera restante |
| Llegadas a un paradero | Minutos hasta que cada bus en servicio alcanza el paradero + retraso; `0` = "Llegando" |
| Estados | `IN_SERVICE` (En recorrido), `AT_TERMINAL` (En terminal), `OUT_OF_SERVICE` (Fuera de servicio) |

Un paradero que no está operativo (S08) no recibe llegadas. Un bus fuera de servicio (BUS105) no tiene posición ni ETA.

## Interfaz (`/live`)

- **Actualizar** (`btn-refresh`) avanza un tick; **Reiniciar** (`btn-reset-simulation`) vuelve al tick 0.
- El tick vive en la URL (`/live?tick=3`): recargar la página conserva el estado y cualquier tick puede abrirse directamente.
- No hay actualización automática: los datos solo cambian cuando el usuario actualiza. Así una prueba nunca "ve" un cambio que no provocó.
- **Ver en el mapa** abre el mapa en el mismo tick (`/map?route=R12&tick=5`).

## Valores de referencia

| Tick | Hora | BUS102 (R12) | BUS104 (R22) |
|---|---|---|---|
| 0 | 07:30 | En recorrido · entre Plaza del Mercado y Centro · **ETA 5 minutos** | En terminal Centro · ETA 12 |
| 1 | 07:31 | ETA 4 minutos | En terminal · ETA 11 |
| 3 | 07:33 | ETA 2 minutos | En recorrido · en Centro · ETA 9 |
| 5 | 07:35 | En terminal Terminal Norte · ETA 9 (3 espera + 6 viaje) | En recorrido · ETA 7 |

Llegadas a **Centro (S03)** en el tick 0: BUS104 (R22) en 3 min, BUS102 (R12) en 5 min, BUS101 (R12) en 10 min.

## Selectores principales

| Elemento | Selector |
|---|---|
| Reloj / número de actualización | `live-clock`, `live-tick`; `live-status` con `data-tick` y `data-state` |
| Tarjeta de bus | `bus-card-<id>` (`data-status`, `data-route-id`) |
| Datos del bus | `bus-name-`, `bus-route-`, `bus-status-`, `bus-location-`, `bus-next-stop-`, `bus-eta-` (`data-minutes`), `bus-delay-` (`data-delay`), `bus-updated-` (`data-timestamp`) |
| Filtro por ruta | `input-live-route` |
| Llegadas | `input-arrivals-stop`, `btn-check-arrivals`, `arrivals-list`, `arrival-<bus>`, `arrival-eta-<bus>` (`data-minutes`), `arrivals-not-served` |

> **Para pruebas automatizadas:** después de hacer clic en *Actualizar*, espera a que `live-status` tenga el nuevo `data-tick` y `data-state="success"` antes de verificar valores. Verificar inmediatamente puede leer los datos del tick anterior.
