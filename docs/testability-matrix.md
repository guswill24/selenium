# Matriz de testabilidad

Relaciona cada funcionalidad del sistema bajo prueba con su **selector estable**, su **estado observable**, el **resultado esperado**, el atributo de **ISO/IEC 25010** relacionado y la **posibilidad de automatizarla** con Selenium IDE.

> Es un insumo técnico para facilitar el laboratorio. **No** es el plan de pruebas de la actividad: no define casos, pasos, datos de prueba ni criterios de aceptación. Diseñarlos es trabajo del estudiante.

## Convenciones de selectores

| Convención | Ejemplo | Regla |
|---|---|---|
| Atributo principal | `data-testid="btn-login"` | Todo elemento importante tiene `data-testid` estable; los campos de formulario además tienen `id` y `name` |
| Nombres | `btn-…`, `input-…`, `link-…`, `error-…` | minúsculas y guiones; describen la función, no la apariencia |
| Elementos de una colección | `route-card-R12`, `stop-card-S01`, `bus-card-BUS102` | terminan en el **código del dato**, nunca en la posición |
| Partes de un elemento | `route-time-R12`, `bus-eta-BUS102` | `<parte>-<código>` |
| Errores de un campo | `error-username`, `error-route-stop-2` | `error-<id del campo>` |
| Títulos y textos de avisos | `login-error-text`, `<aviso>-title` | Usar estos para verificar texto exacto (el contenedor incluye un prefijo oculto para lectores de pantalla, p. ej. "Error:") |
| Estado del flujo principal | `loading-indicator`, `server-error`, `service-unavailable`, `no-results` | **Uno solo por página**: pertenece al flujo principal (formulario → resultados) |
| Estado de secciones secundarias | `all-routes-server-error`, `stop-detail-loading-indicator`, `nearby-…`, `places-…`, `arrivals-…` | Prefijo de la sección, para que ningún selector sea ambiguo |
| Datos para verificar sin depender del texto | `data-state`, `data-status`, `data-count`, `data-minutes`, `data-selected`, `data-active`, `data-error-code` | Valores técnicos estables (independientes del idioma y del formato) |

Selectores **evitados** a propósito: clases CSS (Tailwind las genera y cambian), posición (`nth-child`), XPath extensos y texto visible como único criterio.

Verificado automáticamente en esta fase (todas las pantallas, como pasajero, administrador y anónimo, y en escenarios de error y respuesta lenta): **0** `data-testid` duplicados, **0** `id` duplicados, **0** elementos interactivos sin selector y **0** campos sin etiqueta asociada.

## Selectores del enunciado

| Selector | Dónde |
|---|---|
| `btn-login`, `input-username`, `input-password`, `login-error` | `/login` |
| `dashboard`, `btn-logout`, `alert-service` | Inicio y barra superior |
| `input-origin`, `input-destination`, `btn-search-route`, `route-results`, `route-card-R12`, `route-time-R12`, `no-results` | `/routes` |
| `stop-card-S01` | `/stops` |
| `btn-refresh` | `/live` |
| `history-list` | `/history` |
| `admin-route-create`, `admin-route-edit` | `/admin` (botón crear; formulario de edición) |
| `server-error`, `service-unavailable`, `loading-indicator` | Cualquier página, según el escenario activo |

Enlaces a la presentación de la sesión (se abren en una pestaña nueva, fuera del sistema bajo prueba): `nav-presentation` en el menú lateral y `link-login-presentation` en `/login`. Ver [presentation.md](presentation.md).

## Matriz

Atributos ISO/IEC 25010: **AF** adecuación funcional · **ED** eficiencia del desempeño · **CO** compatibilidad · **CI** capacidad de interacción / usabilidad · **FI** fiabilidad · **SE** seguridad · **MA** mantenibilidad · **PO** portabilidad.

Automatización: **Sí** = verificable con Selenium IDE · **Parcial** = Selenium IDE verifica una parte; el resto requiere otra técnica · **Complementaria** = requiere herramientas distintas de Selenium IDE.

| Funcionalidad | Selector estable | Estado observable | Resultado esperado | ISO | Automatización |
|---|---|---|---|---|---|
| Inicio de sesión válido | `btn-login` | `dashboard`, `welcome-message`, URL `/dashboard` | Acceso al inicio con el nombre del usuario | AF, SE | Sí |
| Credenciales inválidas | `btn-login` | `login-error` (`data-error-code`), `login-error-text` | Mensaje específico, sin acceso | AF, SE | Sí |
| Campos obligatorios | `btn-login` | `error-username`, `error-password`, `aria-invalid` | Mensajes por campo, sin solicitud al servidor | AF, CI | Sí |
| Cierre de sesión | `btn-logout` | `logout-success`, URL `/login` | Sesión eliminada | AF, SE | Sí |
| Protección de rutas | URL directa | URL `/login`; al ingresar, regreso a la página pedida | Sin acceso anónimo | SE | Sí |
| Control de acceso por rol | URL `/admin` como pasajero | `access-denied`; menú sin `nav-admin` | Pasajero bloqueado | SE | Sí (interfaz) · Complementaria (API: 403) |
| Sesión expirada | escenario `SESSION_EXPIRED` | `session-expired` | Sesión cerrada con aviso | FI, SE | Sí |
| Persistencia de sesión | recargar página | `dashboard` sigue visible | Sesión conservada | FI | Sí |
| Perfil | `input-fullname`, `btn-save-profile` | `profile-success`, `error-profile-…` | Cambio validado y conservado | AF | Sí |
| Consulta de ruta | `btn-search-route` | `route-results` (`data-count`), `results-count` | Rutas directas ordenadas | AF | Sí |
| Sin resultados | `btn-search-route` / escenario `NO_RESULTS` | `no-results` | Mensaje de ausencia de rutas | AF, CI | Sí |
| Selección de ruta | `btn-select-route-<ruta>` | `data-selected`, `aria-pressed`, `route-detail`, URL `selected=` | Detalle del recorrido | AF | Sí |
| Consulta de paradero | `input-stop-search`, `btn-search-stop` | `stops-list` (`data-count`), `stop-card-<id>` | Paraderos filtrados | AF | Sí |
| Paraderos cercanos | `input-location`, `btn-find-nearby` | `nearby-stop-<id>` (`data-rank`), `nearby-distance-<id>` | 3 más cercanos, ordenados | AF | Sí |
| Planificación | `btn-plan-trip` | `trip-recommended` (`data-option-id`), `trip-time-<id>` | Recomendada + alternativas | AF | Sí |
| Visualización del recorrido | `link-route-map`, `link-trip-map-<id>` | `route-map` (`data-mode`), `map-stop-<id>` (`data-role`) | Recorrido destacado en el mapa | AF, CI | Parcial (estructura y atributos; no la apariencia visual) |
| Consulta de ETA | `input-arrivals-stop`, `btn-check-arrivals` | `arrival-eta-<bus>` (`data-minutes`) | Llegadas ordenadas | AF | Sí |
| Actualización de información | `btn-refresh` | `live-status` (`data-tick`, `data-state`), `bus-eta-<bus>` | Datos del minuto siguiente | AF, FI | Sí |
| Visualización de alertas | `alert-service`, `alert-level-filter-<NIVEL>` | `alert-card-<id>` (`data-level`) | Alertas por nivel | AF, CI | Sí |
| Historial | `btn-select-route-<ruta>`, `btn-choose-trip-<id>` | `history-list`, `history-entry-<id>` | Consulta registrada y conservada | AF, FI | Sí |
| Crear ruta | `admin-route-create`, `btn-save-route` | `admin-route-saved`, `admin-route-row-<id>` (`data-origin="new"`) | Ruta agregada (demostración) | AF | Sí |
| Modificar ruta | `admin-route-edit-<id>`, `admin-route-edit` | `admin-route-saved`, `data-origin="edited"` | Cambios reflejados (demostración) | AF | Sí |
| Validación de datos | formularios con `noValidate` | `error-<campo>`, detalle 400 por campo | Un mensaje por campo | AF, FI | Sí |
| Errores controlados | escenarios `SERVER_ERROR`, `SERVICE_UNAVAILABLE`, `INVALID_DATA`, `UNAUTHORIZED`; URL inexistente | `server-error`, `service-unavailable`, `invalid-data`, `unauthorized`, `dashboard-alerts-error`, `page-not-found`; `error-details-code`, `login-error-details-code`, `profile-error-details-code` | Mensaje amigable y detalle técnico (ver [errors.md](errors.md)) | FI | Sí |
| Falla inesperada de la interfaz | — (no se provoca desde el laboratorio) | `app-error` | Mensaje amigable sin traza de pila | FI, CI | Complementaria |
| Tiempo de respuesta | escenario `SLOW_RESPONSE` | `loading-indicator`, `data-state="loading"` | Indicador visible durante la espera | ED, CI | Parcial (umbral con esperas; medición precisa requiere herramientas de rendimiento) |
| Disponibilidad | escenario `SERVICE_UNAVAILABLE`, `/api/health` | `api-health` (`data-state`), `monitoring-api-health` | Estado no disponible informado | FI | Parcial |
| Diseño adaptable | tamaño de ventana | menú `btn-open-menu`, `sidebar` (`data-state`) | Sin desplazamiento horizontal | PO, CI | Parcial (tamaño y visibilidad; la calidad visual requiere revisión humana) |
| Compatibilidad de navegadores | cualquier selector | mismos resultados en Chrome, Firefox y Edge | Comportamiento equivalente | CO | Parcial (ejecución en cada navegador) |
| Accesibilidad | `skip-link`, etiquetas, `aria-*` | foco visible, `aria-invalid`, `role="alert"` | Navegable con teclado | CI | Parcial (herramientas de accesibilidad y revisión manual) |
| Datos inconsistentes | escenario `INCONSISTENT_DATA` | valores de distintas pantallas | Detección de contradicciones | AF, FI | Sí (comparando valores entre pantallas) |
| Comportamiento ante carga | — | — | — | ED, FI | Complementaria (herramientas de carga; no ejecutar contra el despliegue público) |
| Seguridad (enumeración de usuarios, tokens) | API | códigos `USER_NOT_FOUND` / `WRONG_PASSWORD` | Hallazgo documentado | SE | Complementaria (inspección de la API) |
| Mantenibilidad | código fuente | pruebas técnicas (`npm run check`) | — | MA | Complementaria (fuera del alcance de Selenium IDE) |
