import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserSessions, terminateSession } from '../utils/api';

export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);

  const load = () => getUserSessions(user.user_id).then(r => setSessions(r.data)).catch(() => {});

  useEffect(() => { if (user?.user_id) load(); }, [user]);

  const terminate = async (id) => {
    await terminateSession(id);
    load();
  };

  return (
    <div style={{ padding: '32px 36px' }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Sessions</div>
        <div style={{ fontSize: 14, color: '#4a5568' }}>All sessions for your account</div>
      </div>

      <div className="card">
        {sessions.length === 0 ? (
          <div style={{ fontSize: 13, color: '#4a5568', padding: '20px 0' }}>No sessions yet. Run a simulation first.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2530' }}>
                {['ID', 'Token', 'IP Address', 'Status', 'Created', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#4a5568', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #1a1f28' }}>
                  <td style={{ padding: '12px', fontFamily: 'Space Mono', color: '#8892a4' }}>#{s.id}</td>
                  <td style={{ padding: '12px', fontFamily: 'Space Mono', fontSize: 11, color: '#4a5568' }}>{s.session_token?.slice(0, 16)}...</td>
                  <td style={{ padding: '12px', color: '#8892a4' }}>{s.ip_address}</td>
                  <td style={{ padding: '12px' }}>
                    {s.is_terminated ? (
                      <span className="tag tag-high">Terminated</span>
                    ) : s.is_active ? (
                      <span className="tag tag-low">Active</span>
                    ) : (
                      <span className="tag tag-medium">Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>{new Date(s.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    {!s.is_terminated && (
                      <button className="btn btn-ghost" onClick={() => terminate(s.id)} style={{ padding: '6px 12px', fontSize: 12, color: '#ff4757', borderColor: '#ff475733' }}>
                        Terminate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
