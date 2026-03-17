// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exchangeAPI, sessionAPI, userAPI } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ requests: 0, sessions: 0, matches: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, sessionRes, matchRes] = await Promise.all([
          exchangeAPI.getMy(),
          sessionAPI.getMy(),
          userAPI.getMatches(),
        ]);
        const allRequests = [...reqRes.data.sent, ...reqRes.data.received];
        setRecentRequests(allRequests.slice(0, 3));
        setUpcomingSessions(sessionRes.data.sessions?.slice(0, 3) || []);
        setStats({
          requests: allRequests.length,
          sessions: sessionRes.data.sessions?.length || 0,
          matches: matchRes.data.count || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="page dashboard-page">
      {/* Hero section */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-left">
          <div className="avatar avatar-lg">{initials}</div>
          <div>
            <h1>Hello, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="hero-sub">Ready to exchange skills today?</p>
            {user?.lmsScore > 0 && (
              <div className="lms-badge">
                <span>⟡</span> LMS Score: <strong>{user.lmsScore}</strong>
              </div>
            )}
          </div>
        </div>
        <div className="dashboard-hero-actions">
          <Link to="/matches" className="btn btn-primary">Find Matches</Link>
          <Link to="/skills" className="btn btn-outline">Browse Skills</Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {[
          { label: 'Skill Matches', value: stats.matches, icon: '⟡', to: '/matches', color: 'accent' },
          { label: 'Exchanges', value: stats.requests, icon: '◎', to: '/requests', color: 'blue' },
          { label: 'Sessions', value: stats.sessions, icon: '◷', to: '/sessions', color: 'green' },
          { label: 'Rating', value: user?.rating > 0 ? `${user.rating.toFixed(1)}★` : '—', icon: '◆', to: '/reviews', color: 'accent' },
        ].map((stat) => (
          <Link to={stat.to} key={stat.label} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{loading ? '–' : stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Skills section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Your Skills</h2>
            <Link to="/profile" className="section-link">Edit →</Link>
          </div>
          <div className="skills-panel">
            <div className="skills-panel-col">
              <div className="skills-section-label">TEACHING</div>
              <div className="skill-tags">
                {user?.skillsToTeach?.length > 0
                  ? user.skillsToTeach.map((s, i) => <span key={i} className="skill-tag">{s}</span>)
                  : <span className="empty-hint">Add skills to teach</span>}
              </div>
            </div>
            <div className="skills-panel-divider" />
            <div className="skills-panel-col">
              <div className="skills-section-label learn">LEARNING</div>
              <div className="skill-tags">
                {user?.skillsToLearn?.length > 0
                  ? user.skillsToLearn.map((s, i) => <span key={i} className="skill-tag skill-tag-learn">{s}</span>)
                  : <span className="empty-hint">Add skills to learn</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming sessions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Sessions</h2>
            <Link to="/sessions" className="section-link">View all →</Link>
          </div>
          {loading ? <div className="spinner" /> :
           upcomingSessions.length === 0
            ? <div className="empty-hint-block">No sessions scheduled yet</div>
            : upcomingSessions.map(s => (
              <div key={s._id} className="mini-session-card">
                <div className="mini-session-date">
                  {new Date(s.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="mini-session-info">
                  <div className="mini-session-topic">{s.topic || 'Skill Session'}</div>
                  <div className="mini-session-time">{s.scheduledTime}</div>
                </div>
                <span className={`badge badge-${s.status === 'scheduled' ? 'green' : 'gray'}`}>
                  {s.status}
                </span>
              </div>
          ))}
        </div>

        {/* Recent requests */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Requests</h2>
            <Link to="/requests" className="section-link">View all →</Link>
          </div>
          {loading ? <div className="spinner" /> :
           recentRequests.length === 0
            ? <div className="empty-hint-block">No exchange requests yet</div>
            : recentRequests.map(r => {
              const isSender = r.sender?._id === user?._id || r.sender === user?._id;
              const other = isSender ? r.receiver : r.sender;
              const initials2 = other?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';
              return (
                <div key={r._id} className="mini-request-row">
                  <div className="avatar avatar-sm">{initials2}</div>
                  <div className="mini-request-info">
                    <span className="mini-request-name">{other?.name}</span>
                    <span className="mini-request-skills">{r.senderSkill} ⇄ {r.receiverSkill}</span>
                  </div>
                  <span className={`badge badge-${r.status === 'accepted' ? 'green' : r.status === 'rejected' ? 'red' : 'accent'}`}>
                    {r.status}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
