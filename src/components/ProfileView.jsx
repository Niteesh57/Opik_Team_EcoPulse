import React, { useState, useEffect } from 'react';
import { User, Globe, Mail, Save, ChevronDown, Check } from 'lucide-react';
import { usersService } from '../services/usersService';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese (Mandarin)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'it', name: 'Italian' },
    { code: 'nl', name: 'Dutch' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pl', name: 'Polish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'id', name: 'Indonesian' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'el', name: 'Greek' }
];

const ProfileView = ({ user: initialUser }) => {
    const [user, setUser] = useState(initialUser || {});
    const [fullName, setFullName] = useState(initialUser?.full_name || '');
    const [username, setUsername] = useState(initialUser?.username || '');
    const [email, setEmail] = useState(initialUser?.email || '');
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (initialUser) {
            setUser(initialUser);
            setFullName(initialUser.full_name || '');
            setUsername(initialUser.username || '');
            setEmail(initialUser.email || '');
        }
    }, [initialUser]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const updatedData = {
                full_name: fullName,
                username: username,
                email: email
            };

            const response = await usersService.updateMe(updatedData);
            setUser({ ...user, ...response });
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setErrorMessage('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageSelect = (langCode) => {
        setSelectedLanguage(langCode);
        setIsLangDropdownOpen(false);
        // Here you would typically trigger an app-level language change
        // For now we just update the local state
    };

    return (
        <div style={{
            padding: '24px',
            paddingBottom: '100px', // Space for bottom nav
            maxWidth: '600px',
            margin: '0 auto',
            width: '100%'
        }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Tracking Profile</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Manage your personal information and preferences
                </p>
            </header>

            <div className="glass-card" style={{ padding: '32px', borderRadius: '24px' }}>

                {/* Avatar Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: `hsl(${((fullName || username || 'U').charCodeAt(0) * 123) % 360}, 70%, 85%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '4px solid white'
                    }}>
                        <span style={{ fontSize: '36px', fontWeight: '800', color: `hsl(${((fullName || username || 'U').charCodeAt(0) * 123) % 360}, 70%, 35%)` }}>
                            {fullName ? fullName.charAt(0).toUpperCase() : username ? username.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{fullName || username || 'Community Member'}</h2>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{user.role === 'admin' ? 'Community Admin' : 'Community Member'}</span>
                </div>

                <form onSubmit={handleUpdateProfile}>
                    {/* Full Name */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-charcoal)' }}>
                            Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    background: 'rgba(255,255,255,0.5)',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-charcoal)' }}>
                            Username
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    background: 'rgba(255,255,255,0.5)',
                                    fontSize: '15px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-charcoal)' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }}>
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    background: 'rgba(255,255,255,0.5)',
                                    fontSize: '15px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Language Settings */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Preferences</h3>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-charcoal)' }}>
                            Language
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    paddingLeft: '48px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    background: 'rgba(255,255,255,0.5)',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }}>
                                    <Globe size={18} />
                                </div>
                                <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.name}</span>
                                <ChevronDown size={16} color="var(--color-text-tertiary)" />
                            </div>

                            {/* Dropdown Menu */}
                            {isLangDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '8px',
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    zIndex: 50,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    {LANGUAGES.map(lang => (
                                        <div
                                            key={lang.code}
                                            onClick={() => handleLanguageSelect(lang.code)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                borderBottom: '1px solid rgba(0,0,0,0.03)',
                                                background: selectedLanguage === lang.code ? 'var(--color-soft-mint)' : 'transparent',
                                                color: selectedLanguage === lang.code ? 'var(--color-sage-green)' : 'inherit',
                                                fontWeight: selectedLanguage === lang.code ? '600' : '400'
                                            }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {lang.name}
                                            </span>
                                            {selectedLanguage === lang.code && <Check size={16} />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    {successMessage && (
                        <div style={{ marginBottom: '20px', padding: '12px', borderRadius: '12px', background: 'rgba(135, 169, 107, 0.1)', color: 'var(--color-sage-green)', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div style={{ marginBottom: '20px', padding: '12px', borderRadius: '12px', background: 'rgba(255, 82, 82, 0.1)', color: '#FF5252', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
                            {errorMessage}
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'var(--color-sage-green)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 20px rgba(135, 169, 107, 0.25)',
                            transition: 'transform 0.1s'
                        }}
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileView;
