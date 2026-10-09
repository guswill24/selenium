import { Power, PowerOff } from 'lucide-react';
import { Button } from '../ui/Button.tsx';

interface ActiveToggleProps {
  active: boolean;
  label: string;
  testId: string;
  isBusy: boolean;
  onToggle: () => void;
  activateText?: string;
  deactivateText?: string;
}

/** Explicit action button (not a switch), so the text always says what a click will do. */
export function ActiveToggle({
  active,
  label,
  testId,
  isBusy,
  onToggle,
  activateText = 'Activar',
  deactivateText = 'Desactivar',
}: ActiveToggleProps) {
  const Icon = active ? PowerOff : Power;
  return (
    <Button
      variant="secondary"
      className="px-3 py-1.5"
      onClick={onToggle}
      isLoading={isBusy}
      loadingText="Guardando…"
      aria-label={`${active ? deactivateText : activateText} ${label}`}
      data-testid={testId}
      data-active={active}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {active ? deactivateText : activateText}
    </Button>
  );
}
