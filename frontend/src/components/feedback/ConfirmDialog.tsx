import { useEffect, useRef } from 'react';
import { Button } from '../ui/Button.tsx';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  testId: string;
}

/**
 * Native <dialog> shown as a modal: the browser traps focus, closes on Escape
 * and restores focus to the opener. Escape and "Cancelar" both cancel.
 */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel, testId }: ConfirmDialogProps) {
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
        onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby={`${testId}-title`}
      aria-describedby={`${testId}-message`}
      data-testid={testId}
    >
      <div className="space-y-4 p-6">
        <h2 id={`${testId}-title`} className="text-lg font-bold text-slate-900">
          {title}
        </h2>
        <p id={`${testId}-message`} className="text-sm text-slate-700">
          {message}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} data-testid={`${testId}-cancel`} autoFocus>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} data-testid={`${testId}-confirm`}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
