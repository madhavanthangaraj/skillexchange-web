// src/pages/Matches.js
import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserCard from '../components/UserCard';
import SendRequestModal from '../components/SendRequestModal';
import toast from 'react-hot-toast';
import '../components/Components.css';
import '../components/Modal.css';
import './Pages.css';
import './Matches.css';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, allRes] = await Promise.all([userAPI.getMatches(), userAPI.getAll()]);
        setMatches(matchRes.data.matches);
        setAllUsers(allRes.data.users);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await userAPI.search(searchTerm.trim());
      setSearchResults(res.data.users);
      setActiveTab('search');
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const topMatch = matches[0];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Skill Matches</h1>
        <p>Users ranked by how well your skills overlap — powered by LMS matching</p>
      </div>

      {/* LMS explanation banner */}
      <div className="lms-banner">
        <div className="lms-banner-icon">⟡</div>
        <div className="lms-banner-text">
          <strong>How Matching Works</strong>
          <p>Each user is scored: +10 pts for every skill you teach that they want to learn, +10 pts for every skill they teach that you want to learn, +20 bonus for a full bidirectional match. Higher score = better exchange partner.</p>
        </div>
      </div>

      {/* Search bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <span className="search-icon">⌕</span>
        <input
          placeholder="Search users by skill (e.g. React, Python, Design...)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
          disabled={searching}>
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {/* Tabs */}
      <div className="tabs-row">
        <button className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
          ⟡ Best Matches ({matches.length})
        </button>
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Users ({allUsers.length})
        </button>
        {searchResults.length > 0 && (
          <button className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            Search Results ({searchResults.length})
          </button>
        )}
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {activeTab === 'matches' && (
            <>
              {/* Top match highlight */}
              {topMatch && (
                <div className="top-match-card card">
                  <div className="top-match-label">🏆 Best Match</div>
                  <div className="top-match-inner">
                    <div className="avatar avatar-lg">
                      {topMatch.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="top-match-info">
                      <h2>{topMatch.user.name}</h2>
                      {topMatch.user.bio && <p>{topMatch.user.bio}</p>}
                      <div className="top-match-skills">
                        <div>
                          <div className="skills-section-label">TEACHES YOU</div>
                          <div className="skill-tags">
                            {topMatch.user.skillsToTeach?.filter(s =>
                              user?.skillsToLearn?.map(l => l.toLowerCase()).includes(s.toLowerCase())
                            ).map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                          </div>
                        </div>
                        <div>
                          <div className="skills-section-label learn">WANTS TO LEARN</div>
                          <div className="skill-tags">
                            {topMatch.user.skillsToLearn?.filter(s =>
                              user?.skillsToTeach?.map(t => t.toLowerCase()).includes(s.toLowerCase())
                            ).map((s, i) => <span key={i} className="skill-tag skill-tag-learn">{s}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="top-match-score-wrap">
                      <div className="top-match-score">{topMatch.matchScore}</div>
                      <div className="top-match-score-label">pts</div>
                      <button className="btn btn-primary" onClick={() => setSelectedUser(topMatch.user)}>
                        Request Exchange
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {matches.length === 0
                ? <div className="empty-state"><div className="icon">⟡</div><h3>No matches yet</h3><p>Add skills to your profile to find matches</p></div>
                : <div className="grid-3">
                    {matches.slice(1).map(({ user: u, matchScore }) => (
                      <UserCard key={u._id} user={u} matchScore={matchScore} onSendRequest={setSelectedUser} />
                    ))}
                  </div>
              }
            </>
          )}

          {activeTab === 'all' && (
            allUsers.length === 0
              ? <div className="empty-state"><div className="icon">◎</div><h3>No users found</h3></div>
              : <div className="grid-3">{allUsers.map(u => <UserCard key={u._id} user={u} onSendRequest={setSelectedUser} />)}</div>
          )}

          {activeTab === 'search' && (
            searchResults.length === 0
              ? <div className="empty-state"><div className="icon">⌕</div><h3>No results found</h3></div>
              : <div className="grid-3">{searchResults.map(u => <UserCard key={u._id} user={u} onSendRequest={setSelectedUser} />)}</div>
          )}
        </>
      )}

      {selectedUser && (
        <SendRequestModal
          targetUser={selectedUser}
          currentUser={user}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => toast.success('Request sent!')}
        />
      )}
    </div>
  );
}
