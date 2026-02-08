import React from 'react';
import { Sparkles, Zap, Brain, Cpu, CheckCircle2 } from 'lucide-react';

const AIProcessingIndicator = ({ isProcessing, statusMessage, activeTool, completedTools = [] }) => {
    // Show if processing, OR if we have completed tools, OR if we have an active tool (even if paused/waiting)
    if (!isProcessing && completedTools.length === 0 && !activeTool) return null;

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                    100% { transform: scale(0.8); opacity: 0.8; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes orbit {
                    0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
                }
                @keyframes glow-pulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(135, 169, 107, 0.4), 0 0 40px rgba(135, 169, 107, 0.2); }
                    50% { box-shadow: 0 0 30px rgba(135, 169, 107, 0.6), 0 0 60px rgba(135, 169, 107, 0.3); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes tool-complete {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .ai-orb {
                    animation: orbit 3s linear infinite;
                }
                .ai-orb:nth-child(2) {
                    animation-delay: -1s;
                    animation-duration: 4s;
                }
                .ai-orb:nth-child(3) {
                    animation-delay: -2s;
                    animation-duration: 5s;
                }
            `}</style>

            <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                animation: 'fade-in-up 0.4s ease-out'
            }}>
                {/* AI Avatar with Glowing Effect */}
                <div style={{
                    position: 'relative',
                    width: '48px',
                    height: '48px',
                    flexShrink: 0
                }}>
                    {/* Outer glow ring */}
                    <div style={{
                        position: 'absolute',
                        inset: '-8px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(135, 169, 107, 0.3) 0%, transparent 70%)',
                        animation: 'pulse-ring 2s ease-in-out infinite'
                    }} />

                    {/* Orbiting particles */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="ai-orb" style={{
                            position: 'absolute',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #87A96B 0%, #5d7d4a 100%)',
                            boxShadow: '0 0 10px rgba(135, 169, 107, 0.6)'
                        }} />
                        <div className="ai-orb" style={{
                            position: 'absolute',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #a8c686 0%, #87A96B 100%)',
                            boxShadow: '0 0 8px rgba(135, 169, 107, 0.5)'
                        }} />
                        <div className="ai-orb" style={{
                            position: 'absolute',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#c4d9af',
                            boxShadow: '0 0 6px rgba(135, 169, 107, 0.4)'
                        }} />
                    </div>

                    {/* Main avatar */}
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'glow-pulse 2s ease-in-out infinite, breathe 3s ease-in-out infinite',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <Brain size={24} color="white" style={{ animation: 'float 3s ease-in-out infinite' }} />
                    </div>
                </div>

                {/* Content Container */}
                <div style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderRadius: '20px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(135, 169, 107, 0.1) inset',
                    animation: 'fade-in-up 0.5s ease-out'
                }}>
                    {/* Status Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: completedTools.length > 0 || activeTool ? '16px' : '0'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(135, 169, 107, 0.2) 0%, rgba(135, 169, 107, 0.1) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Sparkles size={16} color="var(--color-sage-green)" style={{ animation: 'float 2s ease-in-out infinite' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--color-charcoal)',
                                marginBottom: '2px'
                            }}>
                                {statusMessage || 'Processing your request...'}
                            </div>
                            <div style={{
                                height: '3px',
                                borderRadius: '3px',
                                background: 'rgba(135, 169, 107, 0.2)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, var(--color-sage-green), transparent)',
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 1.5s ease-in-out infinite'
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Tool Steps */}
                    {(completedTools.length > 0 || activeTool) && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            {/* Completed Tools */}
                            {completedTools.map((tool, idx) => (
                                <div
                                    key={`completed-${idx}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 14px',
                                        background: 'rgba(135, 169, 107, 0.1)',
                                        borderRadius: '12px',
                                        animation: 'tool-complete 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(135, 169, 107, 0.3)'
                                    }}>
                                        <CheckCircle2 size={14} color="white" />
                                    </div>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--color-charcoal)'
                                    }}>
                                        {tool}
                                    </span>
                                    <span style={{
                                        marginLeft: 'auto',
                                        fontSize: '11px',
                                        color: 'var(--color-sage-green)',
                                        fontWeight: '600'
                                    }}>
                                        ✓ Done
                                    </span>
                                </div>
                            ))}

                            {/* Active Tool */}
                            {activeTool && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    background: 'linear-gradient(90deg, rgba(135, 169, 107, 0.15), rgba(135, 169, 107, 0.05))',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(135, 169, 107, 0.2)',
                                    animation: 'fade-in-up 0.3s ease-out'
                                }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'rgba(135, 169, 107, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        {/* Spinning border */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '50%',
                                            border: '2px solid transparent',
                                            borderTopColor: 'var(--color-sage-green)',
                                            animation: 'orbit 1s linear infinite'
                                        }} />
                                        <Zap size={12} color="var(--color-sage-green)" />
                                    </div>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--color-charcoal)'
                                    }}>
                                        {activeTool.description || activeTool.name}
                                    </span>
                                    <div style={{
                                        marginLeft: 'auto',
                                        display: 'flex',
                                        gap: '3px'
                                    }}>
                                        {[0, 1, 2].map(i => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: '4px',
                                                    height: '4px',
                                                    borderRadius: '50%',
                                                    background: 'var(--color-sage-green)',
                                                    animation: `pulse-ring 1s ease-in-out infinite`,
                                                    animationDelay: `${i * 0.2}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AIProcessingIndicator;
