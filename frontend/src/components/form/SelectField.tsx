import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn.ts';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name'> {
  id: string;
  label: string;
  testId: string;
  options: SelectOption[];
  placeholder: string;
  error?: string | undefined;
}

/** Native select (reliable for Selenium `select` commands) with an accessible error. */
export function SelectField({ id, label, testId, options, placeholder, error, className, required, ...rest }: SelectFieldProps) {
  const errorId = `${id}-error`;

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
      <select
        id={id}
        name={id}
        data-testid={testId}
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900',
          'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 focus:outline-none',
          error ? 'border-red-600' : 'border-slate-300',
          className,
        )}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-sm font-medium text-red-700" data-testid={`error-${id}`}>
          {error}
        </p>
      )}
    </div>
  );
}
