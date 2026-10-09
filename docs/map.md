# Mapa simulado

El mapa de Mi Ruta es un **SVG propio**: no usa Google Maps, APIs de mapas, GPS ni datos geográficos reales. Dibuja las coordenadas ficticias de `/data` en un lienzo de 1000 × 600 unidades (1 unidad = 5 metros simulados).

## Modos (definidos por la URL)

| URL | Modo | Qué destaca |
|---|---|---|
| `/map` | Vista general | Todas las rutas activas, todos los buses en servicio |
| `/map?route=R12` | Ruta | La ruta completa; las demás quedan atenuadas |
| `/map?route=R12&origin=S01&destination=S03` | Ruta con tramo | Solo el tramo entre origen y destino |
| `/map?origin=S01&destination=S05&option=R18-R22` | Itinerario | Los tramos de la opción del planificador, con transbordos |
| `…&stop=S03` | (cualquiera) | Mantiene seleccionado un paradero |

Entradas al mapa: botón **Ver en el mapa** del detalle de una ruta (`link-route-map`) y de cada opción del planificador (`link-trip-map-<id>`).

Entradas inválidas no rompen la página: una ruta inexistente muestra la vista general con el aviso `map-route-not-found`; una opción inexistente muestra la recomendada con `map-option-not-found`; un viaje imposible muestra `map-no-itinerary`.

## Elementos y selectores

| Elemento | Selector | Atributos útiles |
|---|---|---|
| Lienzo | `route-map` | `data-mode` = `overview` \| `route` \| `itinerary` |
| Resumen textual | `map-summary` | texto con ruta, tiempo y transbordos |
| Ruta dibujada | `map-route-<ruta>` / `map-route-focus-<ruta>` | `data-emphasis`, `stroke-dasharray` (ruta suspendida) |
| Paradero | `map-stop-<id>` | `data-role` = `origin` \| `destination` \| `transfer` \| `path` \| `idle`; `data-status`; `aria-pressed` |
| Nombre del paradero | `map-stop-label-<id>` | |
| Bus | `map-bus-<id>` | `data-route-id`, `data-x`, `data-y` |
| Lugar de interés | `map-place-<id>` | |
| Información del paradero | `map-stop-info` | `data-stop-id`; `map-stop-info-name`, `-role`, `-routes`, `-status` |
| Capas | `toggle-map-buses`, `toggle-map-places`, `toggle-map-labels` | casillas de verificación |
| Ruta a destacar | `input-map-route` | select nativo |
| Leyenda | `map-legend` | |
| Alternativa textual | `map-text-alternative` | `map-path-stop-<id>` en orden de recorrido |

## Accesibilidad

- Los paraderos son elementos enfocables: **Tab** para recorrerlos, **Enter** o **Espacio** para seleccionarlos. Cada uno tiene un `aria-label` con nombre, código, estado y rol en el recorrido.
- El rol de un paradero se indica con **letra y color** (A origen, B destino, T transbordo); el mantenimiento, con borde punteado y el texto "(mant.)". Nunca solo con color.
- La **descripción textual del mapa** enumera los paraderos del recorrido en orden, como alternativa al dibujo.

## Diseño adaptable

El dibujo mantiene un ancho mínimo legible de 640 px. En pantallas angostas (teléfonos) el mapa se desplaza **dentro de su propio recuadro**; la página nunca genera desplazamiento horizontal. Este comportamiento es intencional y puede analizarse como parte de una prueba de usabilidad.

## Posición de los buses

La API calcula la posición de cada bus interpolando linealmente entre dos paraderos según su minuto en la ruta (`startMinute`). Un bus exactamente en el minuto de un paradero se reporta *en* ese paradero. Ejemplo de referencia: BUS102 (R12, minuto 7) está a 1/6 del camino entre S02 y S03, en (288,3; 188,3). La simulación en tiempo real (Fase 10) hará avanzar esas posiciones.
