// src/pages/Reviews.js
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reviewAPI, sessionAPI } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../components/Components.css';
import './Pages.css';
import './Reviews.css';

export default function Reviews() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [myReviews, setMyReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sessionId: '', revieweeId: '', rating: 5, comment: '', skillReviewed: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [myRes, receivedRes, sessRes] = await Promise.all([
        reviewAPI.getMy(),
        reviewAPI.getUserReviews(user._id),
        sessionAPI.getMy(),
      ]);
      setMyReviews(myRes.data.reviews);
      setReceivedReviews(receivedRes.data.reviews);
      setCompletedSessions(sessRes.data.sessions?.filter(s => s.status === 'completed') || []);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await reviewAPI.add(form);
      toast.success('Review submitted!');
      setShowForm(false);
      setForm({ sessionId: '', revieweeId: '', rating: 5, comment: '', skillReviewed: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Reviews</h1>
          <p>Give feedback after completed sessions</p>
        </div>
        {completedSessions.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '★ Write Review'}
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Write a Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Completed Session</label>
              <select className="form-input" value={form.sessionId} required
                onChange={e => {
                  const session = completedSessions.find(s => s._id === e.target.value);
                  const reviewee = session?.participants?.find(p => p._id !== user._id);
                  setForm({ ...form, sessionId: e.target.value, revieweeId: reviewee?._id || '' });
                }}>
                <option value="">Select a session to review</option>
                {completedSessions.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.topic || 'Skill Session'} — {new Date(s.scheduledDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Skill Reviewed</label>
              <input className="form-input" placeholder="e.g. React" value={form.skillReviewed}
                onChange={e => setForm({ ...form, skillReviewed: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    className={`star-btn ${form.rating >= n ? 'filled' : ''}`}
                    onClick={() => setForm({ ...form, rating: n })}>★</button>
                ))}
                <span className="star-label">{form.rating}/5</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea className="form-input" rows={3} placeholder="Share your experience..."
                value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={formLoading || !form.sessionId}>
              {formLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      <div className="tabs-row">
        <button className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`} onClick={() => setActiveTab('received')}>
          Received ({receivedReviews.length})
        </button>
        <button className={`tab-btn ${activeTab === 'given' ? 'active' : ''}`} onClick={() => setActiveTab('given')}>
          Given ({myReviews.length})
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {activeTab === 'received' && (
            receivedReviews.length === 0
              ? <div className="empty-state"><div className="icon">◆</div><h3>No reviews yet</h3><p>Complete sessions to start receiving reviews</p></div>
              : <div className="grid-2">{receivedReviews.map(r => <ReviewCard key={r._id} review={r} />)}</div>
          )}
          {activeTab === 'given' && (
            myReviews.length === 0
              ? <div className="empty-state"><div className="icon">◆</div><h3>No reviews written</h3><p>Review your exchange partners after completed sessions</p></div>
              : <div className="grid-2">{myReviews.map(r => <ReviewCard key={r._id} review={r} />)}</div>
          )}
        </>
      )}
    </div>
  );
}
