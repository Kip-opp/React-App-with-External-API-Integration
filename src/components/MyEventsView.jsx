import { useEffect, useMemo, useState } from 'react';

import authService from '../services/authService';
import eventbriteService from '../services/eventbriteService';

import EventGrid from './EventGrid';
import StateViews from './StateViews';

import './style/SavedEventsView.css';

const MyEventsView = ({
  onEventClick,
  onClose,
  onEditEvent,
  onDeleteEvent,
  onToast,
}) => {
  const [myEvents, setMyEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] =
    useState('all');

  const currentUser =
    authService.getCurrentUser?.();

  const role = currentUser?.role || 'user';

  const isAdmin = role === 'admin';

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    let filtered = [...myEvents];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (event) =>
          event.status === statusFilter
      );
    }

    setFilteredEvents(filtered);
  }, [myEvents, statusFilter]);

  const fetchMyEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        authService.getToken();

      if (!token) {
        throw new Error(
          'You must be logged in.'
        );
      }

      const result =
        await eventbriteService.getMyEvents(
          token
        );

      setMyEvents(result.events || []);
    } catch (err) {
      setError(
        err.message ||
          'Failed to load events.'
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: myEvents.length,

      approved: myEvents.filter(
        (event) =>
          event.status === 'approved'
      ).length,

      pending: myEvents.filter(
        (event) =>
          event.status === 'pending'
      ).length,

      rejected: myEvents.filter(
        (event) =>
          event.status === 'rejected'
      ).length,
    };
  }, [myEvents]);

  return (
    <div className="saved-events-view">
      <div className="view-header">
        <div>
          <h1>
            {isAdmin
              ? '🛡️ Managed Events'
              : '📅 My Events'}
          </h1>

          <p>
            {isAdmin
              ? 'Events created and managed through the platform.'
              : 'Events you have created as an organizer.'}
          </p>
        </div>

        <button
          className="close-view-btn"
          onClick={onClose}
        >
          ← Back to Events
        </button>
      </div>

      {!loading && !error && (
        <div className="events-stats">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Events</p>
          </div>

          <div className="stat-card approved">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>

          <div className="stat-card pending">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>

          <div className="stat-card rejected">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="events-toolbar">
          <div className="filter-buttons">
            <button
              className={
                statusFilter === 'all'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setStatusFilter('all')
              }
            >
              All
            </button>

            <button
              className={
                statusFilter ===
                'approved'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setStatusFilter(
                  'approved'
                )
              }
            >
              Approved
            </button>

            <button
              className={
                statusFilter ===
                'pending'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setStatusFilter(
                  'pending'
                )
              }
            >
              Pending
            </button>

            <button
              className={
                statusFilter ===
                'rejected'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setStatusFilter(
                  'rejected'
                )
              }
            >
              Rejected
            </button>
          </div>
        </div>
      )}

      {loading && (
        <StateViews.Loading />
      )}

      {error && (
        <StateViews.Error
          message={error}
          onRetry={fetchMyEvents}
        />
      )}

      {!loading &&
        !error &&
        filteredEvents.length === 0 && (
          <StateViews.Empty
            message="No events match the selected filter."
          />
        )}

      {!loading &&
        !error &&
        filteredEvents.length > 0 && (
          <EventGrid
            events={filteredEvents}
            onEventClick={onEventClick}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            onToast={onToast}
          />
        )}
    </div>
  );
};

export default MyEventsView;