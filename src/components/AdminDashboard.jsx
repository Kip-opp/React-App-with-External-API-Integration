import { useEffect, useMemo, useState } from 'react';

import authService from '../services/authService';
import eventbriteService from '../services/eventbriteService';
import StateViews from './StateViews';
import {
  UsersModal,
  UsersDetailModal,
  EventsModal,
  EventsDetailModal,
  CategoriesModal,
  SourcesModal,
  SourceEventsModal,
} from './AdminModals';

import './style/AdminDashboard.css';

const AdminDashboard = ({ onClose, onToast }) => {
  const [events, setEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeModal, setActiveModal] = useState(null);
  const [modalConfig, setModalConfig] = useState({});
  const [selectedReviewEvent, setSelectedReviewEvent] = useState(null);

  const token = authService.getToken();

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const pendingData = await eventbriteService.getPendingEvents(token);
      setEvents(pendingData.events || []);

      // Fetch rejected events for the new Rejected section
      const rejectedData = await eventbriteService.getAdminEvents(token, 1, 100, null, 'rejected');
      setRejectedEvents(rejectedData.events || []);

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
      const result = await eventbriteService.approveEvent(eventId, token);
      onToast?.(result.message || 'Event approved successfully', 'success');
      await fetchDashboard();
    } catch (err) {
      onToast?.(err.message || 'Failed to approve event', 'error');
    }
  };

  const handleReject = async (eventId) => {
    try {
      const token = authService.getToken();
      const result = await eventbriteService.rejectEvent(eventId, token);
      onToast?.(result.message || 'Event rejected', 'success');
      await fetchDashboard();
    } catch (err) {
      onToast?.(err.message || 'Failed to reject event', 'error');
    }
  };

  const openModal = (modalName, config = {}) => {
    setModalConfig(config);
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalConfig({});
  };

  const openSourceEventsModal = (source) => {
    setModalConfig({ source });
    setActiveModal('sourceEvents');
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
              <div 
                key={event.id} 
                className="pending-event-item clickable"
                onClick={() => setSelectedReviewEvent(event)}
              >
                <div className="pending-event-info">
                  <h4>{event.name || event.title}</h4>
                  <p className="event-organizer">by {event.organizer?.username || 'Unknown'}</p>
                  <p className="event-date">{event.start_date ? new Date(event.start_date).toLocaleDateString() : (event.date ? new Date(event.date).toLocaleDateString() : 'TBA')}</p>
                </div>
                <div className="pending-event-actions" onClick={e => e.stopPropagation()}>
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

      {/* Rejected Events Review Box - New section with re-approve capability */}
      <div className="dashboard-card rejected-review-card">
        <h2>📝 Rejected Events</h2>
        {rejectedEvents.length === 0 ? (
          <p className="empty-state">No rejected events.</p>
        ) : (
          <div className="pending-events-grid">
            {rejectedEvents.map((event) => (
              <div 
                key={event.id} 
                className="pending-event-item rejected-item clickable"
                onClick={() => setSelectedReviewEvent(event)}
              >
                <div className="pending-event-info">
                  <h4>{event.name || event.title}</h4>
                  <p className="event-organizer">by {event.organizer?.username || 'Unknown'}</p>
                  <p className="event-date">{event.start_date ? new Date(event.start_date).toLocaleDateString() : (event.date ? new Date(event.date).toLocaleDateString() : 'TBA')}</p>
                  {event.admin_note && (
                    <p className="rejection-note"><strong>Rejection note:</strong> {event.admin_note}</p>
                  )}
                </div>
                <div className="pending-event-actions" onClick={e => e.stopPropagation()}>
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(event.id)}
                  >
                    ✓ Re-approve
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
            <div
              className="analytics-section clickable"
              onClick={() => openModal('events')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal('events')}
            >
              <h3 className="clickable-title">Events →</h3>
              <div className="analytics-grid">
                <div
                  className="analytics-item clickable"
                  onClick={(e) => { e.stopPropagation(); openModal('eventsDetail', { statusFilter: 'approved', title: 'Approved Events' }); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('eventsDetail', { statusFilter: 'approved', title: 'Approved Events' }); } }}
                >
                  <span className="analytics-label">Approved:</span>
                  <span className="analytics-value">{analytics?.events?.approved || 0}</span>
                </div>
                <div
                  className="analytics-item clickable"
                  onClick={(e) => { e.stopPropagation(); openModal('eventsDetail', { statusFilter: 'pending', title: 'Pending Events' }); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('eventsDetail', { statusFilter: 'pending', title: 'Pending Events' }); } }}
                >
                  <span className="analytics-label">Pending:</span>
                  <span className="analytics-value">{analytics?.events?.pending || 0}</span>
                </div>
                <div
                  className="analytics-item clickable"
                  onClick={(e) => { e.stopPropagation(); openModal('eventsDetail', { statusFilter: 'rejected', title: 'Rejected Events' }); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('eventsDetail', { statusFilter: 'rejected', title: 'Rejected Events' }); } }}
                >
                  <span className="analytics-label">Rejected:</span>
                  <span className="analytics-value">{analytics?.events?.rejected || 0}</span>
                </div>
                <div
                  className="analytics-item clickable"
                  onClick={(e) => { e.stopPropagation(); openModal('eventsDetail', { title: 'All Events' }); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('eventsDetail', { title: 'All Events' }); } }}
                >
                  <span className="analytics-label">Total:</span>
                  <span className="analytics-value">{analytics?.events?.total || 0}</span>
                </div>
              </div>
            </div>

            {/* Popular Categories Section */}
            <div
              className="analytics-section clickable"
              onClick={() => openModal('categories')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal('categories')}
            >
              <h3 className="clickable-title">Popular Categories →</h3>
              <div className="analytics-list">
                {analytics?.popular_categories?.length > 0 ? (
                  analytics.popular_categories.slice(0, 5).map((cat, idx) => (
                    <div
                      key={idx}
                      className="analytics-list-item clickable"
                      onClick={(e) => { e.stopPropagation(); openModal('eventsDetail', { categoryFilter: cat.category, title: `Events: ${cat.category}` }); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('eventsDetail', { categoryFilter: cat.category, title: `Events: ${cat.category}` }); } }}
                    >
                      <span>{cat.category}</span>
                      <span className="category-count">{cat.count} events</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state-small">No data available</p>
                )}
              </div>
            </div>

            {/* Source Summary Section */}
            <div
              className="analytics-section clickable"
              onClick={() => openModal('sources')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal('sources')}
            >
              <h3 className="clickable-title">Source Summary →</h3>
              <div className="analytics-grid">
                {['EventSphere', 'Eventbrite', 'Ticketmaster'].map((src) => (
                  <div
                    key={src}
                    className="analytics-item clickable"
                    onClick={(e) => { e.stopPropagation(); openSourceEventsModal(src); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openSourceEventsModal(src); } }}
                  >
                    <span className="analytics-label">{src}:</span>
                    <span className="analytics-value">{analytics?.source_summary?.[src] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Users Section */}
            <div
              className="analytics-section clickable"
              onClick={() => openModal('users')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal('users')}
            >
              <h3 className="clickable-title">Users →</h3>
              <div className="analytics-grid">
                <div
                  className="analytics-item clickable"
                  onClick={(e) => { e.stopPropagation(); openModal('usersDetail', { title: 'All Users' }); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('usersDetail', { title: 'All Users' }); } }}
                >
                  <span className="analytics-label">Total Users:</span>
                  <span className="analytics-value">{analytics?.users?.total || 0}</span>
                </div>
                <div
                  className="analytics-item clickable"
                  onClick={(e) => { e.stopPropagation(); openModal('usersDetail', { roleFilter: 'admin', title: 'Admins' }); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('usersDetail', { roleFilter: 'admin', title: 'Admins' }); } }}
                >
                  <span className="analytics-label">Admins:</span>
                  <span className="analytics-value">{analytics?.users?.admins || 0}</span>
                </div>
                <div
                  className="analytics-item clickable"
                  onClick={(e) => { e.stopPropagation(); openModal('usersDetail', { roleFilter: 'organizer', title: 'Organizers' }); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('usersDetail', { roleFilter: 'organizer', title: 'Organizers' }); } }}
                >
                  <span className="analytics-label">Organizers:</span>
                  <span className="analytics-value">{analytics?.users?.organizers || 0}</span>
                </div>
                <div
                  className="analytics-item clickable"
                  onClick={(e) => { e.stopPropagation(); openModal('usersDetail', { recentFilter: 'true', title: 'Recent Accounts (7 days)' }); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openModal('usersDetail', { recentFilter: 'true', title: 'Recent Accounts (7 days)' }); } }}
                >
                  <span className="analytics-label">Recent Accounts:</span>
                  <span className="analytics-value">{analytics?.users?.recent_accounts || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'users' && (
        <UsersModal title="User Management" onClose={closeModal} onToast={onToast} />
      )}
      {activeModal === 'usersDetail' && (
        <UsersDetailModal
          title={modalConfig.title || 'Users'}
          roleFilter={modalConfig.roleFilter}
          recentFilter={modalConfig.recentFilter}
          onClose={closeModal}
          onToast={onToast}
        />
      )}
      {activeModal === 'events' && (
        <EventsModal title="All Events" onClose={closeModal} onToast={onToast} />
      )}
      {activeModal === 'eventsDetail' && (
        <EventsDetailModal
          title={modalConfig.title || 'Events'}
          statusFilter={modalConfig.statusFilter}
          categoryFilter={modalConfig.categoryFilter}
          onClose={closeModal}
          onToast={onToast}
        />
      )}
      {activeModal === 'categories' && (
        <CategoriesModal title="Popular Categories" analytics={analytics} onClose={closeModal} />
      )}
      {activeModal === 'sources' && (
        <SourcesModal
          title="Event Sources"
          analytics={analytics}
          onClose={closeModal}
          onSourceClick={(src) => {
            closeModal();
            // slight delay to allow close animation
            setTimeout(() => openSourceEventsModal(src), 50);
          }}
        />
      )}
      {activeModal === 'sourceEvents' && (
        <SourceEventsModal
          title={`Events from ${modalConfig.source || 'Source'}`}
          source={modalConfig.source || 'EventSphere'}
          onClose={closeModal}
        />
      )}

      {/* Event Review Modal (works for both Pending and Rejected) */}
      {selectedReviewEvent && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReviewEvent(null)}>
          <div className="admin-modal review-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div>
                <span className="admin-modal__icon">📝</span>
                <h2>{selectedReviewEvent.status === 'rejected' ? 'Review Rejected Event' : 'Review Pending Event'}</h2>
                <p>
                  {selectedReviewEvent.status === 'rejected' 
                    ? 'Re-approve or keep rejected' 
                    : 'Approve or reject this submission'}
                </p>
              </div>
              <button className="admin-modal__close" onClick={() => setSelectedReviewEvent(null)}>✕</button>
            </div>

            <div className="admin-modal__body">
              <div className="review-modal-content">
                <div className="review-header">
                  <h3>{selectedReviewEvent.name}</h3>
                  <span className={`status-badge status-${selectedReviewEvent.status}`}>
                    {selectedReviewEvent.status}
                  </span>
                </div>

                <div className="review-creator">
                  <strong>Submitted by:</strong> {selectedReviewEvent.organizer?.username || 'Unknown'} 
                  {selectedReviewEvent.organizer?.email && ` (${selectedReviewEvent.organizer.email})`}
                </div>

                <div className="review-details-grid">
                  <div><strong>Category:</strong> {selectedReviewEvent.category || 'Uncategorized'}</div>
                  <div><strong>Capacity:</strong> {selectedReviewEvent.capacity || 'N/A'}</div>
                  <div><strong>Start:</strong> {new Date(selectedReviewEvent.start_date).toLocaleString()}</div>
                  <div><strong>End:</strong> {new Date(selectedReviewEvent.end_date).toLocaleString()}</div>
                  <div><strong>Location:</strong> {selectedReviewEvent.venue_name || (selectedReviewEvent.online_event ? 'Online' : 'TBA')}</div>
                  {selectedReviewEvent.venue_address && (
                    <div><strong>Address:</strong> {selectedReviewEvent.venue_address}</div>
                  )}
                </div>

                <div className="review-description">
                  <strong>Description</strong>
                  <p>{selectedReviewEvent.description || 'No description provided.'}</p>
                </div>

                {selectedReviewEvent.admin_note && selectedReviewEvent.status === 'rejected' && (
                  <div className="review-note">
                    <strong>Previous Rejection Note:</strong>
                    <p>{selectedReviewEvent.admin_note}</p>
                  </div>
                )}

                <div className="review-actions">
                  {selectedReviewEvent.status === 'pending' ? (
                    <>
                      <button 
                        className="approve-btn large"
                        onClick={() => {
                          handleApprove(selectedReviewEvent.id);
                          setSelectedReviewEvent(null);
                        }}
                      >
                        ✓ Approve Event
                      </button>
                      <button 
                        className="reject-btn large"
                        onClick={() => {
                          handleReject(selectedReviewEvent.id);
                          setSelectedReviewEvent(null);
                        }}
                      >
                        ✗ Reject Event
                      </button>
                    </>
                  ) : (
                    <button 
                      className="approve-btn large"
                      onClick={() => {
                        handleApprove(selectedReviewEvent.id);
                        setSelectedReviewEvent(null);
                      }}
                    >
                      ✓ Re-approve Event
                    </button>
                  )}
                  <button 
                    className="btn-secondary"
                    onClick={() => setSelectedReviewEvent(null)}
                  >
                    Close
                  </button>
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
