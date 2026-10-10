# Presentación de la sesión

Mi Ruta incluye la presentación de la sesión CIPAS *Calidad de Software – Automatización de pruebas con Selenium IDE. Caso práctico: Mi Ruta*: 28 láminas. La primera, **¡Amarren sus cinturones!**, abre la clase de pruebas de sistema; las 27 siguientes recorren el proceso desde el usuario hasta la evidencia de prueba.

## Cómo abrirla

| Desde | Cómo |
|---|---|
| Menú lateral | **Presentación** al pie del menú (`nav-presentation`) |
| Dirección directa | `/presentacion/`; con `#N` abre la lámina N (por ejemplo `/presentacion/#18`; la numeración cuenta la lámina de apertura, así que la portada es la 2) |

Se abre en una pestaña nueva para no interrumpir la sesión ni el escenario activo de Mi Ruta.

## Controles

| Entrada | Acción |
|---|---|
| Botones **Anterior** / **Siguiente** | Cambian de lámina |
| Teclado y presentador inalámbrico | `→` `↓` `AvPág` `Espacio` avanzan; `←` `↑` `RePág` retroceden; `Inicio` / `Fin` van a la primera o la última |
| `F` o **Pantalla completa** | Activa o desactiva la pantalla completa |
| `R` o **Reproducir** (solo en la portada) | Reproduce la animación desde el inicio |
| Deslizamiento táctil | Izquierda avanza; derecha retrocede |
| **Audio** y volumen | Música de fondo; la preferencia se recuerda en el navegador |
| **Mi Ruta** | Vuelve a la aplicación |

La barra de controles se oculta tras 3 segundos sin mover el puntero y reaparece con cualquier movimiento, toque o tecla. En pantallas de menos de 900 px muestra solo íconos.

## Lámina de apertura animada

La lámina 1 (**¡Amarren sus cinturones!**) tiene una animación sobria de 12,5 segundos dibujada encima de la imagen, sin recortarla:

| Momento | Qué ocurre |
|---|---|
| 0–1,3 s | Las luces de la cabina se encienden y la cámara se asienta (acercamiento de 1,08 a 1,00) |
| 0,35 s | Suena el aviso de cinturones de la cabina (*bing-bong*) |
| 1,7–2,9 s | Una breve turbulencia sacude la escena |
| 1,2–3,4 s | Un destello recorre el título y luego la cinta "Que comienza la clase…" |
| 2,6–4 s | Una estela punteada vuela desde el avión hasta "Arquitectura de las pruebas" |
| 3,6–5,8 s | Los niveles de prueba se iluminan de abajo hacia arriba: unitarias, integración, sistema y aceptación |
| 5,9 s | "Aquí se usa Selenium IDE" queda resaltado en dorado (y sigue latiendo suavemente) |
| 6,6–7,8 s | Destellos sobre los otros tipos de pruebas |
| 7,7–10,3 s | Una luz recorre los 6 pasos del flujo; el paso 3 (Selenium IDE) queda marcado un momento |
| 10,2–11,2 s | Destellos en los objetivos y en la libreta |
| 10,9–12,5 s | "¡Aprovecha cada minuto!" brilla, el reloj suena y el boleto "Destino" recibe un reflejo |

Después de la secuencia la lámina sigue viva con efectos suaves: partículas de luz frente a la ventana y un brillo periódico en el título, el reloj y el boleto. Respeta el botón **Audio**, el volumen, **Reproducir** / `R` y la preferencia "reducir movimiento" (muestra un cuadro fijo). Código: `anim/boarding.js`; las zonas de la imagen están en `R`, `SHAPES`, `LEVELS` y `STEPS`, y la línea de tiempo en `T`.

## Portada animada

La lámina 2 (portada) se anima con la misma técnica de la plantilla de presentaciones (18 segundos):

| Momento | Qué ocurre |
|---|---|
| 0–2,4 s | La escena aparece como pintada sobre papel; el follaje se mueve con el viento y las nubes avanzan sobre el cielo (WebGL) |
| 1,6 s | El título se arma con partículas doradas y recibe un destello |
| 4 s | **"Caso práctico: Mi Ruta"** entra como un sello, con contornos y chispas, y queda con un brillo dorado |
| 5–6,6 s | Frase, tarjeta del curso y nota |
| 6,9–8,8 s | El bus llega por la calle desde el fondo (crece a medida que se acerca), frena con un leve cabeceo y polvo en las ruedas, suena un pitido real de bus al detenerse y el letrero **"Mi Ruta"** se enciende como un LED; el cartel del paradero y el pin del mapa laten |
| 9,6–12,6 s | Los 7 pasos entran en orden; el paso **3. Mi Ruta (SUT)** se resalta en dorado |
| 13,2 s | Barra "En este CIPAS…", con "Trabajamos con un caso práctico: Mi Ruta" resaltado |
| 14,4–17,4 s | Un reflector oscurece el resto e ilumina todos los elementos de Mi Ruta |

Sonido: ambiente de ciudad (tráfico lejano, brisa y pájaros) y efectos sincronizados, hechos con Web Audio; respetan el botón **Audio** y el volumen. Con la preferencia del sistema "reducir movimiento" (en Windows: *Accesibilidad → Efectos visuales → Efectos de animación* desactivado) se muestra el cuadro final; **Reproducir** o `R` reproducen la animación cuando se pida.

Código: `anim/cover.js`. Las capas se recortan en el navegador a partir de `assets/slide-01.webp` (no hay archivos de imagen adicionales); las coordenadas de cada bloque están en el objeto `R` y la línea de tiempo en `T`.

### Créditos de audio

El pitido del bus al detenerse es una grabación real: un fragmento de 0,85 s (doble pitido, recortado, normalizado y convertido a WAV) de [*WWS CityBusMANSG220horn.ogg*](https://commons.wikimedia.org/wiki/File:WWS_CityBusMANSG220horn.ogg), bocina de un bus urbano MAN/Avtomontaža de 1991, por **Work With Sounds / Technical Museum of Slovenia**, con licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Archivo: `assets/bus-horn.wav` (crédito también en `assets/CREDITS.txt`).

## Sin conexión

Antes de la sesión, abrir `/presentacion/?offline` en el equipo con el que se va a proyectar y esperar el mensaje "Listo". Desde ese momento la presentación funciona sin internet en ese navegador (unos 11 MB).

## Cómo está construida

| Archivo (`frontend/public/presentacion/`) | Función |
|---|---|
| `index.html` | Presentación en una sola página: solo cambia la imagen, así la pantalla completa y la música no se interrumpen |
| `slides.js` | Orden, título y texto alternativo de cada lámina; `anim` indica qué lámina está animada |
| `anim/cover.js` | Animación de la portada |
| `assets/slide-00.webp` | Lámina de apertura (convertida de `control/selenium_unad.png`); en `slides.js` se indica con su propio `src` |
| `assets/slide-01.webp` … `slide-27.webp` | Láminas 2 a 28 en WebP (convertidas de `control/sele0.png` … `sele26.png`, en ese orden: 0, 1, 2a, 3a, 4a, 5 … 26). La pantalla del portátil de la lámina 7 reproduce el menú del aplicativo con sus colores (fondo `slate-900`, ítem activo `brand-700`); el azul de marca del aplicativo es el mismo de las láminas |
| `sw.js` | Service worker limitado a `/presentacion/`; no afecta a la aplicación ni a `/api` |
| `manifest.webmanifest`, `icons/`, `et_douloureux.ogg` | Instalación como app, íconos y música |

Vite copia la carpeta tal cual al build, y Vercel la sirve como archivos estáticos antes de aplicar las reescrituras de la aplicación. `vercel.json` redirige `/presentacion` a `/presentacion/`.

Se basa en la plantilla de presentaciones de `control/present/`, que no se modifica.

## Cambiar o agregar láminas

1. Convertir la imagen a WebP (16:9) y guardarla en `assets/`. La lámina N usa `assets/slide-(N-1).webp`; una lámina intercalada sin renombrar las demás lleva su propio `src` (como la de apertura).
2. Agregar su entrada en `slides.js`, en el orden correcto, con `title` y `alt`.
3. Subir la versión de `mi-ruta-deck-vN` (por ejemplo de `v3` a `v4`) en `sw.js` **y** en `index.html`; si no, los navegadores que la guardaron sin conexión seguirán mostrando la versión anterior.

## Limitaciones conocidas

- La música y el sonido de la animación solo arrancan después del primer clic o tecla: es una regla de los navegadores.
- Si se reemplaza la imagen de la portada, hay que revisar las coordenadas de `R`, `BUS_POLY` y `LAPTOP_POLY` en `anim/cover.js`.
- Mientras el bus avanza se ve un fondo dibujado (edificios, árboles y calle) que reemplaza lo que el bus tapa en la imagen original.
- Algunos Safari de iPhone no reproducen `.ogg`.
- La barra de controles se superpone a la franja inferior de la lámina mientras está visible.
- Las láminas son imágenes: el texto alternativo resume cada una, pero no reemplaza el detalle visual.
