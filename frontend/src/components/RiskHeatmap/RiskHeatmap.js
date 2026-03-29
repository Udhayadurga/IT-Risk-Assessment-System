import React from 'react';

const RiskHeatmap = ({ heatmapData = [] }) => {
  const getColor = (l, i) => {
    const score = l * i;
    if (score >= 20) return '#dc2626';
    if (score >= 12) return '#ea580c';
    if (score >= 6)  return '#ca8a04';
    return '#16a34a';
  };

  const getCount = (l, i) => {
    const cell = heatmapData.find(d => d._id.likelihood === l && d._id.impact === i);
    return cell ? cell.count : 0;
  };

  const labels = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely', 5: 'Almost Certain' };
  const impactLabels = { 1: 'Negligible', 2: 'Minor', 3: 'Moderate', 4: 'Major', 5: 'Catastrophic' };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Risk Heatmap</h3>
        <div style={styles.legend}>
          {[['Critical', '#dc2626'], ['High', '#ea580c'], ['Medium', '#ca8a04'], ['Low', '#16a34a']].map(([label, color]) => (
            <div key={label} style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.matrixWrap}>
        {/* Y-axis label */}
        <div style={styles.yAxisLabel}>← LIKELIHOOD →</div>

        <div style={styles.matrix}>
          {/* Column headers (Impact) */}
          <div style={{ gridColumn: '1', gridRow: '1' }} />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={styles.colHeader}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e40af' }}>{i}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{impactLabels[i]}</div>
            </div>
          ))}

          {/* Rows (Likelihood - 5 to 1) */}
          {[5, 4, 3, 2, 1].map(l => (
            <React.Fragment key={l}>
              <div style={styles.rowHeader}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e40af' }}>{l}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{labels[l]}</div>
              </div>
              {[1, 2, 3, 4, 5].map(i => {
                const score = l * i;
                const count = getCount(l, i);
                const color = getColor(l, i);
                return (
                  <div key={i} style={{
                    ...styles.cell,
                    background: `${color}18`,
                    borderColor: count > 0 ? color : '#e2e8f0',
                    boxShadow: count > 0 ? `inset 0 0 0 2px ${color}40` : 'none',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>L×I={score}</div>
                    {count > 0 && (
                      <div style={{
                        ...styles.countBadge,
                        background: color, color: 'white',
                      }}>{count}</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* X-axis label */}
        <div style={styles.xAxisLabel}>← IMPACT →</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white', border: '1px solid #e2e8f0',
    borderRadius: '14px', padding: '24px',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '20px',
  },
  title: {
    fontSize: '16px', fontWeight: 700, color: '#0f172a',
    fontFamily: 'Sora, sans-serif',
  },
  legend: { display: 'flex', gap: '14px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%' },
  matrixWrap: { position: 'relative' },
  yAxisLabel: {
    fontSize: '10px', fontWeight: 600, color: '#94a3b8',
    letterSpacing: '0.1em', textAlign: 'center',
    marginBottom: '8px', textTransform: 'uppercase',
  },
  matrix: {
    display: 'grid',
    gridTemplateColumns: '90px repeat(5, 1fr)',
    gridTemplateRows: 'auto repeat(5, 56px)',
    gap: '4px',
  },
  colHeader: {
    textAlign: 'center', padding: '6px 4px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  rowHeader: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    paddingRight: '8px', textAlign: 'right',
  },
  cell: {
    borderRadius: '8px', border: '1.5px solid',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '4px', position: 'relative', transition: 'all 0.15s',
    cursor: 'default',
  },
  countBadge: {
    borderRadius: '50%', width: '22px', height: '22px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 700,
  },
  xAxisLabel: {
    fontSize: '10px', fontWeight: 600, color: '#94a3b8',
    letterSpacing: '0.1em', textAlign: 'center',
    marginTop: '8px', textTransform: 'uppercase',
  },
};

export default RiskHeatmap;