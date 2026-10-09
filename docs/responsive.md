# Diseño responsive

Mi Ruta se adapta a teléfonos, tabletas y escritorio sin desplazamiento horizontal de la página. Este documento describe el comportamiento por ancho y cómo se verificó.

## Puntos de quiebre

Se usan los puntos de quiebre estándar de Tailwind CSS 4:

| Prefijo | Ancho mínimo | Uso principal |
|---|---|---|
| (base) | 0 px | Diseño de una columna para teléfonos |
| `sm` | 640 px | Más margen lateral; listas de datos en dos columnas (etiqueta y valor) |
| `md` | 768 px | Grillas de dos columnas |
| `lg` | 1024 px | Barra lateral fija visible; en anchos menores es un menú deslizable |
| `xl` | 1280 px | Grillas de tres columnas |
| `2xl` | 1536 px | Panel lateral de información junto al mapa |

Las grillas de tarjetas usan columnas automáticas (`repeat(auto-fit, minmax(…))`) para adaptarse también cuando se amplía el texto, no solo cuando cambia el ancho de la ventana.

## Comportamiento por ancho

| Elemento | Menos de 1024 px | 1024 px o más |
|---|---|---|
| Navegación principal | Menú deslizable: botón `btn-open-menu`, se cierra con `btn-close-menu`, Escape o el fondo (`sidebar-backdrop`) | Barra lateral fija (`sidebar`); el botón de menú no se muestra |
| Marca en la barra superior | Visible (`topbar-brand`) | Oculta (la marca está en la barra lateral) |
| Secciones de administración | Las pestañas pasan a una segunda línea si no caben | Una sola línea |
| Tablas | Se desplazan dentro de su propio recuadro | Ancho completo (la tabla de rutas de administración, con 8 columnas, puede desplazarse hasta 1024 px) |
| Mapa | Se desplaza dentro de su recuadro (ancho mínimo 640 px); la alternativa textual está siempre disponible | Ancho completo |

El desplazamiento dentro de tablas y del mapa es **intencional**: son contenidos bidimensionales que WCAG 1.4.10 exceptúa del reflow. Cada recuadro con desplazamiento se puede alcanzar con el teclado.

## Cómo se verificó

| Verificación | Alcance | Resultado |
|---|---|---|
| Desplazamiento horizontal de la página | 6 anchos (360, 390, 768, 1024, 1280 y 1440 px) × 27 estados: inicio de sesión (con y sin errores), 404, todas las pantallas como administrador, formularios de creación y edición, escenarios `SERVER_ERROR`, `SERVICE_UNAVAILABLE`, `EMPTY_DATA` y `BUS_DELAYED` | 165 combinaciones sin desplazamiento horizontal ni elementos fuera de la ventana |
| Navegación según el ancho | Mismas combinaciones | Menú deslizable por debajo de 1024 px y barra lateral fija desde 1024 px |
| Menú móvil | 360, 390 y 768 px | Se abre dentro de la ventana y se cierra con Escape |
| Tamaño de objetivos táctiles (WCAG 2.5.8) | Anchos menores a 768 px | Todos los controles miden al menos 24 × 24 px (se corrigieron enlaces, casillas y `summary`) |
| Reglas automáticas (axe-core) | Rutas, mapa y administración a 360, 768 y 1024 px | 0 infracciones (se corrigió 1: la tabla de rutas no era alcanzable con teclado en teléfonos) |

## Limitaciones conocidas

- La verificación se hizo en un motor Chromium con ventanas de distintos anchos. **No** reemplaza pruebas en dispositivos reales (pantallas táctiles, barras del navegador móvil, orientación horizontal).
- No se verificó la apariencia en Firefox ni Safari; la compatibilidad entre navegadores corresponde a las pruebas NF01–NF03.

## Herramientas sugeridas para el análisis

Selenium IDE puede cambiar el tamaño de la ventana (comando `set window size`) y verificar la presencia o visibilidad de elementos en cada ancho. Sin embargo, **no** juzga si el diseño se ve bien. Para analizarlo se recomiendan:

| Herramienta | Uso |
|---|---|
| Modo dispositivo de DevTools (Chrome, Edge o Firefox) | Simular anchos y dispositivos, rotar la pantalla |
| Zoom del navegador | Comprobar el reflow al 200 % y 400 % |
| Dispositivos reales | Confirmar la experiencia táctil |
