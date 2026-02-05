import React, { useRef, useState, useEffect } from "react";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';

export default function VoiceRoom({ isOpen, onClose }) {
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const [userLang, setUserLang] = useState("en");
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch user language on mount
  useEffect(() => {
    const fetchUserLanguage = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        const response = await fetch(`${apiUrl}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUserLang(userData.lang || 'en');
        }
      } catch (error) {
        console.error('Failed to fetch user language:', error);
      }
    };
    fetchUserLanguage();
  }, []);

  async function join() {
    if (!roomId.trim()) return alert("Enter room ID");

    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = apiUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}/api/v1/voice/ws/${roomId}/${userLang}`;
    
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    socketRef.current = ws;

    ws.onopen = () => setStatus("Connected");
    ws.onclose = () => setStatus("Disconnected");

    ws.onmessage = (e) => {
      // 📝 TEXT
      if (typeof e.data === "string") {
        const msg = JSON.parse(e.data);
        if (msg.type === "text" && msg.language === userLang) {
          setMessages(prev => [...prev, msg.text]);
        }
        return;
      }

      // 🔊 AUDIO (PLAY IMMEDIATELY)
      const blob = new Blob([e.data], { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play().finally(() => URL.revokeObjectURL(url));
    };

    // 🎤 MIC
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const startRecorder = () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm; codecs=opus",
      });
      recorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 1000 && ws.readyState === 1) {
          ws.send(await e.data.arrayBuffer());
        }
      };

      recorder.start();
      setTimeout(() => recorder.stop(), 3000);
    };

    startRecorder();
    timerRef.current = setInterval(startRecorder, 3000);
  }

  function leave() {
    clearInterval(timerRef.current);
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    socketRef.current?.close();
    setStatus("Disconnected");
    setMessages([]);
  }

  function toggleMute() {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '500px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
              🎙️ Voice Room
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '20px',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ×
            </button>
          </div>
          
          {/* Status Badge */}
          <div style={{
            marginTop: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: status === 'Connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: status === 'Connected' ? '#22c55e' : '#fbbf24',
              animation: status === 'Connected' ? 'pulse 2s infinite' : 'none'
            }} />
            {status}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {status !== "Connected" ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--color-charcoal)',
                  marginBottom: '8px'
                }}>
                  Room ID
                </label>
                <input
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  placeholder="Enter room ID..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(135, 169, 107, 0.2)',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-sage-green)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(135, 169, 107, 0.2)'}
                />
              </div>

              <button
                onClick={join}
                style={{
                  background: 'linear-gradient(135deg, var(--color-sage-green) 0%, #5d7d4a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(135, 169, 107, 0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Phone size={20} />
                Join Room
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Control Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={toggleMute}
                  style={{
                    background: isMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(135, 169, 107, 0.1)',
                    color: isMuted ? '#ef4444' : 'var(--color-sage-green)',
                    border: `2px solid ${isMuted ? '#ef4444' : 'var(--color-sage-green)'}`,
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                  onClick={leave}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <PhoneOff size={24} />
                </button>
              </div>

              {/* Messages */}
              {messages.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'rgba(135, 169, 107, 0.05)',
                  borderRadius: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--color-charcoal)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Volume2 size={16} />
                    Transcriptions
                  </div>
                  {messages.map((m, i) => (
                    <div key={i} style={{
                      padding: '8px 12px',
                      background: 'white',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: 'var(--color-charcoal)'
                    }}>
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
