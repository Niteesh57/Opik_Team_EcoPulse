import React from 'react';
import { Leaf } from 'lucide-react';

const LeaderboardItem = ({ rank, avatar, name, points, maxPoints }) => {
    const percent = (points / maxPoints) * 100;

    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Generate consistent color from name
    const getAvatarColor = (name) => {
        const colors = [
            '#87A96B', // sage green
            '#6B9BA9', // teal
            '#A96B87', // mauve
            '#A9876B', // tan
            '#6BA987', // mint
            '#A9A96B', // olive
            '#876BA9', // purple
            '#6B87A9', // blue
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
            {/* Rank */}
            <span style={{
                width: '24px',
                fontWeight: '700',
                color: rank <= 3 ? 'var(--color-sage-green)' : 'var(--color-text-secondary)',
                fontSize: '16px'
            }}>
                {rank}
            </span>

            {/* Avatar */}
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '12px',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: avatar ? 'transparent' : bgColor,
                overflow: 'hidden'
            }}>
                {avatar ? (
                    <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        letterSpacing: '-0.5px'
                    }}>
                        {initials}
                    </span>
                )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-sage-green)' }}>
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>{points}</span>
                        <Leaf size={12} fill="currentColor" />
                    </div>
                </div>

                {/* Growth Bar */}
                <div style={{
                    height: '6px',
                    background: '#E0E0E0',
                    borderRadius: '3px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--color-sage-green) 0%, #A4C686 100%)',
                        borderRadius: '3px'
                    }} />
                </div>
            </div>
        </div>
    );
};

export default LeaderboardItem;
