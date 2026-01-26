import React, { useState } from 'react';
import { ChevronRight, Leaf, MessageSquare, Users, TrendingUp, X } from 'lucide-react';

const OnboardingGuide = ({ onComplete, onSkip }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            icon: Leaf,
            title: "Welcome to EcoPulse",
            description: "Your community's sustainability companion. Track, collaborate, and grow together towards a greener future.",
            color: "#87A96B"
        },
        {
            icon: Users,
            title: "Community-Driven",
            description: "Join your neighborhood or building community. Share tips, organize events, and track collective environmental impact.",
            color: "#6B8E50"
        },
        {
            icon: MessageSquare,
            title: "AI Green Sentinel",
            description: "Get instant answers about sustainability, recycling, composting, and eco-friendly practices from our AI assistant.",
            color: "#87A96B"
        },
        {
            icon: TrendingUp,
            title: "Track Your Impact",
            description: "Monitor your contributions, earn recognition, and see how your community is making a difference together.",
            color: "#4A6B3A"
        }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onSkip();
    };

    const slide = slides[currentSlide];
    const Icon = slide.icon;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, #87A96B 0%, #6B8E50 100%)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Skip Button */}
            <button
                onClick={handleSkip}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
                <X size={20} />
            </button>

            {/* Content */}
            <div style={{
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                color: 'white'
            }}>
                {/* Icon */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Icon size={60} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    {slide.title}
                </h1>

                {/* Description */}
                <p style={{
                    fontSize: '18px',
                    lineHeight: '1.6',
                    opacity: 0.95,
                    marginBottom: '48px',
                    textShadow: '0 1px 5px rgba(0,0,0,0.1)'
                }}>
                    {slide.description}
                </p>

                {/* Progress Dots */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    marginBottom: '32px'
                }}>
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: currentSlide === index ? '32px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.4)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    style={{
                        background: 'white',
                        color: slide.color,
                        border: 'none',
                        borderRadius: '50px',
                        padding: '16px 32px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                    }}
                >
                    {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default OnboardingGuide;
