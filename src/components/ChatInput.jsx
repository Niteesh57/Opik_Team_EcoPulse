import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
    const [message, setMessage] = React.useState('');

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

    return (
        <>
            <style>{`
                .chat-input-form {
                    max-width: 600px;
                }
                @media (min-width: 768px) {
                    .chat-input-form {
                        max-width: 700px;
                        bottom: 110px !important;
                    }
                }
                @media (min-width: 1024px) {
                    .chat-input-form {
                        max-width: 900px;
                        bottom: 110px !important;
                    }
                }
            `}</style>
            <form onSubmit={handleSubmit} className="glass-panel chat-input-form" style={{
                position: 'fixed',
                bottom: '90px',
                left: '20px',
                right: '20px',
                maxWidth: '600px',
                margin: '0 auto',
                padding: '12px 12px 12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 101
            }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? "EcoPulse AI is thinking..." : "Ask the Green Sentinel..."}
                    disabled={disabled}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        flex: 1,
                        outline: 'none',
                        fontSize: '15px',
                        color: 'var(--color-charcoal)',
                        fontWeight: '400'
                    }}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        background: (!message.trim() || disabled) ? '#ccc' : 'var(--color-sage-green)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (!message.trim() || disabled) ? 'default' : 'pointer',
                        transition: 'background 0.2s ease',
                        flexShrink: 0
                    }}
                >
                    <Send size={18} />
                </button>
            </form>
        </>
    );
};

export default ChatInput;
