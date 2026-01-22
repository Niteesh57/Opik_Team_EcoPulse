import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = () => {
    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            bottom: '100px', /* Above nav */
            left: '20px',
            right: '20px',
            maxWidth: '440px', /* Container width - padding */
            margin: '0 auto',
            padding: '8px 8px 8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 90
        }}>
            <input
                type="text"
                placeholder="Ask the Green Sentinel..."
                style={{
                    border: 'none',
                    background: 'transparent',
                    flex: 1,
                    outline: 'none',
                    fontSize: '14px',
                    color: 'var(--color-charcoal)'
                }}
            />
            <button style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--color-sage-green)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}>
                <Send size={16} />
            </button>
        </div>
    );
};

export default ChatInput;
