import { useCallback, useEffect, useState } from 'react';

import authService from '../services/authService';
import eventbriteService from '../services/eventbriteService';
import StateViews from './StateViews';

import './style/AdminModals.css';

const ModalShell = ({ title, subtitle, icon, onClose, children }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <span className="admin-modal__icon">{icon}</span>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="admin-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
      </div>
    </div>
  );
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="admin-modal__pagination">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ←
      </button>
      {start > 1 && <span className="pagination-ellipsis">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? 'active' : ''}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <span className="pagination-ellipsis">…</span>}
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        →
      </button>
    </div>
  );
};

export const UsersModal = ({ title, onClose, onToast }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const token = authService.getToken();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventbriteService.getAdminUsers(token, page);
      setUsers(data.users || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePromote = async (userId) => {
    setActionLoading(`promote-${userId}`);
    try {
      const result = await eventbriteService.promoteUserToAdmin(userId, token);
      onToast?.(result.message || 'User promoted to admin', 'success');
      await fetchUsers();
    } catch (err) {
      onToast?.(err.message || 'Failed to promote user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setActionLoading(`toggle-${userId}`);
    try {
      const result = await eventbriteService.toggleUserStatus(userId, token);
      onToast?.(result.message || 'User status updated', 'success');
      await fetchUsers();
    } catch (err) {
      onToast?.(err.message || 'Failed to toggle user status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ModalShell
      title={title || 'User Management'}
      subtitle={`${total} total users`}
      icon="👥"
      onClose={onClose}
    >
      {loading ? (
        <StateViews.Loading message="Loading users..." />
      ) : error ? (
        <StateViews.Error message={error} onRetry={fetchUsers} />
      ) : (
        <>
          <div className="admin-modal__table-wrap">
            <table className="admin-modal__table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.is_active ? 'status-active' : 'status-suspended'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-modal__actions">
                        {user.role !== 'admin' && (
                          <button
                            className="admin-action-btn promote-btn"
                            disabled={actionLoading === `promote-${user.id}`}
                            onClick={() => handlePromote(user.id)}
                          >
                            {actionLoading === `promote-${user.id}`
                              ? '...'
                              : '↑ Promote'}
                          </button>
                        )}
                        <button
                          className={`admin-action-btn ${
                            user.is_active ? 'suspend-btn' : 'activate-btn'
                          }`}
                          disabled={actionLoading === `toggle-${user.id}`}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {actionLoading === `toggle-${user.id}`
                            ? '...'
                            : user.is_active
                            ? '⏸ Suspend'
                            : '▶ Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </ModalShell>
  );
};

export const UsersDetailModal = ({ title, roleFilter, recentFilter, onClose, onToast }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const token = authService.getToken();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventbriteService.getAdminUsers(
        token, page, 10, roleFilter || null, recentFilter || null
      );
      setUsers(data.users || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token, page, roleFilter, recentFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (user) => {
    const isAdmin = user.role === 'admin';
    const actionKey = `role-${user.id}`;
    setActionLoading(actionKey);
    try {
      let result;
      if (isAdmin) {
        result = await eventbriteService.demoteAdminToUser(user.id, token);
      } else {
        result = await eventbriteService.promoteUserToAdmin(user.id, token);
      }
      onToast?.(result.message || (isAdmin ? 'User demoted' : 'User promoted to admin'), 'success');
      await fetchUsers();
    } catch (err) {
      onToast?.(err.message || 'Failed to update user role', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setActionLoading(`toggle-${userId}`);
    try {
      const result = await eventbriteService.toggleUserStatus(userId, token);
      onToast?.(result.message || 'User status updated', 'success');
      await fetchUsers();
    } catch (err) {
      onToast?.(err.message || 'Failed to toggle user status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ModalShell
      title={title || 'Users'}
      subtitle={`${total} user${total !== 1 ? 's' : ''}`}
      icon="👥"
      onClose={onClose}
    >
      {loading ? (
        <StateViews.Loading message="Loading users..." />
      ) : error ? (
        <StateViews.Error message={error} onRetry={fetchUsers} />
      ) : (
        <>
          <div className="admin-modal__table-wrap">
            <table className="admin-modal__table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.is_active ? 'status-active' : 'status-suspended'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                     <td>
                       <div className="admin-modal__actions">
                         <button
                           className={`admin-action-btn ${user.role === 'admin' ? 'demote-btn' : 'promote-btn'}`}
                           disabled={actionLoading === `role-${user.id}`}
                           onClick={() => handleRoleChange(user)}
                         >
                           {actionLoading === `role-${user.id}`
                             ? '...'
                             : user.role === 'admin'
                             ? '↓ Demote'
                             : '↑ Promote'}
                         </button>
                         <button
                           className={`admin-action-btn ${
                             user.is_active ? 'suspend-btn' : 'activate-btn'
                           }`}
                           disabled={actionLoading === `toggle-${user.id}`}
                           onClick={() => handleToggleStatus(user.id)}
                         >
                           {actionLoading === `toggle-${user.id}`
                             ? '...'
                             : user.is_active
                             ? '⏸ Suspend'
                             : '▶ Activate'}
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           {totalPages > 1 && (
             <Pagination
               page={page}
               totalPages={totalPages}
               onPageChange={setPage}
             />
           )}
         </>
       )}
     </ModalShell>
   );
 };

 export const EventsModal = ({ title, onClose, onToast }) => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = authService.getToken();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventbriteService.getAdminEvents(token, page);
      setEvents(data.events || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <ModalShell
      title={title || 'All Events'}
      subtitle={`${total} total events`}
      icon="📅"
      onClose={onClose}
    >
      {loading ? (
        <StateViews.Loading message="Loading events..." />
      ) : error ? (
        <StateViews.Error message={error} onRetry={fetchEvents} />
      ) : (
        <>
          <div className="admin-modal__list">
            {events.map((event) => (
              <div key={event.id} className="admin-modal__event-card">
                <div className="admin-modal__event-info">
                  <h4>{event.name}</h4>
                  <p className="admin-modal__event-organizer">
                    by {event.organizer?.username || 'Unknown'}
                  </p>
                  <p className="admin-modal__event-date">
                    {event.start_date
                      ? new Date(event.start_date).toLocaleDateString()
                      : 'TBA'}
                  </p>
                </div>
                <div className="admin-modal__event-badges">
                  <span className={`status-badge status-${event.status}`}>
                    {event.status}
                  </span>
                  {event.category && (
                    <span className="category-badge">{event.category}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </ModalShell>
  );
};

export const EventsDetailModal = ({ title, statusFilter, categoryFilter, onClose, onToast }) => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = authService.getToken();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventbriteService.getAdminEvents(
        token, page, 10, categoryFilter || null, statusFilter || null
      );
      setEvents(data.events || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [token, page, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <ModalShell
      title={title || 'Events'}
      subtitle={`${total} event${total !== 1 ? 's' : ''}`}
      icon="📅"
      onClose={onClose}
    >
      {loading ? (
        <StateViews.Loading message="Loading events..." />
      ) : error ? (
        <StateViews.Error message={error} onRetry={fetchEvents} />
      ) : (
        <>
          <div className="admin-modal__list">
            {events.map((event) => (
              <div key={event.id} className="admin-modal__event-card">
                <div className="admin-modal__event-info">
                  <h4>{event.name}</h4>
                  <p className="admin-modal__event-organizer">
                    by {event.organizer?.username || 'Unknown'}
                  </p>
                  <p className="admin-modal__event-date">
                    {event.start_date
                      ? new Date(event.start_date).toLocaleDateString()
                      : 'TBA'}
                  </p>
                </div>
                <div className="admin-modal__event-badges">
                  <span className={`status-badge status-${event.status}`}>
                    {event.status}
                  </span>
                  {event.category && (
                    <span className="category-badge">{event.category}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </ModalShell>
  );
};

export const CategoriesModal = ({ title, analytics, onClose }) => {
  const categories = analytics?.popular_categories || [];

  return (
    <ModalShell
      title={title || 'Popular Categories'}
      subtitle={`${categories.length} categories`}
      icon="🏷️"
      onClose={onClose}
    >
      {categories.length === 0 ? (
        <StateViews.Empty
          title="No category data"
          message="No categories have been used yet."
        />
      ) : (
        <div className="admin-modal__categories">
          {categories.map((cat, idx) => (
            <div key={idx} className="admin-modal__category-card">
              <div className="admin-modal__category-info">
                <h4>{cat.category}</h4>
                <p>{cat.count} event{cat.count !== 1 ? 's' : ''}</p>
              </div>
              <div className="admin-modal__category-bar">
                <div
                  className="admin-modal__category-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (cat.count / Math.max(...categories.map((c) => c.count))) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
};

export const SourcesModal = ({ title, analytics, onClose, onSourceClick }) => {
  const sourceSummary = analytics?.source_summary || {};

  const handleSourceClick = (source) => {
    if (onSourceClick) {
      onSourceClick(source);
    }
  };

  return (
    <ModalShell
      title={title || 'Event Sources'}
      subtitle="Where events come from"
      icon="🔗"
      onClose={onClose}
    >
      <div className="admin-modal__sources">
        {Object.entries(sourceSummary).map(([source, count]) => (
          <div
            key={source}
            className={`admin-modal__source-card ${onSourceClick ? 'clickable' : ''}`}
            onClick={() => handleSourceClick(source)}
            role={onSourceClick ? 'button' : undefined}
            tabIndex={onSourceClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onSourceClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleSourceClick(source);
              }
            }}
          >
            <h4>{source.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h4>
            <span className="admin-modal__source-count">{count}</span>
          </div>
        ))}
      </div>
    </ModalShell>
  );
};

export const SourceEventsModal = ({ title, source = 'EventSphere', onClose }) => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = authService.getToken();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventbriteService.getEventsBySource(
        token, page, 10, source
      );
      setEvents(data.events || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [token, page, source]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const displayTitle = title || `Events: ${source}`;

  return (
    <ModalShell
      title={displayTitle}
      subtitle={`${total} event${total !== 1 ? 's' : ''} from ${source}`}
      icon="🔗"
      onClose={onClose}
    >
      {loading ? (
        <StateViews.Loading message="Loading events..." />
      ) : error ? (
        <StateViews.Error message={error} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <StateViews.Empty
          title="No events found"
          message={`No events available from ${source}.`}
        />
      ) : (
        <>
          <div className="admin-modal__list">
            {events.map((event) => (
              <div key={event.id} className="admin-modal__event-card">
                <div className="admin-modal__event-info">
                  <h4>{event.name || event.title}</h4>
                  <p className="admin-modal__event-organizer">
                    by {event.organizer?.username || event.source || 'Unknown'}
                  </p>
                  <p className="admin-modal__event-date">
                    {event.start_date
                      ? new Date(event.start_date).toLocaleDateString()
                      : 'TBA'}
                  </p>
                </div>
                <div className="admin-modal__event-badges">
                  <span className={`status-badge status-${event.status || 'approved'}`}>
                    {event.status || 'live'}
                  </span>
                  {event.category && (
                    <span className="category-badge">{event.category}</span>
                  )}
                  {event.source && (
                    <span className="category-badge">{event.source}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </ModalShell>
  );
};

const AdminModals = {
  UsersModal,
  UsersDetailModal,
  EventsModal,
  EventsDetailModal,
  CategoriesModal,
  SourcesModal,
  SourceEventsModal,
};

export default AdminModals;
