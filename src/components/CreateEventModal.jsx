import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Tag, Sparkles, Mic, ChevronDown, ChevronUp } from 'lucide-react';

const CreateEventModal = ({ isOpen, onClose, onEventCreated, isLoading = false }) => {
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

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

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

        try {
            const { eventsService } = await import('../services/eventsService');
            const newEvent = await eventsService.createEvent(payload);
            onEventCreated?.(newEvent);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Failed to create event:', error);
            alert('Failed to create event. Please try again.');
        } finally {
            setSubmitting(false);
        }
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
        setShowAdvanced(false);
    };

    if (!isOpen) return null;

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '12px',
        border: '1.5px solid rgba(135, 169, 107, 0.2)',
        fontSize: '14px',
        background: '#fafafa',
        outline: 'none',
        transition: 'all 0.2s ease'
    };

    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#555',
        marginBottom: '6px'
    };

    return (
        <>
            <style>{`
                .create-modal-input:focus {
                    border-color: var(--color-sage-green) !important;
                    background: rgba(135, 169, 107, 0.03) !important;
                    box-shadow: 0 0 0 3px rgba(135, 169, 107, 0.1) !important;
                }
                .create-modal-input::placeholder { color: #aaa; }
            `}</style>
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    borderRadius: '24px',
                    background: 'white',
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px 24px',
                        borderBottom: '1px solid #eee',
                        position: 'sticky',
                        top: 0,
                        background: 'white',
                        zIndex: 10,
                        borderRadius: '24px 24px 0 0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'var(--color-sage-green)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={20} color="white" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Create Event</h2>
                                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Share with your community</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { resetForm(); onClose(); }}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#f0f0f0',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={18} color="#666" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                        {/* Event Name */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <Sparkles size={12} color="var(--color-sage-green)" />
                                Event Name *
                            </label>
                            <input
                                type="text"
                                name="event_name"
                                value={formData.event_name}
                                onChange={handleChange}
                                placeholder="What's the occasion?"
                                required
                                className="create-modal-input"
                                style={inputStyle}
                            />
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <Tag size={12} color="var(--color-sage-green)" />
                                Description
                            </label>
                            <textarea
                                name="event_description"
                                value={formData.event_description}
                                onChange={handleChange}
                                placeholder="Brief description..."
                                rows={2}
                                className="create-modal-input"
                                style={{ ...inputStyle, resize: 'none' }}
                            />
                        </div>

                        {/* Date & Time */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>
                                    <Calendar size={12} color="var(--color-sage-green)" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    className="create-modal-input"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    <Clock size={12} color="var(--color-sage-green)" />
                                    Time
                                </label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="create-modal-input"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <MapPin size={12} color="var(--color-sage-green)" />
                                Location
                            </label>
                            <input
                                type="text"
                                name="event_place"
                                value={formData.event_place}
                                onChange={handleChange}
                                placeholder="Where will it be?"
                                className="create-modal-input"
                                style={inputStyle}
                            />
                        </div>

                        {/* Event Type */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <Users size={12} color="var(--color-sage-green)" />
                                Event Type
                            </label>
                            <select
                                name="event_type"
                                value={formData.event_type}
                                onChange={handleChange}
                                className="create-modal-input"
                                style={{ ...inputStyle, cursor: 'pointer' }}
                            >
                                <option value="community">🏘️ Community</option>
                                <option value="public">🌍 Public</option>
                                <option value="private">🔒 Private</option>
                                <option value="social">🎉 Social</option>
                            </select>
                        </div>

                        {/* Advanced Options Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                marginBottom: '16px',
                                borderRadius: '10px',
                                border: '1px dashed rgba(135, 169, 107, 0.3)',
                                background: 'transparent',
                                color: 'var(--color-sage-green)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                        </button>

                        {/* Advanced Options */}
                        {showAdvanced && (
                            <div style={{
                                padding: '16px',
                                marginBottom: '16px',
                                borderRadius: '12px',
                                background: 'rgba(135, 169, 107, 0.05)',
                                border: '1px solid rgba(135, 169, 107, 0.1)'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={labelStyle}>
                                            <Tag size={12} color="var(--color-sage-green)" />
                                            Tag
                                        </label>
                                        <input
                                            type="text"
                                            name="tag"
                                            value={formData.tag}
                                            onChange={handleChange}
                                            placeholder="e.g. New Year"
                                            className="create-modal-input"
                                            style={{ ...inputStyle, background: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>
                                            <Clock size={12} color="var(--color-sage-green)" />
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={formData.end_time}
                                            onChange={handleChange}
                                            className="create-modal-input"
                                            style={{ ...inputStyle, background: 'white' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={labelStyle}>
                                            <Mic size={12} color="var(--color-sage-green)" />
                                            Guest Speakers
                                        </label>
                                        <input
                                            type="text"
                                            name="guest_speakers"
                                            value={formData.guest_speakers}
                                            onChange={handleChange}
                                            placeholder="Speaker names"
                                            className="create-modal-input"
                                            style={{ ...inputStyle, background: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>
                                            <Users size={12} color="var(--color-sage-green)" />
                                            Max
                                        </label>
                                        <input
                                            type="number"
                                            name="max_participants"
                                            value={formData.max_participants}
                                            onChange={handleChange}
                                            placeholder="∞"
                                            min="1"
                                            className="create-modal-input"
                                            style={{ ...inputStyle, background: 'white', textAlign: 'center' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting || !formData.event_name}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '14px',
                                border: 'none',
                                background: submitting || !formData.event_name
                                    ? '#ccc'
                                    : 'var(--color-sage-green)',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: submitting || !formData.event_name ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: submitting || !formData.event_name
                                    ? 'none'
                                    : '0 4px 16px rgba(135, 169, 107, 0.3)'
                            }}
                        >
                            <Sparkles size={18} />
                            {submitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateEventModal;
