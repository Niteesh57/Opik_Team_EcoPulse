import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { eventsService } from '../services/eventsService';
import { authService } from '../services/auth';
import { usersService } from '../services/usersService';

const EventChatModal = ({ isOpen, onClose, eventId, eventName, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [myUserId, setMyUserId] = useState(null);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Get current user ID on mount - fetch from /users/me API
    useEffect(() => {
        const fetchCurrentUser = async () => {
            // First check localStorage for cached user ID
            try {
                const storedUserId = localStorage.getItem('currentUserId');
                if (storedUserId) {
                    setMyUserId(parseInt(storedUserId, 10));
                }
            } catch (e) {
                // Ignore localStorage errors
            }

            // Always fetch from API to ensure we have the latest user ID
            try {
                const userData = await usersService.getMe();
                if (userData && userData.id) {
                    const userId = userData.id;
                    setMyUserId(userId);
                    // Save to localStorage for quick access
                    localStorage.setItem('currentUserId', String(userId));
                    // Also save full user data
                    localStorage.setItem('user', JSON.stringify(userData));
                    console.log('Current user ID fetched:', userId);
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                // Fallback to prop or localStorage
                if (currentUser?.id || currentUser?.user_id) {
                    setMyUserId(currentUser?.id || currentUser?.user_id);
                } else {
                    try {
                        const storedUser = localStorage.getItem('user');
                        if (storedUser) {
                            const parsed = JSON.parse(storedUser);
                            if (parsed?.id || parsed?.user_id) {
                                setMyUserId(parsed?.id || parsed?.user_id);
                            }
                        }
                    } catch (e) {
                        console.error('Failed to parse stored user:', e);
                    }
                }
            }
        };

        if (isOpen) {
            fetchCurrentUser();
        }
    }, [currentUser, isOpen]);

    // Helper to detect YouTube URL and extract video ID
    const getYouTubeVideoId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    // Helper to detect if URL is an image
    const isImageUrl = (url) => {
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url) ||
            url.includes('i.ibb.co') ||
            url.includes('imgur.com') ||
            url.includes('cloudinary.com');
    };

    const ShareButtons = ({ url }) => {
        const shareOnFacebook = () => {
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        };

        const shareOnInstagram = () => {
            // Instagram does not support direct web sharing with a pre-filled image.
            // This will open Instagram, and the user can manually post.
            // A better UX would be to copy the link or guide the user.
            window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
        };

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '8px',
                padding: '4px 8px',
                background: 'rgba(0,0,0,0.03)',
                borderRadius: '8px',
                alignSelf: 'flex-start'
            }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Share:</span>
                <button onClick={shareOnFacebook} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </button>
                <button onClick={shareOnInstagram} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </button>
            </div>
        );
    };

    // Markdown components with custom styling
    const getMarkdownComponents = (isMe) => ({
        // Tables
        table: ({ children }) => (
            <div style={{
                overflowX: 'auto',
                marginTop: '8px',
                marginBottom: '8px',
                borderRadius: '8px',
                border: `1px solid ${isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    minWidth: '300px'
                }}>
                    {children}
                </table>
            </div>
        ),
        thead: ({ children }) => (
            <thead style={{
                background: isMe ? 'rgba(255,255,255,0.15)' : 'rgba(135, 169, 107, 0.15)'
            }}>
                {children}
            </thead>
        ),
        th: ({ children }) => (
            <th style={{
                padding: '8px 10px',
                textAlign: 'left',
                borderBottom: `1px solid ${isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                fontWeight: '600',
                fontSize: '11px',
                whiteSpace: 'nowrap'
            }}>
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td style={{
                padding: '6px 10px',
                borderBottom: `1px solid ${isMe ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                fontSize: '12px',
                lineHeight: '1.4'
            }}>
                {children}
            </td>
        ),
        // Links - check for YouTube and images
        a: ({ href, children }) => {
            const ytId = getYouTubeVideoId(href);
            if (ytId) {
                return (
                    <div style={{
                        marginTop: '8px',
                        marginBottom: '8px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        minWidth: '280px'
                    }}>
                        <iframe
                            width="100%"
                            height="180"
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title="YouTube video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ borderRadius: '12px' }}
                        />
                    </div>
                );
            }
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: isMe ? '#a8e6cf' : 'var(--color-sage-green)',
                        textDecoration: 'underline'
                    }}
                >
                    {children}
                </a>
            );
        },
        // Images
        img: ({ src, alt }) => (
            <div style={{ marginTop: '8px', marginBottom: '8px', minWidth: '200px' }}>
                <img
                    src={src}
                    alt={alt || 'Shared image'}
                    style={{
                        maxWidth: '100%',
                        minWidth: '200px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                    }}
                    onClick={() => window.open(src, '_blank')}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <ShareButtons url={src} />
            </div>
        ),
        // Code blocks
        code: ({ inline, children }) => (
            <code style={{
                background: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                padding: inline ? '2px 6px' : '8px 12px',
                borderRadius: inline ? '4px' : '8px',
                fontSize: '12px',
                display: inline ? 'inline' : 'block',
                overflowX: 'auto',
                whiteSpace: inline ? 'nowrap' : 'pre-wrap'
            }}>
                {children}
            </code>
        ),
        // Strong/bold with @mention detection
        strong: ({ children }) => (
            <strong style={{ fontWeight: '600' }}>{children}</strong>
        ),
        // Paragraphs
        p: ({ children }) => (
            <p style={{ margin: '4px 0', lineHeight: '1.5' }}>{children}</p>
        ),
        // Lists
        ul: ({ children }) => (
            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>{children}</ul>
        ),
        ol: ({ children }) => (
            <ol style={{ margin: '4px 0', paddingLeft: '20px' }}>{children}</ol>
        ),
        li: ({ children }) => (
            <li style={{ marginBottom: '2px' }}>{children}</li>
        )
    });

    // Process @mentions in text before rendering
    const processAtMentions = (text, isMe) => {
        if (!text) return text;
        return text.replace(/@(\w+)/g, (match) => {
            // Wrap in a special marker that we'll style
            return `**${match}**`;
        });
    };

    // Render message with full markdown support
    const renderMessageContent = (text, isMe) => {
        if (!text) return text;

        // Pre-process @mentions to make them bold
        const processedText = processAtMentions(text, isMe);

        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={getMarkdownComponents(isMe)}
            >
                {processedText}
            </ReactMarkdown>
        );
    };

    // Fetch initial history
    useEffect(() => {
        if (!isOpen || !eventId) return;

        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const history = await eventsService.getEventMessages(eventId);
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
                maxWidth: '600px',
                height: '90vh',
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
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            gap: '20px'
                        }}>
                            {/* Animated spinner */}
                            <div style={{
                                position: 'relative',
                                width: '60px',
                                height: '60px'
                            }}>
                                {/* Outer rotating circle */}
                                <div style={{
                                    position: 'absolute',
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    border: '3px solid rgba(135, 169, 107, 0.2)',
                                    borderTop: '3px solid var(--color-sage-green)',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                
                                {/* Inner pulsing circle */}
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(135, 169, 107, 0.1)',
                                    animation: 'pulse 2s ease-in-out infinite'
                                }} />
                            </div>
                            
                            {/* Loading text */}
                            <div style={{ textAlign: 'center' }}>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'var(--color-charcoal)',
                                    margin: '0 0 6px 0'
                                }}>
                                    Loading Chat
                                </p>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'var(--color-text-secondary)',
                                    margin: 0
                                }}>
                                    Retrieving messages...
                                </p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--color-text-secondary)' }}>
                            <p>No messages yet.</p>
                            <p style={{ fontSize: '13px' }}>Be the first to say hello! 👋</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            // Check if current user is sender using multiple methods
                            const msgUserId = msg.user_id;
                            const propUserId = currentUser?.id || currentUser?.user_id;

                            // Compare with loose equality to handle type differences
                            const isMe = myUserId ?
                                (msgUserId == myUserId) :
                                (propUserId && msgUserId == propUserId);

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
                                        {renderMessageContent(msg.message, isMe)}
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
                    <div style={{ flex: 1, position: 'relative' }}>
                        {/* Highlight overlay - shows only backgrounds, all text is transparent */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                padding: '12px 16px',
                                borderRadius: '24px',
                                background: '#F8F9FA',
                                border: '1px solid transparent',
                                fontSize: '14px',
                                whiteSpace: 'pre',
                                overflow: 'hidden',
                                pointerEvents: 'none',
                                fontFamily: 'inherit',
                                lineHeight: 'normal'
                            }}
                        >
                            {newMessage.split(/(@\w+)/g).map((part, i) => {
                                if (part.startsWith('@')) {
                                    return (
                                        <span key={i} style={{
                                            background: 'rgba(135, 169, 107, 0.3)',
                                            padding: '2px 1px',
                                            borderRadius: '4px',
                                            color: 'transparent'
                                        }}>
                                            {part}
                                        </span>
                                    );
                                }
                                return <span key={i} style={{ color: 'transparent' }}>{part}</span>;
                            })}
                        </div>
                        {/* Actual input */}
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message... (use @AI to mention)"
                            disabled={!isConnected}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '24px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                background: 'transparent',
                                outline: 'none',
                                fontSize: '14px',
                                position: 'relative',
                                zIndex: 1,
                                fontFamily: 'inherit',
                                caretColor: 'var(--color-charcoal)'
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
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { 
                            transform: scale(1);
                            opacity: 0.1;
                        }
                        50% { 
                            transform: scale(1.2);
                            opacity: 0.2;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EventChatModal;
