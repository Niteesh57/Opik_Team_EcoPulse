import React from 'react';
import { Home, UserPlus, UserMinus, User } from 'lucide-react';

const NeighborCard = ({ neighbor, onAdd, onRemove, isAdded = false, isLoading = false }) => {
    // Handle both neighbor (near_user) format and member search format
    const user = neighbor.near_user || neighbor;
    const displayName = neighbor.nickname || user.full_name || user.username;
    const roomNumber = neighbor.room_number || user.room_number;

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name) => {
        const colors = [
            '#87A96B', '#5D8A4A', '#7CB342', '#8BC34A',
            '#689F38', '#558B2F', '#33691E', '#9CCC65'
        ];
        const index = (name || '').charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="glass-card neighbor-card" style={{
            padding: '16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
            {/* Avatar with Home Icon */}
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: getAvatarColor(displayName),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0
            }}>
                <span style={{
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '700'
                }}>
                    {getInitials(displayName)}
                </span>

                {/* Home Icon Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                    <Home size={12} color="var(--color-sage-green)" />
                </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {displayName}
                </h4>
                {roomNumber && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <Home size={10} />
                        <span>Unit {roomNumber}</span>
                    </div>
                )}
                {user.email && (
                    <p style={{
                        fontSize: '11px',
                        color: 'var(--color-text-secondary)',
                        opacity: 0.7,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        margin: 0
                    }}>
                        {user.email}
                    </p>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={() => {
                    if (isAdded) {
                        onRemove?.(neighbor.id);
                    } else {
                        onAdd?.(user.id);
                    }
                }}
                disabled={isLoading}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: isAdded ? '1px solid #ff5252' : '1px solid var(--color-sage-green)',
                    background: isAdded ? 'rgba(255, 82, 82, 0.1)' : 'rgba(135, 169, 107, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isLoading ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.6 : 1
                }}
            >
                {isAdded ? (
                    <UserMinus size={16} color="#ff5252" />
                ) : (
                    <UserPlus size={16} color="var(--color-sage-green)" />
                )}
            </button>
        </div>
    );
};

export default NeighborCard;
