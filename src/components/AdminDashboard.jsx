import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, LogOut, Plus, Loader } from 'lucide-react';
import { roomService } from '../services/rooms';
import RoomCard from './RoomCard';
import RoomModal from './RoomModal';

const AdminDashboard = ({ onLogout }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            setLoading(true);
            const data = await roomService.getMyRooms();
            setRooms(data);
        } catch (err) {
            console.error('Failed to load rooms:', err);
            setError('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (formData) => {
        try {
            setSubmitting(true);
            setError('');
            const newRoom = await roomService.createRoom(formData);
            setRooms([newRoom, ...rooms]);
            setModalOpen(false);
        } catch (err) {
            console.error('Failed to create room:', err);
            setError(err.message || 'Failed to create room');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRoom = async (formData) => {
        try {
            setSubmitting(true);
            setError('');
            const updatedRoom = await roomService.updateRoom(editingRoom.room_id, formData);
            setRooms(rooms.map(r => r.room_id === updatedRoom.room_id ? updatedRoom : r));
            setModalOpen(false);
            setEditingRoom(null);
        } catch (err) {
            console.error('Failed to update room:', err);
            setError(err.message || 'Failed to update room');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await roomService.deleteRoom(roomId);
            setRooms(rooms.filter(r => r.room_id !== roomId));
        } catch (err) {
            console.error('Failed to delete room:', err);
            alert('Failed to delete room: ' + err.message);
        }
    };

    const openEditModal = (room) => {
        setEditingRoom(room);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingRoom(null);
        setError('');
    };

    return (
        <div className="container" style={{ padding: '20px', paddingBottom: '100px' }}>
            <header style={{ marginBottom: '32px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-charcoal)' }}>
                        <Shield color="var(--color-sage-green)" /> Admin Portal
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Manage rooms and system overview</p>
                </div>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 16px', borderRadius: '12px',
                            background: 'white', border: '1px solid #e0e0e0',
                            cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                            transition: 'all 0.2s ease', color: 'var(--color-charcoal)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                )}
            </header>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Users size={32} color="var(--color-sage-green)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '24px', fontWeight: '700' }}>{rooms.length}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>Total Rooms</span>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Activity size={32} color="var(--color-sage-green)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '24px', fontWeight: '700' }}>Active</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>Room Status</span>
                </div>
            </div>

            {/* Room Management Section */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-charcoal)' }}>
                        My Rooms
                    </h2>
                    <button
                        onClick={() => setModalOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'var(--color-sage-green)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(122, 161, 138, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(122, 161, 138, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 161, 138, 0.3)';
                        }}
                    >
                        <Plus size={18} />
                        Create Room
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: '#fee2e2',
                        color: '#ef4444',
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Rooms Grid */}
                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '300px',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <Loader size={40} color="var(--color-sage-green)" className="spinner" />
                        <p style={{ color: '#999' }}>Loading rooms...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="glass-panel" style={{ 
                        padding: '60px 24px', 
                        textAlign: 'center',
                        borderRadius: '16px'
                    }}>
                        <div style={{ 
                            fontSize: '48px', 
                            marginBottom: '16px',
                            opacity: 0.3
                        }}>🏠</div>
                        <p style={{ color: '#999', fontSize: '16px', marginBottom: '8px' }}>
                            No rooms created yet
                        </p>
                        <p style={{ color: '#ccc', fontSize: '14px' }}>
                            Click "Create Room" to get started
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '16px'
                    }}>
                        {rooms.map(room => (
                            <RoomCard
                                key={room.room_id}
                                room={room}
                                onEdit={openEditModal}
                                onDelete={handleDeleteRoom}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Room Modal */}
            <RoomModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom}
                room={editingRoom}
                loading={submitting}
            />
        </div>
    );
};

export default AdminDashboard;
