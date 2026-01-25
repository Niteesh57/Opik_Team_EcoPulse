import React from 'react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';
import { getInitials, getColorFromString } from '../utils/avatarUtils';

const SERVICES = [
    { key: 'doctor', label: 'Doctor', icon: '🩺' },
    { key: 'shop', label: 'Shop', icon: '🏪' },
    { key: 'security', label: 'Security', icon: '🛡️' },
    { key: 'partyhall', label: 'Party Hall', icon: '🎉' },
    { key: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { key: 'playground', label: 'Playground', icon: '🎮' }
];

const RoomCard = ({ room, onEdit, onDelete }) => {
    const initials = getInitials(room.name);
    const avatarColor = getColorFromString(room.name);
    
    const activeServices = SERVICES.filter(s => room[s.key]);
    const hasStaff = room.staff_assignments && Object.keys(room.staff_assignments).length > 0;

    return (
        <div className="glass-panel" style={{
            padding: '20px',
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}>
            {/* Room Avatar */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'white',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${avatarColor}40`
                }}>
                    {initials}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--color-charcoal)',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {room.name}
                    </h3>
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'monospace',
                        background: 'var(--color-soft-mint)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-block'
                    }}>
                        ID: {room.room_id}
                    </p>
                </div>
            </div>

            {/* Description */}
            {room.description && (
                <p style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '12px',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {room.description}
                </p>
            )}

            {/* Location */}
            {room.location && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '16px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px'
                }}>
                    <MapPin size={14} />
                    <span>{room.location}</span>
                </div>
            )}

            {/* Created Date */}
            <div style={{
                fontSize: '12px',
                color: '#999',
                marginBottom: '16px'
            }}>
                Created {new Date(room.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                })}
            </div>

            {/* Active Services */}
            {activeServices.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                        Services:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {activeServices.map(service => {
                            const hasAssignment = room.staff_assignments && room.staff_assignments[service.key];
                            return (
                                <div key={service.key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    background: hasAssignment ? 'var(--color-soft-mint)' : '#f5f5f5',
                                    border: hasAssignment ? '1px solid var(--color-sage-green)' : '1px solid #e5e5e5',
                                    fontSize: '12px',
                                    position: 'relative'
                                }}>
                                    <span>{service.icon}</span>
                                    <span style={{ fontWeight: '500' }}>{service.label}</span>
                                    {hasAssignment && (
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: '#10b981',
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px'
                                        }} title="Staff Assigned" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Staff Info */}
            {hasStaff && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                        Assigned Staff:
                    </div>
                    {Object.entries(room.staff_assignments).slice(0, 2).map(([serviceKey, assignment]) => {
                        const service = SERVICES.find(s => s.key === serviceKey);
                        const displayName = assignment.user_name || assignment.user_email || `User ID ${assignment.user_id}`;
                        const displayTiming = assignment.available_timing || assignment.availableTiming || '';
                        const displayDays = assignment.days || assignment.available_days || '';

                        return (
                            <div key={serviceKey} style={{ fontSize: '11px', marginBottom: '6px', lineHeight: '1.4' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                    <span>{service?.icon}</span>
                                    <strong>{displayName}</strong>
                                </div>
                                {displayTiming && (
                                    <div style={{ color: '#666', paddingLeft: '16px' }}>
                                        ⏰ {displayTiming}
                                    </div>
                                )}
                                {displayDays && (
                                    <div style={{ color: '#666', paddingLeft: '16px' }}>
                                        📅 {displayDays}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {Object.keys(room.staff_assignments).length > 2 && (
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                            +{Object.keys(room.staff_assignments).length - 2} more
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(room);
                    }}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid var(--color-sage-green)',
                        background: 'var(--color-soft-mint)',
                        color: 'var(--color-sage-green)',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-sage-green)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-soft-mint)';
                        e.currentTarget.style.color = 'var(--color-sage-green)';
                    }}
                >
                    <Edit2 size={16} />
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete room "${room.name}"?`)) {
                            onDelete(room.room_id);
                        }
                    }}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid #ef4444',
                        background: '#fee2e2',
                        color: '#ef4444',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </div>
    );
};

export default RoomCard;
