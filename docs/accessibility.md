# Accesibilidad

Mi Ruta aplica buenas prácticas básicas de accesibilidad (WCAG 2.1/2.2, niveles A y AA) para que los estudiantes puedan **analizarla**. Este documento describe lo implementado y cómo se verificó; no es un informe de conformidad formal.

## Prácticas implementadas

| Práctica | Implementación |
|---|---|
| Idioma | `<html lang="es">` |
| Título por pantalla | "Rutas · Mi Ruta", "Iniciar sesión · Mi Ruta"… (se actualiza al navegar) |
| Regiones (landmarks) | `header`, `nav` con nombre ("Navegación principal", "Ruta de navegación"), `main`, `aside`, `footer` |
| Encabezados | Un `h1` por pantalla y jerarquía sin saltos |
| Enlace para saltar | "Saltar al contenido principal" (`skip-link`), primer elemento al pulsar Tab |
| Teclado | Todo se opera con teclado, incluidos los paraderos del mapa (Tab y Enter o Espacio) |
| Foco visible | Contorno visible en todos los elementos enfocables (`:focus-visible`) |
| Foco tras navegar | Al cambiar de pantalla el foco pasa al contenido principal |
| Menú móvil | Botón con `aria-expanded` y `aria-controls`; Escape cierra y devuelve el foco; cerrado es `inert` |
| Diálogos | `<dialog>` modal nativo: fondo inerte, foco inicial en la opción segura, Escape cancela, el foco vuelve al botón que lo abrió |
| Formularios | Cada campo tiene `<label>` asociada; obligatorios con `aria-required`; errores con `aria-invalid` y `aria-describedby` |
| Mensajes | Errores con `role="alert"`; estados y resultados con `role="status"` o `aria-live="polite"`; prefijo oculto ("Error:", "Éxito:") para lectores de pantalla |
| No depender del color | Estados con texto e ícono (badges, niveles de alerta con borde, texto e ícono); mapa con letras A/B/T y borde punteado para mantenimiento |
| Contraste | Colores de texto verificados ≥ 4,5:1 (por ejemplo, blanco sobre verde de marca: 5,53:1) |
| Imágenes e íconos | Íconos decorativos con `aria-hidden`; el mapa SVG tiene título, descripción y una **alternativa textual** |
| Tablas | `<caption>` y encabezados con `scope`; el recuadro con desplazamiento horizontal se puede enfocar con el teclado |
| Objetivos táctiles | Controles de al menos 24 × 24 px (WCAG 2.5.8) |
| Movimiento | Se respeta `prefers-reduced-motion`; el menú no usa animaciones |
| Ampliación | Sin desplazamiento horizontal a 320 px de ancho ni con el texto al 200 % |

## Cómo se verificó

| Verificación | Herramienta | Alcance | Resultado |
|---|---|---|---|
| Reglas automáticas WCAG 2.1/2.2 A/AA y buenas prácticas | axe-core 4.13 en el navegador | 22 estados: pantallas como anónimo y administrador, errores de formulario, diálogo abierto, escenario de error y menú móvil | 0 infracciones (se corrigió 1: jerarquía de encabezados en el mapa) |
| Navegación con teclado | Recorrido automatizado con Tab | 13 pantallas | Todo elemento enfocable alcanzable y con foco visible |
| Reflow (WCAG 1.4.10) | Ventana de 320 px | 14 pantallas | Sin desplazamiento horizontal |
| Texto al 200 % (WCAG 1.4.4) | Tamaño de fuente raíz al 200 % | 14 pantallas | Sin desplazamiento horizontal (se corrigieron la barra superior y cuatro grillas) |
| Títulos de página (WCAG 2.4.2) | Lectura de `document.title` | 13 pantallas | Título propio en cada una |

## Limitaciones conocidas

- Las herramientas automáticas detectan **solo una parte** de los problemas de accesibilidad. Una evaluación completa requiere revisión manual y pruebas con usuarios.
- **No** se realizaron pruebas con lectores de pantalla reales (NVDA, JAWS, VoiceOver) ni con usuarios con discapacidad.
- El mapa necesita un ancho mínimo para ser legible: en teléfonos se desplaza dentro de su propio recuadro. La alternativa textual ofrece la misma información.
- En el diálogo modal, al tabular después del último botón el foco puede pasar a los controles del propio navegador antes de volver al diálogo. Es el comportamiento estándar de `<dialog>`; el contenido de la página detrás permanece inerte.

## Herramientas sugeridas para el análisis

Selenium IDE puede verificar algunos aspectos (existencia de etiquetas, atributos `aria-*`, orden de foco con `sendKeys`), pero **no** evalúa la accesibilidad por sí mismo. Para analizarla se recomiendan herramientas complementarias:

| Herramienta | Uso |
|---|---|
| axe DevTools (extensión) | Reglas WCAG automáticas en la página actual |
| WAVE (extensión) | Visualización de errores, contraste y estructura |
| Lighthouse (DevTools de Chrome/Edge) | Auditoría de accesibilidad con puntaje |
| Lector de pantalla (NVDA en Windows, VoiceOver en macOS) | Experiencia real de navegación |
| Teclado únicamente | Recorrido con Tab, Shift+Tab, Enter, Espacio y Escape |
| Zoom del navegador y tamaño de texto | Comportamiento al 200 % y 400 % |
