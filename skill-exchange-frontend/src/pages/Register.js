// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', bio: '',
    skillsToTeach: '', skillsToLearn: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skillsToTeach: form.skillsToTeach.split(',').map(s => s.trim()).filter(Boolean),
        skillsToLearn: form.skillsToLearn.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await authAPI.register(payload);
      login(res.data.user, res.data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb1" />
        <div className="auth-bg-orb orb2" />
      </div>
      <div className="auth-container">
        <div className="auth-brand">
          <span className="logo-icon" style={{ fontSize: '2rem' }}>⟡</span>
          <h1>SkillXchange</h1>
          <p>Exchange skills, grow together</p>
        </div>

        <div className="auth-card">
          <h2>Create account</h2>
          <p className="auth-sub">Join the skill exchange community</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="Jane Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bio (optional)</label>
              <textarea
                className="form-input"
                placeholder="Tell others about yourself..."
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={2}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Skills You Can Teach</label>
              <input
                className="form-input"
                placeholder="React, Python, Guitar (comma separated)"
                value={form.skillsToTeach}
                onChange={e => setForm({ ...form, skillsToTeach: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Skills You Want to Learn</label>
              <input
                className="form-input"
                placeholder="Node.js, Design, Spanish (comma separated)"
                value={form.skillsToLearn}
                onChange={e => setForm({ ...form, skillsToLearn: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
