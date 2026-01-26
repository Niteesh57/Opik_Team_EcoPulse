import React, { useState, useEffect } from 'react';
import { Bell, Menu, Search, LogOut } from 'lucide-react';
import TaskCard from './TaskCard';
import LeaderboardItem from './LeaderboardItem';
import BottomNavigation from './BottomNavigation';
import ChatInput from './ChatInput';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { chatService } from '../services/chatService';

// Placeholder Assets
const PLACEHOLDERS = {
    monstera: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80",
    succulent: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80",
    avatar1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    avatar2: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
    avatar3: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
};

const UserDashboard = ({ userName = "Alex", onLogout }) => {
    // View State
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'chat'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Chat State
    const [currentSession, setCurrentSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [streamingContent, setStreamingContent] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const tasks = [
        {
            title: "Community Garden Prep",
            plantName: "Monstera Deliciosa",
            image: PLACEHOLDERS.monstera,
            priority: "High Priority",
            neighbors: [PLACEHOLDERS.avatar1, PLACEHOLDERS.avatar2]
        },
        {
            title: "Succulent Swap",
            plantName: "Echeveria Elegans",
            image: PLACEHOLDERS.succulent,
            priority: "Weekend Event",
            neighbors: [PLACEHOLDERS.avatar3, PLACEHOLDERS.avatar1]
        }
    ];

    const leaders = [
        { rank: 1, name: "Sarah Chen", points: 1250, avatar: PLACEHOLDERS.avatar1 },
        { rank: 2, name: "Marcus Johnson", points: 980, avatar: PLACEHOLDERS.avatar3 },
        { rank: 3, name: "Emma Wilson", points: 845, avatar: PLACEHOLDERS.avatar2 },
        { rank: 4, name: "David Kim", points: 720, avatar: PLACEHOLDERS.avatar1 },
    ];

    // Load messages when a session is selected
    useEffect(() => {
        if (currentSession?.session_id) {
            loadMessages(currentSession.session_id);
        } else {
            setMessages([]);
        }
    }, [currentSession]);

    const loadMessages = async (sessionId) => {
        try {
            const history = await chatService.getMessages(sessionId);
            setMessages(history);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = async (text) => {
        setViewMode('chat');
        setIsThinking(true);
        setStreamingContent('');

        // Optimistic update for user message
        const optimisticMsg = { role: 'user', user_message: text, id: Date.now() };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            let sessionId = currentSession?.session_id;

            // If no session, create one first or if passing initial prompt is supported
            // The API expects 'prompt' and optional 'session_id'

            await chatService.streamChatMessage(
                {
                    prompt: text,
                    session_id: sessionId || null
                },
                (chunk) => {
                    setStreamingContent(prev => prev + chunk);
                },
                (finalData) => {
                    setIsThinking(false);
                    setStreamingContent('');
                    if (finalData.session_id) {
                        // If we just created a session, update state
                        if (!sessionId) {
                            setCurrentSession({
                                session_id: finalData.session_id,
                                first_user_message: text,
                                created_at: new Date().toISOString()
                            });
                        }
                        // Reload messages to get the persisted AI message with ID
                        loadMessages(finalData.session_id);
                    }
                },
                (err) => {
                    console.error('Streaming error', err);
                    setIsThinking(false);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        ai_message: "I'm having trouble connecting right now. Please try again."
                    }]);
                }
            );

        } catch (error) {
            console.error(error);
            setIsThinking(false);
        }
    };

    const handleNewChat = () => {
        setCurrentSession(null);
        setMessages([]);
        setViewMode('chat');
        setIsSidebarOpen(false);
    };

    const handleSelectSession = (session) => {
        setCurrentSession(session);
        setViewMode('chat');
        setIsSidebarOpen(false);
    };

    return (
        <div className="container" style={{ overflow: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                activeSessionId={currentSession?.session_id}
            />

            {/* Overlay for Sidebar */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 90
                    }}
                />
            )}

            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                marginBottom: viewMode === 'chat' ? '0' : '24px',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        style={{
                            width: '40px', height: '40px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Menu size={20} color="var(--color-charcoal)" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: '700' }}>
                            {viewMode === 'chat' ? 'Green Sentinel' : 'EcoPulse'}
                        </h1>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {viewMode === 'chat' ? (currentSession ? 'Chat Session' : 'New Conversation') : `Good Morning, ${userName}`}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative'
                    }}>
                        <Bell size={20} color="var(--color-charcoal)" />
                        <div style={{
                            position: 'absolute', top: '10px', right: '10px',
                            width: '8px', height: '8px', background: '#FF5252', borderRadius: '50%', border: '1px solid white'
                        }} />
                    </div>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            title="Logout"
                        >
                            <LogOut size={20} color="var(--color-charcoal)" />
                        </button>
                    )}
                </div>
            </header>

            {/* Dashboard Content */}
            {viewMode === 'dashboard' ? (
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '120px' }}>

                    {/* Task Orchestration */}
                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2>Active Tasks</h2>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-sage-green)' }}>View All</span>
                        </div>

                        <div className="no-scrollbar" style={{ display: 'flex', overflowX: 'auto', paddingBottom: '4px' }}>
                            {tasks.map((task, i) => (
                                <TaskCard key={i} {...task} />
                            ))}
                        </div>
                    </section>

                    {/* Impact Leaderboard */}
                    <section style={{ marginBottom: '24px' }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '24px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ marginBottom: 0 }}>Community Champions</h2>
                                <div style={{
                                    background: 'var(--color-soft-mint)',
                                    padding: '8px', borderRadius: '12px'
                                }}>
                                    <Search size={16} color="var(--color-sage-green)" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {leaders.map((leader) => (
                                    <LeaderboardItem key={leader.rank} {...leader} maxPoints={1500} />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <ChatArea
                    messages={messages}
                    loading={isThinking}
                    streamingMessage={streamingContent}
                />
            )}

            {/* AI Interface & Nav */}
            <ChatInput onSend={handleSendMessage} disabled={isThinking} />
            <BottomNavigation activeTab={viewMode} onTabChange={(tab) => {
                if (tab === 'home') setViewMode('dashboard');
                // other tabs logic
            }} />
        </div>
    );
};

export default UserDashboard;

