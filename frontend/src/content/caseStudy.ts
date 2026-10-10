/**
 * Course case study (control/Caso_estudio_App_Transporte_Publico_CIPAS.pdf) as structured content,
 * so it can be read on screen, by screen readers and aloud with speech synthesis.
 * Text is transcribed verbatim from the PDF (sections 1–8; the conclusion is left out on purpose);
 * keep it in sync when the PDF changes.
 */

export type CaseStudyBlock =
  | { kind: 'paragraph'; id: string; text: string }
  | { kind: 'list'; id: string; title?: string; items: string[] }
  | { kind: 'table'; id: string; caption: string; headers: [string, string]; rows: [string, string][] }
  | { kind: 'flow'; id: string; steps: string[] }
  | { kind: 'figure'; id: string; alt: string; caption: string };

export interface CaseStudySection {
  id: string;
  title: string;
  blocks: CaseStudyBlock[];
}

// The PDF's institutional header lines are left out on purpose.
export const caseStudyMeta = {
  component: 'Caso de estudio para el componente práctico',
  course: 'Calidad de software – 202016903',
  title: 'Caso de estudio: Aplicación de transporte público de una ciudad',
} as const;

export const caseStudySections: CaseStudySection[] = [
  {
    id: 'descripcion',
    title: '1. Descripción del servicio',
    blocks: [
      {
        kind: 'paragraph',
        id: 'descripcion-1',
        text: 'La aplicación Mi Ruta es una solución digital orientada a facilitar el desplazamiento de las personas dentro de una ciudad mediante la consulta de rutas, paraderos, recorridos y tiempos estimados de llegada de los buses. Busca integrar información del servicio de transporte público en una experiencia sencilla, accesible y útil.',
      },
      {
        kind: 'paragraph',
        id: 'descripcion-2',
        text: 'El sistema permite consultar información desde un dispositivo móvil, identificar alternativas de transporte, visualizar recorridos en un mapa y recibir notificaciones sobre la llegada de los buses y posibles cambios en el servicio.',
      },
    ],
  },
  {
    id: 'problema',
    title: '2. Definición del problema',
    blocks: [
      {
        kind: 'paragraph',
        id: 'problema-1',
        text: 'Los usuarios del transporte público pueden tener dificultades para conocer qué ruta utilizar, dónde está el paradero más cercano, cuánto tiempo deben esperar y si existen cambios en el recorrido. La información puede estar dispersa, desactualizada o presentarse de manera poco comprensible.',
      },
      {
        kind: 'list',
        id: 'problema-dificultades',
        title: 'Principales dificultades:',
        items: [
          'Dificultad para identificar rápidamente la ruta adecuada hacia un destino.',
          'Información insuficiente o poco clara sobre tiempos de llegada y paraderos.',
          'Complejidad para comprender el recorrido de una ruta.',
          'Falta de información oportuna sobre cambios y novedades del servicio.',
          'Dificultades de acceso a la información para personas con diferentes necesidades de interacción.',
        ],
      },
      {
        kind: 'paragraph',
        id: 'problema-2',
        text: 'El problema central consiste en disponer de una aplicación que permita consultar y comprender la información del transporte público de manera funcional, usable, accesible, confiable y oportuna.',
      },
    ],
  },
  {
    id: 'alcance',
    title: '3. Alcance del proyecto',
    blocks: [
      {
        kind: 'paragraph',
        id: 'alcance-1',
        text: 'El proyecto contempla el diseño y desarrollo de una aplicación digital para apoyar la planificación y seguimiento de desplazamientos mediante transporte público. Incluye los siguientes componentes:',
      },
      {
        kind: 'list',
        id: 'alcance-componentes',
        items: [
          'Registro, autenticación y gestión básica del perfil del usuario.',
          'Consulta de rutas entre un origen y un destino.',
          'Consulta de paraderos cercanos.',
          'Visualización del recorrido mediante mapas.',
          'Consulta de tiempos estimados de llegada.',
          'Información del bus y de su ubicación o estado cuando esté disponible.',
          'Alertas y notificaciones sobre cambios o novedades del servicio.',
          'Historial de consultas y recorridos.',
          'Gestión de rutas, paraderos y horarios.',
          'Panel de administración para supervisar información y operación.',
        ],
      },
      {
        kind: 'table',
        id: 'alcance-usuarios',
        caption: 'Usuarios',
        headers: ['Usuario', 'Necesidades principales'],
        rows: [
          ['Pasajeros', 'Consultar rutas, paraderos, tiempos y recorridos; recibir alertas.'],
          ['Operadores', 'Consultar y actualizar información operacional del servicio.'],
          ['Administradores', 'Gestionar rutas, paraderos, horarios, alertas e indicadores.'],
        ],
      },
      {
        kind: 'table',
        id: 'alcance-modulos',
        caption: 'Módulos del sistema',
        headers: ['#', 'Módulo'],
        rows: [
          ['1', 'Autenticación y perfil'],
          ['2', 'Consulta de rutas'],
          ['3', 'Paraderos'],
          ['4', 'Planificación del recorrido'],
          ['5', 'Mapa y geolocalización'],
          ['6', 'Información en tiempo real'],
          ['7', 'Alertas y notificaciones'],
          ['8', 'Historial'],
          ['9', 'Gestión de rutas'],
          ['10', 'Administración y monitoreo'],
        ],
      },
    ],
  },
  {
    id: 'factores',
    title: '4. Factores clave para el éxito',
    blocks: [
      {
        kind: 'list',
        id: 'factores-lista',
        items: [
          'Identificación clara de las necesidades y requisitos de los usuarios.',
          'Información de rutas, paraderos y horarios consistente y actualizada.',
          'Facilidad de uso y navegación para diferentes perfiles.',
          'Accesibilidad de la información y de las funciones principales.',
          'Disponibilidad adecuada del servicio digital.',
          'Tiempos de respuesta apropiados para consultas.',
          'Compatibilidad con los entornos tecnológicos definidos.',
          'Protección de datos personales y de la información de usuarios.',
          'Integración adecuada con fuentes de información del transporte.',
          'Aplicación de pruebas de calidad durante el ciclo de desarrollo.',
        ],
      },
    ],
  },
  {
    id: 'atributos',
    title: '5. Atributos de calidad relevantes',
    blocks: [
      {
        kind: 'paragraph',
        id: 'atributos-1',
        text: 'El caso permite analizar características y subcaracterísticas de calidad relacionadas con las necesidades del servicio.',
      },
      {
        kind: 'table',
        id: 'atributos-tabla',
        caption: 'Atributos de calidad y su aplicación en el caso',
        headers: ['Característica', 'Aplicación en el caso'],
        rows: [
          ['Adecuación funcional', 'Consulta correcta de rutas, paraderos, recorridos y tiempos.'],
          ['Eficiencia del desempeño', 'Tiempo de respuesta y actualización de información.'],
          ['Usabilidad', 'Facilidad para encontrar, comprender y utilizar la información.'],
          ['Accesibilidad', 'Alternativas de interacción y presentación para diferentes usuarios.'],
          ['Compatibilidad', 'Funcionamiento adecuado en los entornos definidos.'],
          ['Fiabilidad', 'Disponibilidad y comportamiento consistente.'],
          ['Seguridad', 'Protección de datos personales y control de acceso.'],
          ['Portabilidad', 'Adaptación a los entornos definidos para su uso.'],
        ],
      },
    ],
  },
  {
    id: 'orientacion',
    title: '6. Orientación para el análisis de pruebas',
    blocks: [
      {
        kind: 'paragraph',
        id: 'orientacion-1',
        text: 'A partir del caso, los estudiantes pueden identificar requisitos, atributos de calidad, tipos de pruebas, casos de prueba, criterios de aceptación y herramientas de automatización. El objetivo del caso didáctico es mostrar la trazabilidad desde la necesidad hasta la prueba, sin proporcionar las respuestas del caso evaluativo BioTest.',
      },
    ],
  },
  {
    id: 'trazabilidad',
    title: '7. Trazabilidad del caso',
    blocks: [
      {
        kind: 'flow',
        id: 'trazabilidad-flujo',
        steps: [
          'Necesidad del usuario',
          'Requisito',
          'Atributo de calidad',
          'Tipo de prueba',
          'Caso de prueba',
          'Criterio de aceptación',
          'Ejecución',
          'Resultado',
          'Análisis técnico',
        ],
      },
      {
        kind: 'figure',
        id: 'trazabilidad-infografia',
        alt: 'Infografía "Usabilidad aplicada al territorio": seis pasos del viaje de una persona con la app Mi Ruta y las cualidades que la hacen usable.',
        caption: 'Usabilidad aplicada al territorio. Ejemplo real: app de transporte público de una ciudad.',
      },
    ],
  },
  {
    id: 'impacto',
    title: '8. Impacto esperado',
    blocks: [
      {
        kind: 'list',
        id: 'impacto-lista',
        items: [
          'Facilitar la planificación de los desplazamientos.',
          'Reducir la incertidumbre sobre rutas, paraderos y tiempos.',
          'Mejorar la experiencia de los usuarios durante el recorrido.',
          'Favorecer el acceso a información clara y oportuna.',
          'Apoyar la gestión y supervisión del servicio.',
        ],
      },
    ],
  },
];

/** One spoken unit. `targetId` is the on-screen element highlighted while it is read. */
export interface SpeechSegment {
  targetId: string;
  sectionId: string;
  text: string;
}

// Short utterances avoid the Chrome bug that silently stops long utterances after ~15 s,
// and make pause/resume restart only a sentence.
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?:;])\s+/).filter(Boolean);
}

function blockSegments(sectionId: string, block: CaseStudyBlock): SpeechSegment[] {
  const seg = (targetId: string, text: string): SpeechSegment[] =>
    sentences(text).map((part) => ({ targetId, sectionId, text: part }));

  switch (block.kind) {
    case 'paragraph':
      return seg(block.id, block.text);
    case 'list':
      return [
        ...(block.title ? seg(block.id, block.title) : []),
        ...block.items.flatMap((item, index) => seg(`${block.id}-${index}`, item)),
      ];
    case 'table':
      return [
        ...seg(block.id, `Tabla: ${block.caption}.`),
        ...block.rows.map(([key, value], index) => ({
          targetId: `${block.id}-${index}`,
          sectionId,
          text: block.headers[0] === '#' ? `${key}. ${value}.` : `${key}: ${value}`,
        })),
      ];
    case 'flow':
      return seg(block.id, `Flujo de trazabilidad: ${block.steps.join(', luego ')}.`);
    case 'figure':
      return seg(block.id, `Imagen: ${block.caption}`);
  }
}

export function buildSpeechSegments(sections: CaseStudySection[]): SpeechSegment[] {
  return sections.flatMap((section) => [
    { targetId: `${section.id}-title`, sectionId: section.id, text: section.title.replace(/^(\d+)\.\s*/, 'Sección $1. ') },
    ...section.blocks.flatMap((block) => blockSegments(section.id, block)),
  ]);
}
