import React, { useState } from 'react';
import { unlockUser, getUser } from '../utils/api';

export default function AdminPage() {
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState('');

  const lookup = async () => {
    try {
      const r = await getUser(userId);
      setUserInfo(r.data);
      setMessage('');
    } catch {
      setMessage('User not found');
      setUserInfo(null);
    }
  };

  const unlock = async () => {
    try {
      await unlockUser(userId);
      setMessage('User unlocked successfully');
      lookup();
    } catch {
      setMessage('Failed to unlock user');
    }
  };

  return (
    <div style={{ padding: '32px 36px' }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Admin Panel</div>
        <div style={{ fontSize: 14, color: '#4a5568' }}>Manage users and sessions</div>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>User Lookup</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={lookup}>Lookup</button>
          </div>
          {message && <div style={{ marginTop: 12, fontSize: 13, color: message.includes('success') ? '#2ed573' : '#ff4757' }}>{message}</div>}
        </div>

        {userInfo && (
          <div className="card">
            <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>User Details</div>
            {[
              { label: 'ID', val: userInfo.id },
              { label: 'Username', val: userInfo.username },
              { label: 'Email', val: userInfo.email },
              { label: 'Status', val: userInfo.is_locked ? 'LOCKED' : 'Active' },
              { label: 'Created', val: new Date(userInfo.created_at).toLocaleString() },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1f28', fontSize: 13 }}>
                <span style={{ color: '#4a5568' }}>{row.label}</span>
                <span style={{ color: row.label === 'Status' && userInfo.is_locked ? '#ff4757' : '#e8eaf0', fontFamily: row.label === 'ID' ? 'Space Mono' : 'inherit' }}>{row.val}</span>
              </div>
            ))}
            {userInfo.is_locked && (
              <button className="btn btn-primary" onClick={unlock} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                Unlock Account
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
