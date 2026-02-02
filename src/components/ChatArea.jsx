import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Loader2, CheckCircle2, Circle, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import AIProcessingIndicator from './AIProcessingIndicator';
import { api } from '../services/api';

const ChatArea = ({ messages, loading, streamingMessage, toolSteps, statusMessage, waitingForUser }) => {
    const messagesEndRef = useRef(null);
    const [feedbackStates, setFeedbackStates] = useState({});
    const [feedbackLoading, setFeedbackLoading] = useState({});

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage, toolSteps, waitingForUser]);

    // Initialize feedback states from messages
    useEffect(() => {
        const initialFeedback = {};
        messages.forEach(msg => {
            if (msg.id && msg.role === 'assistant') {
                initialFeedback[msg.id] = {
                    liked: msg.liked || false,
                    disliked: msg.disliked || false
                };
            }
        });
        setFeedbackStates(initialFeedback);
    }, [messages]);

    const submitFeedback = async (messageId, isLiked) => {
        setFeedbackLoading(prev => ({ ...prev, [messageId]: true }));
        
        try {
            const currentState = feedbackStates[messageId] || { liked: false, disliked: false };
            
            // Determine new state
            let newLiked, newDisliked;
            if (isLiked) {
                newLiked = !currentState.liked; // Toggle like
                newDisliked = false;
            } else {
                newLiked = false;
                newDisliked = !currentState.disliked; // Toggle dislike
            }
            
            const response = await api.patch(`/chat/messages/${messageId}/feedback`, {
                liked: newLiked || null,
                disliked: newDisliked || null
            });
            
            // Update local state with response
            setFeedbackStates(prev => ({
                ...prev,
                [messageId]: {
                    liked: response.liked || false,
                    disliked: response.disliked || false
                }
            }));
            
        } catch (error) {
            console.error('Error submitting feedback:', error);
            // Could show a toast notification here
        } finally {
            setFeedbackLoading(prev => ({ ...prev, [messageId]: false }));
        }
    };

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
                        <div key={msg.id || idx} className="message-item" style={{
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            gap: '14px',
                            alignItems: 'flex-start',
                            maxWidth: '100%'
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #1d1d1f 0%, #3a3a3c 100%)'
                                    : 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: msg.role === 'user'
                                    ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                                    : '0 4px 12px rgba(135, 169, 107, 0.3)'
                            }}>
                                {msg.role === 'user' ? (
                                    <User size={18} color="white" />
                                ) : (
                                    <Bot size={18} color="white" />
                                )}
                            </div>

                            {/* Message Bubble and Feedback Container */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: 'min(75%, 600px)' }}>
                                {/* Message Bubble */}
                                <div style={{
                                    padding: '14px 18px',
                                    borderRadius: msg.role === 'user' ?
                                        '20px 20px 6px 20px' :
                                        '20px 20px 20px 6px',
                                    background: msg.role === 'user' ?
                                        'linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 100%)' :
                                        'rgba(255, 255, 255, 0.9)',
                                    color: msg.role === 'user' ? 'white' : 'var(--color-charcoal)',
                                    boxShadow: msg.role === 'user'
                                        ? '0 4px 16px rgba(0, 0, 0, 0.12)'
                                        : '0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
                                    backdropFilter: msg.role !== 'user' ? 'blur(20px)' : 'none',
                                    WebkitBackdropFilter: msg.role !== 'user' ? 'blur(20px)' : 'none',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    letterSpacing: '-0.01em'
                                }}>
                                {msg.role === 'user' ? (
                                    <p style={{ margin: 0, color: 'inherit' }}>{msg.user_message || msg.content}</p>
                                ) : (
                                    <div className="markdown-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                // Tables
                                                table: ({ children }) => (
                                                    <div style={{
                                                        overflowX: 'auto',
                                                        marginTop: '8px',
                                                        marginBottom: '8px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(0,0,0,0.1)'
                                                    }}>
                                                        <table style={{
                                                            width: '100%',
                                                            borderCollapse: 'collapse',
                                                            fontSize: '13px',
                                                            minWidth: '300px'
                                                        }}>
                                                            {children}
                                                        </table>
                                                    </div>
                                                ),
                                                thead: ({ children }) => (
                                                    <thead style={{ background: 'rgba(135, 169, 107, 0.15)' }}>
                                                        {children}
                                                    </thead>
                                                ),
                                                th: ({ children }) => (
                                                    <th style={{
                                                        padding: '8px 10px',
                                                        textAlign: 'left',
                                                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                                                        fontWeight: '600',
                                                        fontSize: '12px',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {children}
                                                    </th>
                                                ),
                                                td: ({ children }) => (
                                                    <td style={{
                                                        padding: '6px 10px',
                                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                        fontSize: '12px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {children}
                                                    </td>
                                                ),
                                                // Code blocks
                                                code: ({ inline, children }) => (
                                                    <code style={{
                                                        background: 'rgba(0,0,0,0.06)',
                                                        padding: inline ? '2px 6px' : '8px 12px',
                                                        borderRadius: inline ? '4px' : '8px',
                                                        fontSize: '13px',
                                                        display: inline ? 'inline' : 'block',
                                                        overflowX: 'auto'
                                                    }}>
                                                        {children}
                                                    </code>
                                                ),
                                                // Images
                                                img: ({ src, alt }) => (
                                                    <img
                                                        src={src}
                                                        alt={alt || 'Image'}
                                                        style={{
                                                            maxWidth: '100%',
                                                            minWidth: '200px',
                                                            borderRadius: '12px',
                                                            marginTop: '8px',
                                                            marginBottom: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => window.open(src, '_blank')}
                                                    />
                                                ),
                                                // Paragraphs
                                                p: ({ children }) => (
                                                    <p style={{ margin: '4px 0' }}>{children}</p>
                                                )
                                            }}
                                        >
                                            {msg.ai_message || msg.content || ''}
                                        </ReactMarkdown>
                                    </div>
                                )}
                                </div>
                                
                                {/* Feedback Buttons - Only for AI messages */}
                                {msg.role === 'assistant' && msg.id && (
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '8px', 
                                        paddingLeft: '4px',
                                        opacity: feedbackLoading[msg.id] ? 0.5 : 1
                                    }}>
                                        <button
                                            onClick={() => submitFeedback(msg.id, true)}
                                            disabled={feedbackLoading[msg.id]}
                                            style={{
                                                background: feedbackStates[msg.id]?.liked 
                                                    ? 'rgba(34, 197, 94, 0.15)' 
                                                    : 'rgba(0, 0, 0, 0.04)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '6px 10px',
                                                cursor: feedbackLoading[msg.id] ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!feedbackLoading[msg.id]) {
                                                    e.currentTarget.style.background = feedbackStates[msg.id]?.liked
                                                        ? 'rgba(34, 197, 94, 0.25)'
                                                        : 'rgba(0, 0, 0, 0.08)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = feedbackStates[msg.id]?.liked
                                                    ? 'rgba(34, 197, 94, 0.15)'
                                                    : 'rgba(0, 0, 0, 0.04)';
                                            }}
                                        >
                                            <ThumbsUp 
                                                size={14} 
                                                color={feedbackStates[msg.id]?.liked ? '#22c55e' : '#666'}
                                                fill={feedbackStates[msg.id]?.liked ? '#22c55e' : 'none'}
                                            />
                                        </button>
                                        
                                        <button
                                            onClick={() => submitFeedback(msg.id, false)}
                                            disabled={feedbackLoading[msg.id]}
                                            style={{
                                                background: feedbackStates[msg.id]?.disliked 
                                                    ? 'rgba(239, 68, 68, 0.15)' 
                                                    : 'rgba(0, 0, 0, 0.04)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '6px 10px',
                                                cursor: feedbackLoading[msg.id] ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!feedbackLoading[msg.id]) {
                                                    e.currentTarget.style.background = feedbackStates[msg.id]?.disliked
                                                        ? 'rgba(239, 68, 68, 0.25)'
                                                        : 'rgba(0, 0, 0, 0.08)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = feedbackStates[msg.id]?.disliked
                                                    ? 'rgba(239, 68, 68, 0.15)'
                                                    : 'rgba(0, 0, 0, 0.04)';
                                            }}
                                        >
                                            <ThumbsDown 
                                                size={14} 
                                                color={feedbackStates[msg.id]?.disliked ? '#ef4444' : '#666'}
                                                fill={feedbackStates[msg.id]?.disliked ? '#ef4444' : 'none'}
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* AI Processing Indicator - Glassy Animated Design */}
                    {((toolSteps && toolSteps.length > 0) || statusMessage) && (
                        <AIProcessingIndicator
                            isProcessing={loading}
                            statusMessage={statusMessage}
                            activeTool={toolSteps?.find(s => s.loading)}
                            completedTools={toolSteps?.filter(s => !s.loading).map(s => s.description) || []}
                        />
                    )}

                    {/* Unified AI Response Area (Streaming or Loading) */}
                    {(loading || streamingMessage) && !statusMessage && (
                        <div className="streaming-container" style={{
                            display: 'flex',
                            gap: '14px',
                            alignItems: 'flex-start',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(135, 169, 107, 0.3)'
                            }}>
                                <Bot size={18} color="white" />
                            </div>
                            
                            <div style={{
                                maxWidth: 'min(75%, 600px)',
                                padding: '14px 18px',
                                borderRadius: '20px 20px 20px 6px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
                                fontSize: '15px',
                                lineHeight: '1.6',
                                letterSpacing: '-0.01em',
                                transition: 'all 0.3s ease'
                            }}>
                                {streamingMessage ? (
                                    <div className="markdown-content">
                                        <ReactMarkdown components={{
                                            p: ({ children }) => <p className="streaming-p">{children}</p>
                                        }}>
                                            {streamingMessage}
                                        </ReactMarkdown>
                                        <span className="streaming-cursor">▍</span>
                                    </div>
                                ) : (
                                    /* The dots now live INSIDE the bubble until text arrives */
                                    <div style={{ display: 'flex', gap: '4px', padding: '4px 0' }}>
                                        <div className="typing-dot" style={{ animationDelay: '0s' }} />
                                        <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                                        <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Waiting for User Input */}
                    {waitingForUser && (
                        <div style={{
                            marginLeft: '44px',
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, rgba(135, 169, 107, 0.15) 0%, rgba(135, 169, 107, 0.08) 100%)',
                            border: '2px solid var(--color-sage-green)',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            animation: 'waitingPulse 2s ease-in-out infinite'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div className="waiting-icon-wrapper">
                                    <MessageSquare size={18} color="var(--color-sage-green)" />
                                </div>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'var(--color-sage-green)'
                                }}>
                                    Your input is needed
                                </span>
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '13px',
                                color: 'var(--color-charcoal)',
                                opacity: 0.8,
                                lineHeight: '1.5'
                            }}>
                                {waitingForUser.question || 'Please type your response below to continue the conversation...'}
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '4px'
                            }}>
                                <div className="input-arrow-animation">
                                    <span style={{ fontSize: '16px' }}>↓</span>
                                </div>
                                <span style={{
                                    fontSize: '12px',
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    Type in the message box below
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
            <div ref={messagesEndRef} />

            <style>{`
                .message-item {
                    animation: none;
                    opacity: 1;
                }
                
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
                
                .spinning {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .pulsing {
                    animation: pulse 1.5s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                
                /* Bubble entry animation for EcoPulse feel */
                @keyframes bubbleEntry {
                    from { 
                        opacity: 0; 
                        transform: translateY(10px) scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                
                .streaming-container {
                    animation: none;
                    opacity: 1;
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
                
                /* Waiting for user input animations */
                @keyframes waitingPulse {
                    0%, 100% { 
                        box-shadow: 0 0 0 0 rgba(135, 169, 107, 0.4);
                    }
                    50% { 
                        box-shadow: 0 0 0 8px rgba(135, 169, 107, 0);
                    }
                }
                
                .waiting-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: iconBounce 1s ease-in-out infinite;
                }
                
                @keyframes iconBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                
                .input-arrow-animation {
                    animation: arrowBounce 1.5s ease-in-out infinite;
                    color: var(--color-sage-green);
                }
                
                @keyframes arrowBounce {
                    0%, 100% { 
                        transform: translateY(0);
                        opacity: 1;
                    }
                    50% { 
                        transform: translateY(5px);
                        opacity: 0.6;
                    }
                }

                .streaming-cursor {
                    display: inline-block;
                    color: var(--color-sage-green);
                    margin-left: 2px;
                    animation: blink 1s step-end infinite;
                    vertical-align: baseline;
                }

                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }

                .streaming-p {
                    display: inline; /* Keep paragraph inline to allow cursor to sit next to it */
                }
            `}</style>
        </div>
    );
};

export default ChatArea;
