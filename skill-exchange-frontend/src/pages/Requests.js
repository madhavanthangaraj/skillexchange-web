// src/pages/Requests.js
import React, { useEffect, useState } from 'react';
import { exchangeAPI } from '../services/api';
import RequestCard from '../components/RequestCard';
import toast from 'react-hot-toast';
import '../components/Components.css';
import './Pages.css';
import './Reviews.css';

export default function Requests() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  const fetchRequests = async () => {
    try {
      const res = await exchangeAPI.getMy();
      setSent(res.data.sent);
      setReceived(res.data.received);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAccept = async (id) => {
    try {
      await exchangeAPI.updateStatus(id, 'accepted');
      toast.success('Request accepted!');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to accept');
    }
  };

  const handleReject = async (id) => {
    try {
      await exchangeAPI.updateStatus(id, 'rejected');
      toast.success('Request rejected');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  const pendingCount = received.filter(r => r.status === 'pending').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Exchange Requests</h1>
        <p>Manage your incoming and outgoing skill exchange requests</p>
      </div>

      <div className="tabs-row">
        <button className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`} onClick={() => setActiveTab('received')}>
          Received {pendingCount > 0 && <span className="notif-dot">{pendingCount}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>
          Sent ({sent.length})
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {activeTab === 'received' && (
            received.length === 0
              ? <div className="empty-state"><div className="icon">◎</div><h3>No requests received</h3><p>When someone requests to exchange skills with you, it will appear here</p></div>
              : <div className="grid-2">
                  {received.map(r => (
                    <RequestCard key={r._id} request={r} onAccept={handleAccept} onReject={handleReject} />
                  ))}
                </div>
          )}
          {activeTab === 'sent' && (
            sent.length === 0
              ? <div className="empty-state"><div className="icon">◎</div><h3>No requests sent</h3><p>Find matches and send exchange requests from the Matches page</p></div>
              : <div className="grid-2">
                  {sent.map(r => <RequestCard key={r._id} request={r} />)}
                </div>
          )}
        </>
      )}
    </div>
  );
}
