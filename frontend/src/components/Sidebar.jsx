import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/simulate', icon: '⚡', label: 'Simulate' },
  { to: '/sessions', icon: '⊡', label: 'Sessions' },
  { to: '/history', icon: '◷', label: 'History' },
  { to: '/admin', icon: '⊕', label: 'Admin' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#0d0f14',
      borderRight: '1px solid #1a1f28', display: 'flex',
      flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, left: 0, zIndex: 100
    }}>
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #1a1f28' }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#00d4aa', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>TrustSys</div>
        <div style={{ fontSize: 10, color: '#4a5568', marginTop: 3, fontFamily: 'Space Mono, monospace' }}>v1.0.0 · adaptive</div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 8, marginBottom: 4, fontSize: 14, fontWeight: 500,
            color: isActive ? '#00d4aa' : '#8892a4',
            background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
            transition: 'all 0.15s',
          })}>
            <span style={{ fontSize: 16 }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1f28' }}>
        <div style={{ fontSize: 13, color: '#8892a4', marginBottom: 2 }}>Logged in as</div>
        <div style={{ fontSize: 14, color: '#e8eaf0', fontWeight: 500, marginBottom: 12 }}>{user?.username}</div>
        <button onClick={handleLogout} style={{
          width: '100%', background: 'transparent', border: '1px solid #1f2530',
          color: '#8892a4', borderRadius: 8, padding: '8px', fontSize: 13,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s'
        }}
          onMouseOver={e => { e.target.style.borderColor = '#ff4757'; e.target.style.color = '#ff4757'; }}
          onMouseOut={e => { e.target.style.borderColor = '#1f2530'; e.target.style.color = '#8892a4'; }}
        >Sign out</button>
      </div>
    </aside>
  );
}
