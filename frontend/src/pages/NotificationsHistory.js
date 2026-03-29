import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const TYPE_META = {
  Critical: { emoji: '🔴', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  High:     { emoji: '🟠', color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
  Medium:   { emoji: '🟡', color: '#ca8a04', bg: '#fefce8', border: '#fde047' },
  Low:      { emoji: '🟢', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  Status:   { emoji: '📋', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  System:   { emoji: '⚙️', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const NotificationsHistory = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('All');  // All | Unread | Read

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      await fetchNotifications();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleClick = async (n) => {
    try {
      await api.put(`/notifications/${n._id}/read`);
      await fetchNotifications();
      if (n.riskId) navigate(`/risks/${n.riskId}`);
    } catch {
      toast.error('Failed to mark notification');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Read')   return  n.isRead;
    return true;
  });

  if (loading) return (
    <div style={S.loader}>
      <div style={{ fontSize: '36px' }}>🔔</div>
      <p style={{ color: '#94a3b8' }}>Loading notifications...</p>
    </div>
  );

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>🔔 Notifications History</h1>
          <p style={S.subtitle}>
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={S.markAllBtn}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={S.statsRow}>
        {[
          { label: 'Total',    value: notifications.length,          color: '#1e40af', bg: '#eff6ff' },
          { label: 'Unread',   value: unreadCount,                   color: '#dc2626', bg: '#fef2f2' },
          { label: 'Read',     value: notifications.length - unreadCount, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Critical', value: notifications.filter(n => n.type === 'Critical').length, color: '#dc2626', bg: '#fef2f2' },
          { label: 'High',     value: notifications.filter(n => n.type === 'High').length,     color: '#ea580c', bg: '#fff7ed' },
        ].map(s => (
          <div key={s.label} style={{ ...S.statCard, background: s.bg }}>
            <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={S.filterRow}>
        {['All', 'Unread', 'Read'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...S.filterBtn,
              ...(filter === f ? S.filterBtnActive : {}),
            }}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span style={S.filterBadge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div style={S.listCard}>
        {filtered.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: '40px' }}>🔕</div>
            <p style={{ fontWeight: 600, color: '#475569', margin: '8px 0 4px' }}>
              No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}notifications
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Notifications appear when risks are reported or updated.
            </p>
          </div>
        ) : (
          filtered.map((n, idx) => {
            const meta = TYPE_META[n.type] || TYPE_META.System;
            return (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  ...S.notifRow,
                  background: n.isRead ? 'white' : meta.bg,
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  borderLeft: `4px solid ${n.isRead ? '#e2e8f0' : meta.color}`,
                }}
              >
                {/* Emoji */}
                <div style={{ fontSize: '22px', flexShrink: 0 }}>{meta.emoji}</div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: n.isRead ? 500 : 700,
                      color: n.isRead ? '#475569' : '#0f172a',
                    }}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span style={{ ...S.unreadPill, background: meta.color }}>New</span>
                    )}
                    <span style={{ ...S.typePill, background: meta.bg, color: meta.color, borderColor: meta.border }}>
                      {n.type}
                    </span>
                  </div>
                  <p style={S.notifMsg}>{n.message}</p>
                  <div style={S.notifMeta}>
                    {n.createdBy?.name && (
                      <span style={S.notifAuthor}>👤 {n.createdBy.name}</span>
                    )}
                    <span>🕐 {timeAgo(n.createdAt)}</span>
                    {n.riskId && (
                      <span style={{ color: '#1e40af', fontWeight: 600 }}>→ View Risk</span>
                    )}
                  </div>
                </div>

                {/* Read/unread dot */}
                {!n.isRead && (
                  <div style={{ ...S.unreadDot, background: meta.color }} />
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

const S = {
  page:    { padding: '28px 32px', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  loader:  { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title:   { fontSize: '26px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  subtitle:{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  markAllBtn: { padding: '10px 18px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },

  statsRow: { display: 'flex', gap: '12px' },
  statCard: { flex: 1, borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #e2e8f0' },
  statValue:{ fontSize: '28px', fontWeight: 800, fontFamily: 'Sora, sans-serif', lineHeight: 1 },
  statLabel:{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '5px' },

  filterRow:   { display: 'flex', gap: '8px' },
  filterBtn:   { padding: '8px 18px', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', fontSize: '13px', fontWeight: 500, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  filterBtnActive: { background: '#1e40af', borderColor: '#1e40af', color: 'white' },
  filterBadge: { background: '#dc2626', color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' },

  listCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' },
  empty:    { padding: '60px 20px', textAlign: 'center' },

  notifRow: { display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px 20px', cursor: 'pointer', transition: 'background 0.1s' },
  notifMsg: { fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '4px 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  notifMeta:{ display: 'flex', gap: '14px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' },
  notifAuthor: { fontWeight: 600, color: '#64748b' },

  unreadPill: { fontSize: '9px', fontWeight: 800, color: 'white', padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  typePill:   { fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid' },
  unreadDot:  { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '6px' },
};

export default NotificationsHistory;