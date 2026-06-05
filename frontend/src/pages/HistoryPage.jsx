import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTrustHistory } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const riskColor = { LOW: '#2ed573', MEDIUM: '#ffa502', HIGH: '#ff6b35', CRITICAL: '#ff4757' };

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user?.user_id) getTrustHistory(user.user_id).then(r => setHistory(r.data)).catch(() => {});
  }, [user]);

  const avg = history.length ? (history.reduce((s, h) => s + h.overall_score, 0) / history.length).toFixed(1) : '—';
  const minScore = history.length ? Math.min(...history.map(h => h.overall_score)).toFixed(1) : '—';
  const maxScore = history.length ? Math.max(...history.map(h => h.overall_score)).toFixed(1) : '—';
  const critical = history.filter(h => h.risk_level === 'CRITICAL').length;

  const barData = {
    labels: [...history].reverse().map((_, i) => `${i + 1}`),
    datasets: [{
      data: [...history].reverse().map(h => h.overall_score),
      backgroundColor: [...history].reverse().map(h => riskColor[h.risk_level] + '99'),
      borderColor: [...history].reverse().map(h => riskColor[h.risk_level]),
      borderWidth: 1, borderRadius: 4,
    }]
  };
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111318', borderColor: '#1f2530', borderWidth: 1, titleColor: '#e8eaf0', bodyColor: '#8892a4' } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#4a5568', font: { size: 10 } } },
      y: { min: 0, max: 100, grid: { color: '#1a1f28' }, ticks: { color: '#4a5568' } }
    }
  };

  return (
    <div style={{ padding: '32px 36px' }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Trust History</div>
        <div style={{ fontSize: 14, color: '#4a5568' }}>Full audit log of all trust evaluations</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Avg Trust Score', val: avg },
          { label: 'Highest Score', val: maxScore, color: '#2ed573' },
          { label: 'Lowest Score', val: minScore, color: minScore < 40 ? '#ff4757' : '#ffa502' },
          { label: 'Critical Events', val: critical, color: critical > 0 ? '#ff4757' : '#2ed573' },
        ].map(s => (
          <div key={s.label} style={{ background: '#111318', border: '1px solid #1f2530', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Mono', color: s.color || '#e8eaf0' }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Score Distribution</div>
        {history.length > 0 ? <Bar data={barData} options={barOptions} height={80} /> : (
          <div style={{ color: '#4a5568', fontSize: 13, padding: '20px 0' }}>No data yet.</div>
        )}
      </div>

      <div className="card">
        <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Evaluation Log</div>
        {history.length === 0 ? (
          <div style={{ fontSize: 13, color: '#4a5568' }}>No evaluations yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2530' }}>
                {['Score', 'Risk', 'Action', 'Behavioral', 'Contextual', 'Historical', 'Stability', 'Timestamp'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#4a5568', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1f28' }}>
                  <td style={{ padding: '10px', fontFamily: 'Space Mono', color: riskColor[h.risk_level] }}>{h.overall_score.toFixed(1)}</td>
                  <td style={{ padding: '10px' }}><span className={`tag tag-${h.risk_level.toLowerCase()}`}>{h.risk_level}</span></td>
                  <td style={{ padding: '10px', color: '#8892a4', fontSize: 12 }}>{h.action_taken}</td>
                  <td style={{ padding: '10px', color: '#8892a4' }}>{h.behavioral_score.toFixed(1)}</td>
                  <td style={{ padding: '10px', color: '#8892a4' }}>{h.contextual_score.toFixed(1)}</td>
                  <td style={{ padding: '10px', color: '#8892a4' }}>{h.historical_score.toFixed(1)}</td>
                  <td style={{ padding: '10px', color: '#8892a4' }}>{h.session_stability_score.toFixed(1)}</td>
                  <td style={{ padding: '10px', color: '#4a5568', fontSize: 11 }}>{new Date(h.computed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
