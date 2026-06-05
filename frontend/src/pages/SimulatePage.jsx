import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createSession, evaluateTrust, logEvent } from '../utils/api';
import TrustScoreCard from '../components/TrustScoreCard';
import TrustRadar from '../components/TrustRadar';

const personas = [
  { label: 'Trusted User', click_frequency: 1.5, navigation_events: 8, time_on_page: 120, inactivity_seconds: 10, ip_address: '192.168.1.1', device_fingerprint: 'abc123', country: 'IN', isp: 'Airtel', login_hour: 10 },
  { label: 'Suspicious Activity', click_frequency: 15, navigation_events: 40, time_on_page: 3, inactivity_seconds: 0, ip_address: '10.0.0.55', device_fingerprint: 'xyz999', country: 'XX', isp: 'vpn-service', login_hour: 3 },
  { label: 'New Device', click_frequency: 2, navigation_events: 5, time_on_page: 90, inactivity_seconds: 20, ip_address: '172.16.0.5', device_fingerprint: 'newdevice123', country: 'IN', isp: 'Jio', login_hour: 14 },
  { label: 'Inactive Session', click_frequency: 0.5, navigation_events: 2, time_on_page: 600, inactivity_seconds: 450, ip_address: '192.168.1.1', device_fingerprint: 'abc123', country: 'IN', isp: 'Airtel', login_hour: 11 },
  { label: 'Bot-like Pattern', click_frequency: 25, navigation_events: 100, time_on_page: 1, inactivity_seconds: 0, ip_address: '45.33.32.156', device_fingerprint: 'bot007', country: 'US', isp: 'datacenter-hosting', login_hour: 2 },
];

export default function SimulatePage() {
  const { user } = useAuth();
  const [form, setForm] = useState(personas[0]);
  const [sessionId, setSessionId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wsResult, setWsResult] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const wsRef = useRef(null);
  const liveIntervalRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyPersona = (p) => setForm({ ...p });

  const setupSession = async () => {
    const res = await createSession({
      user_id: user.user_id,
      ip_address: form.ip_address || '127.0.0.1',
      user_agent: navigator.userAgent,
      device_fingerprint: form.device_fingerprint || 'default-fp',
      country: form.country || 'IN',
      isp: form.isp || 'Unknown',
    });
    return res.data.id;
  };

  const runEvaluation = async () => {
    setLoading(true);
    try {
      let sid = sessionId;
      if (!sid) {
        sid = await setupSession();
        setSessionId(sid);
      }
      await logEvent({ session_id: sid, event_type: 'page_view', event_data: { page: '/simulate' } });
      const res = await evaluateTrust({ ...form, session_id: sid, user_id: user.user_id });
      setResult(res.data);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  const startLiveMode = async () => {
    setLiveMode(true);
    let sid = sessionId;
    if (!sid) {
      sid = await setupSession();
      setSessionId(sid);
    }
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/ws/trust/${sid}`);
    wsRef.current = ws;
    ws.onopen = () => setWsConnected(true);
    ws.onmessage = (e) => setWsResult(JSON.parse(e.data));
    ws.onclose = () => { setWsConnected(false); setLiveMode(false); };
    liveIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ ...form, session_id: sid, user_id: user.user_id }));
      }
    }, 3000);
  };

  const stopLiveMode = () => {
    wsRef.current?.close();
    clearInterval(liveIntervalRef.current);
    setLiveMode(false); setWsConnected(false);
  };

  useEffect(() => () => { wsRef.current?.close(); clearInterval(liveIntervalRef.current); }, []);

  const displayResult = liveMode ? wsResult : result;

  return (
    <div style={{ padding: '32px 36px' }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Trust Simulator</div>
        <div style={{ fontSize: 14, color: '#4a5568' }}>Simulate different user behaviors and see live trust evaluation</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Quick Personas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {personas.map(p => (
                <button key={p.label} onClick={() => applyPersona(p)} style={{
                  background: form.label === p.label ? 'rgba(0,212,170,0.08)' : '#0d0f14',
                  border: '1px solid ' + (form.label === p.label ? '#00d4aa44' : '#1f2530'),
                  borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                  fontFamily: 'DM Sans', fontSize: 13, color: form.label === p.label ? '#00d4aa' : '#8892a4',
                  textAlign: 'left', transition: 'all 0.15s'
                }}>{p.label}</button>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Behavior Signals</div>
            {[
              { k: 'click_frequency', label: 'Click Frequency (clicks/sec)', type: 'number', step: 0.1 },
              { k: 'navigation_events', label: 'Navigation Events', type: 'number' },
              { k: 'time_on_page', label: 'Time on Page (sec)', type: 'number' },
              { k: 'inactivity_seconds', label: 'Inactivity (sec)', type: 'number' },
            ].map(f => (
              <div key={f.k} className="field">
                <label>{f.label}</label>
                <input type={f.type} step={f.step || 1} value={form[f.k] || 0} onChange={e => set(f.k, parseFloat(e.target.value))} />
              </div>
            ))}

            <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '14px 0 10px' }}>Context Signals</div>
            {[
              { k: 'ip_address', label: 'IP Address' },
              { k: 'device_fingerprint', label: 'Device Fingerprint' },
              { k: 'country', label: 'Country Code' },
              { k: 'isp', label: 'ISP / Network' },
            ].map(f => (
              <div key={f.k} className="field">
                <label>{f.label}</label>
                <input value={form[f.k] || ''} onChange={e => set(f.k, e.target.value)} />
              </div>
            ))}
            <div className="field">
              <label>Login Hour (0–23)</label>
              <input type="number" min={0} max={23} value={form.login_hour || 12} onChange={e => set('login_hour', parseInt(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={runEvaluation} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner" /> : 'Evaluate Trust'}
            </button>
            {!liveMode ? (
              <button className="btn btn-ghost" onClick={startLiveMode} style={{ flex: 1, justifyContent: 'center' }}>Live Mode</button>
            ) : (
              <button className="btn btn-danger" onClick={stopLiveMode} style={{ flex: 1, justifyContent: 'center' }}>Stop Live</button>
            )}
          </div>

          {liveMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: wsConnected ? '#2ed573' : '#ffa502' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: wsConnected ? '#2ed573' : '#ffa502', animation: 'pulse 1.5s infinite' }}></span>
              {wsConnected ? 'WebSocket connected — updating every 3s' : 'Connecting...'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayResult ? (
            <>
              <TrustScoreCard result={displayResult} />
              <div className="card">
                <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Dimension Radar</div>
                <div style={{ maxWidth: 360, margin: '0 auto' }}>
                  <TrustRadar scores={displayResult} />
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#4a5568' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>◈</div>
              <div style={{ fontSize: 14 }}>Configure signals and click "Evaluate Trust"</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Or enable Live Mode for real-time WebSocket updates</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
