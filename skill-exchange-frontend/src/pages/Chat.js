// src/pages/Chat.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { chatAPI, exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../components/Components.css';
import './Chat.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export default function Chat() {
  const { exchangeId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load exchange info + chat history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exchRes, msgRes] = await Promise.all([
          exchangeAPI.getById(exchangeId),
          chatAPI.getMessages(exchangeId),
        ]);
        setExchange(exchRes.data.request);
        setMessages(msgRes.data.messages);
      } catch (err) {
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [exchangeId]);

  // Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinRoom', { exchangeRequestId: exchangeId });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('newMessage', (msg) => {
      setMessages(prev => {
        // Avoid duplicate messages
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('userTyping', ({ name }) => {
      setTypingUser(name);
      setTyping(true);
    });

    socket.on('userStoppedTyping', () => {
      setTyping(false);
      setTypingUser(null);
    });

    socket.on('error', ({ message }) => {
      toast.error(message);
    });

    return () => {
      socket.emit('leaveRoom', { exchangeRequestId: exchangeId });
      socket.disconnect();
    };
  }, [token, exchangeId]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content) return;

    setInput('');

    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', { exchangeRequestId: exchangeId, content });
      socketRef.current.emit('stopTyping', { exchangeRequestId: exchangeId });
    } else {
      // Fallback to REST
      try {
        const res = await chatAPI.sendMessage(exchangeId, content);
        setMessages(prev => [...prev, res.data.message]);
      } catch (err) {
        toast.error('Failed to send message');
      }
    }
  }, [input, exchangeId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { exchangeRequestId: exchangeId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stopTyping', { exchangeRequestId: exchangeId });
      }, 1500);
    }
  };

  const isSender = (msg) => msg.sender?._id === user?._id || msg.sender === user?._id;

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const otherUser = exchange
    ? exchange.sender?._id === user?._id ? exchange.receiver : exchange.sender
    : null;

  const otherInitials = otherUser?.name
    ? otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page chat-page">
      <div className="chat-layout">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate('/requests')}>
            ← Back
          </button>
          <div className="chat-sidebar-info card">
            <div className="avatar avatar-lg">{otherInitials}</div>
            <h3>{otherUser?.name}</h3>
            <div className={`connection-status ${connected ? 'online' : 'offline'}`}>
              <span className="status-dot" /> {connected ? 'Connected' : 'Reconnecting...'}
            </div>
            {exchange && (
              <div className="exchange-summary">
                <div className="exchange-summary-row">
                  <span className="exchange-label teach">YOU TEACH</span>
                  <span className="skill-tag">{exchange.senderSkill}</span>
                </div>
                <div className="exchange-summary-row">
                  <span className="exchange-label learn">YOU LEARN</span>
                  <span className="skill-tag skill-tag-learn">{exchange.receiverSkill}</span>
                </div>
              </div>
            )}
            <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
              onClick={() => navigate(`/sessions/new?exchange=${exchangeId}`)}>
              📅 Schedule Session
            </button>
          </div>
        </div>

        {/* Chatbox */}
        <div className="chatbox">
          <div className="chatbox-header">
            <div className="avatar avatar-sm">{otherInitials}</div>
            <div className="chat-header-info">
              <div className="chat-header-name">{otherUser?.name || 'Exchange Partner'}</div>
              <div className="chat-header-status">
                {connected ? '● Online' : '○ Offline'}
              </div>
            </div>
            <div className="chat-msg-count">{messages.length} messages</div>
          </div>

          <div className="chatbox-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>💬</div>
                <p>Start the conversation!</p>
                <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Introduce yourself and discuss how you'll exchange skills.</p>
              </div>
            )}

            {messages.map((msg, i) => {
              const sent = isSender(msg);
              const showSender = !sent && (i === 0 || isSender(messages[i - 1]));
              return (
                <div key={msg._id || i} className={`message-bubble ${sent ? 'sent' : 'received'}`}>
                  {showSender && (
                    <div className="bubble-sender">{msg.sender?.name}</div>
                  )}
                  <div className="bubble-content">{msg.content}</div>
                  <div className="bubble-time">{formatTime(msg.createdAt)}</div>
                </div>
              );
            })}

            {typing && typingUser && (
              <div className="typing-indicator">
                <div className="typing-dots"><span/><span/><span/></div>
                {typingUser} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbox-input-area">
            <textarea
              className="chat-input"
              placeholder="Type a message... (Enter to send)"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="btn btn-primary send-btn" onClick={handleSend} disabled={!input.trim()}>
              Send ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
