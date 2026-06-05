import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTrustHistory, getUserSessions, getUser } from '../utils/api';
import TrustRadar from '../components/TrustRadar';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const latest = history[0];

  useEffect(() => {
    if (!user?.user_id) return;
    getTrustHistory(user.user_id).then(r => setHistory(r.data)).catch(() => {});
    getUserSessions(user.user_id).then(r => setSessions(r.data)).catch(() => {});
    getUser(user.user_id).then(r => setUserInfo(r.data)).catch(() => {});
  }, [user]);

  const lineData = {
    labels: [...history].reverse().map((_, i) => `#${i + 1}`),
    datasets: [{
      data: [...history].reverse().map(h => h.overall_score),
      borderColor: '#00d4aa',
      backgroundColor: 'rgba(0,212,170,0.06)',
      fill: true, tension: 0.4,
      pointRadius: 3, pointBackgroundColor: '#00d4aa',
    }]
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111318', borderColor: '#1f2530', borderWidth: 1, titleColor: '#e8eaf0', bodyColor: '#8892a4' } },
    scales: {
      x: { grid: { color: '#1a1f28' }, ticks: { color: '#4a5568', font: { size: 11 } } },
      y: { min: 0, max: 100, grid: { color: '#1a1f28' }, ticks: { color: '#4a5568', font: { size: 11 } } }
    }
  };

  const riskColor = { LOW: '#2ed573', MEDIUM: '#ffa502', HIGH: '#ff4757', CRITICAL: '#ff4757' };

  return (
    <div style={{ padding: '32px 36px' }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Welcome back, {user?.username}</div>
        <div style={{ fontSize: 14, color: '#4a5568' }}>Real-time trust overview for your account</div>
      </div>

      {userInfo?.is_locked && (
        <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠</span>
          <div>
            <div style={{ fontWeight: 600, color: '#ff4757', fontSize: 14 }}>Account Locked</div>
            <div style={{ fontSize: 13, color: '#8892a4' }}>Your account was locked due to critical trust score. Contact admin or use the Admin panel to unlock.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Latest Score', val: latest ? `${latest.overall_score.toFixed(0)}/100` : '—', color: latest ? riskColor[latest.risk_level] : '#4a5568' },
          { label: 'Risk Level', val: latest?.risk_level || '—', color: latest ? riskColor[latest.risk_level] : '#4a5568' },
          { label: 'Total Sessions', val: sessions.length },
          { label: 'Evaluations', val: history.length },
        ].map(s => (
          <div key={s.label} style={{ background: '#111318', border: '1px solid #1f2530', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Mono', color: s.color || '#e8eaf0' }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 500, color: '#8892a4', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trust Dimensions</div>
          <TrustRadar scores={latest} />
        </div>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 500, color: '#8892a4', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score Over Time</div>
          {history.length > 0 ? <Line data={lineData} options={lineOptions} /> : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#4a5568', fontSize: 13 }}>No evaluations yet. Try the Simulate tab.</div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 500, color: '#8892a4', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent Evaluations</div>
        {history.length === 0 ? (
          <div style={{ fontSize: 13, color: '#4a5568', padding: '20px 0' }}>No trust evaluations yet. Go to Simulate to run one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2530' }}>
                {['Score', 'Risk', 'Action', 'Behavioral', 'Contextual', 'Time'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#4a5568', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1f28' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'Space Mono', color: riskColor[h.risk_level] }}>{h.overall_score.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px' }}><span className={`tag tag-${h.risk_level.toLowerCase()}`}>{h.risk_level}</span></td>
                  <td style={{ padding: '10px 12px', color: '#8892a4' }}>{h.action_taken}</td>
                  <td style={{ padding: '10px 12px', color: '#8892a4' }}>{h.behavioral_score.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', color: '#8892a4' }}>{h.contextual_score.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', color: '#4a5568' }}>{new Date(h.computed_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
