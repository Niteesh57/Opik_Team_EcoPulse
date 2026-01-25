import React, { useState } from 'react';
import { Home, Users, Key, Hash } from 'lucide-react';
import { roomService } from '../services/rooms';

const JoinRoom = ({ onRoomJoined }) => {
    const [formData, setFormData] = useState({
        roomId: '',
        roomNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.roomId.trim()) {
            setError('Room ID is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await roomService.joinRoom(
                formData.roomId.trim(),
                formData.roomNumber.trim() || null
            );
            
            // Call the callback to indicate successful room joining
            onRoomJoined(response);
        } catch (error) {
            console.error('Error joining room:', error);
            // Use the error message from the service, which now includes the detail
            setError(error.message || 'Failed to join room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(''); // Clear error when user starts typing
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--color-sage-green) 0%, var(--color-soft-mint) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '48px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'var(--color-soft-mint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <Users size={36} style={{ color: 'var(--color-sage-green)' }} />
                    </div>
                    
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: 'var(--color-charcoal)',
                        marginBottom: '12px'
                    }}>
                        Join Your Community
                    </h1>
                    
                    <p style={{
                        fontSize: '16px',
                        color: '#666',
                        lineHeight: '1.5',
                        marginBottom: '8px'
                    }}>
                        Welcome to our community growth and wellness platform! 
                        We allow only authenticated community members.
                    </p>
                    
                    <p style={{
                        fontSize: '14px',
                        color: '#888',
                        lineHeight: '1.4'
                    }}>
                        If you're already in the community, ask your admin to share the Room ID 
                        and please enter your room number for identification.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        color: '#dc2626',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Room ID */}
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--color-charcoal)',
                            marginBottom: '8px'
                        }}>
                            <Key size={16} />
                            Room ID *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.roomId}
                            onChange={(e) => handleInputChange('roomId', e.target.value)}
                            placeholder="Enter the Room ID provided by your admin"
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '2px solid #e5e5e5',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box',
                                fontFamily: 'monospace',
                                letterSpacing: '0.5px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-sage-green)'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                        />
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#999', 
                            marginTop: '4px',
                            fontStyle: 'italic'
                        }}>
                            Ask your community admin for this unique Room ID
                        </div>
                    </div>

                    {/* Room Number */}
                    <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--color-charcoal)',
                            marginBottom: '8px'
                        }}>
                            <Hash size={16} />
                            Your Room/Unit Number
                        </label>
                        <input
                            type="text"
                            value={formData.roomNumber}
                            onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                            placeholder="e.g., Apt 101, House A1, Unit 205"
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '2px solid #e5e5e5',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-sage-green)'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                        />
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#999', 
                            marginTop: '4px',
                            fontStyle: 'italic'
                        }}>
                            Optional: Help us identify your specific location in the community
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '18px',
                            borderRadius: '12px',
                            border: 'none',
                            background: loading ? '#ccc' : 'var(--color-sage-green)',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#6b9f7f')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--color-sage-green)')}
                    >
                        {loading ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #fff',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Joining Community...
                            </>
                        ) : (
                            <>
                                <Home size={20} />
                                Join Community Room
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    marginTop: '32px',
                    padding: '20px',
                    background: '#f9f9f9',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#666',
                    textAlign: 'left'
                }}>
                    <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        color: 'var(--color-charcoal)'
                    }}>
                        Need Help?
                    </h4>
                    <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: 0,
                        lineHeight: '1.6'
                    }}>
                        <li>• Contact your community admin for the Room ID</li>
                        <li>• Make sure you're registered as a community member</li>
                        <li>• Room numbers help us provide personalized services</li>
                    </ul>
                </div>
            </div>

            {/* Loading spinner animation */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default JoinRoom;