import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, UserPlus, Check, Loader2, Users } from 'lucide-react';
import { neighborsService } from '../services/neighborsService';

const AddNeighborModal = ({ isOpen, onClose, onAdd, existingNeighborIds = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addingUserId, setAddingUserId] = useState(null);
    const [error, setError] = useState('');

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            setError('');
            try {
                const results = await neighborsService.searchMembers(searchQuery.trim());
                setSearchResults(results);
            } catch (err) {
                console.error('Search failed:', err);
                setError('Failed to search. Please try again.');
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAdd = async (user) => {
        setAddingUserId(user.id);
        try {
            await onAdd(user.id);
            // Update local state to show as added
            setSearchResults(prev =>
                prev.map(u => u.id === user.id ? { ...u, is_already_added: true } : u)
            );
        } catch (err) {
            console.error('Failed to add neighbor:', err);
        } finally {
            setAddingUserId(null);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        setError('');
        onClose();
    };

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

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '480px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 24px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'rgba(135, 169, 107, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Users size={22} color="var(--color-sage-green)" />
                        </div>
                        <div>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                marginBottom: '2px'
                            }}>
                                Add Neighbor
                            </h2>
                            <p style={{
                                fontSize: '13px',
                                color: 'var(--color-text-secondary)',
                                margin: 0
                            }}>
                                Search community members
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#f5f5f5',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <X size={18} color="#666" />
                    </button>
                </div>

                {/* Search Input */}
                <div style={{ padding: '16px 24px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#f8f9fa',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        border: '2px solid transparent',
                        transition: 'all 0.2s ease'
                    }}>
                        {isSearching ? (
                            <Loader2 size={20} color="var(--color-sage-green)" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <Search size={20} color="#999" />
                        )}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            autoFocus
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                fontSize: '15px',
                                outline: 'none',
                                color: 'var(--color-charcoal)'
                            }}
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="no-scrollbar" style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 24px 24px'
                }}>
                    {error && (
                        <div style={{
                            padding: '16px',
                            background: '#fee2e2',
                            borderRadius: '12px',
                            color: '#dc2626',
                            fontSize: '14px',
                            marginBottom: '16px'
                        }}>
                            {error}
                        </div>
                    )}

                    {!searchQuery.trim() && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--color-text-secondary)'
                        }}>
                            <Search size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ fontSize: '14px', margin: 0 }}>
                                Start typing to search for community members
                            </p>
                        </div>
                    )}

                    {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--color-text-secondary)'
                        }}>
                            <Users size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ fontSize: '14px', margin: 0 }}>
                                No members found matching "{searchQuery}"
                            </p>
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {searchResults.map(user => {
                                const isAdded = user.is_already_added || existingNeighborIds.includes(user.id);
                                const isAdding = addingUserId === user.id;
                                const displayName = user.full_name || user.username;

                                return (
                                    <div
                                        key={user.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            padding: '14px',
                                            background: '#fafafa',
                                            borderRadius: '14px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '14px',
                                            background: getAvatarColor(displayName),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <span style={{
                                                color: 'white',
                                                fontSize: '16px',
                                                fontWeight: '700'
                                            }}>
                                                {getInitials(displayName)}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                marginBottom: '2px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {displayName}
                                            </h4>
                                            <p style={{
                                                fontSize: '13px',
                                                color: 'var(--color-text-secondary)',
                                                margin: 0,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {user.email}
                                            </p>
                                            {user.room_number && (
                                                <span style={{
                                                    fontSize: '12px',
                                                    color: 'var(--color-sage-green)',
                                                    fontWeight: '500'
                                                }}>
                                                    Unit {user.room_number}
                                                </span>
                                            )}
                                        </div>

                                        {/* Add Button */}
                                        <button
                                            onClick={() => !isAdded && handleAdd(user)}
                                            disabled={isAdded || isAdding}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                border: isAdded
                                                    ? '2px solid var(--color-sage-green)'
                                                    : '2px solid var(--color-sage-green)',
                                                background: isAdded
                                                    ? 'var(--color-sage-green)'
                                                    : 'transparent',
                                                cursor: isAdded ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease',
                                                opacity: isAdding ? 0.6 : 1
                                            }}
                                        >
                                            {isAdding ? (
                                                <Loader2 size={18} color="var(--color-sage-green)" style={{ animation: 'spin 1s linear infinite' }} />
                                            ) : isAdded ? (
                                                <Check size={18} color="white" />
                                            ) : (
                                                <UserPlus size={18} color="var(--color-sage-green)" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Spinner animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AddNeighborModal;
