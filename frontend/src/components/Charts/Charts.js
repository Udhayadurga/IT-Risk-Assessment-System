import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const StatsCards = ({ stats }) => {
  const cards = [
    { label: 'Total Risks', value: stats?.totalRisks || 0, icon: '⚠️', color: '#1e40af', bg: '#eff6ff' },
    { label: 'Critical', value: stats?.byLevel?.Critical || 0, icon: '🔴', color: '#dc2626', bg: '#fef2f2' },
    { label: 'High', value: stats?.byLevel?.High || 0, icon: '🟠', color: '#ea580c', bg: '#fff7ed' },
    { label: 'Avg Score', value: stats?.avgScore || 0, icon: '📈', color: '#7c3aed', bg: '#fdf4ff' },
    { label: 'Open', value: stats?.byStatus?.Open || 0, icon: '🔓', color: '#dc2626', bg: '#fef2f2' },
    { label: 'Mitigated', value: stats?.byStatus?.Mitigated || 0, icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
  ];

  return (
    <div style={styles.grid}>
      {cards.map(card => (
        <div key={card.label} style={{ ...styles.card, borderTop: `3px solid ${card.color}` }}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconWrap, background: card.bg }}>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
            </div>
          </div>
          <div style={{ ...styles.value, color: card.color }}>{card.value}</div>
          <div style={styles.label}>{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export const RiskDistributionChart = ({ byLevel }) => {
  if (!byLevel) return null;
  const data = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [byLevel.Critical || 0, byLevel.High || 0, byLevel.Medium || 0, byLevel.Low || 0],
      backgroundColor: ['#dc2626', '#ea580c', '#ca8a04', '#16a34a'],
      borderWidth: 0,
      hoverOffset: 8,
    }]
  };
  return (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>Risk Distribution</h3>
      <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
        <Doughnut data={data} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } } }} />
      </div>
    </div>
  );
};

export const CategoryChart = ({ byCategory }) => {
  if (!byCategory) return null;
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const data = {
    labels: entries.map(([k]) => k),
    datasets: [{
      label: 'Risks',
      data: entries.map(([, v]) => v),
      backgroundColor: '#3b82f680',
      borderColor: '#3b82f6',
      borderWidth: 1.5,
      borderRadius: 6,
    }]
  };
  return (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>Risks by Category</h3>
      <div style={{ height: '220px' }}>
        <Bar data={data} options={{
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }
        }} />
      </div>
    </div>
  );
};

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' },
  card: {
    background: 'white', border: '1px solid #e2e8f0',
    borderRadius: '12px', padding: '18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardTop: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  iconWrap: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: '28px', fontWeight: 700, lineHeight: '1', fontFamily: 'Sora, sans-serif' },
  label: { fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 },
  chartCard: {
    background: 'white', border: '1px solid #e2e8f0',
    borderRadius: '14px', padding: '20px',
  },
  chartTitle: { fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', fontFamily: 'Sora, sans-serif' },
};