import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import AuthModal from './AuthModal';
import './style/Navbar.css';

const SOURCE_FILTERS = [
  { key: 'all', label: 'All Events', icon: '🌐' },
  { key: 'local', label: 'Community', icon: '🏠' },
  { key: 'eventbrite', label: 'Eventbrite', icon: '🎫' },
  { key: 'ticketmaster', label: 'Ticketmaster', icon: '🎟️' },
];

const NavBar = ({
  onCreateEventClick,
  onProfileClick,
  activeSource,
  onSourceChange,
  onLogout,
  onAuthSuccess
}) => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const syncUser = () => {
    setUser(authService.getCurrentUser());
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('auth-change', syncUser);

    return () => {
      window.removeEventListener('auth-change', syncUser);
    };
  }, []);

  // Close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.navbar__user')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    authService.logout();

    if (onLogout) {
      onLogout();
    }
  };

  const handleCreateClick = () => {
    setShowUserMenu(false);

    if (onCreateEventClick) {
      onCreateEventClick();
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);

    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__container">

          {/* Logo */}
          <div className="navbar__logo">
            <h1>🎫 EventSphere</h1>
          </div>

          {/* Filters */}
          {onSourceChange && (
            <div className="navbar__filters">
              {SOURCE_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  className={`navbar__filter-btn ${
                    activeSource === filter.key ? 'active' : ''
                  }`}
                  onClick={() => onSourceChange(filter.key)}
                >
                  <span className="filter-icon">
                    {filter.icon}
                  </span>

                  <span className="filter-label">
                    {filter.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Right section */}
          <div className="navbar__right">

            {user ? (
              <div className="navbar__user">

                <button
                  className="navbar__user-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                >
                  <span className="user-avatar">
                    {user.username[0].toUpperCase()}
                  </span>

                  <span className="user-name">
                    {user.username}
                  </span>

                  <span className="dropdown-arrow">
                    ▾
                  </span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">

                    <div className="user-dropdown__header">
                      <p className="user-info-name">
                        {user.username}
                      </p>

                      <p className="user-email">
                        {user.email}
                      </p>
                    </div>


                    <div className="user-dropdown__menu">

                      <button
                        onClick={handleProfileClick}
                        className="menu-item"
                      >
                        <span className="menu-icon">
                          👤
                        </span>

                        Profile Dashboard
                      </button>


                      <button
                        onClick={handleCreateClick}
                        className="menu-item"
                      >
                        <span className="menu-icon">
                          ➕
                        </span>

                        Create Event
                      </button>

                    </div>


                    <div className="user-dropdown__footer">

                      <button
                        onClick={handleLogout}
                        className="logout-btn"
                      >
                        <span className="menu-icon">
                          🚪
                        </span>

                        Logout
                      </button>

                    </div>

                  </div>
                )}

              </div>
            ) : (

              <button
                className="navbar__login-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Login / Sign Up
              </button>

            )}

          </div>
        </div>
      </nav>


      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setUser(authService.getCurrentUser());
            setShowAuthModal(false);

            if (onAuthSuccess) {
              onAuthSuccess('login');
            }
          }}
        />
      )}
    </>
  );
};

export default NavBar;