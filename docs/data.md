# Datos simulados (fixtures)

Todos los datos de Mi Ruta son **ficticios, deterministas y de solo lectura**. Viven en `/data` como archivos JSON y se validan automáticamente al iniciar la API.

> Los archivos JSON funcionan como *fixtures*: la aplicación **nunca** escribe sobre ellos. Los cambios que se hagan en la interfaz (por ejemplo, desde administración) se guardan solo en el navegador (`localStorage`) o en memoria.

## Archivos

| Archivo | Contenido | Registros |
|---|---|---|
| `stops.json` | Paraderos: nombre, dirección, zona, estado, accesibilidad, coordenadas del mapa | 8 |
| `routes.json` | Rutas: origen, destino, secuencia de paraderos con minutos acumulados, estado | 5 |
| `buses.json` | Buses: placa ficticia, ruta, capacidad, estado, posición inicial | 5 |
| `alerts.json` | Alertas: nivel, tipo, ruta afectada, mensaje | 6 |
| `schedules.json` | Horarios por ruta y tipo de día | 7 |
| `users.json` | Usuarios de demostración | 3 |
| `history.json` | Historial inicial de consultas | 3 |
| `points-of-interest.json` | Puntos de interés para el mapa simulado | 5 |

## Red de transporte

```
R12  Terminal Norte (S01) → Plaza del Mercado (S02) → Centro (S03)                 12 min
R15  Terminal Norte (S01) → Centro (S03)   (expreso, alternativa más rápida)          9 min
R18  Terminal Norte (S01) → Av. Las Palmas (S06) → Biblioteca (S07) → Universidad (S04)   18 min
R22  Centro (S03) → Biblioteca (S07) → Estadio (S08) → Hospital Central (S05)       25 min
R30  Plaza del Mercado (S02) → Centro (S03) → Estadio (S08)          SUSPENDIDA (inactiva)
```

- **Paraderos de transbordo:** Centro (S03) y Biblioteca Pública (S07) son compartidos por varias rutas activas.
- **Estados especiales:** Estadio Municipal (S08) está en mantenimiento; la ruta R30 está suspendida; BUS105 está fuera de servicio.

## Usuarios de demostración

Credenciales **exclusivamente educativas**. No corresponden a personas ni sistemas reales.

| Rol | Usuario | Contraseña | Estado |
|---|---|---|---|
| Pasajero | `pasajero.demo` | `Pasajero2026!` | Activo |
| Administrador | `admin.demo` | `Admin2026!` | Activo |
| Pasajero | `bloqueado.demo` | `Bloqueado2026!` | Bloqueado |

## Validación

```bash
npm run validate:data   # valida estructura e integridad de /data
npm test                # incluye pruebas de los fixtures
```

La validación tiene dos niveles:

1. **Estructura** (`backend/src/data/schemas.ts`, con zod): tipos, formatos de identificadores (`S01`, `R12`, `BUS101`), fechas ISO, horas `HH:mm`, correos `@mi-ruta.demo`.
2. **Integridad** (`backend/src/data/integrity.ts`): identificadores únicos, referencias existentes entre archivos, primer/último paradero coherente con origen/destino, tiempos crecientes, duración total igual al último tiempo, historial coherente con el recorrido de la ruta.

Si un fixture es inválido, la API **no inicia** y muestra la lista completa de problemas.

## Agregar o modificar datos

1. Edita el archivo JSON correspondiente en `/data`.
2. Ejecuta `npm run validate:data`.
3. Corrige los problemas reportados hasta obtener "Fixtures are valid and consistent".
