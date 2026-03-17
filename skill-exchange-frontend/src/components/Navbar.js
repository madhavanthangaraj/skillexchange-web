// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/skills', label: 'Skills', icon: '◈' },
  { to: '/matches', label: 'Matches', icon: '⟡' },
  { to: '/requests', label: 'Requests', icon: '◎' },
  { to: '/sessions', label: 'Sessions', icon: '◷' },
  { to: '/reviews', label: 'Reviews', icon: '◆' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">⟡</span>
          <span className="logo-text">SkillXchange</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <Link to="/profile" className="navbar-profile">
            <div className="avatar avatar-sm">{initials}</div>
            <span className="profile-name">{user?.name?.split(' ')[0]}</span>
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>
            👤 Profile
          </Link>
          <button className="mobile-link logout-btn" onClick={handleLogout}>
            ↩ Logout
          </button>
        </div>
      )}
    </nav>
  );
}
