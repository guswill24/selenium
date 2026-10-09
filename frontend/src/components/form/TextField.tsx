import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn.ts';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name'> {
  /** Stable id and name; also used to derive error/hint ids. */
  id: string;
  label: string;
  testId: string;
  error?: string | undefined;
  hint?: string;
  trailing?: ReactNode;
}

/**
 * Labelled input with an accessible, testable error:
 * `aria-invalid`, `aria-describedby` and a `data-testid="error-<id>"` message.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, testId, error, hint, trailing, className, required, ...inputProps },
  ref,
) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {' '}*
          </span>
        )}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          name={id}
          data-testid={testId}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500',
            'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 focus:outline-none',
            error ? 'border-red-600' : 'border-slate-300',
            trailing ? 'pr-12' : undefined,
            className,
          )}
          {...inputProps}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{trailing}</div>}
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-red-700" data-testid={`error-${id}`}>
          {error}
        </p>
      )}
    </div>
  );
});
