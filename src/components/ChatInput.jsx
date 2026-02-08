import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px'; // Reset height to single line
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [message]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled && onSend) {
            onSend(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const canSend = message.trim() && !disabled;

    return (
        <>
            <style>{`
                .chat-input-container {
                    max-width: 800px;
                    align-items: flex-end; /* Align items to bottom for multiline */
                }
                @media (min-width: 768px) {
                    .chat-input-container {
                        max-width: 720px;
                        bottom: 100px !important;
                    }
                }
                @media (min-width: 1024px) {
                    .chat-input-container {
                        max-width: 900px;
                        bottom: 100px !important;
                    }
                }
                @media (min-width: 1400px) {
                    .chat-input-container {
                        max-width: 1000px;
                    }
                }
                .chat-input-field::placeholder {
                    color: var(--color-text-tertiary, #86868b);
                    font-weight: 400;
                }
                .send-button-active {
                    background: linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%) !important;
                    box-shadow: 0 4px 16px rgba(135, 169, 107, 0.4) !important;
                }
                .send-button-active:hover {
                    transform: scale(1.08) !important;
                    box-shadow: 0 6px 24px rgba(135, 169, 107, 0.5) !important;
                }
            `}</style>
            <form
                onSubmit={handleSubmit}
                className="chat-input-container"
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 32px)',
                    maxWidth: '800px',
                    padding: '8px 8px 8px 20px',
                    display: 'flex',
                    alignItems: 'flex-end', // Changed for multiline
                    gap: '12px',
                    zIndex: 101,
                    background: isFocused
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    borderRadius: '24px', // Adjusted border radius
                    border: isFocused
                        ? '1.5px solid rgba(135, 169, 107, 0.4)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: isFocused
                        ? '0 8px 40px rgba(135, 169, 107, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8) inset'
                        : '0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
            >
                {/* AI Icon */}
                <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(135, 169, 107, 0.15), rgba(135, 169, 107, 0.25))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginBottom: '6px' // Align with textarea
                }}>
                    <Sparkles size={14} color="var(--color-sage-green)" />
                </div>

                {/* Textarea Field */}
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={disabled ? "EcoPulse AI is thinking..." : "Ask the Green Sentinel..."}
                    disabled={disabled}
                    className="chat-input-field"
                    rows={1}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        flex: 1,
                        outline: 'none',
                        fontSize: '15px',
                        fontWeight: '500',
                        color: 'var(--color-charcoal)',
                        letterSpacing: '-0.01em',
                        padding: '8px 0',
                        resize: 'none',
                        maxHeight: '150px', // Limit max height
                        overflowY: 'auto',
                        lineHeight: '1.5'
                    }}
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!canSend}
                    className={canSend ? 'send-button-active' : ''}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        border: 'none',
                        background: canSend
                            ? 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)'
                            : 'rgba(0, 0, 0, 0.06)',
                        color: canSend ? 'white' : 'var(--color-text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: canSend ? 'pointer' : 'default',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        flexShrink: 0,
                        boxShadow: canSend ? '0 4px 16px rgba(135, 169, 107, 0.3)' : 'none',
                        marginBottom: '2px' // Align with textarea
                    }}
                >
                    <Send
                        size={16}
                        style={{
                            transform: 'rotate(-45deg)',
                            marginLeft: '2px',
                            marginBottom: '2px'
                        }}
                    />
                </button>
            </form>
        </>
    );
};

export default ChatInput;