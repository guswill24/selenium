import { ArrowUpDown, type LucideIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Stop } from '../../types/transit.ts';
import { SelectField } from '../form/SelectField.tsx';
import { Button } from '../ui/Button.tsx';

export interface TripQuery {
  origin: string;
  destination: string;
}

interface FieldErrors {
  origin?: string | undefined;
  destination?: string | undefined;
}

function validate({ origin, destination }: TripQuery): FieldErrors {
  return {
    origin: origin ? undefined : 'Selecciona un paradero de origen.',
    destination: !destination
      ? 'Selecciona un paradero de destino.'
      : destination === origin
        ? 'El origen y el destino deben ser diferentes.'
        : undefined,
  };
}

interface StopPairFormProps {
  stops: Stop[];
  initialQuery: TripQuery;
  isSubmitting: boolean;
  onSubmit: (query: TripQuery) => void;
  onClear: () => void;
  /** Accessible name of the form, e.g. "Buscar ruta". */
  formLabel: string;
  formTestId: string;
  submitLabel: string;
  submitLoadingLabel: string;
  submitTestId: string;
  submitIcon: LucideIcon;
  clearTestId: string;
}

/** Origin/destination selector shared by route search and trip planning. */
export function StopPairForm({
  stops,
  initialQuery,
  isSubmitting,
  onSubmit,
  onClear,
  formLabel,
  formTestId,
  submitLabel,
  submitLoadingLabel,
  submitTestId,
  submitIcon: SubmitIcon,
  clearTestId,
}: StopPairFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [errors, setErrors] = useState<FieldErrors>({});

  const options = stops.map((stop) => ({
    value: stop.id,
    label: `${stop.name} (${stop.id})${stop.status === 'ACTIVE' ? '' : ' – en mantenimiento'}`,
  }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(query);
    setErrors(validation);
    if (validation.origin || validation.destination) {
      document.getElementById(validation.origin ? 'origin' : 'destination')?.focus();
      return;
    }
    onSubmit(query);
  };

  const handleClear = () => {
    setQuery({ origin: '', destination: '' });
    setErrors({});
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={formLabel} data-testid={formTestId}>
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
        <SelectField
          id="origin"
          testId="input-origin"
          label="Origen"
          placeholder="Selecciona un paradero"
          required
          options={options}
          value={query.origin}
          onChange={(event) => setQuery((current) => ({ ...current, origin: event.target.value }))}
          error={errors.origin}
        />
        <Button
          variant="ghost"
          className="self-center md:mt-7"
          onClick={() => setQuery(({ origin, destination }) => ({ origin: destination, destination: origin }))}
          aria-label="Intercambiar origen y destino"
          data-testid="btn-swap-stops"
        >
          <ArrowUpDown className="h-5 w-5 md:rotate-90" aria-hidden="true" />
        </Button>
        <SelectField
          id="destination"
          testId="input-destination"
          label="Destino"
          placeholder="Selecciona un paradero"
          required
          options={options}
          value={query.destination}
          onChange={(event) => setQuery((current) => ({ ...current, destination: event.target.value }))}
          error={errors.destination}
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSubmitting} loadingText={submitLoadingLabel} data-testid={submitTestId}>
          <SubmitIcon className="h-4 w-4" aria-hidden="true" />
          {submitLabel}
        </Button>
        <Button variant="secondary" onClick={handleClear} data-testid={clearTestId}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
