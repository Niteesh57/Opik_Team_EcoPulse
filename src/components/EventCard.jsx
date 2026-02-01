import React from 'react';
import { Calendar, Clock, MapPin, Users, Tag, UserPlus, Check, MessageCircle } from 'lucide-react';

const EventCard = ({ event, onJoin, onLeave, onChat, isJoined = false }) => {
    const [isPopping, setIsPopping] = React.useState(false);

    const handleJoin = async () => {
        if (onJoin) {
            await onJoin(event.event_id);
            setIsPopping(true);
            setTimeout(() => setIsPopping(false), 300);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';

    return (
        <div className={`glass-card event-card ${isPopping ? 'pop-animation' : ''}`} style={{
            minWidth: '340px',
            maxWidth: '400px',
            borderRadius: '24px',
            overflow: 'hidden',
            marginRight: '0',
            flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
            transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}>
            {/* Event Image */}
            <div style={{
                height: '180px',
                background: `url(${event.event_image_url || defaultImage}) center/cover`,
                position: 'relative'
            }}>
                {/* Tag Badge */}
                {event.tag && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(135, 169, 107, 0.9)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <Tag size={10} />
                        {event.tag}
                    </div>
                )}

                {/* Event Type Badge */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    color: 'var(--color-charcoal)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backdropFilter: 'blur(8px)',
                    textTransform: 'capitalize'
                }}>
                    {event.event_type}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '16px' }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    marginBottom: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {event.event_name}
                </h3>

                {/* Description Preview */}
                {event.event_description && (
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '10px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.4'
                    }}>
                        {event.event_description}
                    </p>
                )}

                {/* Guest Speakers */}
                {event.guest_speakers && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'linear-gradient(135deg, rgba(135, 169, 107, 0.1), rgba(135, 169, 107, 0.2))',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        marginBottom: '10px',
                        fontSize: '11px',
                        color: 'var(--color-sage-green)',
                        fontWeight: '600'
                    }}>
                        🎤 {event.guest_speakers}
                    </div>
                )}

                {/* Meta Info */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)'
                }}>
                    {event.event_date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="var(--color-sage-green)" />
                            <span>{formatDate(event.event_date)}</span>
                            {event.start_time && (
                                <>
                                    <Clock size={14} color="var(--color-sage-green)" style={{ marginLeft: '8px' }} />
                                    <span>{formatTime(event.start_time)}</span>
                                </>
                            )}
                        </div>
                    )}

                    {event.event_place && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="var(--color-sage-green)" />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {event.event_place}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Participants */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <Users size={14} />
                        <span>{event.registered_users_count || 0} attending</span>
                    </div>

                    {/* Chat Button */}
                    {(isJoined || event.this_user_owner) && (
                        <button
                            onClick={() => onChat?.(event.event_id)}
                            className="glass-button-outline"
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                border: '1px solid rgba(135, 169, 107, 0.4)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                color: 'var(--color-sage-green)',
                                transition: 'all 0.2s ease',
                                marginRight: '8px'
                            }}
                        >
                            <MessageCircle size={14} />
                            Chat
                        </button>
                    )}

                    {/* Join/Leave Button */}
                    {event.this_user_owner ? (
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid var(--color-sage-green)',
                            background: 'rgba(135, 169, 107, 0.1)',
                            color: 'var(--color-sage-green)',
                            cursor: 'default'
                        }}>
                            <Check size={14} />
                            Owner
                        </div>
                    ) : (
                        <button
                            onClick={() => isJoined ? onLeave?.(event.event_id) : handleJoin()}
                            className={isJoined ? 'glass-button-outline' : 'glass-button'}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                border: isJoined ? '1px solid var(--color-sage-green)' : 'none',
                                background: isJoined ? 'transparent' : 'var(--color-sage-green)',
                                color: isJoined ? 'var(--color-sage-green)' : 'white',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isJoined ? <Check size={14} /> : <UserPlus size={14} />}
                            {isJoined ? 'Joined' : 'Join'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
