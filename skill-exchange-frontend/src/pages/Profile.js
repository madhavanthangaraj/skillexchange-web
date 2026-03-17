// src/pages/Profile.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skillsToTeach: user?.skillsToTeach?.join(', ') || '',
    skillsToLearn: user?.skillsToLearn?.join(', ') || '',
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        skillsToTeach: form.skillsToTeach.split(',').map(s => s.trim()).filter(Boolean),
        skillsToLearn: form.skillsToLearn.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await userAPI.updateProfile(payload);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your identity and skill sets</p>
      </div>

      <div className="profile-layout">
        {/* Left: Identity card */}
        <div className="profile-identity card">
          <div className="profile-avatar-wrap">
            <div className="avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>{initials}</div>
            <div className="profile-level-ring" />
          </div>
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          {user?.bio && <p className="profile-bio">{user.bio}</p>}

          <div className="profile-stats-row">
            <div className="profile-stat">
              <div className="profile-stat-value">{user?.lmsScore || 0}</div>
              <div className="profile-stat-label">LMS Score</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{user?.rating > 0 ? user.rating.toFixed(1) : '—'}</div>
              <div className="profile-stat-label">Rating</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{user?.totalReviews || 0}</div>
              <div className="profile-stat-label">Reviews</div>
            </div>
          </div>

          {!editing && (
            <button className="btn btn-outline" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
              onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {/* Right: Skills + Edit form */}
        <div className="profile-right">
          {!editing ? (
            <>
              <div className="card profile-skills-card">
                <h3 className="profile-section-title">
                  <span className="title-icon">◈</span> Skills I Teach
                </h3>
                <div className="skill-tags" style={{ marginTop: 12 }}>
                  {user?.skillsToTeach?.length > 0
                    ? user.skillsToTeach.map((s, i) => <span key={i} className="skill-tag">{s}</span>)
                    : <span className="empty-hint">No teaching skills added yet</span>}
                </div>
              </div>

              <div className="card profile-skills-card">
                <h3 className="profile-section-title">
                  <span className="title-icon" style={{ color: 'var(--blue)' }}>◎</span> Skills I Want to Learn
                </h3>
                <div className="skill-tags" style={{ marginTop: 12 }}>
                  {user?.skillsToLearn?.length > 0
                    ? user.skillsToLearn.map((s, i) => <span key={i} className="skill-tag skill-tag-learn">{s}</span>)
                    : <span className="empty-hint">No learning goals added yet</span>}
                </div>
              </div>
            </>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Edit Your Profile</h3>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" rows={3} value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell others about yourself..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Skills You Teach</label>
                  <input className="form-input" value={form.skillsToTeach}
                    onChange={e => setForm({ ...form, skillsToTeach: e.target.value })}
                    placeholder="React, Python, Guitar (comma separated)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Skills You Want to Learn</label>
                  <input className="form-input" value={form.skillsToLearn}
                    onChange={e => setForm({ ...form, skillsToLearn: e.target.value })}
                    placeholder="Node.js, Design, Spanish (comma separated)" />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
