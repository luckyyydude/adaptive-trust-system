import React from 'react';

const riskColors = {
  LOW: '#2ed573', MEDIUM: '#ffa502', HIGH: '#ff4757', CRITICAL: '#ff4757'
};
const actionLabels = {
  ALLOW: { label: 'Full Access', color: '#2ed573' },
  REQUIRE_OTP: { label: 'OTP Required', color: '#ffa502' },
  RESTRICT: { label: 'Restricted', color: '#ff6b35' },
  TERMINATE: { label: 'Terminated', color: '#ff4757' },
};

export default function TrustScoreCard({ result }) {
  if (!result) return null;
  const color = riskColors[result.risk_level] || '#8892a4';
  const action = actionLabels[result.action_taken] || { label: result.action_taken, color: '#8892a4' };
  const score = result.overall_score ?? 0;

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Trust Score</div>
          <div style={{ fontSize: 42, fontWeight: 700, fontFamily: 'Space Mono', color }}>
            {score.toFixed(0)}
            <span style={{ fontSize: 18, color: '#4a5568' }}>/100</span>
          </div>
        </div>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="54" fill="none" stroke="#1f2530" strokeWidth="10"/>
          <circle cx="65" cy="65" r="54" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}/>
          <text x="65" y="70" textAnchor="middle" fill={color} fontSize="14" fontFamily="Space Mono" fontWeight="700">
            {result.risk_level}
          </text>
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Behavioral', val: result.behavioral_score },
          { label: 'Contextual', val: result.contextual_score },
          { label: 'Historical', val: result.historical_score },
          { label: 'Session', val: result.session_stability_score },
        ].map(d => (
          <div key={d.label} style={{ background: '#0d0f14', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 4 }}>{d.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: '#1f2530', borderRadius: 2 }}>
                <div style={{ width: `${d.val}%`, height: '100%', background: d.val > 70 ? '#2ed573' : d.val > 40 ? '#ffa502' : '#ff4757', borderRadius: 2, transition: 'width 0.6s ease' }}/>
              </div>
              <span style={{ fontSize: 12, fontFamily: 'Space Mono', color: '#e8eaf0', minWidth: 28 }}>{d.val?.toFixed(0)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#0d0f14', borderRadius: 8, border: `1px solid ${action.color}22` }}>
        <span style={{ fontSize: 13, color: '#8892a4' }}>System response</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: action.color, fontFamily: 'Space Mono' }}>{action.label}</span>
      </div>

      {result.explanation && (
        <div>
          {result.explanation.positives?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {result.explanation.positives.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#2ed573', marginBottom: 4 }}>
                  <span>+</span>{p}
                </div>
              ))}
            </div>
          )}
          {result.explanation.negatives?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {result.explanation.negatives.map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ff4757', marginBottom: 4 }}>
                  <span>−</span>{n}
                </div>
              ))}
            </div>
          )}
          {result.explanation.suggestion && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(0,153,255,0.08)', borderLeft: '3px solid #0099ff', borderRadius: '0 8px 8px 0', fontSize: 13, color: '#8892a4' }}>
              {result.explanation.suggestion}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
