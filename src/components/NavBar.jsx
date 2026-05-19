import { useEffect, useState } from 'react';

import authService from '../services/authService';

import AuthModal from './AuthModal';

import './style/Navbar.css';

const SOURCE_FILTERS = [
  {
    key: 'all',
    label: 'All Events',
    icon: '🌐',
  },
  {
    key: 'local',
    label: 'Community',
    icon: '🏠',
  },
  {
    key: 'eventbrite',
    label: 'Eventbrite',
    icon: '🎫',
  },
  {
    key: 'ticketmaster',
    label: 'Ticketmaster',
    icon: '🎟️',
  },
];

const NavBar = ({
  onCreateEventClick,
  onMyEventsClick,
  onSavedEventsClick,
  onAdminDashboardClick,
  activeSource,
  onSourceChange,
  onLogout,
  onAuthSuccess,
  darkMode,
  onToggleDarkMode,
}) => {
  const [user, setUser] = useState(null);

  const [showAuthModal, setShowAuthModal] =
    useState(false);

  const [showUserMenu, setShowUserMenu] =
    useState(false);

  const syncUser = () => {
    setUser(
      authService.getCurrentUser?.()
    );
  };

  useEffect(() => {
    syncUser();

    window.addEventListener(
      'auth-change',
      syncUser
    );

    return () =>
      window.removeEventListener(
        'auth-change',
        syncUser
      );
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(
          '.navbar__user'
        )
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener(
      'click',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'click',
        handleClickOutside
      );
  }, []);

  const role = user?.role || 'user';

  const isAdmin = role === 'admin';

  const isOrganizer =
    role === 'organizer';

  const canCreateEvents =
    isAdmin || isOrganizer;

  const handleLogout = () => {
    setShowUserMenu(false);

    authService.logout();

    if (onLogout) onLogout();
  };

  const handleCreateClick = () => {
    setShowUserMenu(false);

    if (onCreateEventClick) {
      onCreateEventClick();
    }
  };

  const handleMyEventsClick = () => {
    setShowUserMenu(false);

    if (onMyEventsClick) {
      onMyEventsClick();
    }
  };

  const handleSavedEventsClick = () => {
    setShowUserMenu(false);

    if (onSavedEventsClick) {
      onSavedEventsClick();
    }
  };

  const handleAdminClick = () => {
    setShowUserMenu(false);

    if (onAdminDashboardClick) {
      onAdminDashboardClick();
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__container">
          <div className="navbar__logo">
            <h1>🎫 EventSphere</h1>

            <span className="navbar-tagline">
              Discover Amazing Events
            </span>
          </div>

          {onSourceChange && (
            <div className="navbar__filters">
              {SOURCE_FILTERS.map(
                (filter) => (
                  <button
                    key={filter.key}
                    className={`navbar__filter-btn ${
                      activeSource ===
                      filter.key
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      onSourceChange(
                        filter.key
                      )
                    }
                  >
                    <span className="filter-icon">
                      {filter.icon}
                    </span>

                    <span className="filter-label">
                      {filter.label}
                    </span>
                  </button>
                )
              )}
            </div>
          )}

          <div className="navbar__right">
            <button
              className="theme-toggle-btn"
              onClick={
                onToggleDarkMode
              }
              title="Toggle Dark Mode"
            >
              {darkMode
                ? '☀️'
                : '🌙'}
            </button>

            {user ? (
              <div className="navbar__user">
                <button
                  className="navbar__user-btn"
                  onClick={(e) => {
                    e.stopPropagation();

                    setShowUserMenu(
                      !showUserMenu
                    );
                  }}
                >
                  <span className="user-avatar">
                    {user.username?.[0]?.toUpperCase()}
                  </span>

                  <div className="user-meta">
                    <span className="user-name">
                      {user.username}
                    </span>

                    <span
                      className={`user-role role-${role}`}
                    >
                      {role}
                    </span>
                  </div>

                  <span className="dropdown-arrow">
                    ▾
                  </span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown__header">
                      <p className="user-info-name">
                        {
                          user.username
                        }
                      </p>

                      <p className="user-email">
                        {user.email}
                      </p>

                      <span
                        className={`dropdown-role-badge role-${role}`}
                      >
                        {role}
                      </span>
                    </div>

                    <div className="user-dropdown__menu">
                      {canCreateEvents && (
                        <button
                          onClick={
                            handleCreateClick
                          }
                          className="menu-item"
                        >
                          <span className="menu-icon">
                            ➕
                          </span>

                          Create Event
                        </button>
                      )}

                      <button
                        onClick={
                          handleMyEventsClick
                        }
                        className="menu-item"
                      >
                        <span className="menu-icon">
                          📅
                        </span>

                        My Events
                      </button>

                      <button
                        onClick={
                          handleSavedEventsClick
                        }
                        className="menu-item"
                      >
                        <span className="menu-icon">
                          ❤️
                        </span>

                        Saved Events
                      </button>

                      {isAdmin && (
                        <button
                          onClick={
                            handleAdminClick
                          }
                          className="menu-item admin-menu-item"
                        >
                          <span className="menu-icon">
                            🛡️
                          </span>

                          Admin Dashboard
                        </button>
                      )}
                    </div>

                    <div className="user-dropdown__footer">
                      <button
                        onClick={
                          handleLogout
                        }
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
                onClick={() =>
                  setShowAuthModal(
                    true
                  )
                }
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal
          onClose={() =>
            setShowAuthModal(
              false
            )
          }
          onSuccess={() => {
            setUser(
              authService.getCurrentUser?.()
            );

            setShowAuthModal(
              false
            );

            if (
              onAuthSuccess
            ) {
              onAuthSuccess();
            }
          }}
        />
      )}
    </>
  );
};

export default NavBar;