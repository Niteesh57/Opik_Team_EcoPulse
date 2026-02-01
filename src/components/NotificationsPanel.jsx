import React, { useState, useEffect } from 'react';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { notificationsService } from '../services/notificationsService';

const NotificationsPanel = ({ isOpen, onClose, onNotificationRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsService.getNotifications();
            // API returns { results: [], messages: boolean } or just list?
            // Checking the user request spec: "200 ... schema type=object ... additionalProperties=true"
            // The user description says "Returns: results: List of notifications..."
            // Let's assume data.results has the array if not direct array.
            const list = Array.isArray(data) ? data : (data.results || []);
            setNotifications(list);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            if (onNotificationRead) onNotificationRead();
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    const handleAccept = async (notification) => {
        try {
            // Update value to 1
            await notificationsService.updateNotification(notification.id, { value: 1 });

            // Re-fetch to update state or optimistically update
            // Let's optimistically update
            setNotifications(prev => prev.map(n =>
                n.id === notification.id
                    ? { ...n, value: 1, read: true } // Assume accepting makes it read too?
                    : n
            ));
        } catch (error) {
            console.error('Failed to accept notification:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for closing */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 90,
                }}
                onClick={onClose}
            />

            {/* Panel */}
            <div style={{
                position: 'absolute',
                top: '70px',
                right: '20px',
                width: '360px',
                maxHeight: '500px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Notifications</h3>
                    <button
                        onClick={handleMarkAllRead}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-sage-green)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <CheckCheck size={14} />
                        Mark all read
                    </button>
                </div>

                {/* List */}
                <div className="no-scrollbar" style={{
                    overflowY: 'auto',
                    flex: 1,
                    maxHeight: '400px'
                }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            <Bell size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div key={notification.id} style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid rgba(0,0,0,0.03)',
                                background: notification.read ? 'transparent' : 'rgba(135, 169, 107, 0.05)',
                                transition: 'background 0.2s'
                            }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {/* Icon/Avatar Placeholder */}
                                    <div style={{
                                        width: '36px', height: '36px',
                                        borderRadius: '50%',
                                        background: 'var(--color-soft-mint)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Bell size={16} color="var(--color-sage-green)" />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', lineHeight: '1.4' }}>
                                            {notification.message || "New notification"}
                                        </p>
                                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                            {new Date(notification.created_at || Date.now()).toLocaleDateString()}
                                        </span>

                                        {/* Accept Button Logic */}
                                        {notification.from_user_id &&
                                            notification.to_user_id &&
                                            notification.value === 0 && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <button
                                                        onClick={() => handleAccept(notification)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '16px',
                                                            border: 'none',
                                                            background: 'var(--color-sage-green)',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <Check size={12} />
                                                        Accept
                                                    </button>
                                                </div>
                                            )}

                                        {/* Request Fulfilled Badge */}
                                        {notification.value === 2 && (
                                            <div style={{
                                                marginTop: '10px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                background: 'rgba(135, 169, 107, 0.1)',
                                                color: 'var(--color-sage-green)',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                <CheckCheck size={12} />
                                                Request Fulfilled
                                            </div>
                                        )}
                                    </div>

                                    {/* Unread dot */}
                                    {!notification.read && (
                                        <div style={{
                                            width: '8px', height: '8px',
                                            borderRadius: '50%',
                                            background: '#FF5252',
                                            marginTop: '6px'
                                        }} />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <style>{`
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </>
    );
};

export default NotificationsPanel;
