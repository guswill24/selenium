import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { StopFilters } from '../../services/transitService.ts';
import type { StopStatus } from '../../types/transit.ts';
import { SelectField } from '../form/SelectField.tsx';
import { TextField } from '../form/TextField.tsx';
import { Button } from '../ui/Button.tsx';

const MAX_QUERY_LENGTH = 50;

const statusOptions: { value: StopStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Operativo' },
  { value: 'MAINTENANCE', label: 'En mantenimiento' },
  { value: 'CLOSED', label: 'Cerrado' },
];

interface StopSearchFormProps {
  initialFilters: Required<StopFilters>;
  isSearching: boolean;
  onSearch: (filters: Required<StopFilters>) => void;
  onClear: () => void;
}

export function StopSearchForm({ initialFilters, isSearching, onSearch, onClear }: StopSearchFormProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (filters.q.trim().length > MAX_QUERY_LENGTH) {
      setError(`La búsqueda no puede superar ${MAX_QUERY_LENGTH} caracteres.`);
      return;
    }
    setError(undefined);
    onSearch({ q: filters.q.trim(), status: filters.status });
  };

  const handleClear = () => {
    setFilters({ q: '', status: '' });
    setError(undefined);
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Buscar paradero" data-testid="stop-search-form">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <TextField
          id="stop-search"
          testId="input-stop-search"
          label="Nombre, código, dirección o zona"
          type="search"
          placeholder="Ej.: Centro, S03, Carrera 7"
          value={filters.q}
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
          error={error}
        />
        <SelectField
          id="stop-status"
          testId="input-stop-status"
          label="Estado"
          placeholder="Todos los estados"
          options={statusOptions}
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as StopStatus | '' }))}
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSearching} loadingText="Buscando…" data-testid="btn-search-stop">
          <Search className="h-4 w-4" aria-hidden="true" />
          Buscar paradero
        </Button>
        <Button variant="secondary" onClick={handleClear} data-testid="btn-clear-stop-search">
          Limpiar
        </Button>
      </div>
    </form>
  );
}
