import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Loader2 } from 'lucide-react';
import { eventsService } from '../services/eventsService';
import { authService } from '../services/auth';

const EventChatModal = ({ isOpen, onClose, eventId, eventName, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Fetch initial history
    useEffect(() => {
        if (!isOpen || !eventId) return;

        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const history = await eventsService.getEventMessages(eventId);
                // The API returns messages latest first or oldest first? 
                // Usually chat APIs might return latest, but let's assume standard list order.
                // If it's reverse chronological (newest first), we might need to reverse.
                // Based on "skip=0, limit=50", it likely returns standard pagination.
                // Let's assume response order needs checking, but usually we just set them.
                // Ideally we want oldest at top, newest at bottom.
                // If API returns newest first (common for feeds), we reverse. 
                // Let's assume it returns chronological or we sort.
                // For now, let's just set them and see. If the order is wrong, we flip.

                // Sort by created_at to be safe
                const sorted = history.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                setMessages(sorted);
            } catch (error) {
                console.error("Failed to load chat history", error);
            } finally {
                setIsLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        fetchHistory();
    }, [isOpen, eventId]);

    // WebSocket Connection
    useEffect(() => {
        if (!isOpen || !eventId) return;

        const connectWebSocket = () => {
            const token = authService.getToken();
            // Use correct WS protocol (ws vs wss) based on current protocol if needed, 
            // but here we hardcode or use env. Assuming dev is localhost.
            // The user Request used: ws://localhost:8000/api/v1/messages/ws/${eventId}?token=${userToken}
            // We should use the API_URL from auth service logic or env.
            // Let's assume implicit base URL like http://localhost:8000

            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
            const wsHost = apiUrl.replace(/^https?:\/\//, '');
            const wsUrl = `${wsProtocol}://${wsHost}/api/v1/messages/ws/${eventId}?token=${token}`;

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log("Connected to event chat");
                setIsConnected(true);
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [...prev, data]);
                    setTimeout(scrollToBottom, 50);
                } catch (e) {
                    console.error("Failed to parse WS message", e);
                }
            };

            ws.current.onclose = () => {
                console.log("Disconnected from event chat");
                setIsConnected(false);
            };

            ws.current.onerror = (error) => {
                console.error("WS Error:", error);
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [isOpen, eventId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (ws.current && newMessage.trim() && isConnected) {
            const payload = { message: newMessage };
            ws.current.send(JSON.stringify(payload));
            setNewMessage("");
            // Optimistic update isn't strictly needed if WS is fast, 
            // but we rely on the server echo for ID and timestamp usually.
            // The user provided example shows waiting for WS echo.
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                }}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                height: '80vh',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                margin: '20px',
                animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.8)'
                }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>{eventName}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '8px', height: '8px',
                                borderRadius: '50%',
                                background: isConnected ? '#4CAF50' : '#FF5252'
                            }} />
                            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                {isConnected ? 'Live Chat' : 'Connecting...'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(0,0,0,0.05)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={18} color="var(--color-charcoal)" />
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    className="no-scrollbar"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        background: '#F5F7F5'
                    }}
                >
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
                            <Loader2 className="spinning" color="var(--color-sage-green)" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--color-text-secondary)' }}>
                            <p>No messages yet.</p>
                            <p style={{ fontSize: '13px' }}>Be the first to say hello! 👋</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            // Check if current user is sender
                            // currentUser object might have id, sometimes user_id. 
                            // Adjust check based on your app's user object structure.
                            const isMe = msg.user_id === currentUser?.id;

                            return (
                                <div key={msg.id || index} style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}>
                                    {!isMe && (
                                        <span style={{
                                            fontSize: '11px',
                                            marginBottom: '4px',
                                            marginLeft: '12px',
                                            color: 'var(--color-text-secondary)',
                                            fontWeight: '600'
                                        }}>
                                            {msg.full_name || msg.username}
                                        </span>
                                    )}
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: isMe
                                            ? 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)'
                                            : 'white',
                                        color: isMe ? 'white' : 'var(--color-charcoal)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        wordBreak: 'break-word'
                                    }}>
                                        {msg.message.split(/(\s+)/).map((part, i) => {
                                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                                            if (part.match(urlRegex)) {
                                                const isImage = part.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
                                                if (isImage) {
                                                    return (
                                                        <div key={i} style={{ marginTop: '8px', marginBottom: '8px' }}>
                                                            <img
                                                                src={part}
                                                                alt="Shared content"
                                                                style={{
                                                                    maxWidth: '200px',
                                                                    maxHeight: '200px',
                                                                    borderRadius: '12px',
                                                                    objectFit: 'cover',
                                                                    cursor: 'pointer',
                                                                    border: '2px solid rgba(255,255,255,0.2)'
                                                                }}
                                                                onClick={() => window.open(part, '_blank')}
                                                            />
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <a
                                                        key={i}
                                                        href={part}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            color: isMe ? '#e0e0e0' : 'var(--color-sage-green)',
                                                            textDecoration: 'underline'
                                                        }}
                                                    >
                                                        {part}
                                                    </a>
                                                );
                                            }
                                            return part;
                                        })}
                                    </div>
                                    <span style={{
                                        fontSize: '10px',
                                        marginTop: '4px',
                                        opacity: 0.6,
                                        marginRight: isMe ? '4px' : '0',
                                        marginLeft: !isMe ? '4px' : '0'
                                    }}>
                                        {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSendMessage}
                    style={{
                        padding: '16px',
                        background: 'white',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center'
                    }}
                >
                    <div style={{ position: 'relative', flex: 1 }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            padding: '13px 17px',
                            fontSize: '14px',
                            whiteSpace: 'pre',
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            fontFamily: 'inherit'
                        }}>
                            {newMessage.split(/(@\S+)/g).map((part, i) => (
                                part.startsWith('@') ? (
                                    <span key={i} style={{
                                        color: 'var(--color-sage-green)',
                                        fontWeight: '700',
                                        background: 'rgba(135, 169, 107, 0.15)',
                                        borderRadius: '4px',
                                        textShadow: '0 0 1px rgba(0,0,0,0.05)'
                                    }}>
                                        {part}
                                    </span>
                                ) : (
                                    <span key={i} style={{ color: 'var(--color-charcoal)' }}>{part}</span>
                                )
                            ))}
                        </div>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={newMessage ? "" : "Type a message..."}
                            disabled={!isConnected}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '24px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                background: 'transparent',
                                outline: 'none',
                                fontSize: '14px',
                                color: 'transparent',
                                caretColor: 'var(--color-charcoal)',
                                position: 'relative',
                                zIndex: 1,
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!isConnected || !newMessage.trim()}
                        style={{
                            width: '44px', height: '44px',
                            borderRadius: '50%',
                            border: 'none',
                            background: isConnected && newMessage.trim()
                                ? 'var(--color-sage-green)'
                                : 'rgba(0,0,0,0.1)',
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: isConnected && newMessage.trim() ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            boxShadow: isConnected && newMessage.trim() ? '0 4px 12px rgba(135, 169, 107, 0.4)' : 'none'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>

                <style>{`
                    @keyframes modalSlideIn {
                        from { opacity: 0; transform: scale(0.95) translateY(10px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EventChatModal;
