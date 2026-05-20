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
  const [statusFilter, setStatusFilter] = useState('all');

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
      const token = authService.getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve event');
      }
      
      onToast?.('Event approved successfully', 'success');
      await fetchDashboard();
    } catch (err) {
      onToast?.(err.message || 'Failed to approve event', 'error');
    }
  };

  const handleReject = async (eventId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/reject`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject event');
      }
      
      onToast?.('Event rejected', 'success');
      await fetchDashboard();
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

      {/* Clickable Stats Section */}
      <div className="dashboard-stats">
        <div 
          className={`stat-box ${statusFilter === 'all' ? 'stat-box-active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <p className="stat-label">All</p>
          <div className="stat-square">
            <h3>{stats.total}</h3>
          </div>
        </div>
        <div 
          className={`stat-box ${statusFilter === 'approved' ? 'stat-box-active' : ''}`}
          onClick={() => setStatusFilter('approved')}
        >
          <p className="stat-label">Approved</p>
          <div className="stat-square">
            <h3>{stats.approved}</h3>
          </div>
        </div>
        <div 
          className={`stat-box ${statusFilter === 'pending' ? 'stat-box-active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          <p className="stat-label">Pending</p>
          <div className="stat-square">
            <h3>{stats.pending}</h3>
          </div>
        </div>
        <div 
          className={`stat-box ${statusFilter === 'rejected' ? 'stat-box-active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
        >
          <p className="stat-label">Rejected</p>
          <div className="stat-square">
            <h3>{stats.rejected}</h3>
          </div>
        </div>
      </div>

      {/* Pending Events Review Box */}
      <div className="dashboard-card pending-review-card">
        <h2>📝 Pending Event Review</h2>
        {events.length === 0 ? (
          <p className="empty-state">No pending events right now.</p>
        ) : (
          <div className="pending-events-grid">
            {events.map((event) => (
              <div key={event.id} className="pending-event-item">
                <div className="pending-event-info">
                  <h4>{event.name || event.title}</h4>
                  <p className="event-organizer">by {event.organizer?.username || 'Unknown'}</p>
                  <p className="event-date">{event.start_date ? new Date(event.start_date).toLocaleDateString() : (event.date ? new Date(event.date).toLocaleDateString() : 'TBA')}</p>
                </div>
                <div className="pending-event-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(event.id)}
                  >
                    ✓ Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(event.id)}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {analytics && (
        <div className="dashboard-card analytics-card">
          <h2>📊 Analytics Summary</h2>
          
          <div className="analytics-sections">
            {/* Events Section */}
            <div className="analytics-section">
              <h3>Events</h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <span className="analytics-label">Approved:</span>
                  <span className="analytics-value">{analytics?.events?.approved || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Pending:</span>
                  <span className="analytics-value">{analytics?.events?.pending || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Rejected:</span>
                  <span className="analytics-value">{analytics?.events?.rejected || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Total:</span>
                  <span className="analytics-value">{analytics?.events?.total || 0}</span>
                </div>
              </div>
            </div>

            {/* Popular Categories Section */}
            <div className="analytics-section">
              <h3>Popular Categories</h3>
              <div className="analytics-list">
                {analytics?.popular_categories?.length > 0 ? (
                  analytics.popular_categories.map((cat, idx) => (
                    <div key={idx} className="analytics-list-item">
                      <span>{cat.category}</span>
                      <span className="category-count">{cat.count} events</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state-small">No data available</p>
                )}
              </div>
            </div>

            {/* Saved Events Section */}
            <div className="analytics-section">
              <h3>Saved Events</h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <span className="analytics-label">Total Saves:</span>
                  <span className="analytics-value">{analytics?.saved_events?.total_saves || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Unique Users:</span>
                  <span className="analytics-value">{analytics?.saved_events?.unique_users || 0}</span>
                </div>
              </div>
            </div>

            {/* Source Summary Section */}
            <div className="analytics-section">
              <h3>Source Summary</h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <span className="analytics-label">EventSphere:</span>
                  <span className="analytics-value">{analytics?.source_summary?.eventsphere || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Eventbrite:</span>
                  <span className="analytics-value">{analytics?.source_summary?.eventbrite || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Ticketmaster:</span>
                  <span className="analytics-value">{analytics?.source_summary?.ticketmaster || 0}</span>
                </div>
              </div>
            </div>

            {/* Users Section */}
            <div className="analytics-section">
              <h3>Users</h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <span className="analytics-label">Total Users:</span>
                  <span className="analytics-value">{analytics?.users?.total || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Admins:</span>
                  <span className="analytics-value">{analytics?.users?.admins || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Organizers:</span>
                  <span className="analytics-value">{analytics?.users?.organizers || 0}</span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Regular Users:</span>
                  <span className="analytics-value">{analytics?.users?.users || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;