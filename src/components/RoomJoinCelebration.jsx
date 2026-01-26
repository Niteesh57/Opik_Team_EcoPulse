import React, { useEffect, useState } from 'react';
import { Sparkles, MapPin, Users } from 'lucide-react';

const RoomJoinCelebration = ({ roomData, onComplete = () => { } }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 500),
            setTimeout(() => setStep(2), 2000),
            setTimeout(() => setStep(3), 4000),
            setTimeout(() => setStep(4), 6500),
            setTimeout(() => {
                setStep(5);
                onComplete();
            }, 10000)
        ];

        return () => timers.forEach(timer => clearTimeout(timer));
    }, [onComplete]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, #87A96B 0%, #6B8E50 50%, #4A6B3A 100%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Animated Background Particles */}
            <div className="particles-container">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>

            {/* Content Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                padding: '40px',
                textAlign: 'center',
                color: 'white',
                minHeight: '400px'
            }}>
                {/* Step 1: Welcome */}
                <div className={`slide ${step === 1 ? 'active' : ''}`}>
                    <Sparkles size={80} style={{ margin: '0 auto 24px', opacity: 0.9 }} />
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '800',
                        marginBottom: '16px',
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}>
                        Welcome to EcoPulse!
                    </h1>
                    <p style={{ fontSize: '20px', opacity: 0.9 }}>
                        You're now part of the community
                    </p>
                </div>

                {/* Step 2: Room Name */}
                <div className={`slide ${step === 2 ? 'active' : ''}`}>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '40px',
                        border: '2px solid rgba(255,255,255,0.2)'
                    }}>
                        <Users size={60} style={{ margin: '0 auto 20px', opacity: 0.9 }} />
                        <h2 style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            marginBottom: '12px'
                        }}>
                            {roomData?.room_name || 'Community Room'}
                        </h2>
                        {roomData?.room_number && (
                            <p style={{
                                fontSize: '20px',
                                opacity: 0.9,
                                fontWeight: '500',
                                marginTop: '8px'
                            }}>
                                Room #{roomData.room_number}
                            </p>
                        )}
                    </div>
                </div>

                {/* Step 3: Description */}
                <div className={`slide ${step === 3 ? 'active' : ''}`}>
                    {roomData?.room_description && (
                        <p style={{
                            fontSize: '22px',
                            fontWeight: '400',
                            lineHeight: '1.6',
                            maxWidth: '500px',
                            margin: '0 auto',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            fontStyle: 'italic'
                        }}>
                            {roomData.room_description}
                        </p>
                    )}
                </div>

                {/* Step 4: Location */}
                <div className={`slide ${step === 4 ? 'active' : ''}`}>
                    {roomData?.room_location && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            fontSize: '20px',
                            opacity: 0.9
                        }}>
                            <MapPin size={24} />
                            <span>{roomData.room_location}</span>
                        </div>
                    )}
                </div>

                {/* Progress Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px'
                }}>
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            style={{
                                width: step >= i ? '40px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: step >= i ? 'white' : 'rgba(255,255,255,0.3)',
                                transition: 'all 0.5s ease'
                            }}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                .particles-container {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    pointer-events: none;
                }

                .particle {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    opacity: 0;
                    animation: float-up linear infinite;
                }

                @keyframes float-up {
                    0% {
                        transform: translateY(100vh) scale(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) scale(1);
                        opacity: 0;
                    }
                }

                .slide {
                    opacity: 0;
                    transition: opacity 0.6s ease;
                    pointer-events: none;
                }

                .slide.active {
                    opacity: 1;
                    pointer-events: auto;
                }

                @media (max-width: 768px) {
                    .slide h1 {
                        font-size: 36px !important;
                    }
                    .slide h2 {
                        font-size: 28px !important;
                    }
                    .slide p {
                        font-size: 18px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default RoomJoinCelebration;