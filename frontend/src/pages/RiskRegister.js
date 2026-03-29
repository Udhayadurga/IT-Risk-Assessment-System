import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRisks, deleteRisk, CATEGORIES, STATUSES, RISK_LEVEL_COLORS, STATUS_COLORS } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RiskRegister = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', riskLevel: '', status: '' });
  const [deleting, setDeleting] = useState(null);

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.riskLevel) params.riskLevel = filters.riskLevel;
      if (filters.status) params.status = filters.status;
      const res = await getRisks(params);
      setRisks(res.data.risks);
    } catch { toast.error('Failed to load risks'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchRisks(); }, [fetchRisks]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    try {
      await deleteRisk(id);
      toast.success('Risk deleted');
      fetchRisks();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Risk Register</h1>
          <p style={styles.subtitle}>{risks.length} risks found</p>
        </div>
        <button onClick={() => navigate('/risks/new')} style={styles.addBtn}>➕ Report Risk</button>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <input
          placeholder="🔍 Search risks..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          style={styles.searchInput}
        />
        <select value={filters.category} onChange={e => setFilter('category', e.target.value)} style={styles.filterSelect}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filters.riskLevel} onChange={e => setFilter('riskLevel', e.target.value)} style={styles.filterSelect}>
          <option value="">All Levels</option>
          {['Critical', 'High', 'Medium', 'Low'].map(l => <option key={l}>{l}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilter('status', e.target.value)} style={styles.filterSelect}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(filters.search || filters.category || filters.riskLevel || filters.status) && (
          <button onClick={() => setFilters({ search: '', category: '', riskLevel: '', status: '' })} style={styles.clearBtn}>✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHead}>
          {['Risk Title', 'Category', 'L×I', 'Score', 'Level', 'Status', 'Owner', 'Dept', 'Actions'].map(h => (
            <div key={h} style={styles.th}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={styles.centered}>Loading...</div>
        ) : risks.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontWeight: 600, color: '#475569' }}>No risks found</div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Try adjusting your filters</div>
          </div>
        ) : risks.map(risk => {
          const lc = RISK_LEVEL_COLORS[risk.riskLevel];
          const sc = STATUS_COLORS[risk.status];
          return (
            <div key={risk._id} style={styles.row}>
              <div style={styles.td}>
                <div style={styles.riskTitle} onClick={() => navigate(`/risks/${risk._id}`)}>{risk.title}</div>
                {risk.tags?.length > 0 && (
                  <div style={styles.tags}>{risk.tags.slice(0, 2).map(t => <span key={t} style={styles.tag}>{t}</span>)}</div>
                )}
              </div>
              <div style={styles.td}><span style={styles.catBadge}>{risk.category}</span></div>
              <div style={styles.td}><span style={{ fontSize: '13px', color: '#64748b' }}>{risk.likelihood}×{risk.impact}</span></div>
              <div style={styles.td}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: lc?.text }}>{risk.riskScore}</span>
              </div>
              <div style={styles.td}>
                <span style={{ ...styles.badge, background: lc?.bg, color: lc?.text, borderColor: lc?.border }}>● {risk.riskLevel}</span>
              </div>
              <div style={styles.td}>
                <span style={{ ...styles.badge, background: sc?.bg, color: sc?.text, borderColor: 'transparent' }}>{risk.status}</span>
              </div>
              <div style={{ ...styles.td, fontSize: '13px' }}>{risk.owner}</div>
              <div style={{ ...styles.td, fontSize: '13px', color: '#64748b' }}>{risk.department}</div>
              <div style={{ ...styles.td, gap: '6px' }}>
                <button onClick={() => navigate(`/risks/${risk._id}/edit`)} style={styles.editBtn}>✏️</button>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(risk._id, risk.title)} disabled={deleting === risk._id} style={styles.deleteBtn}>🗑️</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '28px 32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '26px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  subtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  addBtn: { padding: '10px 20px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' },
  searchInput: { flex: '2', minWidth: '200px', padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px', outline: 'none' },
  filterSelect: { flex: '1', minWidth: '140px', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px', background: 'white', outline: 'none' },
  clearBtn: { padding: '9px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 },
  tableCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 0.7fr 0.7fr 1fr 1fr 1fr 0.8fr 0.8fr', padding: '12px 20px', background: '#f8fafc', gap: '8px' },
  th: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  row: { display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 0.7fr 0.7fr 1fr 1fr 1fr 0.8fr 0.8fr', padding: '14px 20px', borderTop: '1px solid #f1f5f9', alignItems: 'center', gap: '8px', transition: 'background 0.1s' },
  td: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' },
  riskTitle: { fontSize: '13.5px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' },
  tags: { display: 'flex', gap: '4px', marginTop: '3px' },
  tag: { fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: '20px' },
  catBadge: { fontSize: '11.5px', background: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '20px', fontWeight: 500 },
  badge: { fontSize: '11.5px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', border: '1px solid' },
  editBtn: { padding: '5px 8px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { padding: '5px 8px', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  centered: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
  empty: { textAlign: 'center', padding: '60px 20px' },
};

export default RiskRegister;