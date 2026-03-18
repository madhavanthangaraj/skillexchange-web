// src/components/SendRequestModal.js
import React, { useState } from 'react';
import { exchangeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SendRequestModal({ targetUser, currentUser, onClose, onSuccess }) {
  const [form, setForm] = useState({
    senderSkill: currentUser?.skillsToTeach?.[0] || '',
    receiverSkill: targetUser?.skillsToTeach?.[0] || '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await exchangeAPI.send({
        receiverId: targetUser._id,
        senderSkill: form.senderSkill,
        receiverSkill: form.receiverSkill,
        message: form.message,
      });
      toast.success('Exchange request sent!');
      onSuccess?.();
      onClose();
      setTimeout(() => {
        window.location.href = 'http://localhost:3000/requests';
      }, 300); // Ensure modal closes before navigating
    } catch (err) {
      // If request already sent, do not show a popup
      if (err.response?.data?.message === 'Request already sent') {
        // Silently ignore
        return;
      }
      // If backend error is about populate, do not show a popup
      if (err.response?.data?.message?.includes('populate') || err.message?.includes('populate')) {
        // Silently ignore
        return;
      }
      // Otherwise, show error
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Skill Exchange</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-subtitle">
          Exchange skills with <strong>{targetUser?.name}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Skill You Will Teach</label>
            <select
              className="form-input"
              value={form.senderSkill}
              onChange={e => setForm({ ...form, senderSkill: e.target.value })}
              required
            >
              <option value="">Select a skill you teach</option>
              {currentUser?.skillsToTeach?.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Skill You Want to Learn (from them)</label>
            <select
              className="form-input"
              value={form.receiverSkill}
              onChange={e => setForm({ ...form, receiverSkill: e.target.value })}
              required
            >
              <option value="">Select a skill they teach</option>
              {targetUser?.skillsToTeach?.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Message (optional)</label>
            <textarea
              className="form-input"
              placeholder="Introduce yourself and explain what you'd like to exchange..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
