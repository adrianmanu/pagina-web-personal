import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export function AdminLoginPage() {
  const { admin, login, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@tianova.demo');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(email, password);
    if (!ok) {
      setError('Credenciales incorrectas.');
      return;
    }
    navigate('/admin/productos');
  };

  if (admin) {
    return (
      <div className="page account">
        <h1>Hola, {admin.name}</h1>
        <p className="muted">{admin.email} · Administrador</p>
        <Link to="/admin/productos" className="btn btn--primary">Ir al panel administrador</Link>
        <button type="button" className="btn btn--ghost" onClick={logout}>Cerrar sesión</button>
      </div>
    );
  }

  return (
    <div className="page account-auth">
      <h1>Panel administrador</h1>
      <p className="muted">Acceso exclusivo para el dueño de la tienda.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Correo</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn--primary btn--block">
          <LogIn size={16} /> Entrar al panel
        </button>
      </form>

      <div className="demo-creds">
        <p>Acceso demo:</p>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => setPassword('admin123')}
        >
          Admin · admin@tianova.demo / admin123
        </button>
      </div>
    </div>
  );
}
