// src/pages/Skills.js
import React, { useEffect, useState } from 'react';
import { skillAPI } from '../services/api';
import SkillCard from '../components/SkillCard';
import toast from 'react-hot-toast';
import '../components/Components.css';
import './Pages.css';

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'Design', 'Mobile', 'DevOps', 'Business', 'Language', 'Music', 'General'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [form, setForm] = useState({ title: '', description: '', category: 'General', offering: '', seeking: '', level: 'Beginner' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      const params = {};
      if (catFilter !== 'All') params.category = catFilter;
      if (levelFilter !== 'All') params.level = levelFilter;
      const [allRes, myRes] = await Promise.all([skillAPI.getAll(params), skillAPI.getMy()]);
      setSkills(allRes.data.skills);
      setMySkills(myRes.data.skills);
    } catch (err) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSkills(); }, [catFilter, levelFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await skillAPI.create(form);
      toast.success('Skill listing created!');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'General', offering: '', seeking: '', level: 'Beginner' });
      fetchSkills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create skill');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill listing?')) return;
    try {
      await skillAPI.delete(id);
      toast.success('Skill deleted');
      fetchSkills();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Skill Listings</h1>
          <p>Browse what others are offering and seeking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Skill'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Create Skill Listing</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="e.g. Learn React from scratch" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Skill You Offer (Teach)</label>
                <input className="form-input" placeholder="e.g. React" value={form.offering}
                  onChange={e => setForm({ ...form, offering: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Skill You Seek (Learn)</label>
                <input className="form-input" placeholder="e.g. Python" value={form.seeking}
                  onChange={e => setForm({ ...form, seeking: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Your Level</label>
                <select className="form-input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {LEVELS.filter(l => l !== 'All').map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} placeholder="Describe what you'll teach and what you're looking for..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Listing'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-row">
        {['browse', 'mine'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'browse' ? `All Skills (${skills.length})` : `My Listings (${mySkills.length})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeTab === 'browse' && (
        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-label">Category:</span>
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Level:</span>
            {LEVELS.map(l => (
              <button key={l} className={`filter-chip ${levelFilter === l ? 'active' : ''}`} onClick={() => setLevelFilter(l)}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? <div className="spinner" /> : (
        <>
          {activeTab === 'browse' && (
            skills.length === 0
              ? <div className="empty-state"><div className="icon">◈</div><h3>No skills found</h3><p>Try adjusting your filters</p></div>
              : <div className="grid-2">{skills.map(s => <SkillCard key={s._id} skill={s} />)}</div>
          )}
          {activeTab === 'mine' && (
            mySkills.length === 0
              ? <div className="empty-state"><div className="icon">◈</div><h3>No listings yet</h3><p>Create your first skill listing above</p></div>
              : <div className="grid-2">{mySkills.map(s => <SkillCard key={s._id} skill={s} showActions onDelete={handleDelete} />)}</div>
          )}
        </>
      )}
    </div>
  );
}
