import React, { useState, useEffect } from 'react';
import { Bell, Menu, Search, LogOut, Plus, Users } from 'lucide-react';
import LeaderboardItem from './LeaderboardItem';
import BottomNavigation from './BottomNavigation';
import ChatInput from './ChatInput';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import EventCard from './EventCard';
import NeighborCard from './NeighborCard';
import EventChatModal from './EventChatModal';
import NotificationsPanel from './NotificationsPanel';
import ProfileView from './ProfileView';
import CreateEventModal from './CreateEventModal';
import AddNeighborModal from './AddNeighborModal';
import DashboardSkeleton from './DashboardSkeleton';
import VoiceRoom from './VoiceRoom';

import { chatService } from '../services/chatService';
import { notificationsService } from '../services/notificationsService';
import { eventsService } from '../services/eventsService';
import { neighborsService } from '../services/neighborsService';
import { championsService } from '../services/championsService';

const PLACEHOLDERS = {
    avatar1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    avatar2: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
    avatar3: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
};

const UserDashboard = ({ userName = "Alex", onLogout }) => {
    // View State
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'chat' | 'profile'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

    // Modal States
    const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
    const [isAddNeighborOpen, setIsAddNeighborOpen] = useState(false);
    const [isVoiceRoomOpen, setIsVoiceRoomOpen] = useState(false);
    const [voiceRoomEvent, setVoiceRoomEvent] = useState(null);

    // Data State
    const [events, setEvents] = useState([]);
    const [neighbors, setNeighbors] = useState([]);
    const [leaders, setLeaders] = useState([]);
    const [activeChatEvent, setActiveChatEvent] = useState(null);
    const [user, setUser] = useState({ full_name: userName });
    const [neighborSearch, setNeighborSearch] = useState('');

    // Chat State
    const [currentSession, setCurrentSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [streamingContent, setStreamingContent] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [waitingForUser, setWaitingForUser] = useState(null);

    // Tool Activity State for real-time visualization
    const [toolActivity, setToolActivity] = useState({
        status: null,        // 'reasoning' | 'writing' | null
        statusMessage: '',
        activeTool: null,    // { name, description, args }
        completedTools: []   // Array of completed tool names
    });

    // Language preference - synced with localStorage and Profile changes
    const [preferredLanguage, setPreferredLanguage] = useState(() => {
        return localStorage.getItem('preferredLanguage') || 'en';
    });

    // Listen for language changes from ProfileView
    useEffect(() => {
        const handleLanguageChange = (event) => {
            setPreferredLanguage(event.detail);
        };
        window.addEventListener('languageChange', handleLanguageChange);
        return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, []);

    // Dashboard Loading State
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();

        // Poll for unread notifications
        const checkNotifications = async () => {
            try {
                const data = await notificationsService.getNotifications(0, 5);
                const list = Array.isArray(data) ? data : (data.results || []);
                setHasUnreadNotifications(list.some(n => !n.is_read));
            } catch (error) {
                console.error('Failed to check notifications', error);
            }
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 100000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentSession?.session_id) {
            loadMessages(currentSession.session_id);
        } else {
            setMessages([]);
        }
    }, [currentSession]);

    const fetchDashboardData = async () => {
        setIsDashboardLoading(true);
        try {
            const [eventsData, neighborsData, championsData] = await Promise.all([
                eventsService.getEvents(),
                neighborsService.getRoomMembers(),
                championsService.getChampions(0, 10)
            ]);
            setEvents(eventsData || []);
            setNeighbors(neighborsData || []);
            // Map champions to leaderboard format
            const leaderList = (championsData || []).map((c, i) => ({
                rank: i + 1,
                name: c.full_name || c.username || 'User',
                points: c.points || 0
                // No avatar - LeaderboardItem will show initials based on name
            }));
            setLeaders(leaderList);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsDashboardLoading(false);
        }
    };

    const handleSearchNeighbors = async (query) => {
        setNeighborSearch(query);
        if (!query.trim()) {
            // Reset to all members
            const data = await neighborsService.getRoomMembers();
            setNeighbors(data || []);
            return;
        }
        try {
            const results = await neighborsService.searchMembers(query);
            setNeighbors(results || []);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleJoinEvent = async (eventId) => {
        try {
            await eventsService.joinEvent(eventId);
            setEvents(events.map(e =>
                e.event_id === eventId
                    ? { ...e, this_user_already_joined: true, registered_users_count: (e.registered_users_count || 0) + 1 }
                    : e
            ));
        } catch (error) {
            console.error('Failed to join event:', error);
        }
    };

    const handleLeaveEvent = async (eventId) => {
        try {
            await eventsService.leaveEvent(eventId);
            setEvents(events.map(e =>
                e.event_id === eventId
                    ? { ...e, this_user_already_joined: false, registered_users_count: Math.max(0, (e.registered_users_count || 0) - 1) }
                    : e
            ));
        } catch (error) {
            console.error('Failed to leave event:', error);
        }
    };

    const handleAddNeighbor = async (userId) => {
        try {
            await neighborsService.addNeighbor(userId);
            alert("Friend request sent!");
            fetchDashboardData(); // Refresh
        } catch (error) {
            console.error('Failed to add neighbor:', error);
        }
    };

    const handleCallClick = () => {
        // Open voice room for current event if available
        if (activeChatEvent) {
            setVoiceRoomEvent(activeChatEvent);
            setIsVoiceRoomOpen(true);
        } else if (events.length > 0) {
            setVoiceRoomEvent(events[0]);
            setIsVoiceRoomOpen(true);
        } else {
            alert('No events available to join voice call');
        }
    };

    const handleEventCreated = (newEvent) => {
        setEvents(prev => [newEvent, ...prev]);
        setIsCreateEventOpen(false);
    };

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
        setWaitingForUser(null);

        // Reset tool activity
        setToolActivity({
            status: null,
            statusMessage: '',
            activeTool: null,
            completedTools: []
        });

        const optimisticMsg = { role: 'user', user_message: text, id: Date.now() };
        setMessages(prev => [...prev, optimisticMsg]);

        let isInterrupted = false;

        try {
            let threadId = currentSession?.session_id;

            await chatService.streamChatMessage(
                { message: text, thread_id: threadId || null, language: preferredLanguage },
                {
                    onSession: (data) => {
                        if (data.sessionId && !threadId) {
                            setCurrentSession({
                                session_id: data.sessionId,
                                first_user_message: text,
                                created_at: new Date().toISOString()
                            });
                        }
                    },
                    onStatus: (data) => {
                        setToolActivity(prev => ({
                            ...prev,
                            status: data.status,
                            statusMessage: data.message
                        }));
                    },
                    onToolStart: (data) => {
                        setToolActivity(prev => ({
                            ...prev,
                            activeTool: {
                                name: data.tool,
                                description: data.description,
                                args: data.args
                            }
                        }));
                    },
                    onToolEnd: (data) => {
                        setToolActivity(prev => ({
                            ...prev,
                            activeTool: null,
                            completedTools: [...prev.completedTools, data.tool]
                        }));
                    },
                    onDelta: (chunk) => {
                        setStreamingContent(prev => prev + chunk);
                    },
                    onWaitForUser: (data) => {
                        isInterrupted = true;
                        setIsThinking(false);
                        setWaitingForUser({
                            question: data.question,
                            sessionId: data.sessionId,
                            suggestions: data.expected // Capture suggestions/format
                        });
                        // Preserve tool state
                    },
                    onComplete: (finalData) => {
                        setIsThinking(false);
                        setStreamingContent('');
                        
                        if (!isInterrupted) {
                            setToolActivity({
                                status: null,
                                statusMessage: '',
                                activeTool: null,
                                completedTools: []
                            });
                        }

                        if (finalData.sessionId) {
                            loadMessages(finalData.sessionId);
                        } else if (threadId) {
                            loadMessages(threadId);
                        }
                    },
                    onError: (err) => {
                        console.error('Streaming error', err);
                        setIsThinking(false);
                        if (!isInterrupted) {
                            setToolActivity({
                                status: null,
                                statusMessage: '',
                                activeTool: null,
                                completedTools: []
                            });
                        }
                        setMessages(prev => [...prev, {
                            role: 'assistant',
                            ai_message: `Error: ${err.message || "I'm having trouble connecting right now. Please try again."}`
                        }]);
                    }
                }
            );
        } catch (error) {
            console.error(error);
            setIsThinking(false);
            setToolActivity({
                status: null,
                statusMessage: '',
                activeTool: null,
                completedTools: []
            });
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

            {/* Overlay */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 90 }} />
            )}

            {/* Event Chat Modal */}
            <EventChatModal
                isOpen={!!activeChatEvent}
                onClose={() => setActiveChatEvent(null)}
                eventId={activeChatEvent?.event_id}
                eventName={activeChatEvent?.event_name}
                currentUser={user}
            />

            {/* Create Event Modal */}
            <CreateEventModal
                isOpen={isCreateEventOpen}
                onClose={() => setIsCreateEventOpen(false)}
                onEventCreated={handleEventCreated}
            />

            {/* Add Neighbor Modal */}
            <AddNeighborModal
                isOpen={isAddNeighborOpen}
                onClose={() => setIsAddNeighborOpen(false)}
                onNeighborAdded={() => fetchDashboardData()}
            />

            {/* Header */}
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 0', marginBottom: viewMode === 'chat' ? '0' : '24px', flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setIsSidebarOpen(true)} style={{
                        width: '40px', height: '40px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
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
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative',
                            border: 'none', cursor: 'pointer'
                        }}>
                            <Bell size={20} color="var(--color-charcoal)" />
                            {hasUnreadNotifications && (
                                <div style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    width: '8px', height: '8px', background: '#FF5252', borderRadius: '50%', border: '1px solid white'
                                }} />
                            )}
                        </button>
                        <NotificationsPanel
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            onNotificationRead={() => setHasUnreadNotifications(false)}
                        />
                    </div>
                    {onLogout && (
                        <button onClick={onLogout} style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer'
                        }} title="Logout">
                            <LogOut size={20} color="var(--color-charcoal)" />
                        </button>
                    )}
                </div>
            </header>

            {/* Dashboard Content */}
            {viewMode === 'dashboard' ? (
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '120px' }}>
                    {isDashboardLoading ? (
                        <DashboardSkeleton />
                    ) : (
                        <>
                            {/* Community Events */}
                            <section style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h2>Community Events</h2>
                                    <button onClick={() => setIsCreateEventOpen(true)} style={{
                                        width: '32px', height: '32px', borderRadius: '10px',
                                        background: 'var(--color-sage-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(135, 169, 107, 0.3)', border: 'none', cursor: 'pointer'
                                    }}>
                                        <Plus size={18} color="white" />
                                    </button>
                                </div>

                                <div className="no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '4px 4px 24px 4px' }}>
                                    {events && events.length > 0 ? events.map((event) => (
                                        <EventCard
                                            key={event.event_id}
                                            event={event}
                                            isJoined={event.this_user_already_joined}
                                            onJoin={handleJoinEvent}
                                            onLeave={handleLeaveEvent}
                                            onChat={() => setActiveChatEvent(event)}
                                        />
                                    )) : (
                                        <div style={{ padding: '20px', color: 'var(--color-text-secondary)' }}>No upcoming events.</div>
                                    )}
                                </div>
                            </section>

                            {/* Neighbors */}
                            <section style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h2>Neighbors</h2>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            background: 'white', borderRadius: '20px', padding: '6px 12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}>
                                            <Search size={14} color="var(--color-sage-green)" />
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                value={neighborSearch}
                                                onChange={(e) => handleSearchNeighbors(e.target.value)}
                                                style={{
                                                    border: 'none', outline: 'none', fontSize: '12px', width: '80px',
                                                    background: 'transparent'
                                                }}
                                            />
                                        </div>
                                        <button onClick={() => setIsAddNeighborOpen(true)} style={{
                                            width: '28px', height: '28px', borderRadius: '8px',
                                            background: 'var(--color-sage-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: 'none', cursor: 'pointer'
                                        }}>
                                            <Users size={14} color="white" />
                                        </button>
                                    </div>
                                </div>

                                <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                                    {neighbors && neighbors.length > 0 ? neighbors.map((neighbor) => (
                                        <div key={neighbor.id} style={{ minWidth: '200px' }}>
                                            <NeighborCard
                                                neighbor={neighbor}
                                                onAdd={handleAddNeighbor}
                                                isAdded={neighbor.is_already_added}
                                            />
                                        </div>
                                    )) : (
                                        <div style={{ padding: '20px', color: 'var(--color-text-secondary)' }}>No neighbors found.</div>
                                    )}
                                </div>
                            </section>

                            {/* Champions */}
                            <section style={{ marginBottom: '24px' }}>
                                <div style={{
                                    background: 'white', borderRadius: '24px', padding: '24px',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h2 style={{ marginBottom: 0 }}>Community Champions</h2>
                                        <div style={{ background: 'var(--color-soft-mint)', padding: '8px', borderRadius: '12px' }}>
                                            <Search size={16} color="var(--color-sage-green)" />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {leaders.length > 0 ? leaders.map((leader) => (
                                            <LeaderboardItem key={leader.rank} {...leader} maxPoints={1500} />
                                        )) : (
                                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                                No champions yet. Be the first!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            ) : viewMode === 'profile' ? (
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
                    <ProfileView user={user} />
                </div>
            ) : (
                <ChatArea
                    messages={messages}
                    loading={isThinking}
                    streamingMessage={streamingContent}
                    waitingForUser={waitingForUser}
                    onSend={handleSendMessage}
                    toolSteps={[
                        // Add completed tools
                        ...toolActivity.completedTools.map(tool => ({
                            description: tool,
                            loading: false
                        })),
                        // Add active tool if any
                        ...(toolActivity.activeTool ? [{
                            description: toolActivity.activeTool.description || toolActivity.activeTool.name,
                            args: toolActivity.activeTool.args,
                            loading: true
                        }] : [])
                    ]}
                    statusMessage={toolActivity.statusMessage}
                />
            )}

            {/* AI Interface & Nav */}
            <ChatInput onSend={handleSendMessage} disabled={isThinking} />
            <BottomNavigation 
                activeTab={viewMode} 
                onTabChange={(tab) => {
                    if (tab === 'home') setViewMode('dashboard');
                    if (tab === 'profile') setViewMode('profile');
                }} 
                onCallClick={() => setIsVoiceRoomOpen(true)}
            />
            <VoiceRoom isOpen={isVoiceRoomOpen} onClose={() => setIsVoiceRoomOpen(false)} />
        </div>
    );
};

export default UserDashboard;
