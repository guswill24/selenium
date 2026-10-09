# Presentación de la sesión

Mi Ruta incluye la presentación de la sesión CIPAS *Calidad de Software – Automatización de pruebas con Selenium IDE. Caso práctico: Mi Ruta*: 27 láminas que recorren el proceso desde el usuario hasta la evidencia de prueba.

## Cómo abrirla

| Desde | Cómo |
|---|---|
| Inicio de sesión (`/login`) | Enlace **Presentación** (`link-login-presentation`) |
| Menú lateral (con sesión iniciada) | **Presentación** al pie del menú (`nav-presentation`) |
| Dirección directa | `/presentacion/`; con `#N` abre la lámina N (por ejemplo `/presentacion/#18`) |

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

## Portada animada

La lámina 1 se anima con la misma técnica de la plantilla de presentaciones (18 segundos):

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
| `assets/slide-01.webp` … `slide-27.webp` | Láminas en WebP (convertidas de `control/sele0.png` … `sele26.png`, en ese orden: 0, 1, 2a, 3a, 4a, 5 … 26) |
| `sw.js` | Service worker limitado a `/presentacion/`; no afecta a la aplicación ni a `/api` |
| `manifest.webmanifest`, `icons/`, `et_douloureux.ogg` | Instalación como app, íconos y música |

Vite copia la carpeta tal cual al build, y Vercel la sirve como archivos estáticos antes de aplicar las reescrituras de la aplicación. `vercel.json` redirige `/presentacion` a `/presentacion/`.

Se basa en la plantilla de presentaciones de `control/present/`, que no se modifica.

## Cambiar o agregar láminas

1. Convertir la imagen a WebP (16:9) y guardarla como `assets/slide-NN.webp`.
2. Agregar su entrada en `slides.js`, en el orden correcto, con `title` y `alt`.
3. Subir la versión de `mi-ruta-deck-vN` (por ejemplo de `v3` a `v4`) en `sw.js` **y** en `index.html`; si no, los navegadores que la guardaron sin conexión seguirán mostrando la versión anterior.

## Limitaciones conocidas

- La música y el sonido de la animación solo arrancan después del primer clic o tecla: es una regla de los navegadores.
- Si se reemplaza la imagen de la portada, hay que revisar las coordenadas de `R`, `BUS_POLY` y `LAPTOP_POLY` en `anim/cover.js`.
- Mientras el bus avanza se ve un fondo dibujado (edificios, árboles y calle) que reemplaza lo que el bus tapa en la imagen original.
- Algunos Safari de iPhone no reproducen `.ogg`.
- La barra de controles se superpone a la franja inferior de la lámina mientras está visible.
- Las láminas son imágenes: el texto alternativo resume cada una, pero no reemplaza el detalle visual.
