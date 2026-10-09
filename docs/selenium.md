# Guía de Selenium IDE

Esta guía enseña el **proceso** para automatizar pruebas sobre Mi Ruta con Selenium IDE. No contiene pruebas listas para entregar: los fragmentos de comandos solo muestran la sintaxis. Diseñar los casos, los datos y los resultados esperados es parte de la actividad del estudiante.

## Antes de empezar

| Requisito | Cómo comprobarlo |
|---|---|
| Mi Ruta en ejecución | `npm run dev` y abrir `http://localhost:5173` (ver [README](../README.md)) |
| Escenario conocido | `/lab` muestra el escenario activo; para empezar, **NORMAL** |
| Cuentas de demostración | [data.md](data.md) |
| Selectores disponibles | [testability-matrix.md](testability-matrix.md) |

## 1. Instalar Selenium IDE

Selenium IDE es la herramienta de grabación y reproducción del proyecto Selenium. Según la versión vigente se distribuye como extensión del navegador o como aplicación de escritorio. Descárgalo **solo** desde el sitio oficial: <https://www.selenium.dev/selenium-ide/>.

Al terminar, abre Selenium IDE desde el ícono de la extensión o desde la aplicación instalada.

## 2. Crear un proyecto

1. Elige **Create a new project** y asígnale un nombre.
2. Define la **URL base** del sistema: `http://localhost:5173` en local, o la URL publicada que indique el docente.
3. Organiza el proyecto con un nombre de prueba descriptivo por caso (por ejemplo, el código del caso y su objetivo).

Con una URL base definida, el comando `open` puede usar rutas relativas como `/login`.

## 3. Registrar (grabar) una prueba

1. Crea una prueba nueva y pulsa **Record** (grabar).
2. Selenium IDE abre el navegador en la URL base. Interactúa con la aplicación como lo haría el usuario.
3. Pulsa **Stop** para detener la grabación.

La grabación solo registra **acciones**. Todavía no comprueba nada.

> Mi Ruta guarda la sesión y el escenario en el navegador. Si al grabar entras directamente al inicio en lugar del formulario de inicio de sesión, es porque ya había una sesión abierta: cierra sesión o vuelve a NORMAL en `/lab` antes de grabar.

## 4. Editar comandos

Cada paso tiene tres campos:

| Campo | Contenido | Ejemplo |
|---|---|---|
| **Command** | Qué hacer | `click`, `type`, `open` |
| **Target** | Sobre qué elemento (localizador) | `css=[data-testid="btn-login"]` |
| **Value** | Dato adicional, si aplica | El texto que se escribe |

Tareas habituales al editar una grabación:

- Revisar el **Target** de cada paso: Selenium IDE elige un localizador automáticamente y ofrece alternativas en la lista desplegable del campo. Reemplázalo por uno basado en `data-testid` cuando no lo sea (ver secciones 8 y 9).
- Eliminar pasos accidentales (clics de más, desplazamientos).
- Cambiar valores escritos para usar los datos que defina tu caso de prueba.
- Agregar comentarios que expliquen el propósito de cada bloque.

## 5. Ejecutar la prueba

| Opción | Uso |
|---|---|
| Ejecutar la prueba actual | Verificar una prueba mientras la construyes |
| Ejecutar todas las pruebas | Ejecutar el proyecto o la suite completa |
| Paso a paso / punto de interrupción | Encontrar en qué paso falla |
| Velocidad de ejecución | Reducirla ayuda a observar, pero **no** reemplaza una espera correcta |

Ejecuta siempre desde un **estado inicial conocido**: escenario esperado, sesión cerrada o abierta según el caso, y la página inicial con `open`.

## 6. Agregar verificaciones

Un click no demuestra que una prueba haya pasado. Después de cada acción importante agrega una validación del resultado observable (ver [testing.md](testing.md#acciones-vs-validaciones)).

| Qué comprobar | Familia de comandos |
|---|---|
| Que un elemento existe | `assert element present` / `verify element present` |
| Que un elemento se ve | `assert element visible` / `verify element visible` |
| Un texto exacto | `assert text` / `verify text` |
| El valor de un campo | `assert value` / `verify value` |
| El título de la página | `assert title` / `verify title` |
| Esperar un estado (por ejemplo, con respuesta lenta) | `wait for element visible`, `wait for element not present` |

Diferencia clave:

- **`assert`**: si falla, la prueba se **detiene**. Úsalo cuando los pasos siguientes no tienen sentido sin esa condición.
- **`verify`**: si falla, se registra y la prueba **continúa**. Úsalo para revisar varios detalles de una misma pantalla.

Ejemplo de sintaxis (no es un caso completo):

```
verify element present | css=[data-testid="route-results"]
```

Para verificar texto exacto, usa los selectores de texto (`login-error-text`, `<aviso>-title`) y no el contenedor, que incluye un prefijo oculto para lectores de pantalla. Para verificar sin depender del idioma, usa atributos como `data-state`, `data-count` o `data-error-code` (ver [testability-matrix.md](testability-matrix.md#convenciones-de-selectores)).

## 7. Analizar resultados

| Dónde | Qué muestra |
|---|---|
| Lista de pasos | Cada paso en verde (correcto) o rojo (falló) |
| Panel **Log** | Mensajes de cada comando, incluido el motivo del fallo |
| Aplicación | **Detalles técnicos** bajo cada error: código HTTP, código de error y `requestId` (ver [errors.md](errors.md)) |

Antes de concluir que existe un defecto, distingue entre defecto del SUT, prueba frágil, sincronización y ambiente: ver [testing.md](testing.md#cómo-interpretar-pass--fail-en-selenium-ide).

## 8. Evitar selectores frágiles

| Selector frágil | Por qué falla | Alternativa |
|---|---|---|
| Clases CSS (`.bg-brand-700`) | Tailwind genera clases de estilo que cambian con el diseño | `data-testid` |
| Posición (`nth-child(3)`, `//div[2]/ul/li[1]`) | Cambia al agregar, filtrar u ordenar elementos | `data-testid` con el código del dato: `route-card-R12` |
| Texto visible como único criterio | Cambia con la redacción o el idioma | `data-testid` y verificar el texto por separado |
| XPath largo y absoluto | Se rompe con cualquier cambio de estructura | `css=[data-testid="…"]` |
| Pausas fijas (`pause`) | Lentas cuando sobra tiempo, insuficientes cuando falta | `wait for …` sobre el estado esperado |

## 9. Utilizar `data-testid`

Todos los elementos importantes de Mi Ruta tienen un atributo `data-testid` estable; los campos de formulario además tienen `id` y `name`.

| Localizador | Sintaxis en Selenium IDE |
|---|---|
| `data-testid` (recomendado) | `css=[data-testid="input-username"]` |
| `id` | `id=username` |
| `name` | `name=username` |

Cómo encontrar el selector de un elemento:

1. Consulta las convenciones y la matriz en [testability-matrix.md](testability-matrix.md).
2. O abre DevTools (F12) → **Elementos**, selecciona el elemento y busca su `data-testid`.
3. En DevTools → **Consola**, `document.querySelectorAll('[data-testid="…"]').length` debe ser **1**: el selector identifica un único elemento.

Los elementos de una colección terminan en el **código del dato** (`stop-card-S01`, `bus-card-BUS102`), nunca en su posición.

## 10. Exportar evidencia

| Evidencia | Cómo obtenerla |
|---|---|
| Proyecto de pruebas | Guardar el proyecto (archivo `.side`) |
| Resultado de la ejecución | Captura de pantalla de la lista de pasos y del panel **Log** |
| Estado de la aplicación | Captura de la pantalla con el resultado o el error, incluidos los **Detalles técnicos** cuando haya error |
| Trazabilidad de un error | `requestId` de **Detalles técnicos** (coincide con el header `X-Request-Id`) |
| Escenario usado | Insignia `scenario-badge` visible en la captura, o la página `/lab` |
| Código | Opción **Export** de Selenium IDE, si la actividad lo solicita |

Registra junto a cada evidencia: fecha, navegador y versión, URL base, escenario activo y cuenta utilizada.

## Escenarios y Selenium IDE

Los escenarios cambian el comportamiento del sistema sin modificar el código. Desde una prueba se pueden activar con `open` y el parámetro `scenario` en la URL (por ejemplo, `/dashboard?scenario=SLOW_RESPONSE&delay=3000`). Lista completa, efectos y selectores: [scenarios.md](scenarios.md).

Recuerda volver a **NORMAL** al terminar: el escenario se conserva en el navegador entre ejecuciones.

## Límites de Selenium IDE

Selenium IDE verifica comportamiento observable en el navegador. No mide carga ni rendimiento con precisión, no evalúa por sí mismo la accesibilidad ni juzga la calidad visual. Qué se puede automatizar y qué requiere herramientas complementarias: columna **Automatización** de [testability-matrix.md](testability-matrix.md#matriz).
