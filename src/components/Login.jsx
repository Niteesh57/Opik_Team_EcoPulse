import React, { useState } from 'react';
import { Leaf, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/auth';

const Login = ({ onLogin }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [isAdminSignup, setIsAdminSignup] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalFrames = 11;

    React.useEffect(() => {
        // Preload images
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.src = `/hero/${i}.jpeg`;
        }

        const interval = setInterval(() => {
            setCurrentFrame(prev => {
                const next = (prev % totalFrames) + 1;
                console.log('Frame changing to:', next);
                return next;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [totalFrames]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;

            if (isSignup) {
                if (isAdminSignup) {
                    result = await authService.signupAdmin(
                        formData.username,
                        formData.email,
                        formData.password,
                        formData.fullName || null
                    );
                } else {
                    result = await authService.signup(
                        formData.username,
                        formData.email,
                        formData.password,
                        formData.fullName || null
                    );
                }
            } else {
                result = await authService.login(formData.username, formData.password);
            }

            if (result && result.user) {
                onLogin(result.user);
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 12px 12px 40px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        outline: 'none',
        fontSize: '14px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
    };

    return (
        <div style={{
            position: 'relative',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000'
        }}>
            {/* Background with optimized image caching */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(/hero/${currentFrame}.jpeg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0
            }}>
                {/* Dark Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
                    backdropFilter: 'blur(1px)'
                }} />
            </div>

            {/* Breathing Glow */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '150%',
                    height: '150%',
                    background: 'radial-gradient(circle, rgba(135, 169, 107, 0.15) 0%, transparent 70%)',
                    animation: 'breathe 8s ease-in-out infinite'
                }} />
                <style>{`
                    @keyframes breathe {
                        0%, 100% { 
                            transform: translate(-50%, -50%) scale(1); 
                            opacity: 0.4;
                        }
                        50% { 
                            transform: translate(-50%, -50%) scale(1.1); 
                            opacity: 0.7;
                        }
                    }
                    @keyframes slideUp {
                        from { 
                            opacity: 0; 
                            transform: translateY(20px); 
                        }
                        to { 
                            opacity: 1; 
                            transform: translateY(0); 
                        }
                    }
                    .anim-item { 
                        animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
                        opacity: 0;
                    }
                    .anim-delay-1 { animation-delay: 0.1s; }
                    .anim-delay-2 { animation-delay: 0.2s; }
                    .anim-delay-3 { animation-delay: 0.3s; }
                    .anim-delay-4 { animation-delay: 0.4s; }
                `}</style>
            </div>

            {/* Glass Card */}
            <div style={{
                width: '90%',
                maxWidth: '380px',
                padding: '40px 32px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(25px)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Logo */}
                <div className="anim-item" style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #87a96b 0%, #6b8e5c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    boxShadow: '0 0 30px rgba(135, 169, 107, 0.4)'
                }}>
                    <Leaf color="white" size={28} />
                </div>

                {/* Title */}
                <h1 className="anim-item anim-delay-1" style={{
                    color: 'white',
                    marginBottom: '8px',
                    fontSize: '26px',
                    fontWeight: '700',
                    letterSpacing: '-0.5px'
                }}>
                    {isSignup ? 'Grow With Us' : 'Welcome Back'}
                </h1>

                {/* Subtitle */}
                <p className="anim-item anim-delay-2" style={{
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '32px',
                    textAlign: 'center',
                    fontSize: '13px',
                    lineHeight: '1.5'
                }}>
                    {isSignup ? 'Join the community restoring our planet.' : 'Connect with nature and your neighbors.'}
                </p>

                {/* Form Container */}
                <div style={{ width: '100%' }}>
                    {/* Username */}
                    <div className="anim-item anim-delay-3" style={{ marginBottom: '14px', position: 'relative' }}>
                        <User size={16} color="rgba(255,255,255,0.5)" style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                        }} />
                        <input
                            name="username"
                            type="text"
                            placeholder="Username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    {isSignup && (
                        <>
                            {/* Full Name */}
                            <div className="anim-item anim-delay-3" style={{ marginBottom: '14px', position: 'relative' }}>
                                <User size={16} color="rgba(255,255,255,0.5)" style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }} />
                                <input
                                    name="fullName"
                                    type="text"
                                    placeholder="Full Name (Optional)"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Email */}
                            <div className="anim-item anim-delay-3" style={{ marginBottom: '14px', position: 'relative' }}>
                                <Mail size={16} color="rgba(255,255,255,0.5)" style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    required={isSignup}
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>
                        </>
                    )}

                    {/* Password */}
                    <div className="anim-item anim-delay-3" style={{ marginBottom: '20px', position: 'relative' }}>
                        <Lock size={16} color="rgba(255,255,255,0.5)" style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                        }} />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    {/* Admin Checkbox */}
                    {isSignup && (
                        <div
                            className="anim-item anim-delay-3"
                            style={{
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'rgba(255,255,255,0.8)',
                                cursor: 'pointer',
                                userSelect: 'none',
                                fontSize: '13px'
                            }}
                            onClick={() => setIsAdminSignup(!isAdminSignup)}
                        >
                            <div style={{
                                width: '18px',
                                height: '18px',
                                minWidth: '18px',
                                border: '2px solid rgba(255,255,255,0.4)',
                                borderRadius: '4px',
                                marginRight: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isAdminSignup ? 'rgba(135, 169, 107, 0.8)' : 'transparent',
                                transition: 'all 0.2s'
                            }}>
                                {isAdminSignup && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                            </div>
                            <span>Register as Admin</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <p style={{
                            color: '#FF8A80',
                            textAlign: 'center',
                            marginBottom: '16px',
                            fontSize: '12px'
                        }}>
                            {error}
                        </p>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="anim-item anim-delay-4"
                        style={{
                            width: '100%',
                            padding: '13px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #87a96b 0%, #6b8e5c 100%)',
                            color: 'white',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            transition: 'all 0.3s',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 15px rgba(135, 169, 107, 0.3)'
                        }}
                    >
                        {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </div>

                {/* Toggle Button */}
                <div className="anim-item anim-delay-4" style={{ marginTop: '18px' }}>
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.65)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'color 0.2s',
                            padding: 0
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
                        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.65)'}
                    >
                        {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: '32px',
                width: '100%',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px'
            }}>
                <p>🌱 Creating stronger bonds with nature</p>
            </div>
        </div>
    );
};

export default Login;