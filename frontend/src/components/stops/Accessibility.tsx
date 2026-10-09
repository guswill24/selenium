import { Accessibility as AccessibilityIcon, Ban } from 'lucide-react';

/** Accessibility shown with icon AND text, never with color alone. */
export function AccessibilityLabel({ accessible, testId }: { accessible: boolean; testId: string }) {
  const Icon = accessible ? AccessibilityIcon : Ban;
  return (
    <span
      className={accessible ? 'inline-flex items-center gap-1.5 text-brand-800' : 'inline-flex items-center gap-1.5 text-slate-700'}
      data-testid={testId}
      data-accessible={accessible}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {accessible ? 'Accesible' : 'Sin acceso para silla de ruedas'}
    </span>
  );
}
