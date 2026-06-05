import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'register') {
        await registerUser(form);
        setMode('login');
        setError('');
        alert('Registered! Please log in.');
      } else {
        const res = await loginUser({ username: form.username, password: form.password });
        login(res.data);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0c10' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0,212,170,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,153,255,0.04) 0%, transparent 50%)' }} />
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Space Mono', fontSize: 22, color: '#00d4aa', fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>TRUSTSYS</div>
          <div style={{ fontSize: 14, color: '#4a5568' }}>Adaptive Trust-Based Decision System</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0d0f14', padding: 4, borderRadius: 8 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                background: mode === m ? '#1f2530' : 'transparent',
                color: mode === m ? '#e8eaf0' : '#4a5568'
              }}>{m === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Username</label>
              <input value={form.username} onChange={e => set('username', e.target.value)} required placeholder="your_username" />
            </div>
            {mode === 'register' && (
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com" />
              </div>
            )}
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="••••••••" />
            </div>
            {error && <div style={{ fontSize: 13, color: '#ff4757', marginBottom: 14, padding: '10px', background: 'rgba(255,71,87,0.08)', borderRadius: 6 }}>{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#4a5568' }}>
          Demo: register any user, then log in to access the system
        </div>
      </div>
    </div>
  );
}
