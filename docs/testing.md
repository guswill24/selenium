# Pruebas

Mi Ruta tiene dos tipos de pruebas con propósitos distintos:

| Tipo | Quién la ejecuta | Qué demuestra |
|---|---|---|
| **Pruebas técnicas** (Vitest) | El equipo que mantiene el SUT | Que el sistema bajo prueba funciona como está documentado |
| **Pruebas del laboratorio** (manuales y Selenium IDE) | Los estudiantes | Lo que cada estudiante diseñe en su actividad |

Este documento explica cómo ejecutar ambas y cómo interpretar los resultados. **No** contiene casos de prueba de la actividad: diseñarlos es trabajo del estudiante.

## Pruebas técnicas

Se ejecutan desde la raíz del repositorio:

| Comando | Qué hace |
|---|---|
| `npm test` | Ejecuta las pruebas del backend con Vitest (`backend/src/**/*.test.ts`) |
| `npm run validate:data` | Valida estructura e integridad de los archivos de `data/` (ver [data.md](data.md)) |
| `npm run lint` | Revisa el código con ESLint |
| `npm run typecheck` | Verifica tipos de backend y frontend |
| `npm run check` | Todo lo anterior y además la compilación (`lint` → `typecheck` → `validate:data` → `test` → `build`) |

Resultado actual de `npm test`: **156 pruebas aprobadas en 12 archivos**.

| Archivo | Cubre |
|---|---|
| `app.test.ts` | Estado de la API, endpoints de catálogo y errores controlados |
| `auth.test.ts`, `auth/token.test.ts` | Inicio de sesión, endpoints protegidos, perfil, roles y tokens |
| `routeSearch.test.ts`, `stops.test.ts`, `planner.test.ts` | Búsqueda de rutas, paraderos y planificación |
| `realtime.test.ts`, `services/busService.test.ts` | Buses y tiempos de llegada simulados |
| `alerts.test.ts` | Alertas y filtros |
| `admin.test.ts` | Administración: autorización, validación y modo demostración |
| `scenarios.test.ts` | Escenarios de prueba y su aislamiento |
| `data/fixtures.test.ts` | Validación de los fixtures |

> El frontend no tiene pruebas automáticas propias: se verifica con `typecheck`, `lint`, `build` y con las pruebas del laboratorio.

Antes de entregar cualquier cambio al SUT, `npm run check` debe terminar sin errores.

## Pruebas manuales

1. Instala y ejecuta el sistema (ver [README](../README.md)): `npm install` y luego `npm run dev`.
2. Abre `http://localhost:5173` en el navegador.
3. Inicia sesión con una cuenta de demostración (ver [data.md](data.md)).
4. Si la prueba lo requiere, activa un escenario en `/lab` (ver [scenarios.md](scenarios.md)).
5. Ejecuta los pasos, observa el resultado y regístralo como evidencia.
6. Vuelve al escenario `NORMAL` al terminar.

Dónde mirar mientras pruebas:

| Necesitas saber… | Dónde mirar |
|---|---|
| Qué escenario está activo | Insignia de la barra superior (`scenario-badge`) o `/lab` |
| Qué recibió el servidor | `/lab` → **Configuración recibida por el servidor** |
| Por qué falló una pantalla | **Detalles técnicos** bajo el mensaje de error (ver [errors.md](errors.md)) |
| Código HTTP y headers | DevTools → pestaña Red (`X-Request-Id`, `X-Scenario-Applied`) |
| Qué selector usar | [testability-matrix.md](testability-matrix.md) o DevTools → Elementos |

## Acciones vs validaciones

Una prueba automatizada combina dos tipos de pasos:

| Tipo | Ejemplos en Selenium IDE | Qué hace |
|---|---|---|
| **Acción** | `open`, `click`, `type`, `select` | Cambia el estado de la aplicación |
| **Validación** | `assert …`, `verify …`, `wait for …` (existencia, texto, valor, visibilidad, título) | Comprueba que el estado es el esperado |

**Un click no demuestra que una prueba haya pasado.** Una prueba solo con acciones termina en verde aunque la aplicación muestre un error, porque nada lo comprobó. Después de cada acción relevante debe existir una validación del resultado observable:

```
click   | css=[data-testid="btn-login"]
verify element present | css=[data-testid="dashboard"]
```

El fragmento solo ilustra la sintaxis; ver [selenium.md](selenium.md).

## Cómo interpretar PASS / FAIL en Selenium IDE

| Resultado | Significado |
|---|---|
| Paso en verde | El comando se ejecutó; si es una validación, la condición se cumplió |
| `assert` en rojo | La condición no se cumplió y **la prueba se detiene** en ese paso |
| `verify` en rojo | La condición no se cumplió, se registra el fallo y **la prueba continúa**; al final la prueba queda como fallida |
| Prueba en verde (PASS) | Todas sus validaciones se cumplieron. Si no tiene validaciones, el verde no demuestra nada |
| Prueba en rojo (FAIL) | Al menos una validación falló o un comando no pudo ejecutarse (por ejemplo, el elemento no existe) |

### Un FAIL no siempre es un defecto del SUT

Antes de reportar un defecto, identifica la causa:

| Causa probable | Señales | Qué hacer |
|---|---|---|
| **Defecto del SUT** | El fallo se repite siempre con los mismos pasos y datos; el comportamiento contradice lo documentado | Registrar el defecto con evidencia (pasos, resultado esperado y obtenido, `requestId` si hay error) |
| **Escenario activo** | El escenario no es `NORMAL` (por ejemplo, `SERVER_ERROR`) | Confirmar en `scenario-badge` qué escenario estaba activo y cuál se esperaba |
| **Prueba frágil** | Falla al cambiar texto, orden o estilos; usa XPath largos, posiciones o clases CSS | Usar `data-testid` (ver [selenium.md](selenium.md)) |
| **Sincronización** | Falla a veces; pasa al ejecutar paso a paso; escenario `SLOW_RESPONSE` | Esperar el estado observable (`wait for …`) en lugar de pausas fijas |
| **Ambiente** | La API no responde, puerto ocupado, datos del navegador de otra ejecución | Verificar `npm run dev`, `/api/health`, limpiar `localStorage` o usar una ventana nueva |
| **Expectativa incorrecta** | El resultado obtenido coincide con la documentación, pero no con lo que la prueba supone | Revisar el resultado esperado en [api.md](api.md) y los documentos del módulo |

Una buena práctica es repetir la prueba fallida al menos una vez en un estado limpio: un defecto del SUT es reproducible; un problema de sincronización o de ambiente suele no serlo.

## Qué no cubre Selenium IDE

Selenium IDE verifica comportamiento observable en el navegador. Algunas características de ISO/IEC 25010 requieren herramientas complementarias (carga, rendimiento preciso, accesibilidad completa, seguridad de la API). La columna **Automatización** de la [matriz de testabilidad](testability-matrix.md) indica qué es verificable con Selenium IDE, qué es parcial y qué requiere otras herramientas.
