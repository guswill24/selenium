import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import teacherPhoto from '../../assets/teacher.webp';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../utils/cn.ts';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Acerca de" modal with the course teacher's profile. Native <dialog> like ConfirmDialog: the browser
 * traps focus, closes on Escape and restores focus to the opener. A click on the backdrop also closes it.
 */
export function AboutDialog({ open, onClose }: AboutDialogProps) {
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
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // The dialog element itself is only the target when the click lands on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="about-dialog-title"
      data-testid="about-dialog"
    >
      <div className="space-y-5 p-6">
        <header>
          <h2 id="about-dialog-title" className="text-lg font-bold text-slate-900">
            Acerca de Mi Ruta
          </h2>
          <p className="mt-1 text-sm text-slate-600" data-testid="about-app">
            Laboratorio de Calidad de Software · Curso Calidad de Software (202016903) · UNAD
          </p>
        </header>

        <section aria-labelledby="about-teacher-name" className="space-y-4" data-testid="about-teacher">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <img
              src={teacherPhoto}
              alt="Ilustración del docente Gustavo Willyn Sánchez Rodríguez"
              width={480}
              height={396}
              className="h-32 w-auto shrink-0 rounded-xl border border-slate-200 bg-white"
              data-testid="about-teacher-photo"
            />
            <div>
              <p className="text-xs font-semibold tracking-wider text-brand-800 uppercase">Docente</p>
              <h3 id="about-teacher-name" className="mt-1 font-bold text-slate-900" data-testid="about-teacher-name">
                GUSTAVO WILLYN SÁNCHEZ RODRÍGUEZ
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-700" data-testid="about-teacher-role">
                Docente Tiempo Completo – UNAD
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-700" data-testid="about-teacher-education">
            Ingeniero de Sistemas, Especialista en Informática y Telemática, Especialista en Gerencia de Proyectos y
            Magíster en Ingeniería Computacional por la Universidad de Caldas.
          </p>
          <p className="text-sm text-slate-700" data-testid="about-teacher-experience">
            Cuenta con experiencia en la dirección de proyectos tecnológicos y el diseño y desarrollo de software,
            sistemas de información y soluciones digitales, integrando tecnologías emergentes para impulsar la
            innovación.
          </p>
        </section>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose} data-testid="about-dialog-close" autoFocus>
            Cerrar
          </Button>
        </div>
      </div>
    </dialog>
  );
}

interface AboutButtonProps {
  testId: string;
  className?: string;
  showIcon?: boolean;
  iconClassName?: string;
  onOpen?: () => void;
}

/** Button that opens the "Acerca de" modal; used in the sidebar and on the login page. */
export function AboutButton({ testId, className, showIcon = false, iconClassName = 'h-5 w-5', onOpen }: AboutButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={cn('cursor-pointer', className)}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        data-testid={testId}
      >
        {showIcon && <Info className={cn('shrink-0', iconClassName)} aria-hidden="true" />}
        <span>Acerca de</span>
      </button>
      <AboutDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
