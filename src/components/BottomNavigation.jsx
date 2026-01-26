import React from 'react';
import { Home, Users, BarChart2, Camera } from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange }) => {
    return (
        <div style={{
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
            paddingBottom: '10px', // Safe area
            zIndex: 100,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
        }}>
            {/* Nav Item 1 */}
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

            {/* Nav Item 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#999', cursor: 'pointer' }}>
                <Users size={24} />
                <span style={{ fontSize: '10px', fontWeight: '500' }}>Community</span>
            </div>

            {/* FAB Placeholder Space - Only if FAB is visible */}
            {activeTab !== 'chat' && <div style={{ width: '48px' }} />}

            {/* Nav Item 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#999', cursor: 'pointer' }}>
                <BarChart2 size={24} />
                <span style={{ fontSize: '10px', fontWeight: '500' }}>Stats</span>
            </div>

            {/* FAB - Hide in chat mode */}
            {activeTab !== 'chat' && (
                <div style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-sage-green), #6B8E50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(135, 169, 107, 0.4)',
                    cursor: 'pointer'
                }}>
                    {/* Pulse Effect Ring */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        borderRadius: '50%',
                        border: '2px solid var(--color-sage-green)',
                        animation: 'pulse 2s infinite',
                        opacity: 0
                    }} />
                    <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.8; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          `}</style>

                    <Camera color="white" size={28} strokeWidth={2} />
                </div>
            )}

        </div>
    );
};

export default BottomNavigation;
