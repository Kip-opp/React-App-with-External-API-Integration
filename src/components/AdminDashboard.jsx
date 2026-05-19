import { useEffect, useMemo, useState } from 'react';

import authService from '../services/authService';
import eventbriteService from '../services/eventbriteService';

import StateViews from './StateViews';

import './style/AdminDashboard.css';

const AdminDashboard = ({ onClose, onToast }) => {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = authService.getToken();

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const pendingData = await eventbriteService.getPendingEvents(token);

      setEvents(pendingData.events || []);

      try {
        const analyticsData = await eventbriteService.getAnalytics(token);
        setAnalytics(analyticsData);
      } catch {
        setAnalytics(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    const analyticsEvents = analytics?.events;

    if (analyticsEvents) {
      return {
        total: analyticsEvents.total || 0,
        approved: analyticsEvents.approved || 0,
        pending: analyticsEvents.pending || 0,
        rejected: analyticsEvents.rejected || 0,
      };
    }

    return {
      total: events.length,
      approved: events.filter((event) => event.status === 'approved').length,
      pending: events.filter((event) => event.status === 'pending').length,
      rejected: events.filter((event) => event.status === 'rejected').length,
    };
  }, [events, analytics]);

  const handleApprove = async (eventId) => {
    try {
      await eventbriteService.approveEvent(eventId, token);

      onToast?.('Event approved successfully', 'success');

      fetchDashboard();
    } catch (err) {
      onToast?.(err.message || 'Failed to approve event', 'error');
    }
  };

  const handleReject = async (eventId) => {
    const reason = window.prompt(
      'Optional: add a reason for rejecting this event',
      'Rejected by admin'
    );

    try {
      await eventbriteService.rejectEvent(
        eventId,
        token,
        reason || 'Rejected by admin'
      );

      onToast?.('Event rejected successfully', 'info');

      fetchDashboard();
    } catch (err) {
      onToast?.(err.message || 'Failed to reject event', 'error');
    }
  };

  if (loading) {
    return (
      <StateViews.Loading message="Loading admin dashboard..." />
    );
  }

  if (error) {
    return (
      <StateViews.Error
        message={error}
        onRetry={fetchDashboard}
      />
    );
  }

  return (
    <section className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <span className="section-eyebrow">
            Admin Panel
          </span>

          <h1>
            🛡️ EventSphere Admin Dashboard
          </h1>

          <p>
            Manage platform activity, review organizer events, and approve public listings.
          </p>
        </div>

        <button onClick={onClose}>
          ← Back
        </button>
      </div>

      <div className="dashboard-stats">
        <div>
          <h3>{stats.total}</h3>
          <p>Total Events</p>
        </div>

        <div>
          <h3>{stats.approved}</h3>
          <p>Approved</p>
        </div>

        <div>
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>

        <div>
          <h3>{stats.rejected}</h3>
          <p>Rejected</p>
        </div>
      </div>

      <div className="dashboard-card">
        <h2>📝 Pending Event Review</h2>

        {events.length === 0 ? (
          <p>No pending events right now.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="admin-event-row">
              <div>
                <h3>{event.name}</h3>

                <p>
                  {event.description || 'No description provided.'}
                </p>

                <small>
                  {event.category || 'Uncategorized'} •{' '}
                  {event.venue_name || 'Venue TBA'} •{' '}
                  {event.start_date
                    ? new Date(event.start_date).toLocaleString()
                    : 'Date TBA'}
                </small>
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  onClick={() => handleApprove(event.id)}
                >
                  Approve
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={() => handleReject(event.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {analytics && (
        <div className="dashboard-card">
          <h2>📊 Analytics Summary</h2>

          <pre>
            {JSON.stringify(analytics, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;