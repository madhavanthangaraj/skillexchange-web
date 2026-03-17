// src/components/UserCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserCard({ user, matchScore, onSendRequest }) {
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="card user-card">
      <div className="user-card-top">
        <div className="avatar avatar-lg">{initials}</div>
        <div className="user-card-info">
          <h3 className="user-card-name">{user.name}</h3>
          {user.rating > 0 && (
            <div className="user-rating">
              <span className="stars">{'★'.repeat(Math.round(user.rating))}</span>
              <span className="rating-text">{user.rating.toFixed(1)} ({user.totalReviews || 0} reviews)</span>
            </div>
          )}
          {matchScore !== undefined && (
            <div className="match-score">
              <span>⟡</span> {matchScore} pt match
            </div>
          )}
        </div>
      </div>

      {user.bio && <p className="user-bio">{user.bio}</p>}

      <div className="user-skills-section">
        {user.skillsToTeach?.length > 0 && (
          <div>
            <div className="skills-section-label">TEACHES</div>
            <div className="skill-tags">
              {user.skillsToTeach.slice(0, 4).map((s, i) => (
                <span key={i} className="skill-tag">{s}</span>
              ))}
              {user.skillsToTeach.length > 4 && (
                <span className="skill-tag">+{user.skillsToTeach.length - 4}</span>
              )}
            </div>
          </div>
        )}
        {user.skillsToLearn?.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div className="skills-section-label learn">WANTS TO LEARN</div>
            <div className="skill-tags">
              {user.skillsToLearn.slice(0, 4).map((s, i) => (
                <span key={i} className="skill-tag skill-tag-learn">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="user-card-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/users/${user._id}`)}>
          View Profile
        </button>
        {onSendRequest && (
          <button className="btn btn-primary btn-sm" onClick={() => onSendRequest(user)}>
            Request Exchange
          </button>
        )}
      </div>
    </div>
  );
}
