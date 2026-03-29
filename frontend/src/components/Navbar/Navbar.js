import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard',      label: 'Dashboard',    icon: '📊' },
    { path: '/risks',          label: 'Risk Register', icon: '⚠️' },
    { path: '/risks/new',      label: 'Report Risk',   icon: '➕' },
    { path: '/analytics',      label: 'Analytics',     icon: '📈' },
    { path: '/notifications',  label: 'Notifications', icon: '🔔' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <NavLink to="/dashboard" style={styles.logo}>
          <div style={styles.logoIcon}>🛡️</div>
          <div>
            <div style={styles.logoTitle}>RiskGuard</div>
            <div style={styles.logoSub}>IT Risk Assessment</div>
          </div>
        </NavLink>

        {/* Nav Links */}
        <div style={styles.links}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {})
            })}>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* User Menu */}
        <div style={styles.userArea}>
          <div style={styles.userInfo} onClick={() => setMenuOpen(!menuOpen)}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>{user?.role}</div>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>▾</span>
          </div>
          {menuOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownInfo}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
                <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>{user?.department}</div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              <button onClick={handleLogout} style={styles.logoutBtn}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  inner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    maxWidth: '1400px', margin: '0 auto',
    padding: '0 32px', height: '64px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginRight: '16px', textDecoration: 'none',
  },
  logoIcon: { fontSize: '28px' },
  logoTitle: { fontSize: '16px', fontWeight: 700, color: '#1e40af', fontFamily: 'Sora, sans-serif' },
  logoSub: { fontSize: '10px', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' },
  links: { display: 'flex', alignItems: 'center', gap: '2px', flex: 1 },
  link: {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '7px 10px', borderRadius: '8px',
    fontSize: '13px', fontWeight: 500, color: '#475569',
    textDecoration: 'none', transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  linkActive: { background: '#eff6ff', color: '#1e40af', fontWeight: 600 },
  userArea: { position: 'relative' },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '6px 10px', borderRadius: '10px',
    cursor: 'pointer', transition: 'background 0.15s',
    border: '1px solid transparent',
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 700, fontSize: '14px',
  },
  userDetails: { lineHeight: '1.2' },
  userName: { fontSize: '13px', fontWeight: 600, color: '#0f172a' },
  userRole: { fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' },
  dropdown: {
    position: 'absolute', right: 0, top: '50px',
    background: 'white', border: '1px solid #e2e8f0',
    borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    padding: '12px', minWidth: '200px', zIndex: 999,
  },
  dropdownInfo: { padding: '4px 4px 8px' },
  logoutBtn: {
    width: '100%', textAlign: 'left', padding: '10px 12px',
    background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fca5a5', borderRadius: '8px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
  },
};

export default Navbar;