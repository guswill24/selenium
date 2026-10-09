import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ApiError } from '../../services/apiClient.ts';
import { createRoute, updateRoute } from '../../services/adminService.ts';
import type { AdminRoute, RouteInput } from '../../types/admin.ts';
import type { RouteStatus, Stop } from '../../types/transit.ts';
import { Notice } from '../feedback/Notice.tsx';
import { SelectField } from '../form/SelectField.tsx';
import { TextField } from '../form/TextField.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';

interface StopRow {
  stopId: string;
  minutes: string;
}

type FieldErrors = Record<string, string>;

const statusOptions: { value: RouteStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'DELAYED', label: 'Con retraso' },
  { value: 'CHANGED', label: 'Modificada' },
  { value: 'SUSPENDED', label: 'Suspendida' },
];

const MIN_STOPS = 2;
const MAX_STOPS = 12;

/** Client-side mirror of the server rules, so most errors appear without a request. */
function validate(form: { id: string; name: string; color: string; status: string }, rows: StopRow[], takenIds: Set<string>, isEdit: boolean): FieldErrors {
  const errors: FieldErrors = {};
  const id = form.id.trim().toUpperCase();
  if (!/^R\d{2,3}$/.test(id)) errors['route-id'] = 'El código debe tener el formato R seguido de 2 o 3 dígitos (ej.: R40).';
  else if (!isEdit && takenIds.has(id)) errors['route-id'] = `Ya existe una ruta con el código ${id}.`;
  if (form.name.trim().length < 3) errors['route-name'] = 'El nombre debe tener al menos 3 caracteres.';
  else if (form.name.trim().length > 60) errors['route-name'] = 'El nombre no puede superar 60 caracteres.';
  if (!/^#[0-9a-fA-F]{6}$/.test(form.color.trim())) errors['route-color'] = 'El color debe ser un código hexadecimal (ej.: #0369a1).';
  if (!form.status) errors['route-status'] = 'Selecciona un estado.';

  const seen = new Set<string>();
  rows.forEach((row, index) => {
    const n = index + 1;
    if (!row.stopId) errors[`route-stop-${n}`] = 'Selecciona un paradero.';
    else if (seen.has(row.stopId)) errors[`route-stop-${n}`] = 'El paradero está repetido en la ruta.';
    seen.add(row.stopId);

    const minutes = Number(row.minutes);
    const previous = index > 0 ? Number(rows[index - 1]?.minutes) : null;
    if (row.minutes.trim() === '' || !Number.isInteger(minutes) || minutes < 0) {
      errors[`route-minutes-${n}`] = 'Ingresa un número entero de minutos.';
    } else if (index === 0 && minutes !== 0) {
      errors[`route-minutes-${n}`] = 'El primer paradero debe estar en el minuto 0.';
    } else if (previous !== null && Number.isFinite(previous) && minutes <= previous) {
      errors[`route-minutes-${n}`] = 'Los minutos deben aumentar en cada paradero.';
    }
  });
  return errors;
}

/** "stops.1.stopId" → "route-stop-2", "name" → "route-name". */
function toFieldId(serverField: string): string {
  const stop = /^stops\.(\d+)\.(stopId|minutesFromStart)$/.exec(serverField);
  if (stop) return `${stop[2] === 'stopId' ? 'route-stop' : 'route-minutes'}-${Number(stop[1]) + 1}`;
  return `route-${serverField}`;
}

interface RouteFormProps {
  route: AdminRoute | null;
  stops: Stop[];
  takenIds: Set<string>;
  onSaved: (route: AdminRoute, isNew: boolean) => void;
  onCancel: () => void;
}

export function RouteForm({ route, stops, takenIds, onSaved, onCancel }: RouteFormProps) {
  const isEdit = route !== null;
  const [form, setForm] = useState({
    id: route?.id ?? '',
    name: route?.name ?? '',
    color: route?.color ?? '#15803d',
    status: route?.status ?? 'ACTIVE',
  });
  const [rows, setRows] = useState<StopRow[]>(
    route ? route.stops.map((stop) => ({ stopId: stop.stopId, minutes: String(stop.minutesFromStart) })) : [
      { stopId: '', minutes: '0' },
      { stopId: '', minutes: '' },
    ],
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const stopOptions = stops.map((stop) => ({ value: stop.id, label: `${stop.name} (${stop.id})` }));
  const setField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const setRow = (index: number, change: Partial<StopRow>) =>
    setRows((current) => current.map((row, position) => (position === index ? { ...row, ...change } : row)));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFailure(null);
    const clientErrors = validate(form, rows, takenIds, isEdit);
    setErrors(clientErrors);
    const firstInvalid = Object.keys(clientErrors)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const input: RouteInput = {
      id: form.id.trim().toUpperCase(),
      name: form.name.trim(),
      color: form.color.trim(),
      status: form.status as RouteStatus,
      stops: rows.map((row) => ({ stopId: row.stopId, minutesFromStart: Number(row.minutes) })),
    };

    setIsSaving(true);
    try {
      const saved = isEdit ? await updateRoute(input) : await createRoute(input);
      onSaved(saved, !isEdit);
    } catch (error) {
      if (error instanceof ApiError && error.details.length > 0) {
        setErrors(Object.fromEntries(error.details.map((detail) => [toFieldId(detail.field), detail.message])));
      } else {
        setFailure(error instanceof ApiError && error.status < 500 ? error.message : 'No fue posible guardar la ruta. Intenta nuevamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      title={isEdit ? `Editar ruta ${route.id}` : 'Crear ruta'}
      data-testid="admin-route-form"
      data-mode={isEdit ? 'edit' : 'create'}
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        noValidate
        aria-label={isEdit ? `Editar ruta ${route.id}` : 'Crear ruta'}
        // Literal ids from the specification: the create button is `admin-route-create`, the edit form `admin-route-edit`.
        data-testid={isEdit ? 'admin-route-edit' : 'admin-route-new'}
        data-route-id={route?.id ?? ''}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            id="route-id"
            testId="input-route-id"
            label="Código"
            required
            disabled={isEdit}
            hint={isEdit ? 'El código no se puede modificar.' : 'Formato R seguido de 2 o 3 dígitos, por ejemplo R40.'}
            value={form.id}
            onChange={(event) => setField('id', event.target.value)}
            error={errors['route-id']}
          />
          <TextField
            id="route-name"
            testId="input-route-name"
            label="Nombre"
            required
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            error={errors['route-name']}
          />
          <TextField
            id="route-color"
            testId="input-route-color"
            label="Color (hexadecimal)"
            required
            value={form.color}
            onChange={(event) => setField('color', event.target.value)}
            error={errors['route-color']}
            trailing={
              <span
                className="mr-1 h-7 w-7 rounded-md border border-slate-300"
                style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : 'transparent' }}
                aria-hidden="true"
              />
            }
          />
          <SelectField
            id="route-status"
            testId="input-route-status"
            label="Estado"
            placeholder="Selecciona un estado"
            required
            options={statusOptions}
            value={form.status}
            onChange={(event) => setField('status', event.target.value)}
            error={errors['route-status']}
          />
        </div>

        <fieldset className="space-y-3" data-testid="route-stops-editor" data-count={rows.length}>
          <legend className="text-sm font-semibold text-slate-900">
            Paraderos en orden de recorrido (mínimo {MIN_STOPS}, máximo {MAX_STOPS})
          </legend>
          {errors['route-stops'] && (
            <p className="text-sm font-medium text-red-700" data-testid="error-route-stops">
              {errors['route-stops']}
            </p>
          )}
          <ol className="space-y-3">
            {rows.map((row, index) => {
              const n = index + 1;
              return (
                <li key={n} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[2fr_1fr_auto] sm:items-start" data-testid={`route-stop-row-${n}`}>
                  <SelectField
                    id={`route-stop-${n}`}
                    testId={`input-route-stop-${n}`}
                    label={`Paradero ${n}`}
                    placeholder="Selecciona un paradero"
                    required
                    options={stopOptions}
                    value={row.stopId}
                    onChange={(event) => setRow(index, { stopId: event.target.value })}
                    error={errors[`route-stop-${n}`]}
                  />
                  <TextField
                    id={`route-minutes-${n}`}
                    testId={`input-route-minutes-${n}`}
                    label="Minuto"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    required
                    value={row.minutes}
                    onChange={(event) => setRow(index, { minutes: event.target.value })}
                    error={errors[`route-minutes-${n}`]}
                  />
                  <Button
                    variant="ghost"
                    className="sm:mt-7"
                    onClick={() => {
                      // Errors are indexed by position; they would point to the wrong row after a removal.
                      setErrors({});
                      setRows((current) => current.filter((_, position) => position !== index));
                    }}
                    disabled={rows.length <= MIN_STOPS}
                    aria-label={`Quitar paradero ${n}`}
                    data-testid={`btn-remove-route-stop-${n}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ol>
          <Button
            variant="secondary"
            onClick={() => setRows((current) => [...current, { stopId: '', minutes: '' }])}
            disabled={rows.length >= MAX_STOPS}
            data-testid="btn-add-route-stop"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar paradero
          </Button>
        </fieldset>

        {failure && <Notice tone="error" title={failure} testId="admin-route-error" />}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={isSaving} loadingText="Guardando…" data-testid="btn-save-route">
            {isEdit ? 'Guardar cambios' : 'Crear ruta'}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isSaving} data-testid="btn-cancel-route">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
