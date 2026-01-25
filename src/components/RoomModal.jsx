import React, { useState, useEffect } from 'react';
import { X, MapPin, FileText, Home, Users, Search, Plus, Trash2 } from 'lucide-react';
import { userService } from '../services/users';

const SERVICES = [
    { key: 'doctor', label: 'Doctor', icon: '🩺' },
    { key: 'shop', label: 'Shop', icon: '🏪' },
    { key: 'security', label: 'Security', icon: '🛡️' },
    { key: 'partyhall', label: 'Party Hall', icon: '🎉' },
    { key: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { key: 'playground', label: 'Playground', icon: '🎮' }
];

const RoomModal = ({ isOpen, onClose, onSubmit, room = null, loading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        doctor: false,
        shop: false,
        security: false,
        partyhall: false,
        cleaning: false,
        playground: false,
        staff_assignments: {}
    });

    const [searchEmail, setSearchEmail] = useState('');
    const [searchingUser, setSearchingUser] = useState(false);
    const [assigningService, setAssigningService] = useState(null);
    const [customServices, setCustomServices] = useState([]);
    const [newServiceName, setNewServiceName] = useState('');
    const [addingCustomService, setAddingCustomService] = useState(false);

    useEffect(() => {
        if (room) {
            setFormData({
                name: room.name || '',
                description: room.description || '',
                location: room.location || '',
                doctor: room.doctor || false,
                shop: room.shop || false,
                security: room.security || false,
                partyhall: room.partyhall || false,
                cleaning: room.cleaning || false,
                playground: room.playground || false,
                staff_assignments: room.staff_assignments || {}
            });
        } else {
            setFormData({
                name: '',
                description: '',
                location: '',
                doctor: false,
                shop: false,
                security: false,
                partyhall: false,
                cleaning: false,
                playground: false,
                staff_assignments: {}
            });
        }
        setSearchEmail('');
        setAssigningService(null);
    }, [room, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const sanitizedAssignments = Object.entries(formData.staff_assignments || {}).reduce((acc, [serviceKey, data]) => {
            if (!data || !data.user_id) {
                return acc;
            }

            acc[serviceKey] = {
                user_id: data.user_id,
                available_timing: data.available_timing || '',
                days: data.days || ''
            };

            return acc;
        }, {});

        const payload = {
            ...formData,
            staff_assignments: Object.keys(sanitizedAssignments).length ? sanitizedAssignments : null
        };

        // Ensure any service with an assignment stays active
        if (payload.staff_assignments) {
            Object.keys(payload.staff_assignments).forEach((serviceKey) => {
                payload[serviceKey] = true;
            });
        }

        onSubmit(payload);
    };

    const handleServiceToggle = (serviceKey) => {
        setFormData(prev => {
            const isActive = !prev[serviceKey];
            const updatedAssignments = { ...prev.staff_assignments };

            if (!isActive) {
                delete updatedAssignments[serviceKey];
            }

            return {
                ...prev,
                [serviceKey]: isActive,
                staff_assignments: updatedAssignments
            };
        });
    };

    const searchAndAssignUser = async (serviceKey) => {
        if (!searchEmail) return;
        
        try {
            setSearchingUser(true);
            const user = await userService.searchUserByEmail(searchEmail);
            
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    staff_assignments: {
                        ...prev.staff_assignments,
                        [serviceKey]: {
                            user_id: user.id,
                            user_email: user.email,
                            user_name: user.full_name || user.username,
                            available_timing: '',
                            days: ''
                        }
                    }
                }));
                setSearchEmail('');
                setAssigningService(null);
            } else {
                alert('User not found with this email');
            }
        } catch (error) {
            alert('Error searching user: ' + error.message);
        } finally {
            setSearchingUser(false);
        }
    };

    const updateStaffAssignment = (serviceKey, field, value) => {
        setFormData(prev => ({
            ...prev,
            staff_assignments: {
                ...prev.staff_assignments,
                [serviceKey]: {
                    ...prev.staff_assignments[serviceKey],
                    [field]: value
                }
            }
        }));
    };

    const removeStaffAssignment = (serviceKey) => {
        setFormData(prev => {
            const newAssignments = { ...prev.staff_assignments };
            delete newAssignments[serviceKey];
            return {
                ...prev,
                staff_assignments: newAssignments
            };
        });
    };

    const addCustomService = () => {
        if (!newServiceName.trim()) return;
        
        const serviceKey = 'custom_' + Date.now();
        const newService = {
            key: serviceKey,
            label: newServiceName.trim(),
            icon: '⚙️',
            isCustom: true
        };
        
        setCustomServices(prev => [...prev, newService]);
        setFormData(prev => ({ ...prev, [serviceKey]: true }));
        setNewServiceName('');
        setAddingCustomService(false);
    };

    const removeCustomService = (serviceKey) => {
        setCustomServices(prev => prev.filter(s => s.key !== serviceKey));
        setFormData(prev => {
            const newFormData = { ...prev };
            delete newFormData[serviceKey];
            
            const newAssignments = { ...prev.staff_assignments };
            delete newAssignments[serviceKey];
            
            return {
                ...newFormData,
                staff_assignments: newAssignments
            };
        });
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: 'var(--color-charcoal)'
                    }}>
                        {room ? 'Edit Room' : 'Create New Room'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: 'none',
                            background: '#f5f5f5',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Room Name */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--color-charcoal)',
                            marginBottom: '8px'
                        }}>
                            <Home size={16} />
                            Room Name *
                        </label>
                        <input
                            type="text"
                            required
                            minLength={3}
                            maxLength={100}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Community Garden Hub"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e5e5e5',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-sage-green)'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--color-charcoal)',
                            marginBottom: '8px'
                        }}>
                            <FileText size={16} />
                            Description
                        </label>
                        <textarea
                            maxLength={500}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the purpose of this room..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e5e5e5',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-sage-green)'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                        />
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            {formData.description.length}/500 characters
                        </div>
                    </div>

                    {/* Location */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--color-charcoal)',
                            marginBottom: '8px'
                        }}>
                            <MapPin size={16} />
                            Location
                        </label>
                        <input
                            type="text"
                            maxLength={200}
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., Downtown Park, Building A"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e5e5e5',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-sage-green)'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                        />
                    </div>

                    {/* Services Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--color-charcoal)',
                            marginBottom: '12px'
                        }}>
                            <Users size={16} />
                            Available Services
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {SERVICES.map(service => (
                                <label key={service.key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: `2px solid ${formData[service.key] ? 'var(--color-sage-green)' : '#e5e5e5'}`,
                                    background: formData[service.key] ? 'var(--color-soft-mint)' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: '14px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData[service.key]}
                                        onChange={() => handleServiceToggle(service.key)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '18px' }}>{service.icon}</span>
                                    <span style={{ fontWeight: '500' }}>{service.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Staff Assignments */}
                    <div style={{ marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-charcoal)' }}>
                                Staff Assignments
                            </h3>
                            {!addingCustomService ? (
                                <button
                                    type="button"
                                    onClick={() => setAddingCustomService(true)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-sage-green)',
                                        background: 'white',
                                        color: 'var(--color-sage-green)',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Plus size={14} />
                                    Add Custom Service
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="Service name"
                                        value={newServiceName}
                                        onChange={(e) => setNewServiceName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addCustomService()}
                                        style={{
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e5e5',
                                            fontSize: '13px',
                                            width: '120px'
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomService}
                                        style={{
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: 'var(--color-sage-green)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                        }}
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddingCustomService(false);
                                            setNewServiceName('');
                                        }}
                                        style={{
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e5e5',
                                            background: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                        {[...SERVICES, ...customServices].filter(s => formData[s.key]).length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '20px',
                                color: '#999',
                                fontStyle: 'italic'
                            }}>
                                Select services above or add custom services to assign staff
                            </div>
                        ) : (
                            [...SERVICES, ...customServices].filter(s => formData[s.key]).map(service => (
                                <div key={service.key} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e5e5' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '18px' }}>{service.icon}</span>
                                            <strong style={{ fontSize: '14px' }}>{service.label}</strong>
                                            {service.isCustom && (
                                                <span style={{ 
                                                    fontSize: '11px', 
                                                    background: '#e0e7ff', 
                                                    color: '#3730a3', 
                                                    padding: '2px 6px', 
                                                    borderRadius: '10px' 
                                                }}>
                                                    Custom
                                                </span>
                                            )}
                                        </div>
                                        {service.isCustom && (
                                            <button
                                                type="button"
                                                onClick={() => removeCustomService(service.key)}
                                                style={{
                                                    padding: '4px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    background: '#fee2e2',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                                title="Remove custom service"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {formData.staff_assignments[service.key] ? (
                                        <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>
                                                        {formData.staff_assignments[service.key].user_name 
                                                            || formData.staff_assignments[service.key].user_email 
                                                            || `User ID ${formData.staff_assignments[service.key].user_id}`}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        {formData.staff_assignments[service.key].user_email}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStaffAssignment(service.key)}
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: '#fee2e2',
                                                        color: '#ef4444',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Available Timing (e.g., 9am-5pm)"
                                                value={formData.staff_assignments[service.key].available_timing || ''}
                                                onChange={(e) => updateStaffAssignment(service.key, 'available_timing', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e5e5',
                                                    fontSize: '13px',
                                                    marginBottom: '8px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Days (e.g., Monday-Friday)"
                                                value={formData.staff_assignments[service.key].days || ''}
                                                onChange={(e) => updateStaffAssignment(service.key, 'days', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e5e5',
                                                    fontSize: '13px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            {assigningService === service.key ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="email"
                                                        placeholder="Enter user email"
                                                        value={searchEmail}
                                                        onChange={(e) => setSearchEmail(e.target.value)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e5e5',
                                                            fontSize: '13px',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => searchAndAssignUser(service.key)}
                                                        disabled={searchingUser}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            background: 'var(--color-sage-green)',
                                                            color: 'white',
                                                            cursor: searchingUser ? 'not-allowed' : 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        {searchingUser ? '...' : 'Add'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAssigningService(null)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e5e5',
                                                            background: 'white',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setAssigningService(service.key)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: '1px dashed #ccc',
                                                        background: 'white',
                                                        color: '#666',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <Plus size={14} />
                                                    Assign Staff
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: '2px solid #e5e5e5',
                                background: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'var(--color-sage-green)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#6b9f7f')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--color-sage-green)')}
                        >
                            {loading ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomModal;
