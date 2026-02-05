import React from 'react';
import { Home, User, Phone } from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange, onCallClick }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '70px',
            background: 'rgba(255, 255, 255, 0.95)',
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
            {/* Home Button */}
            <div
                onClick={() => onTabChange && onTabChange('home')}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: activeTab === 'dashboard' ? 'var(--color-sage-green)' : '#999',
                    cursor: 'pointer',
                    padding: '8px 0',
                    transition: 'color 0.2s'
                }}
            >
                <Home size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                <span style={{ fontSize: '11px', fontWeight: activeTab === 'dashboard' ? '600' : '500' }}>Home</span>
            </div>

            {/* Profile Button */}
            <div
                onClick={() => onTabChange && onTabChange('profile')}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: activeTab === 'profile' ? 'var(--color-sage-green)' : '#999',
                    cursor: 'pointer',
                    padding: '8px 0',
                    transition: 'color 0.2s'
                }}
            >
                <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                <span style={{ fontSize: '11px', fontWeight: activeTab === 'profile' ? '600' : '500' }}>Profile</span>
            </div>

            {/* Call Button */}
            <div
                onClick={() => onCallClick && onCallClick()}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#999',
                    cursor: 'pointer',
                    padding: '8px 0',
                    transition: 'color 0.2s'
                }}
            >
                <Phone size={24} strokeWidth={2} />
                <span style={{ fontSize: '11px', fontWeight: '500' }}>Call</span>
            </div>
        </div>
    );
};

export default BottomNavigation;
