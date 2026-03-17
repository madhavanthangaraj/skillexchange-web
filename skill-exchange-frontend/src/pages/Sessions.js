// src/pages/Sessions.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { sessionAPI, exchangeAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Sessions.css';

export default function Sessions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exchangeId = searchParams.get('exchange');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(exchangeId ? 'schedule' : 'list');
  const [acceptedExchanges, setAcceptedExchanges] = useState([]);

  // Schedule form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState({
    exchangeRequestId: exchangeId || '',
    scheduledTime: '',
    duration: 60,
    meetLink: '',
    topic: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [sessRes, exchRes] = await Promise.all([sessionAPI.getMy(), exchangeAPI.getMy()]);
      setSessions(sessRes.data.sessions || []);
      const accepted = [
        ...exchRes.data.sent.filter(r => r.status === 'accepted'),
        ...exchRes.data.received.filter(r => r.status === 'accepted'),
      ];
      setAcceptedExchanges(accepted);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!form.scheduledTime) { toast.error('Please select a time'); return; }
    if (!form.exchangeRequestId) { toast.error('Please select an exchange'); return; }
    setFormLoading(true);
    try {
      await sessionAPI.schedule({
        ...form,
        scheduledDate: selectedDate.toISOString(),
      });
      toast.success('Session scheduled!');
      setActiveTab('list');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await sessionAPI.update(id, { status: 'completed' });
      toast.success('Session marked as completed');
      fetchData();
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  const statusColor = { scheduled: 'badge-green', completed: 'badge-blue', cancelled: 'badge-red' };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Sessions</h1>
          <p>Schedule and manage your skill exchange sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab(activeTab === 'schedule' ? 'list' : 'schedule')}>
          {activeTab === 'schedule' ? '← Back to list' : '+ Schedule Session'}
        </button>
      </div>

      <div className="tabs-row">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          My Sessions ({sessions.length})
        </button>
        <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          Schedule New
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* ── Session list ── */}
          {activeTab === 'list' && (
            sessions.length === 0
              ? <div className="empty-state"><div className="icon">◷</div><h3>No sessions yet</h3><p>Schedule your first session with an accepted exchange partner</p></div>
              : <div className="grid-2">
                  {sessions.map(s => {
                    const others = s.participants?.filter(p => p._id !== s.participants[0]?._id);
                    return (
                      <div key={s._id} className="card session-card">
                        <div className="session-header">
                          <div>
                            <h3 className="session-title">{s.topic || 'Skill Session'}</h3>
                            <div style={{ marginTop: 6 }}>
                              <span className={`badge ${statusColor[s.status] || 'badge-gray'}`}>{s.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="session-datetime">
                          <div className="session-dt-item">
                            <span>📅</span>
                            <span>{new Date(s.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="session-dt-item">
                            <span>🕐</span>
                            <span>{s.scheduledTime} · {s.duration} min</span>
                          </div>
                        </div>

                        {s.meetLink && (
                          <div className="session-meet-link">
                            <a href={s.meetLink} target="_blank" rel="noopener noreferrer">
                              🎥 Join Google Meet
                            </a>
                          </div>
                        )}

                        {s.participants?.length > 0 && (
                          <div className="session-participants">
                            {s.participants.map(p => (
                              <div key={p._id} className="session-participant">
                                <div className="avatar avatar-sm">
                                  {p.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {s.notes && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{s.notes}</p>}

                        <div className="session-card-actions">
                          {s.status === 'scheduled' && (
                            <button className="btn btn-success btn-sm" onClick={() => handleMarkComplete(s._id)}>
                              ✓ Mark Complete
                            </button>
                          )}
                          {s.exchangeRequest && (
                            <button className="btn btn-outline btn-sm" onClick={() => navigate(`/chat/${s.exchangeRequest._id || s.exchangeRequest}`)}>
                              💬 Chat
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
          )}

          {/* ── Schedule form ── */}
          {activeTab === 'schedule' && (
            <div className="schedule-layout">
              <div className="calendar-section">
                <h3 className="schedule-section-title">Pick a Date</h3>
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  minDate={new Date()}
                />
                <div className="selected-date-display">
                  Selected: <strong>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                </div>
              </div>

              <div className="schedule-form-section">
                <h3 className="schedule-section-title">Session Details</h3>
                <form onSubmit={handleSchedule} className="schedule-form">

                  <div className="form-group">
                    <label className="form-label">Exchange Partner</label>
                    <select className="form-input" value={form.exchangeRequestId}
                      onChange={e => setForm({ ...form, exchangeRequestId: e.target.value })} required>
                      <option value="">Select an accepted exchange</option>
                      {acceptedExchanges.map(ex => {
                        const partner = ex.sender?.name && ex.receiver?.name
                          ? `${ex.sender.name} ↔ ${ex.receiver.name} (${ex.senderSkill} ⇄ ${ex.receiverSkill})`
                          : ex._id;
                        return <option key={ex._id} value={ex._id}>{partner}</option>;
                      })}
                    </select>
                    {acceptedExchanges.length === 0 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--red)', marginTop: 6 }}>
                        No accepted exchanges found. Accept an exchange request first.
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Session Topic</label>
                    <input className="form-input" placeholder="e.g. React Hooks deep dive"
                      value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input type="time" className="form-input" value={form.scheduledTime}
                        onChange={e => setForm({ ...form, scheduledTime: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration (minutes)</label>
                      <select className="form-input" value={form.duration}
                        onChange={e => setForm({ ...form, duration: Number(e.target.value) })}>
                        {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Google Meet link */}
                  <div className="form-group meet-link-group">
                    <label className="form-label">
                      🎥 Google Meet Link
                      <span className="form-label-hint">Provide the meeting link for your session</span>
                    </label>
                    <input className="form-input" placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={form.meetLink} onChange={e => setForm({ ...form, meetLink: e.target.value })} />
                    <p className="meet-hint">
                      Create a meeting at <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer">meet.google.com</a> and paste the link here.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes (optional)</label>
                    <textarea className="form-input" rows={2} placeholder="Any prep notes or agenda..."
                      value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={formLoading}>
                    {formLoading ? 'Scheduling...' : '📅 Schedule Session'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
