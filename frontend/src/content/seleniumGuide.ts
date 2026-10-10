// Student guide for Selenium IDE, transcribed from control/selenium-ide/Guia_Selenium_IDE_Mi_Ruta.docx
// (the same .docx is offered for download at the end of the page). Inline `code` and **bold** are
// rendered by the page.

import seleniumWelcome from '../assets/selenium-ide-welcome.jpg';

export type GuideBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'table'; caption: string; headers: string[]; rows: string[][] }
  | { kind: 'code'; caption: string; code: string }
  | { kind: 'checklist'; id: string; title: string; items: string[] }
  | { kind: 'download'; id: string; href: string; fileName: string; label: string; description: string }
  | { kind: 'image'; src: string; alt: string; caption: string; width: number; height: number }
  | { kind: 'video'; id: string; youtubeId: string; startSeconds: number; title: string; author: string; intro: string; note: string };

export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  blocks: GuideBlock[];
}

export const GUIDE_APP_URL = 'https://selenium-exr3-beryl.vercel.app';

export const guideDownload = {
  href: '/descargas/Guia_Selenium_IDE_Mi_Ruta.docx',
  fileName: 'Guia_Selenium_IDE_Mi_Ruta.docx',
  label: 'Documento de Word (.docx)',
};

export const guideSections: GuideSection[] = [
  {
    id: 'requisitos',
    title: 'Antes de empezar',
    summary: 'Qué se necesita para instalar y ejecutar las pruebas.',
    blocks: [
      {
        kind: 'bullets',
        items: [
          'Un computador con Windows 10 u 11, macOS o Linux.',
          'Google Chrome actualizado, para revisar la aplicación manualmente.',
          `Conexión a internet: la aplicación está publicada en ${GUIDE_APP_URL}.`,
          'Las credenciales de prueba, que el tutor entrega en su momento.',
        ],
      },
    ],
  },
  {
    id: 'instalacion',
    title: 'Instalación de Selenium IDE 4',
    summary: 'Instalador de un clic, sin permisos de administrador.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Selenium IDE 4 es una aplicación de escritorio; el curso usa la versión 4.0.1. El instalador no pide carpeta de destino ni permisos de administrador: se instala solo para el usuario actual. Esto es normal y no afecta su funcionamiento.',
      },
      {
        kind: 'steps',
        items: [
          'Abrir la versión 4.0.1 en el repositorio oficial de Selenium en GitHub: https://github.com/SeleniumHQ/selenium-ide/releases/tag/v4.0.1-beta.14.',
          'En **Assets**, descargar el instalador para el sistema operativo del equipo (en Windows, `Selenium-IDE-Setup-4.0.1-beta.14.exe`).',
          'Ejecutar el instalador. Si Windows muestra una advertencia de SmartScreen, elegir **Más información** y luego **Ejecutar de todas formas**.',
          'Esperar unos segundos: la instalación termina sin preguntas y crea un acceso directo.',
          'Abrir **Selenium IDE** desde el menú Inicio o el escritorio.',
        ],
      },
      {
        kind: 'paragraph',
        text: 'Si aparece la pantalla de bienvenida con las opciones para crear o abrir un proyecto, la instalación quedó lista. La sección siguiente explica esa pantalla.',
      },
      {
        kind: 'video',
        id: 'install-video',
        youtubeId: 'KskSQI5ZPVM',
        startSeconds: 130,
        title: 'Automatización de pruebas con Selenium IDE | Curso paso a paso con ejemplo',
        author: 'Geek QA',
        intro: '**Vea el video desde el minuto 2:10.** El reproductor ya arranca en ese punto. Los primeros minutos muestran la instalación de la extensión de Google Chrome, que no es la que se usa en el curso.',
        note: '**Importante:** instale Selenium IDE **4.0.1** como aplicación de escritorio, descargándola únicamente desde el repositorio oficial y autorizado de Selenium en GitHub: https://github.com/SeleniumHQ/selenium-ide/releases/tag/v4.0.1-beta.14. En Windows, el archivo es `Selenium-IDE-Setup-4.0.1-beta.14.exe`. No use la extensión de Chrome ni descargue el instalador desde sitios de terceros.',
      },
    ],
  },
  {
    id: 'primer-arranque',
    title: 'Primer arranque: abrir o crear un proyecto',
    summary: 'Las dos opciones de la pantalla de bienvenida de Selenium IDE 4.0.1.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Al abrir Selenium IDE 4.0.1 aparece la ventana **Welcome to the Selenium IDE client**. En ella se ve la ruta del archivo de registros (Your log file path), dos botones para abrir o crear un proyecto y la lista **Recent Projects**, con los proyectos abiertos recientemente: un clic sobre cualquiera de ellos lo vuelve a abrir.',
      },
      {
        kind: 'image',
        src: seleniumWelcome,
        alt: 'Ventana de bienvenida de Selenium IDE con los botones LOAD PROJECT y CREATE PROJECT y la lista Recent Projects.',
        caption: 'Pantalla de bienvenida de Selenium IDE 4.0.1 (las rutas con datos del usuario aparecen difuminadas)',
        width: 596,
        height: 402,
      },
      {
        kind: 'table',
        caption: 'Opciones de la pantalla de bienvenida',
        headers: ['Opción', 'Qué hace', 'Cuándo usarla'],
        rows: [
          ['**LOAD PROJECT**', 'Abre un proyecto que ya existe (archivo `.side`)', 'Para seguir las pruebas de ejemplo de Mi Ruta: se selecciona el archivo `mi-ruta-vercel.side` que se descarga en la sección siguiente'],
          ['**CREATE PROJECT**', 'Crea un proyecto nuevo, sin pruebas', 'Para los ejercicios de la entrega, que se realizan sobre el caso de estudio propio del grupo'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Para crear el proyecto de la entrega:',
      },
      {
        kind: 'steps',
        items: [
          'Pulsar **CREATE PROJECT**.',
          'Escribir el nombre del proyecto. Se sugiere usar el nombre del caso de estudio.',
          'Ya dentro del proyecto, abrir la pestaña **TESTS**.',
          'Pulsar el botón **(+)** para crear cada prueba automatizada, darle un nombre y construir sus pasos tal como se indicó en el CIPAS.',
        ],
      },
    ],
  },
  {
    id: 'archivo',
    title: 'El archivo de pruebas',
    summary: 'Qué contiene mi-ruta-vercel.side y cómo ejecutarlo.',
    blocks: [
      {
        kind: 'paragraph',
        text: `El proyecto \`mi-ruta-vercel.side\` contiene pruebas automatizadas de ejemplo sobre Mi Ruta publicada en ${GUIDE_APP_URL}. Muestra cómo se automatizan los flujos principales del sistema y cómo se verifican sus resultados.`,
      },
      {
        kind: 'download',
        id: 'side',
        href: '/descargas/mi-ruta-vercel.side',
        fileName: 'mi-ruta-vercel.side',
        label: 'Descargar pruebas',
        description: 'Proyecto de Selenium IDE con las pruebas de ejemplo · Archivo .side (se abre con LOAD PROJECT)',
      },
      {
        kind: 'bullets',
        items: [
          '**Independientes:** cada prueba inicia sesión por su cuenta y parte del escenario NORMAL, así que se puede ejecutar sola.',
          '**Selectores estables:** se usan atributos `data-testid`, que no cambian cuando se modifica el diseño.',
        ],
      },
      {
        kind: 'code',
        caption: 'Ejemplo: atributos data-testid del formulario de inicio de sesión',
        code: '<input\n  type="text"\n  data-testid="input-username"\n  placeholder="Usuario"\n/>\n<input\n  type="password"\n  data-testid="input-password"\n  placeholder="Contraseña"\n/>\n<button data-testid="btn-login">\n  Ingresar\n</button>',
      },
      {
        kind: 'bullets',
        items: [
          '**Esperas:** antes de verificar algo, la prueba espera a que la página termine de cargar.',
          '**Aviso al iniciar sesión:** después de pulsar **Ingresar** aparece la ventana **Aviso importante**, y mientras está abierta el resto de la página no responde. Por eso cada prueba espera el botón `css=[data-testid="learning-notice-accept"]` y lo pulsa antes de continuar.',
        ],
      },
      {
        kind: 'table',
        caption: 'Pruebas del archivo',
        headers: ['Prueba', 'Qué se verifica', 'Concepto que ilustra'],
        rows: [
          ['01 Inicio de sesión válido', 'Acceso al inicio con el saludo del usuario', 'Flujo exitoso'],
          ['02 Consulta de ruta', 'Rutas directas entre Terminal Norte y Centro, con su tiempo estimado', 'Búsqueda con resultados'],
          ['03 Búsqueda de paradero', 'Paraderos encontrados por nombre', 'Filtro de información'],
          ['04 Filtro de alertas críticas', 'Solo se muestran alertas de nivel crítico', 'Validación de atributos de datos'],
          ['05 Planificación de viaje', 'Viaje recomendado entre Terminal Norte y Universidad', 'Resultado calculado por el sistema'],
          ['06 Aserción: contraseña incorrecta', 'Mensaje de error, código técnico y ausencia de acceso', 'Tipos de aserción y pruebas negativas'],
          ['07 Regresión: ruta R12', 'Recorrido y tiempo de la ruta R12 según el escenario activo', 'Pruebas de regresión con el Laboratorio de escenarios'],
        ],
      },
      {
        kind: 'steps',
        items: [
          'Abrir Selenium IDE y elegir **LOAD PROJECT** (abrir proyecto).',
          'Seleccionar el archivo `mi-ruta-vercel.side`.',
          'Pulsar **Run all tests** para ejecutar todas las pruebas, o seleccionar una y pulsar **Run current test**.',
          'Revisar el resultado: los pasos en verde pasaron; los pasos en rojo indican una diferencia entre lo esperado y lo obtenido. El panel **Log** explica el motivo.',
        ],
      },
      {
        kind: 'table',
        caption: 'Comandos que aparecen en las pruebas',
        headers: ['Comando', 'Para qué sirve'],
        rows: [
          ['`open`', 'Abre una ruta de la aplicación, por ejemplo `/login`'],
          ['`type`', 'Escribe un texto en un campo'],
          ['`select`', 'Elige una opción de una lista desplegable'],
          ['`click`', 'Pulsa un botón o enlace'],
          ['`waitForElementVisible`', 'Espera a que un elemento aparezca antes de continuar'],
          ['`assertText`', 'Verifica que un elemento tenga exactamente un texto'],
          ['`assertElementPresent` / `assertElementNotPresent`', 'Verifica que un elemento exista o no exista'],
          ['`storeAttribute` + `assert`', 'Guarda el valor de un atributo y lo compara con el esperado'],
          ['`store`', 'Guarda un valor en una variable que usan los pasos siguientes'],
        ],
      },
    ],
  },
  {
    id: 'regresion',
    title: 'Actividad: regresión con la prueba 07',
    summary: 'Simular un cambio del sistema con el Laboratorio de escenarios.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Una prueba de regresión comprueba que algo que funcionaba sigue funcionando después de un cambio. La prueba 07 usa el **Laboratorio de escenarios** de Mi Ruta para simular ese cambio sin modificar la aplicación.',
      },
      {
        kind: 'checklist',
        id: 'regresion',
        title: 'Pasos de la actividad',
        items: [
          'Ejecutar la prueba 07 con el escenario `NORMAL` y comprobar que pasa. Esta es la línea base.',
          'En el primer comando (`store`), cambiar el valor `NORMAL` por `ROUTE_CHANGED` y ejecutarla de nuevo.',
          'Observar en qué paso falla y explicar por qué falla, si la prueba no se modificó.',
          'Restablecer el valor a `NORMAL` antes de guardar el proyecto.',
        ],
      },
      {
        kind: 'paragraph',
        text: 'El paso que falla tarda unos segundos en marcarse en rojo: Selenium espera a que el elemento aparezca antes de darlo por ausente.',
      },
    ],
  },
  {
    id: 'despues-de-grabar',
    title: 'Después de grabar: revisar antes de reproducir',
    summary: 'La regla de cuatro pasos para que una prueba grabada no falle.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Una prueba grabada suele funcionar mientras se graba, pero falla o se queda detenida al reproducirla. Al grabar, la persona espera a que la página cargue y mueve el mouse; al reproducir, Selenium ejecuta los pasos mucho más rápido y busca elementos que ya cambiaron o desaparecieron.',
      },
      {
        kind: 'checklist',
        id: 'regla',
        title: 'Regla: después de grabar y antes de reproducir',
        items: [
          '**Borrar** los comandos `mouseOver` y `runScript window.scrollTo(…)`: registran movimientos del mouse y desplazamientos que no forman parte del caso de prueba.',
          '**Cambiar cada selector** por su `data-testid` (columna Target). En la lista desplegable del Target, Selenium IDE ya ofrece la opción `css=[data-testid="…"]`.',
          '**Agregar esperas** (`waitForElementVisible`) después de iniciar sesión, cambiar de página o pulsar un botón que carga datos. Después de iniciar sesión, además, esperar y pulsar el botón del aviso (`css=[data-testid="learning-notice-accept"]`).',
          '**Agregar al menos una verificación** (`assertText`, `assertElementPresent` u otra): una prueba sin verificaciones no comprueba nada.',
        ],
      },
      {
        kind: 'table',
        caption: 'Selectores grabados que se deben reemplazar',
        headers: ['Selector grabado', 'Problema', 'Reemplazo'],
        rows: [
          ['`css=[data-state="idle"]`', 'Es un estado del botón, no su nombre: cambia a `loading` al pulsarlo y lo comparten varios botones', '`css=[data-testid="btn-login"]`'],
          ['`mouseOver css=[data-state="loading"]`', 'El estado de carga dura milisegundos; al reproducir ya no existe y la prueba se queda esperando', 'Borrar el paso y esperar el resultado con `waitForElementVisible`'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'En el archivo de ejemplo, las pruebas **08 Prueba** (grabada) y **08 Prueba (corregida)** muestran el mismo flujo antes y después de aplicar esta regla: la primera se detiene en el paso 6 y la segunda pasa.',
      },
    ],
  },
  {
    id: 'plantilla',
    title: 'Plantilla para realizar la actividad',
    summary: 'Formato del informe grupal de la Tarea 3.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Plantilla para la elaboración del informe grupal de la Tarea 3 del curso Calidad de Software, estructurada de acuerdo con el modelo de calidad ISO/IEC 25010:2023. Incluye los apartados para documentar los aportes individuales, diseñar las matrices de 15 pruebas funcionales y 15 no funcionales, establecer criterios de aceptación, registrar la cobertura de las pruebas y consolidar los resultados de ejecución. También contiene el análisis técnico, la reflexión sobre el uso de inteligencia artificial, las conclusiones, las referencias bibliográficas y los anexos con las evidencias.',
      },
      {
        kind: 'download',
        id: 'template',
        href: '/descargas/Plantilla_entrega_Tarea3_guia_rubrica.docx',
        fileName: 'Plantilla_entrega_Tarea3_guia_rubrica.docx',
        label: 'Descargar plantilla',
        description: 'Plantilla de entrega de la Tarea 3 · Documento de Word (.docx)',
      },
    ],
  },
];
