import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingDown,
  TrendingUp,
  Clock,
  Megaphone
} from 'lucide-react';
import { notificationAPI, Notification, NotificationListResponse } from '../services/api';

interface NotificationBellProps {
  /**
   * Polling interval in milliseconds for checking new notifications.
   * Default: 60000 (1 minute)
   */
  pollingInterval?: number;
}

const NotificationBell = ({ pollingInterval = 60000 }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: NotificationListResponse = await notificationAPI.getNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count only (for polling)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications
    const interval = setInterval(fetchUnreadCount, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, pollingInterval]);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Get severity icon and colors
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bgColor: 'var(--error-light)',
          textColor: 'var(--error)',
          borderColor: 'var(--error-border)',
          icon: <AlertTriangle size={16} strokeWidth={2} />,
        };
      case 'WARNING':
        return {
          bgColor: 'var(--warning-light)',
          textColor: 'var(--warning)',
          borderColor: 'var(--warning-border)',
          icon: <AlertCircle size={16} strokeWidth={2} />,
        };
      case 'INFO':
      default:
        return {
          bgColor: 'var(--info-light)',
          textColor: 'var(--info)',
          borderColor: 'var(--info-border)',
          icon: <Info size={16} strokeWidth={2} />,
        };
    }
  };

  // Get notification type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REVENUE_DROP':
        return <TrendingDown size={18} strokeWidth={1.5} />;
      case 'FAILED_TRANSACTION_SPIKE':
        return <AlertTriangle size={18} strokeWidth={1.5} />;
      case 'HIGH_VOLUME_DAY':
        return <TrendingUp size={18} strokeWidth={1.5} />;
      case 'LOW_SUCCESS_RATE':
        return <Megaphone size={18} strokeWidth={1.5} />;
      case 'HIGH_PENDING_TRANSACTIONS':
        return <Clock size={18} strokeWidth={1.5} />;
      default:
        return <Bell size={18} strokeWidth={1.5} />;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '9px',
          backgroundColor: isOpen ? 'var(--bg-page)' : 'var(--bg-subtle)',
          border: `1px solid ${isOpen ? 'var(--border-strong)' : 'var(--border-default)'}`,
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--bg-page)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
          }
        }}
      >
        <Bell size={18} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)' }} />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            minWidth: '18px',
            height: '18px',
            padding: '0 5px',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '10px',
            fontWeight: 600,
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--surface-base)',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="animate-fadeIn"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '380px',
            maxHeight: '480px',
            backgroundColor: 'var(--surface-base)',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            zIndex: 100
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: 'var(--accent-blue-light)',
                  color: 'var(--accent-blue)',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '10px'
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-blue-light)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div style={{
            maxHeight: '380px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {loading && notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border-subtle)',
                  borderTopColor: 'var(--accent-blue)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px'
                }} />
                Loading notifications...
              </div>
            ) : error ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--error)'
              }}>
                <AlertCircle size={40} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                <Bell size={48} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>
                  You'll be notified when important events occur
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const severityStyles = getSeverityStyles(notification.severity);
                return (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: notification.read ? 'default' : 'pointer',
                      transition: 'background-color 0.15s ease',
                      backgroundColor: notification.read ? 'transparent' : 'var(--accent-blue-light)',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                      if (!notification.read) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : 'var(--accent-blue-light)';
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: severityStyles.bgColor,
                      color: severityStyles.textColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {notification.title}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          backgroundColor: severityStyles.bgColor,
                          color: severityStyles.textColor,
                          flexShrink: 0
                        }}>
                          {notification.severity}
                        </span>
                      </div>
                      
                      <p style={{
                        margin: '0 0 6px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {notification.description}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}>
                        <span>{notification.relativeTime}</span>
                        {notification.comparisonPeriod && (
                          <>
                            <span>•</span>
                            <span>{notification.comparisonPeriod}</span>
                          </>
                        )}
                        {!notification.read && (
                          <>
                            <span>•</span>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--accent-blue)'
                            }} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              textAlign: 'center'
            }}>
              <span style={{
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}>
                Showing {notifications.length} most recent notifications
              </span>
            </div>
          )}
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
