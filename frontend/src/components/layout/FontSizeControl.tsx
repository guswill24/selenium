import { useFontScale } from '../../hooks/useFontScale.ts';
import { cn } from '../../utils/cn.ts';

interface FontSizeControlProps {
  /** `dark` for the sign-in screen (dark background). */
  tone?: 'light' | 'dark';
  testId?: string;
}

/** A− / current size (resets to 100 %) / A+. Sizes from 100 % to 200 % (WCAG 2.1, 1.4.4). */
export function FontSizeControl({ tone = 'light', testId = 'font-size-control' }: FontSizeControlProps) {
  const { scale, canDecrease, canIncrease, decrease, increase, reset } = useFontScale();
  const button = cn(
    'min-h-9 min-w-9 px-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
    tone === 'light' ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-slate-700',
  );

  return (
    <div
      role="group"
      aria-label="Tamaño del texto"
      className={cn('inline-flex items-stretch overflow-hidden rounded-lg border', tone === 'light' ? 'border-slate-300 bg-white' : 'border-slate-600 bg-slate-800')}
      data-testid={testId}
      data-scale={scale}
    >
      <button type="button" className={button} onClick={decrease} disabled={!canDecrease} aria-label="Reducir el tamaño del texto" data-testid="btn-font-decrease">
        A<span aria-hidden="true">−</span>
      </button>
      <button
        type="button"
        className={cn(button, 'border-x font-semibold tabular-nums', tone === 'light' ? 'border-slate-300' : 'border-slate-600')}
        onClick={reset}
        disabled={scale === 100}
        aria-label={`Tamaño del texto: ${scale} %. Restablecer a 100 %`}
        data-testid="btn-font-reset"
      >
        {scale} %
      </button>
      <button type="button" className={cn(button, 'text-base')} onClick={increase} disabled={!canIncrease} aria-label="Aumentar el tamaño del texto" data-testid="btn-font-increase">
        A<span aria-hidden="true">+</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {`Tamaño del texto: ${scale} %`}
      </span>
    </div>
  );
}
