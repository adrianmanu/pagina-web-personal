import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Mail, User } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { PasswordField } from '../components/ui/PasswordField';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) errors.fullName = 'Ingresa tu nombre completo';
    if (!email.includes('@')) errors.email = 'Email inválido';
    if (password.length < 8) errors.password = 'Mínimo 8 caracteres';
    if (password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
    if (!acceptTerms) errors.terms = 'Debes aceptar los términos';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email, password, fullName.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Comienza a organizar tus tareas en minutos"
      footer={
        <p>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-link">
            Iniciar sesión <ArrowRight size={14} />
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <FormField
          label="Nombre completo"
          name="fullName"
          placeholder="Adrian Ramos"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={<User size={18} />}
          error={fieldErrors.fullName}
          autoComplete="name"
          required
        />

        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="tu@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />

        <PasswordField
          label="Contraseña"
          name="password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          minLength={8}
          showStrength
        />

        <PasswordField
          label="Confirmar contraseña"
          name="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={fieldErrors.confirmPassword}
        />

        <label className="auth-checkbox auth-checkbox--terms">
          <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
          <span>Acepto los términos de uso y la política de privacidad de la plataforma</span>
        </label>
        {fieldErrors.terms && <span className="form-field__error">{fieldErrors.terms}</span>}

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? (
            <><Loader2 size={18} className="spin" /> Creando cuenta...</>
          ) : (
            <>Crear cuenta <ArrowRight size={18} /></>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
