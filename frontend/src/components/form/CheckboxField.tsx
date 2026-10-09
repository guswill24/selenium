import type { InputHTMLAttributes } from 'react';

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'type'> {
  id: string;
  label: string;
  testId: string;
}

export function CheckboxField({ id, label, testId, ...rest }: CheckboxFieldProps) {
  return (
    <label htmlFor={id} className="inline-flex min-h-6 cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
      <input
        id={id}
        name={id}
        type="checkbox"
        className="h-4 w-4 rounded border-slate-400 accent-brand-700"
        data-testid={testId}
        {...rest}
      />
      {label}
    </label>
  );
}
