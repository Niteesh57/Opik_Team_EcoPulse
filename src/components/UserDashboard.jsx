import React from 'react';
import { Bell, Menu, Search, LogOut } from 'lucide-react';
import TaskCard from './TaskCard';
import LeaderboardItem from './LeaderboardItem';
import BottomNavigation from './BottomNavigation';
import ChatInput from './ChatInput';

// Placeholder Assets
const PLACEHOLDERS = {
    monstera: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80",
    succulent: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80",
    avatar1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    avatar2: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
    avatar3: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
};

const UserDashboard = ({ userName = "Alex", onLogout, roomInfo = null }) => {
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
        { rank: 4, name: "David Kim", points: 720, avatar: PLACEHOLDERS.avatar1 }, // reusing avatar for demo
    ];

    return (
        <div className="container">
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingTop: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                        <Menu size={20} color="var(--color-charcoal)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: '700' }}>EcoPulse</h1>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Good Morning, {userName}</span>
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
                            onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            title="Logout"
                        >
                            <LogOut size={20} color="var(--color-charcoal)" />
                        </button>
                    )}
                </div>
            </header>

            {/* Task Orchestration (Top Section) */}
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

            {/* Impact Leaderboard (Middle Section) */}
            <section style={{ marginBottom: '120px' }}>
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

            {/* AI Interface & Nav */}
            <ChatInput />
            <BottomNavigation />
        </div>
    );
};

export default UserDashboard;
