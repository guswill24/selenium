# Mi Ruta – Laboratorio de Calidad de Software

Sistema bajo prueba (SUT) educativo para el curso **Calidad de Software – 202016903 (UNAD)**.
Simula una aplicación de transporte público urbano para practicar pruebas funcionales y no funcionales con Selenium IDE.

> Estado: **Fase 19 – Documentación**. Pendiente: preparación del despliegue en Vercel (Fase 20, ver [docs/deployment-vercel.md](docs/deployment-vercel.md)).

## Qué es y para qué sirve

- **Qué es:** una aplicación web de movilidad urbana **simulada**: rutas, paraderos, planificación de recorridos, mapa, tiempos de llegada, alertas, historial y administración. No usa mapas externos, GPS ni datos reales.
- **Qué problema representa:** la incertidumbre al desplazarse en transporte público (qué ruta tomar, dónde está el paradero, cuánto esperar, si hay cambios en el servicio).
- **Para qué sirve en el curso:** es un laboratorio de pruebas **estable, reproducible y determinista**, con selectores estables (`data-testid`) y **escenarios de falla** que se activan sin modificar el código.

El repositorio contiene el sistema, sus datos, sus escenarios y su documentación técnica. **No** contiene el plan de pruebas, scripts de Selenium ni respuestas de la actividad: diseñarlos es trabajo del estudiante.

## Cuentas de demostración

Credenciales ficticias, solo para uso educativo (ver [docs/data.md](docs/data.md)):

| Rol | Usuario | Contraseña |
|---|---|---|
| Pasajero | `pasajero.demo` | `Pasajero2026!` |
| Administrador | `admin.demo` | `Admin2026!` |
| Cuenta bloqueada | `bloqueado.demo` | `Bloqueado2026!` |

## Requisitos

- Node.js 22.12 o superior (ver `.nvmrc`)
- npm 10 o superior

## Instalar y ejecutar

```bash
npm install     # instala las dependencias de backend y frontend
npm run dev     # inicia la API (puerto 3001) y el frontend (puerto 5173)
```

Abre `http://localhost:5173` e inicia sesión con una cuenta de demostración. Para detener ambos servidores, pulsa `Ctrl + C`.

Para cambiar el comportamiento del sistema (respuesta lenta, error del servidor, sin resultados…), abre `/lab` o usa `?scenario=` en la URL. Ver [docs/scenarios.md](docs/scenarios.md).

## Comandos

| Comando | Descripción |
|---|---|
| `npm install` | Instala las dependencias de todos los workspaces |
| `npm run dev` | Inicia API (puerto 3001) y frontend (puerto 5173) |
| `npm run build` | Verifica tipos del backend y compila el frontend |
| `npm run preview` | Sirve el build del frontend (puerto 4173); requiere la API en ejecución |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica tipos en backend y frontend |
| `npm test` | Ejecuta las pruebas técnicas del backend |
| `npm run validate:data` | Valida estructura e integridad de los fixtures JSON |
| `npm run check` | lint + typecheck + validate:data + test + build |

En desarrollo, el frontend consume la API mediante rutas relativas (`/api/...`) a través del proxy de Vite.
En producción (Vercel), frontend y API compartirán el mismo origen.

## Estructura

```
backend/    API Express + TypeScript (pruebas con Vitest)
frontend/   React + TypeScript + Vite + Tailwind CSS
data/       Fixtures JSON de solo lectura
docs/       Documentación técnica
scripts/    Utilidades de desarrollo (dev.mjs)
```

Detalle de capas y decisiones: [docs/architecture.md](docs/architecture.md).

## Documentación

| Necesito… | Documento |
|---|---|
| Entender cómo está construido | [architecture.md](docs/architecture.md) |
| Ejecutar pruebas e interpretar PASS/FAIL | [testing.md](docs/testing.md) |
| Aprender a usar Selenium IDE con Mi Ruta | [selenium.md](docs/selenium.md) |
| Activar escenarios o agregar uno nuevo | [scenarios.md](docs/scenarios.md) |
| Encontrar selectores y atributos ISO/IEC 25010 | [testability-matrix.md](docs/testability-matrix.md) |
| Reproducir errores controlados | [errors.md](docs/errors.md) |
| Consultar la API | [api.md](docs/api.md) |
| Conocer los datos simulados | [data.md](docs/data.md) |
| Desplegar en Vercel (pendiente – Fase 20) | [deployment-vercel.md](docs/deployment-vercel.md) |
| Accesibilidad y diseño adaptable | [accessibility.md](docs/accessibility.md), [responsive.md](docs/responsive.md) |
| Módulos específicos | [map.md](docs/map.md), [realtime.md](docs/realtime.md), [alerts.md](docs/alerts.md), [history.md](docs/history.md), [admin.md](docs/admin.md) |

## Limitaciones

| Limitación | Detalle |
|---|---|
| Datos simulados | Red de transporte ficticia y determinista; sin GPS ni datos reales |
| Sin persistencia en el servidor | Administración en modo demostración e historial nuevo guardados solo en el navegador ([admin.md](docs/admin.md), [history.md](docs/history.md)) |
| Sesión sin revocación | Cerrar sesión no invalida el token en el servidor ([api.md](docs/api.md)) |
| Hallazgo de seguridad intencional | El inicio de sesión distingue usuario inexistente de contraseña incorrecta ([api.md](docs/api.md)) |
| Alcance de Selenium IDE | Carga, rendimiento preciso, accesibilidad completa y calidad visual requieren herramientas complementarias ([testability-matrix.md](docs/testability-matrix.md)) |
| Escenarios | Aplican la misma falla a todas las solicitudes; no simulan fallas parciales o intermitentes ([errors.md](docs/errors.md)) |
| Despliegue | La configuración de Vercel está pendiente (Fase 20) |
