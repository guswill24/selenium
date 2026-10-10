import { ArrowRight, Headphones, Pause, Play, Square, Volume2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import usabilityImage from '../assets/case-study-usability.webp';
import { Notice } from '../components/feedback/Notice.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { buildSpeechSegments, caseStudyMeta, caseStudySections, type CaseStudyBlock } from '../content/caseStudy.ts';
import { useMediaQuery } from '../hooks/useMediaQuery.ts';
import { useSpeech } from '../hooks/useSpeech.ts';
import { cn } from '../utils/cn.ts';

const RATES = [
  { value: 0.75, label: 'Lenta (0,75×)' },
  { value: 1, label: 'Normal (1×)' },
  { value: 1.25, label: 'Rápida (1,25×)' },
  { value: 1.5, label: 'Muy rápida (1,5×)' },
];

const segments = buildSpeechSegments(caseStudySections);
const firstSegmentOf = (sectionId: string) => segments.findIndex((segment) => segment.sectionId === sectionId);

const highlight = (active: boolean) => cn('rounded-lg transition-colors', active && 'bg-brand-50 ring-2 ring-brand-200');
const selectClasses = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800';

function Block({ block, activeId }: { block: CaseStudyBlock; activeId: string | undefined }) {
  const speaking = (id: string) => ({ 'data-speech-target': id, 'data-speaking': activeId === id });

  switch (block.kind) {
    case 'paragraph':
      return (
        <p className={cn('-mx-2 px-2 py-1 leading-relaxed text-slate-700', highlight(activeId === block.id))} {...speaking(block.id)}>
          {block.text}
        </p>
      );
    case 'list':
      return (
        <div>
          {block.title && (
            <p className={cn('-mx-2 px-2 py-1 font-semibold text-slate-900', highlight(activeId === block.id))} {...speaking(block.id)}>
              {block.title}
            </p>
          )}
          <ul className="mt-1 space-y-1">
            {block.items.map((item, index) => {
              const id = `${block.id}-${index}`;
              return (
                <li key={id} className={cn('flex gap-3 px-2 py-1 text-slate-700', highlight(activeId === id))} {...speaking(id)}>
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    case 'table':
      return (
        <div className={cn('-mx-2 px-2 py-1', highlight(activeId === block.id))} {...speaking(block.id)}>
          <h3 className="pb-2 font-semibold text-slate-900">{block.caption}</h3>
          {/* Focusable so keyboard users can scroll the table horizontally on narrow screens. */}
          <div className="overflow-x-auto rounded-xl border border-slate-200" tabIndex={0} role="region" aria-label={`Tabla: ${block.caption}`}>
            <table className="w-full min-w-[420px] text-left text-sm" data-testid={`case-study-table-${block.id}`}>
              <caption className="sr-only">{block.caption}</caption>
              <thead className="bg-brand-50 text-xs text-brand-900 uppercase">
                <tr>
                  {block.headers.map((header) => (
                    <th key={header} scope="col" className="px-4 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {block.rows.map(([key, value], index) => {
                  const id = `${block.id}-${index}`;
                  return (
                    <tr key={id} className={cn('transition-colors', activeId === id && 'bg-brand-50')} {...speaking(id)}>
                      <th scope="row" className="px-4 py-2.5 font-semibold whitespace-nowrap text-slate-900">
                        {key}
                      </th>
                      <td className="px-4 py-2.5 text-slate-700">{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'flow':
      return (
        <ol className={cn('-mx-2 flex flex-wrap items-center gap-2 px-2 py-2', highlight(activeId === block.id))} {...speaking(block.id)} aria-label="Flujo de trazabilidad">
          {block.steps.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-900">{step}</span>
              {index < block.steps.length - 1 && <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      );
    case 'figure':
      return (
        <figure className={cn('-mx-2 px-2 py-2', highlight(activeId === block.id))} {...speaking(block.id)}>
          <img
            src={usabilityImage}
            alt={block.alt}
            width={1672}
            height={940}
            loading="lazy"
            className="h-auto w-full rounded-xl border border-slate-200"
            data-testid="case-study-figure"
          />
          <figcaption className="mt-2 text-sm text-slate-600">{block.caption}</figcaption>
        </figure>
      );
  }
}

export function CaseStudyPage() {
  const speech = useSpeech(segments);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const current = segments[speech.currentIndex];
  const activeId = current?.targetId;
  const currentSection = useMemo(() => caseStudySections.find((section) => section.id === current?.sectionId), [current]);

  // Keep the paragraph being read in view; centered, so the sticky player never covers it.
  useEffect(() => {
    if (!activeId) return;
    document.querySelector(`[data-speech-target="${activeId}"]`)?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [activeId, reduceMotion]);

  const statusText =
    speech.status === 'playing'
      ? `Leyendo: ${currentSection?.title ?? ''}`
      : speech.status === 'paused'
        ? `En pausa: ${currentSection?.title ?? ''}`
        : 'Presiona Escuchar para oír el caso completo, o el botón de cada sección.';

  return (
    <div className="space-y-6" data-testid="page-case-study">
      <PageHeader title="Caso de estudio" description={caseStudyMeta.title.replace('Caso de estudio: ', '')} />

      <Card data-testid="case-study-meta">
        <p className="text-lg font-bold text-slate-900">{caseStudyMeta.component}</p>
        <p className="text-sm text-slate-600">{caseStudyMeta.course}</p>
      </Card>

      {/* Player: sticky under the top bar from tablet width, so it stays at hand while reading. */}
      <section
        aria-labelledby="case-study-player-title"
        className="z-10 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm sm:sticky sm:top-20 sm:p-5"
        data-testid="case-study-player"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Headphones className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="case-study-player-title" className="font-semibold text-slate-900">
              Escuchar el caso de estudio
            </h2>
            <p className="text-sm text-slate-600" aria-live="polite" data-testid="speech-status" data-status={speech.status} data-index={speech.currentIndex}>
              {speech.supported ? statusText : 'Lectura en voz alta no disponible en este navegador.'}
            </p>
          </div>
        </div>

        {speech.supported ? (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            {speech.status === 'playing' ? (
              <Button onClick={speech.pause} data-testid="btn-speech-play" aria-label="Pausar la lectura">
                <Pause className="h-4 w-4" aria-hidden="true" /> Pausar
              </Button>
            ) : (
              <Button
                onClick={() => (speech.status === 'paused' ? speech.resume() : speech.playFrom(0))}
                data-testid="btn-speech-play"
                aria-label={speech.status === 'paused' ? 'Continuar la lectura' : 'Escuchar el caso de estudio completo'}
              >
                <Play className="h-4 w-4" aria-hidden="true" /> {speech.status === 'paused' ? 'Continuar' : 'Escuchar'}
              </Button>
            )}
            <Button variant="secondary" onClick={speech.stop} disabled={speech.status === 'idle'} data-testid="btn-speech-stop" aria-label="Detener la lectura">
              <Square className="h-4 w-4" aria-hidden="true" /> Detener
            </Button>

            <div className="flex flex-col gap-1">
              <label htmlFor="speech-rate" className="text-xs font-semibold text-slate-600">
                Velocidad
              </label>
              <select id="speech-rate" name="speech-rate" className={selectClasses} value={speech.rate} onChange={(event) => speech.setRate(Number(event.target.value))} data-testid="select-speech-rate">
                {RATES.map((rate) => (
                  <option key={rate.value} value={rate.value}>
                    {rate.label}
                  </option>
                ))}
              </select>
            </div>

            {speech.voices.length > 1 && (
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor="speech-voice" className="text-xs font-semibold text-slate-600">
                  Voz
                </label>
                <select id="speech-voice" name="speech-voice" className={cn(selectClasses, 'max-w-full sm:max-w-xs')} value={speech.voice?.voiceURI ?? ''} onChange={(event) => speech.selectVoice(event.target.value)} data-testid="select-speech-voice">
                  {speech.voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <Notice tone="info" title="Usa el lector de pantalla de tu equipo" testId="speech-unsupported">
              Este navegador no permite la lectura en voz alta. El texto de la página es compatible con NVDA, Narrador o VoiceOver.
            </Notice>
          </div>
        )}

        {speech.supported && speech.voices.length === 0 && (
          <p className="mt-3 text-xs text-slate-600" data-testid="speech-no-colombian-voice">
            Este equipo no tiene una voz de español (Colombia) instalada; el navegador usará la que tenga disponible. Microsoft Edge incluye voces de Colombia.
          </p>
        )}

        {speech.error && (
          <div className="mt-4">
            <Notice tone="warning" title={speech.error} testId="speech-error" />
          </div>
        )}
      </section>

      <nav aria-label="Contenido del caso de estudio" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-testid="case-study-toc">
        <h2 className="text-sm font-semibold text-slate-900">Contenido</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {caseStudySections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="inline-block rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900" data-testid={`case-study-toc-${section.id}`}>
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {caseStudySections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:scroll-mt-64 sm:p-6"
          data-testid={`case-study-section-${section.id}`}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2
              id={`${section.id}-title`}
              className={cn('-mx-2 px-2 py-1 text-lg font-bold text-slate-900', highlight(activeId === `${section.id}-title`))}
              data-speech-target={`${section.id}-title`}
              data-speaking={activeId === `${section.id}-title`}
            >
              {section.title}
            </h2>
            {speech.supported && (
              <Button variant="ghost" className="px-3 py-1.5" onClick={() => speech.playFrom(firstSegmentOf(section.id))} aria-label={`Escuchar la sección ${section.title}`} data-testid={`btn-speech-section-${section.id}`}>
                <Volume2 className="h-4 w-4" aria-hidden="true" /> Escuchar sección
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {section.blocks.map((block) => (
              <Block key={block.id} block={block} activeId={activeId} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
