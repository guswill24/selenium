import { useState, type FormEvent } from 'react';
import { Notice } from '../components/feedback/Notice.tsx';
import { TextField } from '../components/form/TextField.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { ApiError } from '../services/apiClient.ts';
import { roleLabels, type ProfileUpdate, type User } from '../types/auth.ts';

type FieldErrors = Partial<Record<keyof ProfileUpdate, string>>;
type SaveResult = { tone: 'success'; message: string } | { tone: 'error'; message: string } | null;

function toForm(user: User): ProfileUpdate {
  return { fullName: user.fullName, email: user.email, phone: user.phone };
}

function validate(form: ProfileUpdate): FieldErrors {
  const errors: FieldErrors = {};
  if (form.fullName.trim().length < 3) errors.fullName = 'El nombre debe tener al menos 3 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'El correo no tiene un formato válido.';
  if (!/^[0-9 +()-]{7,20}$/.test(form.phone.trim())) errors.phone = 'El teléfono debe tener entre 7 y 20 dígitos.';
  return errors;
}

export function ProfilePage() {
  const { user, updateProfile, resetProfile } = useAuth();
  // The auth guard guarantees a user on this page.
  const currentUser = user as User;
  const [form, setForm] = useState<ProfileUpdate>(() => toForm(currentUser));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<SaveResult>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setField = (field: keyof ProfileUpdate) => (value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSaving(true);
    try {
      await updateProfile({ fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() });
      setResult({ tone: 'success', message: 'Los cambios se guardaron en este navegador.' });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        setErrors(Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])));
      } else {
        setResult({ tone: 'error', message: 'No fue posible guardar los cambios. Intenta nuevamente.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetProfile();
    setErrors({});
    setResult({ tone: 'success', message: 'Se restauraron los datos originales de la cuenta.' });
  };

  // Keep the form aligned with the restored user after a reset.
  const [syncedUser, setSyncedUser] = useState(currentUser);
  if (syncedUser !== currentUser) {
    setSyncedUser(currentUser);
    setForm(toForm(currentUser));
  }

  return (
    <div className="space-y-6" data-testid="page-profile">
      <PageHeader title="Perfil" description="Consulta y actualiza tu información básica." />

      <Card title="Cuenta" data-testid="profile-account">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-600">Usuario</dt>
            <dd className="font-medium text-slate-900" data-testid="profile-username">
              {currentUser.username}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600">Rol</dt>
            <dd data-testid="profile-role" data-role={currentUser.role}>
              <Badge tone="info">{roleLabels[currentUser.role]}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-slate-600">Identificador</dt>
            <dd className="font-medium text-slate-900" data-testid="profile-id">
              {currentUser.id}
            </dd>
          </div>
        </dl>
      </Card>

      <Card title="Información básica">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate data-testid="profile-form" aria-label="Información básica">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              id="profile-fullname"
              testId="input-fullname"
              label="Nombre completo"
              autoComplete="name"
              required
              value={form.fullName}
              onChange={(event) => setField('fullName')(event.target.value)}
              error={errors.fullName}
            />
            <TextField
              id="profile-email"
              testId="input-email"
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) => setField('email')(event.target.value)}
              error={errors.email}
            />
            <TextField
              id="profile-phone"
              testId="input-phone"
              label="Teléfono"
              type="tel"
              autoComplete="tel"
              required
              hint="Entre 7 y 20 caracteres: dígitos, espacios, +, ( ) o -."
              value={form.phone}
              onChange={(event) => setField('phone')(event.target.value)}
              error={errors.phone}
            />
          </div>

          {result && (
            <Notice tone={result.tone} title={result.message} testId={result.tone === 'success' ? 'profile-success' : 'profile-error'} />
          )}

          <p className="text-xs text-slate-600">
            Los cambios se guardan solo en este navegador (localStorage). Los datos originales de la cuenta no se modifican.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={isSaving} loadingText="Guardando…" data-testid="btn-save-profile">
              Guardar cambios
            </Button>
            <Button variant="secondary" onClick={handleReset} disabled={isSaving} data-testid="btn-reset-profile">
              Restaurar datos originales
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
