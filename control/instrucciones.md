# PROYECTO: MI RUTA – LABORATORIO DE CALIDAD DE SOFTWARE

## 1. ROL

Actúa como arquitecto de software senior, desarrollador full-stack y especialista en aplicaciones web orientadas a pruebas de calidad de software.

Tu responsabilidad es construir una aplicación web educativa denominada:

"Mi Ruta – Laboratorio de Calidad de Software"

La aplicación será utilizada como SISTEMA BAJO PRUEBA (SUT - System Under Test) para una actividad académica del curso:

Calidad de Software – 202016903
Universidad Nacional Abierta y a Distancia – UNAD

La aplicación NO es el producto final que los estudiantes deben entregar.

La aplicación es un entorno controlado que permitirá a los estudiantes:

1. Comprender casos de prueba.
2. Ejecutar pruebas funcionales y no funcionales.
3. Utilizar Selenium IDE.
4. Observar resultados PASS/FAIL.
5. Analizar técnicamente los resultados.
6. Comprender la trazabilidad entre requisito, atributo de calidad, prueba y criterio de aceptación.
7. Grabar la ejecución de sus pruebas.
8. Utilizar diferentes escenarios de prueba sin modificar el código fuente.

IMPORTANTE:

No construyas automáticamente los scripts de Selenium que los estudiantes deben entregar.

No construyas el plan de pruebas académico completo como respuesta evaluativa.

No construyas las conclusiones académicas de los estudiantes.

La aplicación debe proporcionar el SUT y las condiciones necesarias para que los estudiantes diseñen y ejecuten sus propias pruebas.

--------------------------------------------------
## 2. REFERENTES ACADÉMICOS
--------------------------------------------------

El desarrollo debe estar alineado conceptualmente con:

- ISO/IEC 25010.
- Pruebas funcionales.
- Pruebas no funcionales.
- Automatización de pruebas.
- Selenium IDE.
- Trazabilidad de pruebas.
- Criterios de aceptación.
- Análisis técnico de resultados.

La actividad académica requiere trabajar como mínimo con:

- 15 tipos de pruebas funcionales.
- 15 tipos de pruebas no funcionales.

La aplicación debe permitir que estos tipos de pruebas puedan ser demostrados mediante diferentes funcionalidades y escenarios.

No asumas que todos los tipos de pruebas no funcionales pueden ejecutarse exclusivamente con Selenium.

Cuando una prueba requiera una herramienta complementaria, la aplicación debe permitir generar el escenario, pero no debe falsificar una medición que Selenium no pueda realizar correctamente.

--------------------------------------------------
## 3. CASO DE ESTUDIO
--------------------------------------------------

Construye una aplicación educativa basada en el concepto:

"Mi Ruta"

Es una aplicación simulada de transporte público urbano.

El sistema permite consultar:

- rutas
- paraderos
- recorridos
- tiempos estimados de llegada
- información de buses
- alertas
- historial
- planificación de recorridos
- información operacional

El objetivo es facilitar la planificación de desplazamientos y reducir la incertidumbre relacionada con:

- qué ruta utilizar
- dónde está el paradero
- cuánto tiempo esperar
- cuál es el recorrido
- si existen cambios en el servicio
- si la información está disponible
- si la información es comprensible y accesible

IMPORTANTE:

No utilizar Google Maps.

No utilizar APIs externas de mapas.

No utilizar GPS real.

No utilizar datos reales de transporte público.

No depender de servicios externos.

Todo debe ser simulado y determinista.

--------------------------------------------------
## 4. OBJETIVO PRINCIPAL DEL SOFTWARE
--------------------------------------------------

El software debe funcionar como un laboratorio de pruebas.

Debe ser:

- estable
- reproducible
- determinista
- fácil de comprender
- fácil de probar
- fácil de automatizar
- responsive
- accesible
- publicable en Internet
- compatible con Selenium IDE

Cada estudiante debe poder acceder al mismo sistema y obtener resultados reproducibles.

--------------------------------------------------
## 5. ARQUITECTURA TECNOLÓGICA
--------------------------------------------------

Utiliza inicialmente esta arquitectura:

FRONTEND

- React
- TypeScript
- Vite
- Tailwind CSS
- TailAdmin o una estructura visual equivalente
- React Router
- Context API / React Hooks

BACKEND

- Node.js
- Express
- TypeScript

DATOS

Inicialmente utilizar archivos JSON.

Ejemplo:

/data
    users.json
    routes.json
    stops.json
    buses.json
    alerts.json
    schedules.json
    history.json

No utilizar inicialmente:

- MySQL
- PostgreSQL
- MongoDB
- Firebase
- Supabase
- Redis
- servicios externos

El objetivo es mantener el proyecto sencillo y centrado en calidad de software.

CONTROL DE ESTADO

Utilizar:

- React Context
- hooks
- localStorage cuando sea apropiado

No utilizar Redux salvo que exista una necesidad técnica demostrable.

--------------------------------------------------
## 6. ESTRUCTURA DEL PROYECTO
--------------------------------------------------

Propón y utiliza una estructura similar a:

/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── data/
│   │   └── utils/
│   └── ...
│
├── data/
│   ├── users.json
│   ├── routes.json
│   ├── stops.json
│   ├── buses.json
│   ├── alerts.json
│   └── schedules.json
│
├── docs/
│   ├── architecture.md
│   ├── testing.md
│   ├── selenium.md
│   └── deployment-vercel.md
│
├── README.md
├── package.json
└── ...
 
Si consideras que una estructura monorepo simplificada es técnicamente mejor para Vercel, puedes proponerla, pero debes mantener claramente separados frontend, backend, datos y documentación.

--------------------------------------------------
## 7. INTERFAZ VISUAL
--------------------------------------------------

La aplicación debe tener apariencia de una aplicación moderna de movilidad urbana.

Debe inspirarse conceptualmente en:

"Usabilidad aplicada al territorio"

Debe utilizar una interfaz clara, visual y didáctica.

Diseño:

- responsive
- desktop
- tablet
- móvil

Utiliza:

- tarjetas
- tablas
- indicadores
- badges
- mapas simulados
- iconos
- paneles
- formularios
- navegación lateral
- breadcrumbs
- mensajes de éxito/error
- estados de carga
- estados vacíos
- estados de error

La interfaz debe parecer un producto real, pero debe ser claramente un entorno educativo.

Nombre visible:

MI RUTA

Subtítulo:

Laboratorio de Calidad de Software

--------------------------------------------------
## 8. MÓDULOS
--------------------------------------------------

Implementa los siguientes módulos.

### MÓDULO 1 – AUTENTICACIÓN Y PERFIL

Debe permitir:

- login
- logout
- validación de campos
- usuario incorrecto
- contraseña incorrecta
- campos obligatorios
- sesión
- perfil
- cambio de información básica

Debe existir al menos:

USUARIO PASAJERO

USUARIO ADMINISTRADOR

Utiliza credenciales ficticias y claramente educativas.

Nunca utilizar credenciales reales.

--------------------------------------------------
### MÓDULO 2 – CONSULTA DE RUTAS

Permitir:

- seleccionar origen
- seleccionar destino
- buscar ruta
- mostrar resultados
- mostrar ruta inexistente
- mostrar múltiples alternativas
- mostrar duración
- mostrar número de paraderos
- mostrar estado de la ruta

Ejemplo:

Ruta R12
Terminal → Centro
Tiempo estimado: 12 minutos

Ruta R18
Terminal → Universidad
Tiempo estimado: 18 minutos

Ruta R22
Centro → Hospital
Tiempo estimado: 25 minutos

--------------------------------------------------
### MÓDULO 3 – PARADEROS

Permitir:

- consultar paraderos
- buscar paradero
- visualizar dirección
- visualizar rutas asociadas
- mostrar paraderos cercanos simulados
- mostrar estado del paradero

--------------------------------------------------
### MÓDULO 4 – PLANIFICACIÓN DEL RECORRIDO

Permitir:

Origen
Destino

Resultado:

- ruta recomendada
- alternativas
- tiempo estimado
- número de paradas
- transbordos simulados

--------------------------------------------------
### MÓDULO 5 – MAPA SIMULADO

NO utilizar mapas externos.

Construir un mapa visual utilizando HTML/SVG.

Debe mostrar:

- origen
- destino
- paraderos
- recorrido
- bus
- puntos de interés simulados

Debe poder utilizarse como elemento visual para pruebas de usabilidad y funcionalidad.

--------------------------------------------------
### MÓDULO 6 – INFORMACIÓN EN TIEMPO REAL
--------------------------------------------------

Mostrar:

- buses
- estado
- ruta
- ubicación simulada
- tiempo estimado
- retraso
- última actualización

Ejemplo:

BUS 102
Ruta R12
Estado: En recorrido
ETA: 5 minutos

--------------------------------------------------
### MÓDULO 7 – ALERTAS
--------------------------------------------------

Mostrar:

- alertas
- cambios de ruta
- retrasos
- interrupciones
- información importante

Ejemplo:

"Ruta R12 presenta retraso de 8 minutos."

Debe existir:

- alerta normal
- alerta informativa
- alerta de advertencia
- alerta crítica

--------------------------------------------------
### MÓDULO 8 – HISTORIAL
--------------------------------------------------

Mostrar:

- rutas consultadas
- fecha
- origen
- destino
- ruta seleccionada
- tiempo estimado

Utilizar localStorage para conservar información del usuario cuando sea necesario.

--------------------------------------------------
### MÓDULO 9 – ADMINISTRACIÓN DE RUTAS
--------------------------------------------------

Solo para administrador.

Permitir visualizar:

- rutas
- paraderos
- horarios
- buses
- alertas

Permitir operaciones educativas:

- crear
- editar
- visualizar
- activar/desactivar

No es necesario implementar una base de datos persistente.

--------------------------------------------------
### MÓDULO 10 – ADMINISTRACIÓN Y MONITOREO
--------------------------------------------------

Dashboard con:

- cantidad de rutas
- cantidad de buses
- alertas activas
- consultas realizadas
- estado del servicio
- indicadores simulados

--------------------------------------------------
## 9. LABORATORIO DE ESCENARIOS
--------------------------------------------------

Este módulo es MUY IMPORTANTE.

Crear un:

"Laboratorio de escenarios de prueba"

El docente debe poder seleccionar un escenario para modificar el comportamiento del sistema.

Escenarios mínimos:

NORMAL

NO_RESULTS

INVALID_DATA

SERVER_ERROR

SERVICE_UNAVAILABLE

SLOW_RESPONSE

ROUTE_CHANGED

BUS_DELAYED

INCONSISTENT_DATA

EMPTY_DATA

UNAUTHORIZED

SESSION_EXPIRED

Los escenarios deben poder activarse desde una interfaz educativa.

Por ejemplo:

Escenario actual:
NORMAL

Selector:

NORMAL
SIN RESULTADOS
ERROR SERVIDOR
SERVICIO NO DISPONIBLE
RESPUESTA LENTA
RUTA MODIFICADA
BUS RETRASADO
DATOS INCONSISTENTES
DATOS VACÍOS
NO AUTORIZADO
SESIÓN EXPIRADA

IMPORTANTE:

No modificar el código fuente para activar escenarios.

Debe existir una forma controlada desde la interfaz.

--------------------------------------------------
## 10. RESPUESTA LENTA
--------------------------------------------------

El escenario SLOW_RESPONSE debe introducir un retraso controlado.

Por ejemplo:

3000 ms

Debe poder utilizarse para explicar:

- tiempos de respuesta
- percepción de rendimiento
- eficiencia del desempeño
- comportamiento ante espera

El tiempo debe ser configurable.

Ejemplo:

Delay:
1000 ms
3000 ms
5000 ms

--------------------------------------------------
## 11. ERRORES CONTROLADOS
--------------------------------------------------

Los errores deben ser deliberados y reproducibles.

Ejemplos:

HTTP 400
HTTP 401
HTTP 403
HTTP 404
HTTP 500
HTTP 503

No mostrar errores técnicos innecesarios al usuario final.

Mostrar mensajes amigables.

Pero permitir que el estudiante pueda analizar el comportamiento.

--------------------------------------------------
## 12. ISO/IEC 25010
--------------------------------------------------

La aplicación debe permitir demostrar escenarios relacionados con:

1. Adecuación funcional
2. Eficiencia del desempeño
3. Compatibilidad
4. Capacidad de interacción / Usabilidad
5. Fiabilidad
6. Seguridad
7. Mantenibilidad
8. Portabilidad

Además, debe existir especial atención a:

- accesibilidad
- rendimiento
- disponibilidad
- control de acceso
- comportamiento consistente

NO debes afirmar que todas las características se pueden medir completamente mediante Selenium IDE.

Documenta qué características pueden probarse directamente con Selenium y cuáles requieren herramientas complementarias.

--------------------------------------------------
## 13. CASOS FUNCIONALES QUE EL SISTEMA DEBE SOPORTAR
--------------------------------------------------

El sistema debe permitir que un estudiante pueda construir posteriormente casos como:

F01 – Login válido
F02 – Login inválido
F03 – Validación de campos obligatorios
F04 – Logout
F05 – Consulta de ruta válida
F06 – Consulta sin resultados
F07 – Selección de ruta
F08 – Consulta de paradero
F09 – Visualización del recorrido
F10 – Consulta de ETA
F11 – Actualización de información
F12 – Visualización de alerta
F13 – Consulta de historial
F14 – Creación de ruta por administrador
F15 – Modificación de ruta por administrador

IMPORTANTE:

Estos son escenarios funcionales disponibles en el SUT.

NO debes generar automáticamente los scripts de Selenium correspondientes.

Los estudiantes deberán construirlos.

--------------------------------------------------
## 14. ESCENARIOS NO FUNCIONALES
--------------------------------------------------

La aplicación debe permitir explorar escenarios relacionados con:

NF01 – Compatibilidad Chrome
NF02 – Compatibilidad Firefox
NF03 – Compatibilidad Edge
NF04 – Diseño responsive
NF05 – Usabilidad
NF06 – Accesibilidad
NF07 – Tiempo de respuesta
NF08 – Disponibilidad
NF09 – Fiabilidad
NF10 – Autenticación
NF11 – Control de acceso
NF12 – Persistencia
NF13 – Recuperabilidad
NF14 – Portabilidad
NF15 – Comportamiento ante carga

IMPORTANTE:

No simular resultados falsos.

Si una prueba requiere una herramienta especializada, documentar claramente que Selenium IDE no es suficiente.

Por ejemplo:

Load testing
Stress testing
Performance testing avanzado

pueden requerir herramientas complementarias.

--------------------------------------------------
## 15. SELENIUM IDE
--------------------------------------------------

La aplicación debe estar especialmente preparada para Selenium IDE.

Este es uno de los objetivos principales del proyecto.

Todos los controles importantes deben tener identificadores estables.

Preferir:

data-testid

id

name

sobre selectores frágiles basados exclusivamente en:

- texto visible
- posición
- clases CSS generadas
- XPath excesivamente complejo

Ejemplos:

data-testid="btn-login"

data-testid="input-username"

data-testid="input-password"

data-testid="btn-logout"

data-testid="input-origin"

data-testid="input-destination"

data-testid="btn-search-route"

data-testid="route-card-R12"

data-testid="route-time-R12"

data-testid="stop-card-S01"

data-testid="btn-refresh"

data-testid="alert-service"

data-testid="history-list"

data-testid="admin-route-create"

data-testid="admin-route-edit"

Los identificadores deben mantenerse estables.

--------------------------------------------------
## 16. DISEÑO PARA TESTABILIDAD
--------------------------------------------------

La aplicación debe construirse bajo el principio:

"Testability by Design"

Cada funcionalidad importante debe tener:

- selector estable
- estado observable
- mensaje de resultado
- elemento verificable
- comportamiento determinista

Ejemplo:

Después de login exitoso:

data-testid="dashboard"

Después de login inválido:

data-testid="login-error"

Después de búsqueda:

data-testid="route-results"

Sin resultados:

data-testid="no-results"

Error del servidor:

data-testid="server-error"

Servicio no disponible:

data-testid="service-unavailable"

Respuesta lenta:

data-testid="loading-indicator"

--------------------------------------------------
## 17. ACCIONES VS VALIDACIONES
--------------------------------------------------

La aplicación debe facilitar la diferencia entre:

ACCIÓN:

click
type
select
navigate

VALIDACIÓN:

assert
verify
existence
text
value
visibility
URL
estado

La documentación del proyecto debe explicar:

"Un click no demuestra que una prueba haya pasado."

Ejemplo:

INCORRECTO:

click Login

CORRECTO:

click Login
verify dashboard visible

--------------------------------------------------
## 18. ACCESIBILIDAD
--------------------------------------------------

Implementar buenas prácticas básicas:

- labels asociados a inputs
- navegación por teclado
- focus visible
- contraste adecuado
- textos alternativos
- botones semánticos
- landmarks
- aria-label cuando sea necesario
- mensajes de error accesibles
- no depender exclusivamente del color

La aplicación debe permitir que los estudiantes puedan realizar análisis básicos de accesibilidad.

--------------------------------------------------
## 19. RESPONSIVE DESIGN
--------------------------------------------------

Debe funcionar correctamente en:

- 360px
- 390px
- 768px
- 1024px
- 1280px
- 1440px

Crear navegación responsive.

No permitir overflow horizontal accidental.

--------------------------------------------------
## 20. API
--------------------------------------------------

Crear como mínimo:

GET /api/health

GET /api/routes

GET /api/routes/:id

GET /api/stops

GET /api/stops/:id

GET /api/buses

GET /api/buses/:id

GET /api/alerts

GET /api/history

POST /api/auth/login

POST /api/auth/logout

GET /api/scenario

POST /api/scenario

El endpoint:

GET /api/health

debe devolver información sencilla como:

{
  "status": "ok"
}

--------------------------------------------------
## 21. CONFIGURACIÓN DEL ESCENARIO
--------------------------------------------------

Crear un mecanismo centralizado para controlar:

currentScenario

responseDelay

serviceAvailability

routeDataConsistency

sessionState

Ejemplo conceptual:

{
  "scenario": "NORMAL",
  "responseDelay": 0
}

No acoplar la lógica de escenarios a componentes visuales.

La lógica debe estar centralizada.

--------------------------------------------------
## 22. DATOS SIMULADOS
--------------------------------------------------

Crear datos suficientes para demostrar las funcionalidades.

Rutas:

R12
R18
R22

Paraderos:

S01
S02
S03
S04
S05

Buses:

BUS101
BUS102
BUS103

Usuarios:

PASSENGER
ADMIN

Alertas:

- retraso
- cambio de ruta
- interrupción
- información

Los datos deben ser claramente ficticios.

--------------------------------------------------
## 23. SEGURIDAD EDUCATIVA
--------------------------------------------------

No utilizar secretos reales.

Crear:

.env.example

Nunca incluir:

- API keys reales
- contraseñas reales
- tokens reales
- credenciales institucionales

Las credenciales educativas deben estar documentadas como datos de demostración.

Implementar como mínimo:

- autenticación simulada
- protección de rutas
- control de acceso por rol
- manejo de sesión
- logout

--------------------------------------------------
## 24. PERSISTENCIA
--------------------------------------------------

NO intentar escribir permanentemente sobre archivos JSON en producción.

Los archivos JSON funcionan como fixtures.

Para demostraciones:

- localStorage
- memoria
- estado de frontend

son suficientes.

La aplicación debe explicar esta limitación.

--------------------------------------------------
## 25. VERCEL
--------------------------------------------------

El proyecto debe estar preparado para desplegarse en Vercel.

OBJETIVO:

Una sola aplicación pública.

Ejemplo conceptual:

https://mi-ruta-calidad.vercel.app

El frontend debe consumir el backend utilizando rutas relativas:

/api/routes

/api/stops

/api/alerts

etc.

NO utilizar:

http://localhost:3000/api/...

en código de producción.

El proyecto debe funcionar:

LOCALMENTE

y

EN VERCEL

sin modificar manualmente el código fuente.

El backend Express debe estructurarse de forma compatible con Vercel.

Si técnicamente conviene utilizar funciones Node.js de Vercel en lugar de un servidor Express tradicional, documenta la decisión.

No agregar una base de datos externa.

No agregar Docker inicialmente.

--------------------------------------------------
## 26. VARIABLES DE ENTORNO
--------------------------------------------------

Crear:

.env.example

con variables solamente si realmente son necesarias.

Ejemplo:

VITE_API_BASE_URL=

En producción preferir rutas relativas cuando sea posible.

Documentar:

- desarrollo local
- build
- preview
- producción
- variables de entorno

--------------------------------------------------
## 27. GIT Y GITHUB
--------------------------------------------------

Preparar el proyecto para GitHub.

Crear:

.gitignore

README.md

Documentar:

git init

git add .

git commit

git branch

git remote

git push

No incluir archivos:

node_modules

.env

dist

logs

archivos temporales

--------------------------------------------------
## 28. DOCUMENTACIÓN
--------------------------------------------------

Crear:

README.md

docs/architecture.md

docs/testing.md

docs/selenium.md

docs/deployment-vercel.md

docs/scenarios.md

docs/accessibility.md

docs/api.md

La documentación debe explicar:

1. Qué es Mi Ruta.
2. Qué problema resuelve.
3. Arquitectura.
4. Cómo instalar.
5. Cómo ejecutar.
6. Cómo activar escenarios.
7. Cómo utilizar Selenium IDE.
8. Cómo ejecutar pruebas manualmente.
9. Cómo interpretar PASS/FAIL.
10. Cómo desplegar en Vercel.
11. Limitaciones.
12. Cómo agregar nuevos escenarios.

--------------------------------------------------
## 29. DOCUMENTACIÓN PARA SELENIUM
--------------------------------------------------

Crear una guía:

docs/selenium.md

Debe explicar:

1. Instalar Selenium IDE.
2. Crear un proyecto.
3. Registrar una prueba.
4. Editar comandos.
5. Ejecutar la prueba.
6. Agregar verificaciones.
7. Analizar resultados.
8. Evitar selectores frágiles.
9. Utilizar data-testid.
10. Exportar evidencia cuando corresponda.

NO incluir scripts automatizados completos que los estudiantes puedan simplemente copiar y entregar.

La guía debe enseñar el proceso, no resolver la actividad académica.

--------------------------------------------------
## 30. MATRIZ DE TESTABILIDAD
--------------------------------------------------

Crear documentación técnica que relacione:

Funcionalidad
→ selector estable
→ estado observable
→ resultado esperado
→ atributo ISO/IEC 25010 relacionado
→ posibilidad de automatización

Esta matriz es para facilitar el laboratorio, no para entregar resuelta la actividad de los estudiantes.

--------------------------------------------------
## 31. NO GENERAR LA ACTIVIDAD ACADÉMICA COMPLETA
--------------------------------------------------

MUY IMPORTANTE.

La aplicación NO debe contener:

- el plan académico completo de 15 + 15 pruebas
- respuestas de la actividad
- conclusiones académicas
- scripts Selenium completos para los estudiantes
- análisis académico predeterminado de resultados
- respuestas del caso BioTest
- soluciones de la actividad evaluativa

Debe contener únicamente:

SISTEMA BAJO PRUEBA
+
DATOS
+
ESCENARIOS
+
TESTABILIDAD
+
DOCUMENTACIÓN TÉCNICA

--------------------------------------------------
## 32. PROCESO DE DESARROLLO
--------------------------------------------------

NO desarrolles todo de una sola vez.

Trabaja por fases.

FASE 0
Análisis y arquitectura.

NO escribir código todavía.

Entregar:

- arquitectura propuesta
- estructura de carpetas
- decisiones tecnológicas
- riesgos
- estrategia de despliegue

Esperar aprobación.

FASE 1
Inicialización del proyecto.

Validar:

npm/pnpm install
npm run dev
npm run build

FASE 2
Layout y diseño visual.

Validar responsive.

FASE 3
Datos simulados.

Validar JSON.

FASE 4
Backend/API.

Validar:

/api/health

FASE 5
Autenticación.

FASE 6
Consulta de rutas.

FASE 7
Paraderos.

FASE 8
Planificación.

FASE 9
Mapa simulado.

FASE 10
Información en tiempo real.

FASE 11
Alertas.

FASE 12
Historial.

FASE 13
Administración.

FASE 14
Laboratorio de escenarios.

FASE 15
Testabilidad Selenium.

FASE 16
Accesibilidad.

FASE 17
Responsive.

FASE 18
Errores controlados.

FASE 19
Documentación.

FASE 20
Preparación Vercel.

FASE 21
Validación final.

Después de cada fase:

1. Ejecutar pruebas técnicas.
2. Ejecutar build.
3. Revisar errores.
4. Corregir.
5. Documentar.
6. Mostrar resumen.
7. Esperar autorización para continuar.

--------------------------------------------------
## 33. CALIDAD DEL CÓDIGO
--------------------------------------------------

Aplicar:

- TypeScript estricto
- componentes pequeños
- separación de responsabilidades
- funciones reutilizables
- nombres claros
- manejo de errores
- validación de datos
- tipado fuerte
- comentarios solamente cuando aporten valor

Evitar:

- código duplicado
- componentes gigantes
- lógica de negocio dentro del JSX
- credenciales hardcodeadas
- URLs localhost en producción
- dependencias innecesarias

--------------------------------------------------
## 34. CRITERIOS DE ACEPTACIÓN DEL PROYECTO
--------------------------------------------------

El proyecto se considera técnicamente aceptable cuando:

[ ] npm/pnpm install funciona

[ ] aplicación inicia localmente

[ ] frontend compila

[ ] backend inicia

[ ] /api/health responde

[ ] login funciona

[ ] logout funciona

[ ] rutas funcionan

[ ] paraderos funcionan

[ ] planificación funciona

[ ] mapa funciona

[ ] información en tiempo real funciona

[ ] alertas funcionan

[ ] historial funciona

[ ] administración funciona

[ ] escenarios funcionan

[ ] errores controlados funcionan

[ ] respuesta lenta funciona

[ ] accesibilidad básica funciona

[ ] responsive funciona

[ ] selectores Selenium estables existen

[ ] no hay dependencias externas críticas

[ ] build de producción funciona

[ ] aplicación está preparada para Vercel

[ ] documentación existe

--------------------------------------------------
## 35. VALIDACIÓN FINAL
--------------------------------------------------

Antes de considerar terminado el proyecto debes ejecutar:

1. npm/pnpm install
2. lint
3. build
4. ejecución local
5. health check
6. prueba de login
7. prueba de rutas
8. prueba de escenarios
9. prueba responsive
10. revisión de accesibilidad
11. revisión de selectores
12. revisión de errores
13. revisión de documentación
14. preparación para Vercel

Generar un informe técnico final:

docs/validation-report.md

Debe contener:

- fecha
- versión
- ambiente
- validaciones ejecutadas
- resultado
- problemas encontrados
- problemas corregidos
- limitaciones conocidas

--------------------------------------------------
## 36. REGLA FUNDAMENTAL
--------------------------------------------------

Este proyecto tiene como propósito educativo:

"Construir un sistema web controlado para que estudiantes puedan aprender y ejecutar pruebas de calidad de software mediante Selenium IDE."

No conviertas el proyecto en una aplicación empresarial innecesariamente compleja.

Prioriza:

TESTABILIDAD
REPRODUCIBILIDAD
CLARIDAD
ESTABILIDAD
ACCESIBILIDAD
RESPONSIVE
TRAZABILIDAD
FACILIDAD DE AUTOMATIZACIÓN
DEPLOYMENT SENCILLO

No agregues funcionalidades que no contribuyan a estos objetivos.

--------------------------------------------------
## 37. PRIMERA ACCIÓN
--------------------------------------------------

NO ESCRIBAS CÓDIGO TODAVÍA.

Primero:

1. Analiza completamente estas instrucciones.
2. Propón la arquitectura.
3. Propón la estructura de carpetas.
4. Define cómo funcionará frontend + backend + Vercel.
5. Define el modelo de datos.
6. Define los escenarios de prueba.
7. Define la estrategia de testabilidad para Selenium IDE.
8. Identifica riesgos técnicos.
9. Identifica qué partes de las pruebas no funcionales no deben atribuirse exclusivamente a Selenium.
10. Presenta un roadmap por fases.

Después de presentar este análisis:

DETENTE.

Espera mi autorización explícita:

"CONTINUAR FASE 1"

No avances automáticamente a la implementación.