import { CheckCircle2, Circle, Download, FileText, RotateCcw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { guideDownload, guideSections, type GuideBlock } from '../content/seleniumGuide.ts';
import { cn } from '../utils/cn.ts';
import { readJson, storageKeys, writeJson } from '../utils/storage.ts';

interface GuideProgress {
  sections: string[];
  checks: string[];
}

const EMPTY_PROGRESS: GuideProgress = { sections: [], checks: [] };

function loadProgress(): GuideProgress {
  const saved = readJson<Partial<GuideProgress>>(storageKeys.guideProgress);
  return {
    sections: Array.isArray(saved?.sections) ? saved.sections : [],
    checks: Array.isArray(saved?.checks) ? saved.checks : [],
  };
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

/** Renders `code`, **bold** and bare URLs inside the guide's plain-text strings. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|https?:\/\/[^\s]+?(?=[.,]?(?:\s|$)))/).filter(Boolean);
  return (
    <>
      {parts.map((part, index): ReactNode => {
        if (part.startsWith('`')) {
          return (
            <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-900 [overflow-wrap:anywhere]">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="relative font-medium text-brand-700 underline [overflow-wrap:anywhere] hover:text-brand-900">
              {part}
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          );
        }
        return part;
      })}
    </>
  );
}

interface BlockProps {
  block: GuideBlock;
  sectionId: string;
  index: number;
  checks: string[];
  onToggleCheck: (id: string) => void;
}

function Block({ block, sectionId, index, checks, onToggleCheck }: BlockProps) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p className="leading-relaxed text-slate-700">
          <Inline text={block.text} />
        </p>
      );
    case 'bullets':
      return (
        <ul className="space-y-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
              <span className="min-w-0">
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((item, step) => (
            <li key={item} className="flex gap-3 text-slate-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white" aria-hidden="true">
                {step + 1}
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="sr-only">Paso {step + 1}: </span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div>
          <h3 className="pb-2 font-semibold text-slate-900">{block.caption}</h3>
          {/* Focusable so keyboard users can scroll the table horizontally on narrow screens. */}
          <div className="overflow-x-auto rounded-xl border border-slate-200" tabIndex={0} role="region" aria-label={`Tabla: ${block.caption}`}>
            <table className="w-full min-w-[520px] text-left text-sm" data-testid={`selenium-guide-table-${sectionId}-${index}`}>
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
                {block.rows.map((row) => (
                  <tr key={row[0]} className="align-top">
                    {row.map((cell, column) =>
                      column === 0 ? (
                        <th key={column} scope="row" className="px-4 py-2.5 font-semibold text-slate-900">
                          <Inline text={cell} />
                        </th>
                      ) : (
                        <td key={column} className="px-4 py-2.5 text-slate-700">
                          <Inline text={cell} />
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'code':
      return (
        <figure>
          <figcaption className="pb-2 font-semibold text-slate-900">{block.caption}</figcaption>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm leading-relaxed text-slate-100" tabIndex={0} role="region" aria-label={block.caption}>
            <code>{block.code}</code>
          </pre>
        </figure>
      );
    case 'download':
      return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4">
          <FileText className="h-6 w-6 shrink-0 text-brand-700" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm text-slate-700">{block.description}</p>
          <a
            href={block.href}
            download={block.fileName}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            data-testid={`btn-guide-download-${block.id}`}
          >
            <Download className="h-4 w-4" aria-hidden="true" /> {block.label}
          </a>
        </div>
      );
    case 'checklist':
      return (
        <fieldset className="min-w-0 rounded-xl border border-brand-200 bg-brand-50/50 p-4" data-testid={`selenium-guide-checklist-${block.id}`}>
          <legend className="px-1 font-semibold text-slate-900">{block.title}</legend>
          <ul className="mt-1 space-y-2">
            {block.items.map((item, itemIndex) => {
              const id = `${block.id}-${itemIndex}`;
              return (
                <li key={id}>
                  <label className="flex cursor-pointer gap-3 rounded-lg p-1 text-slate-700 hover:bg-white">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-brand-700"
                      checked={checks.includes(id)}
                      onChange={() => onToggleCheck(id)}
                      data-testid={`selenium-guide-check-${id}`}
                    />
                    <span className={cn('min-w-0 [overflow-wrap:anywhere]', checks.includes(id) && 'text-slate-500 line-through')}>
                      <Inline text={item} />
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      );
  }
}

export function SeleniumGuidePage() {
  const [progress, setProgress] = useState<GuideProgress>(loadProgress);
  const reviewed = progress.sections.filter((id) => guideSections.some((section) => section.id === id)).length;
  const total = guideSections.length;
  const percent = Math.round((reviewed / total) * 100);

  useEffect(() => writeJson(storageKeys.guideProgress, progress), [progress]);

  return (
    <div className="space-y-6" data-testid="page-selenium-guide">
      <PageHeader title="Guía Selenium IDE" description="Instalación de Selenium IDE 4 y uso del archivo de pruebas de ejemplo sobre Mi Ruta." />

      <Card data-testid="selenium-guide-progress">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-slate-900" aria-live="polite" data-testid="selenium-guide-progress-text" data-reviewed={reviewed}>
            Secciones revisadas: {reviewed} de {total}
          </p>
          <Button variant="ghost" className="px-3 py-1.5" onClick={() => setProgress(EMPTY_PROGRESS)} disabled={reviewed === 0 && progress.checks.length === 0} data-testid="btn-guide-reset">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reiniciar progreso
          </Button>
        </div>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Avance en la guía"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${percent}%` }} />
        </div>

        <nav aria-label="Secciones de la guía" className="mt-4" data-testid="selenium-guide-toc">
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {guideSections.map((section, index) => {
              const done = progress.sections.includes(section.id);
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex h-full items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900"
                    data-testid={`selenium-guide-toc-${section.id}`}
                    data-done={done}
                  >
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    )}
                    <span className="min-w-0">
                      {index + 1}. {section.title}
                      {done && <span className="sr-only"> (revisada)</span>}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </Card>

      {guideSections.map((section, index) => {
        const done = progress.sections.includes(section.id);
        return (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className={cn('scroll-mt-20 rounded-2xl border bg-white p-5 shadow-sm sm:p-6', done ? 'border-brand-300' : 'border-slate-200')}
            data-testid={`selenium-guide-section-${section.id}`}
            data-done={done}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 font-bold text-brand-800" aria-hidden="true">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h2 id={`${section.id}-title`} className="text-lg font-bold text-slate-900">
                  {section.title}
                </h2>
                <p className="text-sm text-slate-600">{section.summary}</p>
              </div>
            </div>
            <div className="space-y-5">
              {section.blocks.map((block, blockIndex) => (
                <Block
                  key={blockIndex}
                  block={block}
                  sectionId={section.id}
                  index={blockIndex}
                  checks={progress.checks}
                  onToggleCheck={(id) => setProgress((current) => ({ ...current, checks: toggle(current.checks, id) }))}
                />
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <Button
                variant={done ? 'secondary' : 'primary'}
                aria-pressed={done}
                onClick={() => setProgress((current) => ({ ...current, sections: toggle(current.sections, section.id) }))}
                data-testid={`btn-guide-done-${section.id}`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-4 w-4" aria-hidden="true" />}
                {done ? 'Revisada' : 'Marcar como revisada'}
              </Button>
            </div>
          </section>
        );
      })}

      <section aria-labelledby="selenium-guide-download-title" className="rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6" data-testid="selenium-guide-download">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="selenium-guide-download-title" className="font-bold text-slate-900">
              Descargar la guía completa
            </h2>
            <p className="text-sm text-slate-700">El mismo contenido de esta página, para leerlo sin conexión o imprimirlo. {guideDownload.label}.</p>
          </div>
          <a
            href={guideDownload.href}
            download={guideDownload.fileName}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            data-testid="btn-guide-download"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Descargar Word
          </a>
        </div>
      </section>
    </div>
  );
}
