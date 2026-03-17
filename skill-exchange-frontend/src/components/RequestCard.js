// src/components/RequestCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequestCard({ request, onAccept, onReject }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSender = request.sender?._id === user?._id || request.sender === user?._id;
  const otherUser = isSender ? request.receiver : request.sender;

  const initials = otherUser?.name
    ? otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const statusBadge = {
    pending: 'badge-accent',
    accepted: 'badge-green',
    rejected: 'badge-red',
    completed: 'badge-blue',
  }[request.status] || 'badge-gray';

  return (
    <div className={`card request-card ${request.status}`}>
      <div className="request-card-header">
        <div className="request-user">
          <div className="avatar avatar-sm">{initials}</div>
          <div>
            <div className="request-user-name">{otherUser?.name}</div>
            <div className="request-direction">{isSender ? 'Sent by you' : 'Received from them'}</div>
          </div>
        </div>
        <span className={`badge ${statusBadge}`}>{request.status}</span>
      </div>

      <div className="request-skills">
        <div className="request-skill-item">
          <span className="exchange-label teach">YOU TEACH</span>
          <span className="skill-tag">{request.senderSkill}</span>
        </div>
        <span className="exchange-arrow">⇄</span>
        <div className="request-skill-item">
          <span className="exchange-label learn">YOU LEARN</span>
          <span className="skill-tag skill-tag-learn">{request.receiverSkill}</span>
        </div>
      </div>

      {request.message && (
        <p className="request-message">"{request.message}"</p>
      )}

      {request.matchScore > 0 && (
        <div className="match-score" style={{ marginTop: '10px', display: 'inline-flex' }}>
          ⟡ Match Score: {request.matchScore} pts
        </div>
      )}

      <div className="request-card-actions">
        {request.status === 'accepted' && (
          <>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate(`/chat/${request._id}`)}
            >
              💬 Chat
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/sessions/new?exchange=${request._id}`)}
            >
              📅 Schedule
            </button>
          </>
        )}
        {request.status === 'pending' && !isSender && (
          <>
            <button className="btn btn-success btn-sm" onClick={() => onAccept(request._id)}>
              ✓ Accept
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onReject(request._id)}>
              ✗ Reject
            </button>
          </>
        )}
        {request.status === 'completed' && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/reviews/add?session=${request._id}&user=${otherUser?._id}`)}
          >
            ★ Leave Review
          </button>
        )}
      </div>
    </div>
  );
}
