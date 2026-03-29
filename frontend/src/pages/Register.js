import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'analyst', department: 'IT' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '10px' }}>🛡️</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join the IT Risk Assessment System</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'john@company.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
          ].map(f => (
            <div key={f.key} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={styles.input}
                required
              />
            </div>
          ))}

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={styles.input}>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={styles.input}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating...' : '✨ Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1e40af', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '20px',
    background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f0f4ff 100%)',
  },
  card: {
    background: 'white', borderRadius: '20px', padding: '40px',
    width: '100%', maxWidth: '460px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  title: { fontSize: '24px', fontWeight: 700, textAlign: 'center', color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  subtitle: { fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: {
    padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', color: '#0f172a', outline: 'none',
  },
  btn: {
    padding: '13px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '4px',
    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
  },
  footer: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' },
};

export default Register;