import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Tag, Sparkles, Mic } from 'lucide-react';

const CreateEventModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
    const [formData, setFormData] = useState({
        event_name: '',
        event_description: '',
        event_place: '',
        event_date: '',
        start_time: '',
        end_time: '',
        event_type: 'community',
        tag: '',
        guest_speakers: '',
        max_participants: ''
    });

    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            event_name: formData.event_name,
            event_description: formData.event_description || null,
            event_place: formData.event_place || null,
            event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
            start_time: formData.start_time || null,
            end_time: formData.end_time || null,
            event_type: formData.event_type,
            tag: formData.tag || null,
            guest_speakers: formData.guest_speakers || null,
            max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
            event_status: 'confirmed'
        };

        onSubmit(payload);
    };

    const resetForm = () => {
        setFormData({
            event_name: '',
            event_description: '',
            event_place: '',
            event_date: '',
            start_time: '',
            end_time: '',
            event_type: 'community',
            tag: '',
            guest_speakers: '',
            max_participants: ''
        });
    };

    if (!isOpen) return null;

    const getInputStyle = (fieldName) => ({
        width: '100%',
        padding: '14px 16px',
        borderRadius: '14px',
        border: focusedField === fieldName
            ? '2px solid var(--color-sage-green)'
            : '2px solid rgba(135, 169, 107, 0.15)',
        fontSize: '14px',
        fontWeight: '500',
        background: focusedField === fieldName
            ? 'rgba(135, 169, 107, 0.05)'
            : 'rgba(250, 250, 250, 0.8)',
        outline: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: focusedField === fieldName
            ? '0 4px 20px rgba(135, 169, 107, 0.15)'
            : 'none',
        color: 'var(--color-charcoal)'
    });

    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--color-charcoal)',
        marginBottom: '8px'
    };

    const iconStyle = {
        width: '18px',
        height: '18px',
        padding: '3px',
        borderRadius: '6px',
        background: 'linear-gradient(135deg, rgba(135, 169, 107, 0.15), rgba(135, 169, 107, 0.25))',
        color: 'var(--color-sage-green)'
    };

    return (
        <>
            <style>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes backdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .modal-input::placeholder {
                    color: #aaa;
                    font-weight: 400;
                }
                .modal-input:focus::placeholder {
                    color: #bbb;
                }
            `}</style>
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '24px',
                animation: 'backdropFadeIn 0.3s ease'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '88vh',
                    overflowY: 'auto',
                    borderRadius: '28px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    boxShadow: '0 32px 100px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
                    animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px 28px',
                        borderBottom: '1px solid rgba(135, 169, 107, 0.15)',
                        position: 'sticky',
                        top: 0,
                        background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.98) 100%)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 10,
                        borderTopLeftRadius: '28px',
                        borderTopRightRadius: '28px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, var(--color-sage-green), #6B8E5D)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(135, 169, 107, 0.35)'
                            }}>
                                <Sparkles size={24} color="white" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--color-charcoal)' }}>Create Event</h2>
                                <p style={{ fontSize: '13px', color: '#888', margin: 0, marginTop: '2px' }}>Share a moment with your community</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { resetForm(); onClose(); }}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        >
                            <X size={20} color="#666" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
                        {/* Event Name */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>
                                <Sparkles size={14} style={iconStyle} />
                                Event Name <span style={{ color: 'var(--color-sage-green)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="event_name"
                                value={formData.event_name}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('event_name')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="What's the occasion?"
                                required
                                className="modal-input"
                                style={getInputStyle('event_name')}
                            />
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>
                                <Tag size={14} style={iconStyle} />
                                Description
                            </label>
                            <textarea
                                name="event_description"
                                value={formData.event_description}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('description')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Tell everyone what to expect..."
                                rows={3}
                                className="modal-input"
                                style={{
                                    ...getInputStyle('description'),
                                    resize: 'none',
                                    lineHeight: '1.5'
                                }}
                            />
                        </div>

                        {/* Date and Time Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1fr 1fr',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <label style={labelStyle}>
                                    <Calendar size={14} style={iconStyle} />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('date')}
                                    onBlur={() => setFocusedField(null)}
                                    className="modal-input"
                                    style={getInputStyle('date')}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    <Clock size={14} style={iconStyle} />
                                    Start
                                </label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('start')}
                                    onBlur={() => setFocusedField(null)}
                                    className="modal-input"
                                    style={getInputStyle('start')}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    <Clock size={14} style={iconStyle} />
                                    End
                                </label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('end')}
                                    onBlur={() => setFocusedField(null)}
                                    className="modal-input"
                                    style={getInputStyle('end')}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>
                                <MapPin size={14} style={iconStyle} />
                                Location
                            </label>
                            <input
                                type="text"
                                name="event_place"
                                value={formData.event_place}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('place')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Where will everyone meet?"
                                className="modal-input"
                                style={getInputStyle('place')}
                            />
                        </div>

                        {/* Event Type and Tag Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <label style={labelStyle}>
                                    <Users size={14} style={iconStyle} />
                                    Event Type
                                </label>
                                <select
                                    name="event_type"
                                    value={formData.event_type}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('type')}
                                    onBlur={() => setFocusedField(null)}
                                    style={{
                                        ...getInputStyle('type'),
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2387A96B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 14px center'
                                    }}
                                >
                                    <option value="community">🏘️ Community</option>
                                    <option value="public">🌍 Public</option>
                                    <option value="private">🔒 Private</option>
                                    <option value="social">🎉 Social</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    <Tag size={14} style={iconStyle} />
                                    Tag
                                </label>
                                <input
                                    type="text"
                                    name="tag"
                                    value={formData.tag}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('tag')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="e.g. Sustainability"
                                    className="modal-input"
                                    style={getInputStyle('tag')}
                                />
                            </div>
                        </div>

                        {/* Guest Speakers and Max Participants */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '12px',
                            marginBottom: '28px'
                        }}>
                            <div>
                                <label style={labelStyle}>
                                    <Mic size={14} style={iconStyle} />
                                    Guest Speakers
                                </label>
                                <input
                                    type="text"
                                    name="guest_speakers"
                                    value={formData.guest_speakers}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('speakers')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Speaker names"
                                    className="modal-input"
                                    style={getInputStyle('speakers')}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    <Users size={14} style={iconStyle} />
                                    Max
                                </label>
                                <input
                                    type="number"
                                    name="max_participants"
                                    value={formData.max_participants}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('max')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="∞"
                                    min="1"
                                    className="modal-input"
                                    style={{
                                        ...getInputStyle('max'),
                                        textAlign: 'center'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !formData.event_name}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                border: 'none',
                                background: isLoading || !formData.event_name
                                    ? 'linear-gradient(135deg, #ccc 0%, #bbb 100%)'
                                    : 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: isLoading || !formData.event_name ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: isLoading || !formData.event_name
                                    ? 'none'
                                    : '0 8px 32px rgba(135, 169, 107, 0.4)',
                                transform: 'scale(1)'
                            }}
                            onMouseOver={(e) => {
                                if (!isLoading && formData.event_name) {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(135, 169, 107, 0.5)';
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(135, 169, 107, 0.4)';
                            }}
                        >
                            <Sparkles size={20} />
                            {isLoading ? 'Creating Event...' : 'Create Event'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateEventModal;
