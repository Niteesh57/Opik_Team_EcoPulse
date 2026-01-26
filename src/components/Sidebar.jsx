import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, X, ChevronRight, Trash2 } from 'lucide-react';
import { chatService } from '../services/chatService';

const Sidebar = ({ isOpen, onClose, onSelectSession, onNewChat, activeSessionId }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hoveredSession, setHoveredSession] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadSessions();
        }
    }, [isOpen]);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const data = await chatService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (window.confirm('Delete this chat session?')) {
            try {
                await chatService.deleteSession(sessionId);
                setSessions(prev => prev.filter(s => s.session_id !== sessionId));
            } catch (error) {
                console.error('Failed to delete session:', error);
                alert('Failed to delete session. Please try again.');
            }
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '300px',
            height: '100%',
            background: 'white',
            boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
            zIndex: 101,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px'
        }}>
            <style>{`
                @media (min-width: 768px) {
                    .sidebar-container {
                        width: 400px !important;
                    }
                }
            `}</style>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-charcoal)' }}>History</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={20} color="var(--color-text-secondary)" />
                </button>
            </div>

            <button
                onClick={onNewChat}
                style={{
                    background: 'var(--color-sage-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '24px',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                    transition: 'transform 0.2s ease'
                }}
            >
                <Plus size={20} />
                New Chat
            </button>

            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                <h3 style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '16px'
                }}>Recent Sessions</h3>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                        Loading...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => onSelectSession(session)}
                                onMouseEnter={() => setHoveredSession(session.session_id)}
                                onMouseLeave={() => setHoveredSession(null)}
                                style={{
                                    background: activeSessionId === session.session_id ? 'var(--color-soft-mint)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.2s ease',
                                    width: '100%',
                                    position: 'relative'
                                }}
                                onMouseOver={(e) => {
                                    if (activeSessionId !== session.session_id)
                                        e.currentTarget.style.background = '#f5f5f5';
                                }}
                                onMouseOut={(e) => {
                                    if (activeSessionId !== session.session_id)
                                        e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <MessageSquare size={16} color="var(--color-sage-green)" style={{ minWidth: '16px' }} />
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <div style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontSize: '14px',
                                        color: 'var(--color-charcoal)',
                                        fontWeight: activeSessionId === session.session_id ? '600' : '400'
                                    }}>
                                        {session.first_user_message || 'New Conversation'}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--color-text-secondary)',
                                        marginTop: '2px'
                                    }}>
                                        {new Date(session.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                {hoveredSession === session.session_id ? (
                                    <button
                                        onClick={(e) => handleDeleteSession(e, session.session_id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '4px',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 82, 82, 0.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <Trash2 size={14} color="#FF5252" />
                                    </button>
                                ) : activeSessionId === session.session_id ? (
                                    <ChevronRight size={14} color="var(--color-sage-green)" style={{ marginLeft: 'auto' }} />
                                ) : null}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
