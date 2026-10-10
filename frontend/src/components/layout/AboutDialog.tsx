import { Bus, Info, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
// Second pose: the same illustration winking (created from control/present/asssets/gustavo.png).
import teacherPhotoEnd from '../../assets/teacher-wink.webp';
import teacherPhoto from '../../assets/teacher.webp';
import { cn } from '../../utils/cn.ts';

const TEACHER_AREAS = ['UX / UI', 'Producto', 'Desarrollo', 'Analítica', 'Datos', 'Arquitectura'];

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
      className="about-modal"
      aria-labelledby="about-teacher-name"
      aria-describedby="about-dialog-title"
      data-testid="about-dialog"
    >
      <button type="button" className="about-modal__close" onClick={onClose} aria-label="Cerrar" data-testid="about-dialog-close" autoFocus>
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Two columns from tablet width: portrait side | divider | profile (styles in index.css). */}
      <div className="about-modal__inner" data-testid="about-teacher">
        <aside className="about-modal__side">
          {/* Portrait: reveal on open, the two poses alternate gently, solid lift on hover, swaying sticker. */}
          <div className="teacher-portrait" data-testid="about-teacher-portrait">
            <img
              src={teacherPhoto}
              alt="Ilustración del docente Gustavo Willyn Sánchez Rodríguez"
              width={480}
              height={396}
              className="teacher-portrait__init"
              data-testid="about-teacher-photo"
            />
            <img src={teacherPhotoEnd} alt="" aria-hidden="true" width={480} height={396} className="teacher-portrait__end" />
            <span className="teacher-portrait__sticker" aria-hidden="true">
              <Bus className="h-5 w-5" />
            </span>
          </div>
          <div className="text-center">
            <h2 id="about-teacher-name" className="text-2xl leading-tight font-extrabold text-slate-900 sm:text-3xl" data-testid="about-teacher-name">
              GUSTAVO WILLYN SÁNCHEZ RODRÍGUEZ
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-700" data-testid="about-teacher-role">
              Docente Tiempo Completo – UNAD
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Áreas" data-testid="about-teacher-areas">
              {TEACHER_AREAS.map((area) => (
                <li key={area} className="about-modal__tag">
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Focusable: it scrolls on its own from tablet width (keyboard users can scroll it too). */}
        <div className="about-modal__content" tabIndex={0} role="region" aria-label="Perfil del docente">
          <p id="about-dialog-title" className="text-xs font-semibold tracking-wider text-brand-800 uppercase" data-testid="about-app">
            Acerca de Mi Ruta · Laboratorio de Calidad de Software · UNAD
          </p>
          <h3 className="about-modal__heading">Formación</h3>
          <p className="text-base leading-relaxed text-slate-700" data-testid="about-teacher-education">
            Ingeniero de Sistemas, Especialista en Informática y Telemática, Especialista en Gerencia de Proyectos y
            Magíster en Ingeniería Computacional por la Universidad de Caldas.
          </p>
          <hr className="about-modal__rule" />
          <h3 className="about-modal__heading">Experiencia</h3>
          <p className="text-base leading-relaxed text-slate-700" data-testid="about-teacher-experience">
            Cuenta con experiencia en la dirección de proyectos tecnológicos y el diseño y desarrollo de software,
            sistemas de información y soluciones digitales, integrando tecnologías emergentes para impulsar la
            innovación.
          </p>
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
