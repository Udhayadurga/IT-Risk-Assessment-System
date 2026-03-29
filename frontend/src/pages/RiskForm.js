import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRisk, updateRisk, getRisk, CATEGORIES, STATUSES, DEPARTMENTS, calcRiskLevel, RISK_LEVEL_COLORS } from '../utils/api';
import toast from 'react-hot-toast';

const LIKELIHOOD_LABELS = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely', 5: 'Almost Certain' };
const IMPACT_LABELS    = { 1: 'Negligible', 2: 'Minor', 3: 'Moderate', 4: 'Major', 5: 'Catastrophic' };

// ── Hover guidance per category ──────────────────────────────────────────────
const CATEGORY_GUIDANCE = {
  Cybersecurity: {
    likelihood: {
      1: 'Systems are air-gapped. No attacks in 5+ years.',
      2: 'Firewall and MFA in place. Occasional phishing attempts.',
      3: 'Standard firewall. Some phishing attempts or minor alerts.',
      4: 'Known vulnerabilities unpatched. Regular intrusion probes.',
      5: 'Active attacker already in the network.',
    },
    impact: {
      1: 'Test account compromised. No real data affected.',
      2: 'Internal wiki defaced. Fixed within a day.',
      3: '500–5,000 customer emails exposed.',
      4: 'Full customer database with payment info breached.',
      5: 'All systems encrypted by ransomware. Business halted.',
    },
  },
  'Data Privacy': {
    likelihood: {
      1: 'Data encrypted and access-logged. No incidents ever.',
      2: 'Strong access controls. Rare accidental exposure.',
      3: 'Some shared drives lack permissions. Occasional misrouted emails.',
      4: 'Unencrypted PII stored in shared folders. Frequent mishandling.',
      5: 'Customer data openly accessible. Breach already suspected.',
    },
    impact: {
      1: 'Internal test data only. No real personal info.',
      2: 'A few staff email addresses leaked internally.',
      3: '1,000–10,000 user emails exposed. GDPR notification required.',
      4: 'Medical or financial records of thousands exposed.',
      5: 'Full PII database stolen. Regulatory fine + lawsuits.',
    },
  },
  Compliance: {
    likelihood: {
      1: 'Full compliance program. Regular audits pass cleanly.',
      2: 'Minor gaps identified but being addressed.',
      3: 'Policies outdated. Some staff unaware of requirements.',
      4: 'Known violations unresolved for months.',
      5: 'Active regulatory investigation underway.',
    },
    impact: {
      1: 'Minor policy gap. Internal note issued.',
      2: 'Formal warning from regulator. No fine.',
      3: 'Small fine issued. Remediation plan required.',
      4: 'Large fine. Operations restricted temporarily.',
      5: 'License revoked. Forced shutdown or criminal charges.',
    },
  },
  Operational: {
    likelihood: {
      1: 'Mature processes. Full redundancy. Near-zero failure rate.',
      2: 'Good processes with minor gaps.',
      3: 'Inconsistent procedures. Some manual workarounds.',
      4: 'Critical process with no backup. Failures occur monthly.',
      5: 'Process already failing. No contingency exists.',
    },
    impact: {
      1: 'Minor inconvenience. Resolved in under an hour.',
      2: 'Small team disruption. Fixed same day.',
      3: 'Department offline for 1–2 days.',
      4: 'Core operations halted for several days.',
      5: 'Business-wide shutdown. Recovery takes weeks.',
    },
  },
  Financial: {
    likelihood: {
      1: 'Strong financial controls. Audited regularly.',
      2: 'Good controls with minor exceptions.',
      3: 'Some single-person approvals. Occasional errors.',
      4: 'Weak controls. Duplicate payments occurring.',
      5: 'Active fraud suspected or detected.',
    },
    impact: {
      1: 'Under ₹10,000 exposure. Easily recovered.',
      2: '₹10,000–₹1,00,000 loss. Noted in accounts.',
      3: '₹1–10 lakh loss. Affects quarterly budget.',
      4: '₹10–50 lakh loss. Board-level concern.',
      5: 'Over ₹1 crore loss. Viability threatened.',
    },
  },
  Strategic: {
    likelihood: {
      1: 'Strategy reviewed annually. Well-aligned with market.',
      2: 'Minor strategic gaps identified.',
      3: 'Some decisions made without full market analysis.',
      4: 'Strategy misaligned with industry trends.',
      5: 'No strategic planning. Reactive management only.',
    },
    impact: {
      1: 'Slight inefficiency. No market impact.',
      2: 'Minor competitive disadvantage.',
      3: 'Measurable loss of market share.',
      4: 'Major revenue decline. Key clients at risk.',
      5: 'Organisation no longer viable in current form.',
    },
  },
  Technical: {
    likelihood: {
      1: 'All systems current. Automated patch management.',
      2: 'Mostly up to date. Minor legacy components.',
      3: 'Mix of modern and legacy. Patching irregular.',
      4: 'Several end-of-life systems still in production.',
      5: 'Critical systems severely outdated. Failures common.',
    },
    impact: {
      1: 'Minor bug. Cosmetic issue only.',
      2: 'Feature broken. Workaround available.',
      3: 'Key service degraded. Users frustrated.',
      4: 'Core platform down. Revenue impacted.',
      5: 'Complete infrastructure failure. All services offline.',
    },
  },
  Reputational: {
    likelihood: {
      1: 'Excellent public image. No complaints.',
      2: 'Occasional negative reviews. Managed well.',
      3: 'Some public criticism. Social media grumblings.',
      4: 'Ongoing negative press. Customer trust declining.',
      5: 'Active public scandal or viral negative coverage.',
    },
    impact: {
      1: 'A few negative comments. Quickly forgotten.',
      2: 'Local press coverage. Short-lived.',
      3: 'National news story. Noticeable customer drop.',
      4: 'Major brand damage. Long-term trust erosion.',
      5: 'Permanent reputational collapse. Partners walk away.',
    },
  },
};

// ── Score Selector with hover guidance ───────────────────────────────────────
const ScoreSelector = ({ label, value, onChange, labelMap, guidance }) => {
  const [hovered, setHovered] = useState(null);
  const active = hovered || value;
  const colors = { 1: '#16a34a', 2: '#65a30d', 3: '#ca8a04', 4: '#ea580c', 5: '#dc2626' };
  const bgs    = { 1: '#f0fdf4', 2: '#f7fee7', 3: '#fefce8', 4: '#fff7ed', 5: '#fef2f2' };

  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n} type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...S.scoreBtn,
              ...(value === n ? { background: '#1e40af', borderColor: '#1e40af', color: 'white' } : {}),
              ...(hovered === n && value !== n ? { borderColor: colors[n], background: bgs[n] } : {}),
            }}
          >
            <div style={S.scoreBtnNum}>{n}</div>
            <div style={S.scoreBtnLabel}>{labelMap[n]}</div>
          </button>
        ))}
      </div>

      {/* Guidance box */}
      {guidance && active && (
        <div style={{
          ...S.guidanceBox,
          background: bgs[active],
          borderColor: colors[active],
          color: colors[active],
        }}>
          <span style={{ fontWeight: 700 }}>
            {hovered ? '👁 Preview:' : '✅ Selected:'} Score {active} — {labelMap[active]}
          </span>
          <br />
          <span style={{ color: '#475569', fontWeight: 400 }}>{guidance[active]}</span>
        </div>
      )}
    </div>
  );
};

// ── Main Form ─────────────────────────────────────────────────────────────────
const RiskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit  = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Cybersecurity',
    likelihood: 1,
    impact: 1,
    status: 'Open',       // always Open on create — hidden from user
    owner: '',
    department: 'IT',     // kept in state for backend but hidden from user
    mitigation: '',
    dueDate: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getRisk(id)
        .then(res => {
          const r = res.data.risk;
          setForm({
            ...r,
            tags: r.tags?.join(', ') || '',
            dueDate: r.dueDate ? r.dueDate.split('T')[0] : '',
          });
        })
        .catch(() => toast.error('Failed to load risk'));
    }
  }, [id, isEdit]);

  const riskScore  = form.likelihood * form.impact;
  const riskLevel  = calcRiskLevel(riskScore);
  const levelColor = RISK_LEVEL_COLORS[riskLevel];
  const guidance   = CATEGORY_GUIDANCE[form.category] || {};

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (isEdit) await updateRisk(id, payload);
      else        await createRisk(payload);
      toast.success(isEdit ? 'Risk updated!' : 'Risk reported successfully!');
      navigate('/risks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save risk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <button onClick={() => navigate(-1)} style={S.backBtn}>← Back</button>
          <h1 style={S.title}>{isEdit ? '✏️ Edit Risk' : '⚠️ Report New Risk'}</h1>
          <p style={S.subtitle}>
            {isEdit ? 'Update risk details and status' : 'Document and assess a new IT risk'}
          </p>
        </div>

        {/* Live score badge */}
        <div style={{ ...S.scoreBadge, background: levelColor.bg, borderColor: levelColor.border }}>
          <div style={S.scoreBadgeLabel}>Risk Score</div>
          <div style={{ ...S.scoreBadgeValue, color: levelColor.text }}>{riskScore}</div>
          <div style={{ ...S.scoreBadgeLevel, color: levelColor.text }}>● {riskLevel}</div>
          <div style={S.scoreBadgeCalc}>{form.likelihood} × {form.impact}</div>
          {/* Score range bar */}
          <div style={S.barTrack}>
            <div style={{
              ...S.barFill,
              width: `${(riskScore / 25) * 100}%`,
              background: levelColor.text,
            }} />
          </div>
          <div style={S.barLabels}>
            <span style={{ color: '#16a34a' }}>Low</span>
            <span style={{ color: '#dc2626' }}>Critical</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={S.form}>

        {/* ── Section 1: Basic Info ── */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>📋 Basic Information</h2>

          {/* Title — full width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Risk Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g., Customer database accessible without authentication"
              required
              style={S.input}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>Category *</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              style={S.input}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Description — full width */}
          <div>
            <label style={S.label}>Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe the risk in detail — what is the problem, what systems are affected, what could happen if not fixed?"
              rows={4}
              required
              style={{ ...S.input, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* ── Section 2: Risk Scoring ── */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>📊 Risk Assessment</h2>

          <div style={S.tip}>
            💡 <strong>Tip:</strong> Hover over each score button to see a real-world example
            for the <strong>{form.category}</strong> category before selecting.
          </div>

          {/* Score reference strip */}
          <div style={S.scoreStrip}>
            {[
              { range: '1–5',   level: 'Low',      color: '#16a34a', bg: '#f0fdf4' },
              { range: '6–11',  level: 'Medium',   color: '#ca8a04', bg: '#fefce8' },
              { range: '12–19', level: 'High',     color: '#ea580c', bg: '#fff7ed' },
              { range: '20–25', level: 'Critical', color: '#dc2626', bg: '#fef2f2' },
            ].map(item => (
              <div key={item.level} style={{ ...S.stripItem, background: item.bg, borderColor: item.color }}>
                <span style={{ fontWeight: 700, color: item.color }}>{item.level}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{item.range}</span>
              </div>
            ))}
          </div>

          <div style={S.scoringGrid}>
            <ScoreSelector
              label="Likelihood (1–5) *"
              value={form.likelihood}
              onChange={v => set('likelihood', v)}
              labelMap={LIKELIHOOD_LABELS}
              guidance={guidance.likelihood}
            />
            <ScoreSelector
              label="Impact (1–5) *"
              value={form.impact}
              onChange={v => set('impact', v)}
              labelMap={IMPACT_LABELS}
              guidance={guidance.impact}
            />
          </div>
        </div>

        {/* ── Section 3: Ownership (Edit mode shows Status too) ── */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>👤 Ownership</h2>

          <div style={S.grid2}>
            {/* Risk Owner */}
            <div>
              <label style={S.label}>Risk Owner *</label>
              <input
                value={form.owner}
                onChange={e => set('owner', e.target.value)}
                placeholder="e.g., IT Manager"
                required
                style={S.input}
              />
            </div>

            {/* Status — shown ONLY when editing */}
            {isEdit && (
              <div>
                <label style={S.label}>Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  style={S.input}
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={S.actions}>
          <button type="button" onClick={() => navigate(-1)} style={S.cancelBtn}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={S.submitBtn}>
            {loading ? 'Saving...' : isEdit ? '💾 Save Changes' : '🚀 Submit Risk Report'}
          </button>
        </div>

      </form>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page:    { padding: '28px 32px', maxWidth: '860px', margin: '0 auto' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  backBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', marginBottom: '8px', padding: 0 },
  title:   { fontSize: '26px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  subtitle:{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' },

  // Live score badge
  scoreBadge:      { border: '2px solid', borderRadius: '16px', padding: '18px 24px', textAlign: 'center', minWidth: '150px' },
  scoreBadgeLabel: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' },
  scoreBadgeValue: { fontSize: '48px', fontWeight: 800, lineHeight: '1', fontFamily: 'Sora, sans-serif' },
  scoreBadgeLevel: { fontSize: '14px', fontWeight: 700, marginTop: '4px' },
  scoreBadgeCalc:  { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  barTrack: { height: '6px', background: '#e2e8f0', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' },
  barLabels:{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '3px' },

  form:    { display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' },
  sectionTitle: { fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '18px', fontFamily: 'Sora, sans-serif' },
  grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },

  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#0f172a', outline: 'none', background: 'white', boxSizing: 'border-box' },

  tip: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#1e40af', marginBottom: '20px' },

  scoreStrip: { display: 'flex', gap: '8px', marginBottom: '20px' },
  stripItem:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', borderRadius: '8px', border: '1px solid', gap: '2px' },

  scoringGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  scoreBtn:    { flex: 1, padding: '10px 6px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' },
  scoreBtnNum: { fontSize: '18px', fontWeight: 700, fontFamily: 'Sora, sans-serif' },
  scoreBtnLabel:{ fontSize: '10px', marginTop: '2px' },

  guidanceBox: { marginTop: '10px', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid', fontSize: '13px', lineHeight: '1.6' },

  actions:   { display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '40px' },
  cancelBtn: { padding: '12px 24px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#64748b' },
  submitBtn: { padding: '12px 28px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,64,175,0.3)' },
};

export default RiskForm;