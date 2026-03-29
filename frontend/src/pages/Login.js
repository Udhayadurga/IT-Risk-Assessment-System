import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card}>
        <div style={styles.iconWrap}>🛡️</div>
        <h1 style={styles.title}>RiskGuard</h1>
        <p style={styles.subtitle}>IT Risk Assessment System</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="admin@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1e40af', fontWeight: 600 }}>Create one</Link>
        </p>

        <div style={styles.demoBox}>
          <div style={styles.demoTitle}>Demo Credentials</div>
          <div style={styles.demoItem}>📧 admin@company.com  🔑 admin123</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '20px', position: 'relative',
    background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f0f4ff 100%)',
  },
  bg: {
    position: 'fixed', inset: 0, zIndex: 0,
    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)`,
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'white', borderRadius: '20px',
    padding: '44px 40px', width: '100%', maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    animation: 'fadeIn 0.4s ease',
  },
  iconWrap: { fontSize: '48px', textAlign: 'center', marginBottom: '12px' },
  title: {
    fontSize: '26px', fontWeight: 700, color: '#0f172a',
    textAlign: 'center', fontFamily: 'Sora, sans-serif',
  },
  subtitle: { fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '32px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: {
    padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', color: '#0f172a',
    outline: 'none', transition: 'border-color 0.15s',
  },
  btn: {
    padding: '13px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    marginTop: '4px', transition: 'all 0.15s',
    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
  },
  footer: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' },
  demoBox: {
    marginTop: '20px', padding: '12px 16px',
    background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0',
  },
  demoTitle: { fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  demoItem: { fontSize: '12px', color: '#475569', fontFamily: 'monospace' },
};

export default Login;