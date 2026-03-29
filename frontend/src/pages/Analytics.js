import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRisks, getRiskStats, RISK_LEVEL_COLORS } from '../utils/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [risks, setRisks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, rRes] = await Promise.all([
          getRiskStats(),
          getRisks({ sortBy: '-createdAt' }),
        ]);
        setStats(sRes.data.stats);
        setRisks(rRes.data.risks);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={S.loader}>
      <div style={{ fontSize: '36px' }}>📊</div>
      <p style={{ color: '#94a3b8' }}>Loading analytics...</p>
    </div>
  );

  const total      = stats?.totalRisks || 0;
  const byLevel    = stats?.byLevel    || {};
  const byStatus   = stats?.byStatus   || {};
  const byCategory = stats?.byCategory || {};
  const avgScore   = stats?.avgScore   || 0;

  // Resolution rate
  const resolved   = (byStatus['Mitigated'] || 0) + (byStatus['Closed'] || 0);
  const resRate    = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Open rate
  const openCount  = byStatus['Open'] || 0;
  const openRate   = total > 0 ? Math.round((openCount / total) * 100) : 0;

  // Category sorted
  const catSorted  = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  // Top 5 recent critical/high
  const urgent = risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').slice(0, 5);

  // Status breakdown
  const statusList = [
    { key: 'Open',        color: '#dc2626', bg: '#fef2f2' },
    { key: 'In Progress', color: '#2563eb', bg: '#eff6ff' },
    { key: 'Mitigated',   color: '#16a34a', bg: '#f0fdf4' },
    { key: 'Closed',      color: '#475569', bg: '#f8fafc' },
    { key: 'Accepted',    color: '#9333ea', bg: '#fdf4ff' },
  ];

  // Level cards
  const levelCards = [
    { key: 'Critical', emoji: '🔴', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
    { key: 'High',     emoji: '🟠', color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
    { key: 'Medium',   emoji: '🟡', color: '#ca8a04', bg: '#fefce8', border: '#fde047' },
    { key: 'Low',      emoji: '🟢', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  ];

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>📊 Risk Analytics</h1>
          <p style={S.subtitle}>Overview of your organisation's risk posture</p>
        </div>
        <button onClick={() => navigate('/risks/new')} style={S.reportBtn}>
          + Report New Risk
        </button>
      </div>

      {/* ── Row 1: KPI cards ── */}
      <div style={S.kpiRow}>
        {/* Total risks */}
        <div style={{ ...S.kpiCard, borderTop: '3px solid #1e40af' }}>
          <div style={S.kpiIcon}>⚠️</div>
          <div style={S.kpiValue}>{total}</div>
          <div style={S.kpiLabel}>Total Risks</div>
        </div>

        {/* Avg score */}
        <div style={{ ...S.kpiCard, borderTop: '3px solid #ea580c' }}>
          <div style={S.kpiIcon}>🎯</div>
          <div style={{ ...S.kpiValue, color: '#ea580c' }}>{avgScore}</div>
          <div style={S.kpiLabel}>Avg Risk Score</div>
          <div style={S.kpiSub}>out of 25</div>
        </div>

        {/* Resolution rate */}
        <div style={{ ...S.kpiCard, borderTop: '3px solid #16a34a' }}>
          <div style={S.kpiIcon}>✅</div>
          <div style={{ ...S.kpiValue, color: '#16a34a' }}>{resRate}%</div>
          <div style={S.kpiLabel}>Resolution Rate</div>
          <div style={S.kpiSub}>{resolved} of {total} resolved</div>
        </div>

        {/* Open rate */}
        <div style={{ ...S.kpiCard, borderTop: '3px solid #dc2626' }}>
          <div style={S.kpiIcon}>🔓</div>
          <div style={{ ...S.kpiValue, color: '#dc2626' }}>{openRate}%</div>
          <div style={S.kpiLabel}>Open Rate</div>
          <div style={S.kpiSub}>{openCount} risks unresolved</div>
        </div>
      </div>

      {/* ── Row 2: Risk by Level + Status ── */}
      <div style={S.row2}>

        {/* Risk by Level */}
        <div style={S.card}>
          <h2 style={S.cardTitle}>🎚️ Risks by Level</h2>
          <div style={S.levelGrid}>
            {levelCards.map(lc => {
              const count = byLevel[lc.key] || 0;
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={lc.key} style={{ ...S.levelCard, background: lc.bg, borderColor: lc.border }}>
                  <div style={{ fontSize: '24px' }}>{lc.emoji}</div>
                  <div style={{ ...S.levelCount, color: lc.color }}>{count}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: lc.color }}>{lc.key}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{pct}% of total</div>
                  {/* Mini bar */}
                  <div style={S.miniBarTrack}>
                    <div style={{ ...S.miniBarFill, width: `${pct}%`, background: lc.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk by Status */}
        <div style={S.card}>
          <h2 style={S.cardTitle}>📋 Status Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {statusList.map(sl => {
              const count = byStatus[sl.key] || 0;
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={sl.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: sl.color }}>{sl.key}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{count} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: sl.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Category breakdown ── */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>🗂️ Risks by Category</h2>
        {catSorted.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>No risks reported yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {catSorted.map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const catColors = {
                Cybersecurity: '#1e40af', 'Data Privacy': '#9333ea',
                Compliance: '#ca8a04', Operational: '#ea580c',
                Financial: '#16a34a', Strategic: '#0891b2',
                Technical: '#dc2626', Reputational: '#db2777',
              };
              const color = catColors[cat] || '#475569';
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '130px', fontSize: '13px', fontWeight: 600, color, flexShrink: 0 }}>{cat}</div>
                  <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '5px', transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ width: '50px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
                    {count} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '11px' }}>({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Row 4: Urgent risks ── */}
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ ...S.cardTitle, margin: 0 }}>🚨 Urgent Risks — Critical & High</h2>
          <button onClick={() => navigate('/risks')} style={S.viewAllBtn}>View All →</button>
        </div>

        {urgent.length === 0 ? (
          <div style={S.emptyBox}>
            <div style={{ fontSize: '28px' }}>✅</div>
            <p style={{ color: '#16a34a', fontWeight: 600, margin: '8px 0 0' }}>No Critical or High risks!</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>Your organisation is in good shape.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {urgent.map(risk => {
              const lc = RISK_LEVEL_COLORS[risk.riskLevel];
              return (
                <div
                  key={risk._id}
                  onClick={() => navigate(`/risks/${risk._id}`)}
                  style={{ ...S.urgentRow, background: lc.bg, borderColor: lc.border }}
                >
                  <div style={{ ...S.urgentBadge, background: lc.text, color: 'white' }}>
                    {risk.riskScore}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {risk.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {risk.category} · Owner: {risk.owner}
                    </div>
                  </div>
                  <div style={{ ...S.levelPill, background: lc.bg, color: lc.text, borderColor: lc.border }}>
                    {risk.riskLevel}
                  </div>
                  <div style={{ ...S.statusPill, color: risk.status === 'Open' ? '#dc2626' : '#16a34a' }}>
                    {risk.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Row 5: Quick tips ── */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>💡 Risk Management Tips</h2>
        <div style={S.tipsGrid}>
          {[
            { emoji: '🔴', title: 'Critical risks (20–25)', tip: 'Require immediate escalation. Assign an owner today and set a resolution date within 7 days.' },
            { emoji: '🟠', title: 'High risks (12–19)', tip: 'Create an action plan within 30 days. Review weekly in team meetings.' },
            { emoji: '🟡', title: 'Medium risks (6–11)', tip: 'Schedule mitigation within 90 days. Monitor monthly and update status regularly.' },
            { emoji: '🟢', title: 'Low risks (1–5)', tip: 'Accept or monitor periodically. Review quarterly to check if situation has changed.' },
          ].map(tip => (
            <div key={tip.title} style={S.tipCard}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{tip.emoji}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{tip.title}</div>
              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>{tip.tip}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const S = {
  page:    { padding: '28px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  loader:  { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title:   { fontSize: '26px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  subtitle:{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  reportBtn: { padding: '10px 20px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },

  kpiRow:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  kpiCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', textAlign: 'center' },
  kpiIcon: { fontSize: '24px', marginBottom: '8px' },
  kpiValue:{ fontSize: '36px', fontWeight: 800, color: '#0f172a', fontFamily: 'Sora, sans-serif', lineHeight: 1 },
  kpiLabel:{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' },
  kpiSub:  { fontSize: '11px', color: '#94a3b8', marginTop: '3px' },

  row2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card:    { background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' },
  cardTitle: { fontSize: '15px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif', marginBottom: '18px' },

  levelGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  levelCard:  { border: '1px solid', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  levelCount: { fontSize: '32px', fontWeight: 800, fontFamily: 'Sora, sans-serif', lineHeight: 1, margin: '4px 0' },
  miniBarTrack: { height: '4px', background: '#e2e8f0', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' },
  miniBarFill:  { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },

  emptyBox:   { textAlign: 'center', padding: '32px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #86efac' },
  urgentRow:  { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', transition: 'opacity 0.15s' },
  urgentBadge:{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 },
  levelPill:  { fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', border: '1px solid', flexShrink: 0 },
  statusPill: { fontSize: '12px', fontWeight: 600, flexShrink: 0 },
  viewAllBtn: { fontSize: '12px', fontWeight: 600, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' },

  tipsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  tipCard:  { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' },
};

export default Analytics;