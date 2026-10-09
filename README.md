# Mi Ruta – Laboratorio de Calidad de Software

Sistema bajo prueba (SUT) educativo para el curso **Calidad de Software – 202016903 (UNAD)**.
Simula una aplicación de transporte público urbano para practicar pruebas funcionales y no funcionales con Selenium IDE.

> Estado: **Fase 17 – Responsive** (ver [docs/responsive.md](docs/responsive.md)). La documentación completa se construye en la Fase 19.

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

## Estructura

```
backend/    API Express + TypeScript
frontend/   React + TypeScript + Vite + Tailwind CSS
data/       Fixtures JSON de solo lectura (ver docs/data.md)
docs/       Documentación técnica (Fase 19)
```

## Comandos

| Comando | Descripción |
|---|---|
| `npm install` | Instala las dependencias de todos los workspaces |
| `npm run dev` | Inicia API (puerto 3001) y frontend (puerto 5173) |
| `npm run build` | Verifica tipos del backend y compila el frontend |
| `npm run preview` | Sirve el build del frontend (puerto 4173) |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica tipos en backend y frontend |
| `npm test` | Ejecuta las pruebas técnicas del backend |
| `npm run validate:data` | Valida estructura e integridad de los fixtures JSON |
| `npm run check` | lint + typecheck + validate:data + test + build |

En desarrollo, el frontend consume la API mediante rutas relativas (`/api/...`) a través del proxy de Vite.
En producción (Vercel), frontend y API comparten el mismo origen.
