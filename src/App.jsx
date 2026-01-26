import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import JoinRoom from './components/JoinRoom';
import { authService } from './services/auth';

function AppContent() {
  const [user, setUser] = useState(null); // { name: string, role: 'user' | 'admin', ... }
  const [roomStatus, setRoomStatus] = useState(null); // { hasRoom: boolean, room?: object, isAdmin?: boolean }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication and room status on mount
  useEffect(() => {
    const checkAuthAndRoom = async () => {
      try {
        const { user: verifiedUser, roomStatus: userRoomStatus } = await authService.verifyUserAndRoomStatus();
        if (verifiedUser) {
          setUser(verifiedUser);
          setRoomStatus(userRoomStatus);
        } else {
          setUser(null);
          setRoomStatus(null);
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setRoomStatus(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRoom();
  }, [navigate]);

  const handleLogin = async (userData) => {
    setUser(userData);

    if (userData.role === 'admin') {
      // Immediately set room status for admins to prevent flash
      setRoomStatus({ hasRoom: true, isAdmin: true });
      // Use setTimeout to ensure state is set before navigation
      setTimeout(() => navigate('/admin'), 0);
    } else {
      // For regular users, check room status
      const userRoomStatus = await authService.checkUserRoomStatus();
      const status = userRoomStatus ? { hasRoom: true, room: userRoomStatus } : { hasRoom: false };
      setRoomStatus(status);

      if (status.hasRoom) {
        navigate('/dashboard');
      } else {
        navigate('/join-room');
      }
    }
  };

  const handleRoomJoined = (roomData) => {
    setRoomStatus({ hasRoom: true, room: roomData });
    navigate('/dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setRoomStatus(null);
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a0a',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          user.role === 'admin' ?
            <Navigate to="/admin" replace /> :
            (roomStatus?.hasRoom ? <Navigate to="/dashboard" replace /> : <Navigate to="/join-room" replace />)
        ) : <Login onLogin={handleLogin} />
      } />
      <Route
        path="/join-room"
        element={
          user && user.role === 'user' && !roomStatus?.hasRoom ? (
            <JoinRoom onRoomJoined={handleRoomJoined} onLogout={handleLogout} />
          ) : (
            user ? (
              user.role === 'admin' ?
                <Navigate to="/admin" replace /> :
                <Navigate to="/dashboard" replace />
            ) : <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          user && user.role === 'user' && roomStatus?.hasRoom ? (
            <UserDashboard userName={user.username} onLogout={handleLogout} roomInfo={roomStatus.room} />
          ) : (
            user && user.role === 'user' && !roomStatus?.hasRoom ?
              <Navigate to="/join-room" replace /> :
              <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          user && user.role === 'admin' ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
