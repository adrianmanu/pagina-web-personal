import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Mail, Sparkles } from 'lucide-react';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../api';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { PasswordField } from '../components/ui/PasswordField';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('remembered_email_inventory');
    if (saved) setEmail(saved);
  }, []);

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      navigate('/dashboard');
    } catch {
      setError('No se pudo iniciar la sesión demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (remember) localStorage.setItem('remembered_email_inventory', email);
      navigate('/dashboard');
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Ingresa a tu panel de inventario empresarial"
      footer={
        <p>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="auth-link">
            Crear cuenta gratis <ArrowRight size={14} />
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="tu@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          autoComplete="email"
          required
        />

        <PasswordField
          label="Contraseña"
          name="password"
          value={password}
          onChange={setPassword}
          hint="Mínimo 6 caracteres"
        />

        <div className="auth-form__row">
          <label className="auth-checkbox">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Recordarme</span>
          </label>
        </div>

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? (
            <><Loader2 size={18} className="spin" /> Ingresando...</>
          ) : (
            <>Iniciar sesión <ArrowRight size={18} /></>
          )}
        </button>

        <div className="auth-divider"><span>o</span></div>

        <button
          type="button"
          className="btn btn--demo btn--full"
          onClick={handleDemo}
          disabled={loading}
        >
          <Sparkles size={18} /> Explorar con cuenta demo
        </button>
      </form>
    </AuthLayout>
  );
}
