import { BookOpenText, Bus, FlaskConical, Presentation, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import { Button } from '../ui/Button.tsx';

interface LearningStep {
  id: string;
  icon: LucideIcon;
  title: string;
  hint: string;
}

const LEARNING_STEPS: LearningStep[] = [
  { id: 'case-study', icon: BookOpenText, title: 'Caso de estudio', hint: 'Léalo o escúchelo' },
  { id: 'selenium-guide', icon: FlaskConical, title: 'Guía Selenium IDE', hint: 'Siga sus indicaciones' },
  { id: 'presentation', icon: Presentation, title: 'Presentación', hint: 'Mírela completa' },
  { id: 'app', icon: Bus, title: 'Aplicativo Mi Ruta', hint: 'Interactúe y practique' },
];

interface LearningNoticeDialogProps {
  open: boolean;
  onAccept: () => void;
}

/**
 * Mandatory notice shown right after login. Native <dialog> opened as a modal, but Escape and
 * backdrop clicks are ignored: the only way to close it is the accept button.
 * Below the notice, the suggested learning route is drawn as a bus line whose stops light up in order
 * (styles in index.css, `.notice-route`).
 */
export function LearningNoticeDialog({ open, onAccept }: LearningNoticeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => event.preventDefault()}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl p-0 shadow-xl backdrop:bg-slate-900/60"
      aria-labelledby="learning-notice-title"
      aria-describedby="learning-notice-message"
      data-testid="learning-notice"
    >
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-3">
          <TriangleAlert className="h-6 w-6 shrink-0 text-amber-600" aria-hidden="true" />
          <h2 id="learning-notice-title" className="text-lg font-bold text-slate-900">
            Aviso importante
          </h2>
        </div>
        <p id="learning-notice-message" className="text-sm leading-relaxed text-slate-700" data-testid="learning-notice-message">
          Este aplicativo es un laboratorio de aprendizaje diseñado para practicar el uso de Selenium IDE en la
          automatización de pruebas de software. Su propósito es exclusivamente formativo{' '}
          <strong className="font-semibold text-slate-900">
            y no debe utilizarse como caso de estudio para el desarrollo y la entrega de la actividad académica
          </strong>
          . Para dicha entrega, deberá seleccionar y
          trabajar con un caso de estudio propio, de acuerdo con las orientaciones de la guía de actividades.
        </p>

        <section className="notice-route" aria-labelledby="learning-route-title" data-testid="learning-route">
          <h3 id="learning-route-title" className="text-sm font-bold text-slate-900">
            Su ruta de aprendizaje
          </h3>
          <ol className="notice-route__steps">
            {LEARNING_STEPS.map((step, index) => (
              <li
                key={step.id}
                className="notice-route__step"
                style={{ '--step': index } as CSSProperties}
                data-testid={`learning-route-step-${step.id}`}
              >
                <span className="notice-route__stop" aria-hidden="true">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="notice-route__text">
                  <span className="notice-route__number">Paso {index + 1}</span>
                  <span className="notice-route__title">{step.title}</span>
                  <span className="notice-route__hint">{step.hint}</span>
                  {index === 0 && <span className="notice-route__start">Empiece aquí</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex justify-end">
          <Button onClick={onAccept} data-testid="learning-notice-accept" autoFocus>
            He leído y acepto
          </Button>
        </div>
      </div>
    </dialog>
  );
}
