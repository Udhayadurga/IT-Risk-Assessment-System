import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRiskStats, getRisks, RISK_LEVEL_COLORS, STATUS_COLORS } from '../utils/api';
import { StatsCards, RiskDistributionChart, CategoryChart } from '../components/Charts/Charts';
import RiskHeatmap from '../components/RiskHeatmap/RiskHeatmap';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentRisks, setRecentRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, risksRes] = await Promise.all([
          getRiskStats(),
          getRisks({ sortBy: '-createdAt', limit: 5 })
        ]);
        setStats(statsRes.data.stats);
        setRecentRisks(risksRes.data.risks.slice(0, 6));
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <p style={{ color: '#94a3b8', marginTop: '12px' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Risk Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => navigate('/risks/new')} style={styles.addBtn}>
          ➕ Report New Risk
        </button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        <div style={{ flex: 1 }}><RiskDistributionChart byLevel={stats?.byLevel} /></div>
        <div style={{ flex: 2 }}><CategoryChart byCategory={stats?.byCategory} /></div>
      </div>

      {/* Heatmap */}
      <RiskHeatmap heatmapData={stats?.heatmapData || []} />

      {/* Recent Risks */}
      <div style={styles.recentCard}>
        <div style={styles.recentHeader}>
          <h3 style={styles.sectionTitle}>Recent Risks</h3>
          <button onClick={() => navigate('/risks')} style={styles.viewAll}>View All →</button>
        </div>
        <div style={styles.table}>
          <div style={styles.tableHead}>
            {['Title', 'Category', 'Score', 'Level', 'Status', 'Owner'].map(h => (
              <div key={h} style={styles.th}>{h}</div>
            ))}
          </div>
          {recentRisks.length === 0 ? (
            <div style={styles.empty}>No risks reported yet. <span style={{ color: '#1e40af', cursor: 'pointer' }} onClick={() => navigate('/risks/new')}>Report the first one.</span></div>
          ) : recentRisks.map(risk => (
            <div key={risk._id} style={styles.tableRow} onClick={() => navigate(`/risks/${risk._id}`)}>
              <div style={styles.td}>
                <div style={styles.riskTitle}>{risk.title}</div>
              </div>
              <div style={styles.td}><span style={styles.category}>{risk.category}</span></div>
              <div style={styles.td}>
                <span style={{ ...styles.score, background: RISK_LEVEL_COLORS[risk.riskLevel]?.bg, color: RISK_LEVEL_COLORS[risk.riskLevel]?.text }}>
                  {risk.riskScore}
                </span>
              </div>
              <div style={styles.td}>
                <span style={{ ...styles.badge, background: RISK_LEVEL_COLORS[risk.riskLevel]?.bg, color: RISK_LEVEL_COLORS[risk.riskLevel]?.text, borderColor: RISK_LEVEL_COLORS[risk.riskLevel]?.border }}>
                  ● {risk.riskLevel}
                </span>
              </div>
              <div style={styles.td}>
                <span style={{ ...styles.badge, background: STATUS_COLORS[risk.status]?.bg, color: STATUS_COLORS[risk.status]?.text, borderColor: 'transparent' }}>
                  {risk.status}
                </span>
              </div>
              <div style={{ ...styles.td, color: '#475569', fontSize: '13px' }}>{risk.owner}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '28px 32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  spinner: { width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #1e40af', animation: 'spin 0.8s linear infinite' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '26px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  subtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  addBtn: { padding: '10px 20px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(30,64,175,0.25)' },
  chartsRow: { display: 'flex', gap: '20px' },
  recentCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' },
  recentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  viewAll: { background: 'none', border: 'none', color: '#1e40af', fontWeight: 600, fontSize: '13px', cursor: 'pointer' },
  table: { width: '100%' },
  tableHead: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.7fr 1fr 1fr 1fr', padding: '10px 24px', background: '#f8fafc' },
  th: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.7fr 1fr 1fr 1fr', padding: '14px 24px', borderTop: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.1s', alignItems: 'center' },
  td: { display: 'flex', alignItems: 'center' },
  riskTitle: { fontSize: '13.5px', fontWeight: 500, color: '#0f172a' },
  category: { fontSize: '12px', background: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '20px', fontWeight: 500 },
  score: { fontSize: '14px', fontWeight: 700, width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { fontSize: '11.5px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', border: '1px solid' },
  empty: { padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
};

export default Dashboard;