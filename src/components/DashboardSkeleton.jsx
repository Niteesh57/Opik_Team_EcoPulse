import React from 'react';

const DashboardSkeleton = () => {
    return (
        <>
            <style>{`
                @keyframes skeleton-shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes skeleton-pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                @keyframes skeleton-glow {
                    0%, 100% { box-shadow: 0 0 10px rgba(135, 169, 107, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(135, 169, 107, 0.4); }
                }
                @keyframes skeleton-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }
                .skeleton-shimmer {
                    background: linear-gradient(
                        90deg,
                        rgba(135, 169, 107, 0.1) 0%,
                        rgba(135, 169, 107, 0.2) 20%,
                        rgba(135, 169, 107, 0.3) 40%,
                        rgba(135, 169, 107, 0.2) 60%,
                        rgba(135, 169, 107, 0.1) 80%,
                        rgba(135, 169, 107, 0.1) 100%
                    );
                    background-size: 200% 100%;
                    animation: skeleton-shimmer 1.5s ease-in-out infinite, skeleton-pulse 2s ease-in-out infinite;
                }
                .skeleton-card {
                    animation: skeleton-glow 2s ease-in-out infinite;
                }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Events Section Skeleton */}
                <section>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}>
                        <div className="skeleton-shimmer" style={{
                            width: '150px',
                            height: '24px',
                            borderRadius: '8px'
                        }} />
                        <div className="skeleton-shimmer" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px'
                        }} />
                    </div>

                    {/* Event Cards Skeleton */}
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        overflowX: 'auto',
                        paddingBottom: '8px'
                    }} className="no-scrollbar">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="skeleton-card"
                                style={{
                                    minWidth: '340px',
                                    maxWidth: '400px',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(20px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    animationDelay: `${i * 0.2}s`
                                }}
                            >
                                {/* Image skeleton */}
                                <div className="skeleton-shimmer" style={{
                                    height: '180px',
                                    width: '100%'
                                }} />

                                {/* Content skeleton */}
                                <div style={{ padding: '16px' }}>
                                    <div className="skeleton-shimmer" style={{
                                        width: '70%',
                                        height: '20px',
                                        borderRadius: '6px',
                                        marginBottom: '12px'
                                    }} />
                                    <div className="skeleton-shimmer" style={{
                                        width: '100%',
                                        height: '14px',
                                        borderRadius: '4px',
                                        marginBottom: '8px'
                                    }} />
                                    <div className="skeleton-shimmer" style={{
                                        width: '80%',
                                        height: '14px',
                                        borderRadius: '4px',
                                        marginBottom: '16px'
                                    }} />

                                    {/* Meta info skeleton */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        <div className="skeleton-shimmer" style={{
                                            width: '100px',
                                            height: '16px',
                                            borderRadius: '4px'
                                        }} />
                                        <div className="skeleton-shimmer" style={{
                                            width: '80px',
                                            height: '16px',
                                            borderRadius: '4px'
                                        }} />
                                    </div>

                                    {/* Button skeleton */}
                                    <div className="skeleton-shimmer" style={{
                                        width: '100%',
                                        height: '42px',
                                        borderRadius: '12px'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Neighbors Section Skeleton */}
                <section>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}>
                        <div className="skeleton-shimmer" style={{
                            width: '100px',
                            height: '24px',
                            borderRadius: '8px'
                        }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div className="skeleton-shimmer" style={{
                                width: '120px',
                                height: '36px',
                                borderRadius: '10px'
                            }} />
                            <div className="skeleton-shimmer" style={{
                                width: '40px',
                                height: '36px',
                                borderRadius: '10px'
                            }} />
                        </div>
                    </div>

                    {/* Neighbor Cards Skeleton */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        overflowX: 'auto',
                        paddingBottom: '8px'
                    }} className="no-scrollbar">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="skeleton-card"
                                style={{
                                    minWidth: '160px',
                                    padding: '16px',
                                    borderRadius: '20px',
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(20px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    animationDelay: `${i * 0.15}s`
                                }}
                            >
                                {/* Avatar skeleton */}
                                <div className="skeleton-shimmer" style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%'
                                }} />

                                {/* Name skeleton */}
                                <div className="skeleton-shimmer" style={{
                                    width: '80px',
                                    height: '16px',
                                    borderRadius: '4px'
                                }} />

                                {/* Info skeleton */}
                                <div className="skeleton-shimmer" style={{
                                    width: '60px',
                                    height: '12px',
                                    borderRadius: '4px'
                                }} />

                                {/* Button skeleton */}
                                <div className="skeleton-shimmer" style={{
                                    width: '100%',
                                    height: '32px',
                                    borderRadius: '8px'
                                }} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Champions Section Skeleton */}
                <section style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderRadius: '24px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                }} className="skeleton-card">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}>
                        <div className="skeleton-shimmer" style={{
                            width: '180px',
                            height: '22px',
                            borderRadius: '6px'
                        }} />
                        <div className="skeleton-shimmer" style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px'
                        }} />
                    </div>

                    {/* Leaderboard items skeleton */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: 'rgba(135, 169, 107, 0.05)',
                                    borderRadius: '12px'
                                }}
                            >
                                {/* Rank */}
                                <div className="skeleton-shimmer" style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px'
                                }} />

                                {/* Avatar */}
                                <div className="skeleton-shimmer" style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px'
                                }} />

                                {/* Name & points */}
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton-shimmer" style={{
                                        width: '100px',
                                        height: '14px',
                                        borderRadius: '4px',
                                        marginBottom: '6px'
                                    }} />
                                    <div className="skeleton-shimmer" style={{
                                        width: '60px',
                                        height: '12px',
                                        borderRadius: '4px'
                                    }} />
                                </div>

                                {/* Points badge */}
                                <div className="skeleton-shimmer" style={{
                                    width: '50px',
                                    height: '24px',
                                    borderRadius: '12px'
                                }} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Loading Message */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    animation: 'skeleton-float 2s ease-in-out infinite'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '4px'
                    }}>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="skeleton-shimmer"
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    animationDelay: `${i * 0.2}s`
                                }}
                            />
                        ))}
                    </div>
                    <span style={{
                        fontSize: '14px',
                        color: 'var(--color-sage-green)',
                        fontWeight: '500'
                    }}>
                        Loading your community...
                    </span>
                </div>
            </div>
        </>
    );
};

export default DashboardSkeleton;
