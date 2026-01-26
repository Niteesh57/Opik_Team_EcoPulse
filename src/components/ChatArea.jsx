import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';

const ChatArea = ({ messages, loading, streamingMessage }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage]);

    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            paddingBottom: '120px', // Space for input
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }} className="no-scrollbar">

            {messages.length === 0 && !loading && !streamingMessage ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    opacity: 0.6,
                    gap: '16px'
                }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'var(--color-soft-mint)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Bot size={32} color="var(--color-sage-green)" />
                    </div>
                    <p>Start a conversation with EcoPulse AI</p>
                </div>
            ) : (
                <>
                    {messages.map((msg, idx) => (
                        <div key={msg.id || idx} style={{
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '50%',
                                background: msg.role === 'user' ? 'var(--color-charcoal)' : 'var(--color-sage-green)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {msg.role === 'user' ? (
                                    <User size={16} color="white" />
                                ) : (
                                    <Bot size={16} color="white" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div style={{
                                maxWidth: '80%',
                                padding: '12px 16px',
                                borderRadius: msg.role === 'user' ?
                                    '20px 20px 4px 20px' :
                                    '20px 20px 20px 4px',
                                background: msg.role === 'user' ?
                                    'var(--color-charcoal)' :
                                    'white',
                                color: msg.role === 'user' ? 'white' : 'var(--color-charcoal)',
                                boxShadow: msg.role !== 'user' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                fontSize: '15px',
                                lineHeight: '1.5'
                            }}>
                                {msg.role === 'user' ? (
                                    <p style={{ margin: 0 }}>{msg.user_message || msg.content}</p>
                                ) : (
                                    <div className="markdown-content">
                                        <ReactMarkdown>
                                            {msg.ai_message || msg.content || ''}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Streaming Message */}
                    {streamingMessage && (
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '50%',
                                background: 'var(--color-sage-green)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Bot size={16} color="white" />
                            </div>
                            <div style={{
                                maxWidth: '80%',
                                padding: '12px 16px',
                                borderRadius: '20px 20px 20px 4px',
                                background: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                fontSize: '15px',
                                lineHeight: '1.5'
                            }}>
                                <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {loading && !streamingMessage && (
                        <div style={{ display: 'flex', gap: '4px', marginLeft: '44px' }}>
                            <div className="typing-dot" style={{ animationDelay: '0s' }} />
                            <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                            <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                        </div>
                    )}
                </>
            )}
            <div ref={messagesEndRef} />

            <style>{`
                .typing-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--color-text-secondary);
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out;
                    opacity: 0.6;
                }
                @keyframes typing {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.4); }
                }
                /* Basic markdown styles */
                .markdown-content p { margin: 0 0 8px 0; }
                .markdown-content p:last-child { margin: 0; }
                .markdown-content code { 
                    background: rgba(0,0,0,0.1); 
                    padding: 2px 4px; 
                    border-radius: 4px; 
                    font-size: 0.9em;
                }
                .markdown-content pre {
                    background: #f5f5f5;
                    padding: 12px;
                    border-radius: 8px;
                    overflow-x: auto;
                }
            `}</style>
        </div>
    );
};

export default ChatArea;
