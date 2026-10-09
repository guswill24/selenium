import { Eye, EyeOff } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { AboutButton } from '../components/layout/AboutDialog.tsx';
import { ScenarioBadge } from '../components/layout/ScenarioBadge.tsx';
import { ErrorDetails } from '../components/feedback/ErrorDetails.tsx';
import { Notice } from '../components/feedback/Notice.tsx';
import { TextField } from '../components/form/TextField.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { ApiError } from '../services/apiClient.ts';

interface FieldErrors {
  username?: string | undefined;
  password?: string | undefined;
}

interface LoginFailure {
  status: number;
  code: string;
  message: string;
  requestId?: string | undefined;
}

const REQUIRED_MESSAGES = {
  username: 'El usuario es obligatorio.',
  password: 'La contraseña es obligatoria.',
} as const;

const DEMO_ACCOUNTS = [
  { role: 'Pasajero', username: 'pasajero.demo', password: 'Pasajero2026!' },
  { role: 'Administrador', username: 'admin.demo', password: 'Admin2026!' },
  { role: 'Cuenta bloqueada', username: 'bloqueado.demo', password: 'Bloqueado2026!' },
];

function validate(username: string, password: string): FieldErrors {
  return {
    username: username.trim() ? undefined : REQUIRED_MESSAGES.username,
    password: password ? undefined : REQUIRED_MESSAGES.password,
  };
}

function toFailure(error: unknown): LoginFailure {
  if (!(error instanceof ApiError)) {
    return { status: 0, code: 'UNKNOWN_ERROR', message: 'Ocurrió un error inesperado. Intenta nuevamente.' };
  }
  const technical = { status: error.status, code: error.code, requestId: error.requestId };
  if (error.status === 0) {
    return { ...technical, message: 'No fue posible conectar con el servidor. Verifica tu conexión e intenta nuevamente.' };
  }
  if (error.status === 503) {
    return { ...technical, message: 'El servicio no está disponible temporalmente. Intenta nuevamente en unos minutos.' };
  }
  if (error.status >= 500) {
    // Never show internal details to the user; status and code stay available in the technical details.
    return { ...technical, message: 'Ocurrió un problema en el servidor. Intenta nuevamente más tarde.' };
  }
  return { ...technical, message: error.message };
}

export function LoginPage() {
  const { login, notice, clearNotice } = useAuth();
  useDocumentTitle('Iniciar sesión');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<LoginFailure | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearNotice();
    setFailure(null);

    const errors = validate(username, password);
    setFieldErrors(errors);
    if (errors.username || errors.password) {
      (errors.username ? usernameRef : passwordRef).current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      // On success the auth guard redirects to the dashboard (or the page originally requested).
      await login(username, password);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        const byField = Object.fromEntries(error.details.map((detail) => [detail.field, detail.message]));
        setFieldErrors({ username: byField.username, password: byField.password });
      } else {
        setFailure(toFailure(error));
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card data-testid="page-login">
        <h1 className="text-xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-600">Ingresa con una cuenta de demostración.</p>

        <div className="mt-5 space-y-4" aria-live="polite">
          {notice === 'session-expired' && (
            <Notice tone="warning" title="Tu sesión expiró" testId="session-expired">
              Inicia sesión nuevamente para continuar.
            </Notice>
          )}
          {notice === 'logged-out' && (
            <Notice tone="success" title="Sesión cerrada correctamente" testId="logout-success" />
          )}
        </div>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate data-testid="login-form" aria-label="Iniciar sesión">
          <TextField
            ref={usernameRef}
            id="username"
            testId="input-username"
            label="Usuario"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={fieldErrors.username}
          />
          <TextField
            ref={passwordRef}
            id="password"
            testId="input-password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            trailing={
              <button
                type="button"
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                data-testid="btn-toggle-password"
              >
                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            }
          />

          {failure && (
            <div className="space-y-2" data-testid="login-error" data-error-status={failure.status} data-error-code={failure.code}>
              <Notice tone="error" title="No fue posible iniciar sesión" testId="login-error-message">
                <span data-testid="login-error-text">{failure.message}</span>
              </Notice>
              <ErrorDetails status={failure.status} code={failure.code} requestId={failure.requestId} testId="login-error-details" />
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting} loadingText="Ingresando…" data-testid="btn-login">
            Ingresar
          </Button>
        </form>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm text-slate-200" data-testid="login-scenario">
        <ScenarioBadge testId="login-scenario-badge" />
        <Link to="/lab" className="inline-flex min-h-6 items-center font-semibold text-white underline underline-offset-2" data-testid="link-login-lab">
          Laboratorio de escenarios
        </Link>
        <a
          href="/presentacion/"
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-6 items-center font-semibold text-white underline underline-offset-2"
          data-testid="link-login-presentation"
        >
          Presentación<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
        <AboutButton
          testId="link-login-about"
          className="inline-flex min-h-6 items-center font-semibold text-white underline underline-offset-2"
        />
      </div>

      <section
        className="rounded-2xl border border-slate-700 bg-slate-800 p-5 text-sm text-slate-200"
        aria-labelledby="demo-credentials-title"
        data-testid="demo-credentials"
      >
        <h2 id="demo-credentials-title" className="font-semibold text-white">
          Cuentas de demostración (datos ficticios)
        </h2>
        <ul className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.username} className="flex flex-wrap gap-x-2">
              <span className="font-medium text-white">{account.role}:</span>
              <code>{account.username}</code>
              <span aria-hidden="true">/</span>
              <code>{account.password}</code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
