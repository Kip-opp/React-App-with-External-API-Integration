import { useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import eventbriteService from '../services/eventbriteService';
import EventGrid from './EventGrid';
import StateViews from './StateViews';
import './style/OrganizerDashboard.css';

const OrganizerDashboard = ({
  onClose,
  onCreateEvent,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  onToast,
}) => {
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrganizerEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      const result = await eventbriteService.getMyEvents(token);
      setEvents(result.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load organizer events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'all') return events;
    return events.filter((event) => event.status === statusFilter);
  }, [events, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      approved: events.filter((event) => event.status === 'approved').length,
      pending: events.filter((event) => event.status === 'pending').length,
      rejected: events.filter((event) => event.status === 'rejected').length,
    };
  }, [events]);

  if (loading) return <StateViews.Loading message="Loading organizer dashboard..." />;

  if (error) {
    return (
      <StateViews.Error
        message={error}
        onRetry={fetchOrganizerEvents}
      />
    );
  }

  return (
    <section className="organizer-dashboard">
      <div className="dashboard-header">
        <div>
          <span className="section-eyebrow">Organizer Space</span>
          <h1>🎤 Organizer Dashboard</h1>
          <p>Create events, monitor approval status, and manage your event listings.</p>
        </div>

        <div className="dashboard-actions">
          <button onClick={onCreateEvent}>
            + Create Event
          </button>

          <button onClick={onClose}>
            ← Back
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div><h3>{stats.total}</h3><p>Total</p></div>
        <div><h3>{stats.approved}</h3><p>Approved</p></div>
        <div><h3>{stats.pending}</h3><p>Pending</p></div>
        <div><h3>{stats.rejected}</h3><p>Rejected</p></div>
      </div>

      <div className="filter-buttons">
        {['all', 'approved', 'pending', 'rejected'].map((status) => (
          <button
            key={status}
            className={statusFilter === status ? 'active' : ''}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <StateViews.Empty
          title="No events here yet"
          message="Create your first event or change the selected filter."
          actionLabel="Create Event"
          onAction={onCreateEvent}
        />
      ) : (
        <EventGrid
          events={filteredEvents}
          onEventClick={onEventClick}
          onEditEvent={onEditEvent}
          onDeleteEvent={onDeleteEvent}
          onToast={onToast}
          onSaveToggle={fetchOrganizerEvents}
        />
      )}
    </section>
  );
};

export default OrganizerDashboard;