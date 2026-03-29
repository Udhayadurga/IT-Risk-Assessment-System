import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const TYPE_COLORS = {
  Critical: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#dc2626', emoji: '🔴' },
  High:     { bg: '#fff7ed', text: '#ea580c', border: '#fdba74', dot: '#ea580c', emoji: '🟠' },
  Medium:   { bg: '#fefce8', text: '#ca8a04', border: '#fde047', dot: '#ca8a04', emoji: '🟡' },
  Low:      { bg: '#f0fdf4', text: '#16a34a', border: '#86efac', dot: '#16a34a', emoji: '🟢' },
  Status:   { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', dot: '#2563eb', emoji: '📋' },
  System:   { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#475569', emoji: '⚙️' },
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await api.put('/notifications/read-all');
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await api.put(`/notifications/${notification._id}/read`);
      await fetchNotifications();
      if (notification.riskId) {
        navigate(`/risks/${notification.riskId}`);
      }
      setOpen(false);
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <div ref={dropdownRef} style={S.wrapper}>
      {/* Bell Button */}
      <button onClick={() => setOpen(!open)} style={S.bellBtn}>
        <span style={{ fontSize: '20px' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={S.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={S.dropdown}>
          {/* Header */}
          <div style={S.dropHeader}>
            <div>
              <div style={S.dropTitle}>Notifications</div>
              {unreadCount > 0 && (
                <div style={S.unreadText}>{unreadCount} unread</div>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} disabled={loading} style={S.markAllBtn}>
                {loading ? '...' : '✓ Mark all read'}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={S.list}>
            {notifications.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
                <div style={{ fontWeight: 600, color: '#475569' }}>No notifications yet</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Notifications appear when risks are reported
                </div>
              </div>
            ) : (
              notifications.map(n => {
                const c = TYPE_COLORS[n.type] || TYPE_COLORS.System;
                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      ...S.item,
                      background: n.isRead ? 'white' : c.bg,
                      borderLeft: `3px solid ${n.isRead ? '#e2e8f0' : c.dot}`,
                    }}
                  >
                    <div style={S.itemIcon}>{c.emoji}</div>
                    <div style={S.itemContent}>
                      <div style={{
                        ...S.itemTitle,
                        color: n.isRead ? '#475569' : '#0f172a',
                        fontWeight: n.isRead ? 500 : 700,
                      }}>
                        {n.title}
                      </div>
                      <div style={S.itemMsg}>{n.message}</div>
                      <div style={S.itemTime}>
                        {n.createdBy?.name && (
                          <span style={S.itemAuthor}>{n.createdBy.name} · </span>
                        )}
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {!n.isRead && <div style={{ ...S.unreadDot, background: c.dot }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  wrapper: { position: 'relative' },
  bellBtn: {
    position: 'relative', background: 'none', border: 'none',
    cursor: 'pointer', padding: '6px 8px', borderRadius: '8px',
    transition: 'background 0.15s',
  },
  badge: {
    position: 'absolute', top: '2px', right: '2px',
    background: '#dc2626', color: 'white',
    fontSize: '10px', fontWeight: 700,
    minWidth: '18px', height: '18px',
    borderRadius: '10px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '0 4px', border: '2px solid white',
  },
  dropdown: {
    position: 'absolute', right: 0, top: '44px',
    width: '380px', background: 'white',
    border: '1px solid #e2e8f0', borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    zIndex: 999, overflow: 'hidden',
  },
  dropHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px 18px',
    borderBottom: '1px solid #f1f5f9',
  },
  dropTitle: { fontSize: '15px', fontWeight: 700, color: '#0f172a', fontFamily: 'Sora, sans-serif' },
  unreadText: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  markAllBtn: {
    fontSize: '12px', fontWeight: 600, color: '#1e40af',
    background: '#eff6ff', border: '1px solid #bfdbfe',
    borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
  },
  list: { maxHeight: '400px', overflowY: 'auto' },
  empty: { padding: '40px 20px', textAlign: 'center' },
  item: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    padding: '14px 18px', cursor: 'pointer',
    borderBottom: '1px solid #f8fafc',
    transition: 'background 0.1s',
  },
  itemIcon: { fontSize: '18px', marginTop: '2px', flexShrink: 0 },
  itemContent: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: '13px', marginBottom: '3px' },
  itemMsg: {
    fontSize: '12px', color: '#64748b',
    lineHeight: '1.5', marginBottom: '4px',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  itemTime: { fontSize: '11px', color: '#94a3b8' },
  itemAuthor: { fontWeight: 600 },
  unreadDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    flexShrink: 0, marginTop: '6px',
  },
};

export default NotificationBell;