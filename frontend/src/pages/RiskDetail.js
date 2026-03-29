import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRisk, RISK_LEVEL_COLORS, STATUS_COLORS } from '../utils/api';
import toast from 'react-hot-toast';

const RiskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [risk, setRisk] = useState(null);

  useEffect(() => {
    getRisk(id).then(res => setRisk(res.data.risk)).catch(() => {
      toast.error('Risk not found');
      navigate('/risks');
    });
  }, [id, navigate]);

  if (!risk) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

  const lc = RISK_LEVEL_COLORS[risk.riskLevel];
  const sc = STATUS_COLORS[risk.status];

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.back}>← Back to Register</button>

      <div style={styles.headerCard}>
        <div style={styles.headerMain}>
          <div style={{ ...styles.levelBig, background: lc.bg, borderColor: lc.border, color: lc.text }}>
            {risk.riskLevel}
          </div>
          <div>
            <h1 style={styles.title}>{risk.title}</h1>
            <div style={styles.meta}>
              <span style={{ ...styles.badge, background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }}>{risk.category}</span>
              <span style={{ ...styles.badge, background: sc.bg, color: sc.text, borderColor: 'transparent' }}>{risk.status}</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Reported {new Date(risk.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div style={styles.scoreArea}>
          <div style={{ ...styles.bigScore, color: lc.text }}>{risk.riskScore}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Risk Score</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{risk.likelihood} × {risk.impact}</div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.mainCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Description</h3>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>{risk.description}</p>
          </div>
          {risk.mitigation && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🛡️ Mitigation Plan</h3>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>{risk.mitigation}</p>
            </div>
          )}
        </div>

        <div style={styles.sideCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Risk Details</h3>
            {[
              ['Owner', risk.owner],
              ['Department', risk.department],
              ['Likelihood', `${risk.likelihood} – ${['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][risk.likelihood]}`],
              ['Impact', `${risk.impact} – ${['', 'Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'][risk.impact]}`],
              ['Due Date', risk.dueDate ? new Date(risk.dueDate).toLocaleDateString() : '—'],
              ['Created By', risk.createdBy?.name || '—'],
              ['Last Updated', new Date(risk.updatedAt).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} style={styles.detailRow}>
                <span style={styles.detailLabel}>{label}</span>
                <span style={styles.detailValue}>{value}</span>
              </div>
            ))}
          </div>
          {risk.tags?.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {risk.tags.map(t => <span key={t} style={styles.tag}>{t}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <button onClick={() => navigate(`/risks/${id}/edit`)} style={styles.editBtn}>✏️ Edit Risk</button>
    </div>
  );
};

const styles = {
  page: { padding: '28px 32px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  back: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start' },
  headerCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerMain: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  levelBig: { padding: '8px 16px', borderRadius: '10px', border: '2px solid', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '4px' },
  title: { fontSize: '22px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif', marginBottom: '10px' },
  meta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  badge: { fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', border: '1px solid' },
  scoreArea: { textAlign: 'center', minWidth: '100px' },
  bigScore: { fontSize: '52px', fontWeight: 800, lineHeight: '1', fontFamily: 'Sora, sans-serif' },
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  mainCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sideCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' },
  cardTitle: { fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', fontFamily: 'Sora, sans-serif' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' },
  detailLabel: { color: '#94a3b8', fontWeight: 500 },
  detailValue: { color: '#0f172a', fontWeight: 500 },
  tag: { fontSize: '12px', background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px' },
  editBtn: { alignSelf: 'flex-start', padding: '11px 22px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginBottom: '20px' },
};

export default RiskDetail;