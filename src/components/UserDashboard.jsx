import React, { useState, useEffect } from 'react';
import { Bell, Menu, Search, LogOut, Plus } from 'lucide-react';
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

    // Data State
    const [events, setEvents] = useState([]);
    const [neighbors, setNeighbors] = useState([]);
    const [activeChatEvent, setActiveChatEvent] = useState(null);
    const [user, setUser] = useState({ full_name: userName });

    // Chat State
    const [currentSession, setCurrentSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [streamingContent, setStreamingContent] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        fetchDashboardData();

        // Poll for unread notifications
        const checkNotifications = async () => {
            try {
                const data = await notificationsService.getNotifications(0, 5);
                // API returns { results: [], messages: boolean }
                const list = Array.isArray(data) ? data : (data.results || []);
                setHasUnreadNotifications(list.some(n => !n.is_read));
            } catch (error) {
                console.error('Failed to check notifications', error);
            }
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
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
                name: c.full_name || c.username,
                points: c.points || 0,
                avatar: PLACEHOLDERS[`avatar${(i % 3) + 1}`]
            }));
            setLeaders(leaderList);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    };

    const handleJoinEvent = async (eventId) => {
        try {
            await eventsService.joinEvent(eventId);
            // Optimistic update
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
            // Optimistic update
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
        } catch (error) {
            console.error('Failed to add neighbor:', error);
        }
    };

    // Chat Logic
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
        const optimisticMsg = { role: 'user', user_message: text, id: Date.now() };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            let sessionId = currentSession?.session_id;
            await chatService.streamChatMessage(
                { prompt: text, session_id: sessionId || null },
                (chunk) => setStreamingContent(prev => prev + chunk),
                (finalData) => {
                    setIsThinking(false);
                    setStreamingContent('');
                    if (finalData.session_id) {
                        if (!sessionId) {
                            setCurrentSession({
                                session_id: finalData.session_id,
                                first_user_message: text,
                                created_at: new Date().toISOString()
                            });
                        }
                        loadMessages(finalData.session_id);
                    }
                },
                (err) => {
                    console.error('Streaming error', err);
                    setIsThinking(false);
                    setMessages(prev => [...prev, { role: 'assistant', ai_message: "I'm having trouble connecting right now. Please try again." }]);
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
        setMessages([]); // Clear distinct messages before loading new ones
        setViewMode('chat');
        setIsSidebarOpen(false);
        if (session?.session_id) loadMessages(session.session_id);
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
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }} title="Logout">
                            <LogOut size={20} color="var(--color-charcoal)" />
                        </button>
                    )}
                </div>
            </header>

            {/* Dashboard Content */}
            {viewMode === 'dashboard' ? (
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '120px' }}>

                    {/* Community Events */}
                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2>Community Events</h2>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'var(--color-sage-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(135, 169, 107, 0.3)'
                            }}>
                                <Plus size={18} color="white" />
                            </div>
                        </div>

                        <div className="no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '4px 4px 24px 4px' }}>
                            {events && events.length > 0 ? events.map((event) => (
                                <EventCard
                                    key={event.event_id}
                                    event={event}
                                    isJoined={event.this_user_already_joined}
                                    onJoin={handleJoinEvent}
                                    onLeave={handleLeaveEvent}
                                    onChat={(id) => setActiveChatEvent(event)}
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
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-sage-green)' }}>View All</span>
                        </div>

                        <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {neighbors && neighbors.length > 0 ? neighbors.map((neighbor) => (
                                <div key={neighbor.id} style={{ minWidth: '200px' }}>
                                    <NeighborCard
                                        neighbor={neighbor}
                                        onAdd={handleAddNeighbor}
                                        isAdded={false} // Would check if already friend in a real app
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
                                {leaders.map((leader) => (
                                    <LeaderboardItem key={leader.rank} {...leader} maxPoints={1500} />
                                ))}
                            </div>
                        </div>
                    </section>
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
                />
            )}

            {/* AI Interface & Nav */}
            <ChatInput onSend={handleSendMessage} disabled={isThinking} />
            <BottomNavigation activeTab={viewMode} onTabChange={(tab) => {
                if (tab === 'home') setViewMode('dashboard');
                if (tab === 'profile') setViewMode('profile');
            }} />
        </div>
    );
};

export default UserDashboard;
