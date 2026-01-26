import React from 'react';
import { Home, Users, BarChart2 } from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange }) => {
    return (
        <>
            <style>{`
                .bottom-nav {
                    max-width: 480px;
                }
                @media (min-width: 768px) {
                    .bottom-nav {
                        max-width: 600px;
                    }
                }
                @media (min-width: 1024px) {
                    .bottom-nav {
                        max-width: 800px;
                    }
                }
            `}</style>
            <div className="bottom-nav" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                maxWidth: '480px',
                margin: '0 auto',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingBottom: '10px',
                zIndex: 100,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
            }}>
                {/* Nav Item 1 - Home */}
                <div
                    onClick={() => onTabChange && onTabChange('home')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        color: activeTab === 'dashboard' ? 'var(--color-sage-green)' : '#999',
                        cursor: 'pointer'
                    }}
                >
                    <Home size={24} />
                    <span style={{ fontSize: '10px', fontWeight: '500' }}>Home</span>
                </div>

                {/* Nav Item 2 - Community */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#999',
                    cursor: 'pointer'
                }}>
                    <Users size={24} />
                    <span style={{ fontSize: '10px', fontWeight: '500' }}>Community</span>
                </div>

                {/* Nav Item 3 - Stats */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#999',
                    cursor: 'pointer'
                }}>
                    <BarChart2 size={24} />
                    <span style={{ fontSize: '10px', fontWeight: '500' }}>Stats</span>
                </div>
            </div>
        </>
    );
};

export default BottomNavigation;
