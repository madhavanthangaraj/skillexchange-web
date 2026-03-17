// src/components/SkillCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SkillCard({ skill, onDelete, showActions = false }) {
  const navigate = useNavigate();
  const initials = skill.user?.name
    ? skill.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const levelColor = {
    Beginner: 'badge-green',
    Intermediate: 'badge-accent',
    Advanced: 'badge-red',
  }[skill.level] || 'badge-gray';

  return (
    <div className="card skill-card">
      <div className="skill-card-header">
        <div>
          <h3 className="skill-card-title">{skill.title}</h3>
          <span className={`badge ${levelColor}`}>{skill.level}</span>
        </div>
        {skill.category && (
          <span className="badge badge-gray">{skill.category}</span>
        )}
      </div>

      {skill.description && (
        <p className="skill-card-desc">{skill.description}</p>
      )}

      <div className="skill-exchange-row">
        <div className="skill-exchange-item">
          <span className="exchange-label teach">OFFERING</span>
          <span className="skill-tag">{skill.offering}</span>
        </div>
        <span className="exchange-arrow">⇄</span>
        <div className="skill-exchange-item">
          <span className="exchange-label learn">SEEKING</span>
          <span className="skill-tag skill-tag-learn">{skill.seeking}</span>
        </div>
      </div>

      {skill.user && (
        <div className="skill-card-footer">
          <div className="skill-user-info">
            <div className="avatar avatar-sm">{initials}</div>
            <span className="skill-user-name">{skill.user.name}</span>
            {skill.user.rating > 0 && (
              <span className="skill-rating">★ {skill.user.rating.toFixed(1)}</span>
            )}
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/users/${skill.user._id}`)}
          >
            View Profile
          </button>
        </div>
      )}

      {showActions && (
        <div className="skill-card-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/skills/edit/${skill._id}`)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(skill._id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
