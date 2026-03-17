// src/pages/UserProfile.js
// View another user's public profile
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import SendRequestModal from '../components/SendRequestModal';
import toast from 'react-hot-toast';
import '../components/Components.css';
import '../components/Modal.css';
import './Profile.css';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, reviewRes] = await Promise.all([
          userAPI.getById(id),
          reviewAPI.getUserReviews(id),
        ]);
        setProfileUser(userRes.data.user);
        setReviews(reviewRes.data.reviews);
      } catch (err) {
        toast.error('Failed to load profile');
        navigate('/matches');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!profileUser) return null;

  const initials = profileUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isOwnProfile = profileUser._id === currentUser?._id;

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>← Back</button>

      <div className="profile-layout">
        <div className="profile-identity card">
          <div className="avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>{initials}</div>
          <h2 className="profile-name">{profileUser.name}</h2>
          <p className="profile-email">{profileUser.email}</p>
          {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}

          <div className="profile-stats-row">
            <div className="profile-stat">
              <div className="profile-stat-value">{profileUser.lmsScore || 0}</div>
              <div className="profile-stat-label">LMS Score</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{profileUser.rating > 0 ? profileUser.rating.toFixed(1) : '—'}</div>
              <div className="profile-stat-label">Rating</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{profileUser.totalReviews || 0}</div>
              <div className="profile-stat-label">Reviews</div>
            </div>
          </div>

          {!isOwnProfile && (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
              onClick={() => setShowModal(true)}>
              Request Exchange
            </button>
          )}
        </div>

        <div className="profile-right">
          <div className="card profile-skills-card">
            <h3 className="profile-section-title"><span className="title-icon">◈</span> Skills They Teach</h3>
            <div className="skill-tags" style={{ marginTop: 12 }}>
              {profileUser.skillsToTeach?.length > 0
                ? profileUser.skillsToTeach.map((s, i) => <span key={i} className="skill-tag">{s}</span>)
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills listed</span>}
            </div>
          </div>

          <div className="card profile-skills-card">
            <h3 className="profile-section-title"><span className="title-icon" style={{ color: 'var(--blue)' }}>◎</span> Skills They Want to Learn</h3>
            <div className="skill-tags" style={{ marginTop: 12 }}>
              {profileUser.skillsToLearn?.length > 0
                ? profileUser.skillsToLearn.map((s, i) => <span key={i} className="skill-tag skill-tag-learn">{s}</span>)
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills listed</span>}
            </div>
          </div>

          {reviews.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Reviews ({reviews.length})</h3>
              <div className="grid-2">
                {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <SendRequestModal
          targetUser={profileUser}
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
          onSuccess={() => toast.success('Request sent!')}
        />
      )}
    </div>
  );
}
