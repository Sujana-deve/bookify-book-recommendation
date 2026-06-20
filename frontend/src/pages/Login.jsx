import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #fdf6ee 0%, #f5e0cc 50%, #ede0cc 100%)',
      padding: '2rem',
    }}>
      <div style={{
        background: 'white', borderRadius: 20, boxShadow: '0 8px 48px rgba(44,26,14,0.12)',
        padding: '2.5rem', width: '100%', maxWidth: 400,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.6rem' }}>📖</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--terra)', marginTop: '0.5rem' }}>Welcome Back</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink-muted)', marginTop: '0.3rem' }}>Sign in to continue to Bookify</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(196,96,58,0.1)', border: '1px solid var(--terra-pale)',
            borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1.2rem',
            fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--rust)',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              required style={inputStyle} placeholder="yourusername"
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required style={inputStyle} placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} style={{
            background: 'var(--terra)', color: 'white', border: 'none', borderRadius: 100,
            padding: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem',
          }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--terra)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600,
  color: 'var(--ink-mid)', marginBottom: '0.4rem', letterSpacing: '0.04em',
};

const inputStyle = {
  width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
  border: '1.5px solid var(--cream-dark)', fontFamily: 'var(--font-body)',
  fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  color: 'var(--ink)', background: 'var(--cream)',
};