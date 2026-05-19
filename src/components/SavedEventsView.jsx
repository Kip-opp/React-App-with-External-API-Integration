import { useEffect, useState } from 'react';

import savedEventsService from '../services/savedEventsService';

import EventGrid from './EventGrid';
import ReminderModal from './ReminderModal';
import StateViews from './StateViews';

import './style/SavedEventsView.css';

const SavedEventsView = ({
  onEventClick,
  onClose,
  onToast,
}) => {
  const [savedEvents, setSavedEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedReminderEvent, setSelectedReminderEvent] = useState(null);

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  useEffect(() => {
    if (sourceFilter === 'all') {
      setFilteredEvents(savedEvents);
    } else {
      setFilteredEvents(
        savedEvents.filter((event) => event.source === sourceFilter)
      );
    }
  }, [savedEvents, sourceFilter]);

  const fetchSavedEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await savedEventsService.getSavedEvents();

      const events = (result.saved_events || []).map((saved) => ({
        id: saved.external_event_id,
        external_event_id: saved.external_event_id,
        source: saved.source,

        name: saved.event_name,
        description: saved.event_description,

        image_url: saved.image_url,
        start_date: saved.event_date,

        venue_name: saved.venue_name,
        venue_address: saved.venue_address,

        event_url: saved.event_url,
        checkout_url: saved.event_url,

        category: saved.category,

        saved_event_id: saved.id,
        reminder_enabled: saved.reminder_enabled,
        reminder_datetime: saved.reminder_datetime,
        reminder_sent: saved.reminder_sent,
        notes: saved.notes,
      }));

      setSavedEvents(events);
    } catch (err) {
      setError(err.message || 'Failed to load saved events.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (event) => {
    try {
      await savedEventsService.unsaveEvent(event.saved_event_id);

      setSavedEvents((prev) =>
        prev.filter(
          (savedEvent) => savedEvent.saved_event_id !== event.saved_event_id
        )
      );

      onToast?.('Event removed from saved events', 'info');
    } catch (err) {
      onToast?.(err.message || 'Could not remove saved event', 'error');
    }
  };

  const handleSaveReminderForEvent = async (event, reminderData) => {
    try {
      await savedEventsService.updateSavedEvent(
        event.saved_event_id,
        reminderData
      );

      onToast?.(
        reminderData.reminder_datetime
          ? 'Reminder saved successfully'
          : 'Reminder deleted successfully',
        reminderData.reminder_datetime ? 'success' : 'info'
      );

      fetchSavedEvents();
    } catch (err) {
      onToast?.(err.message || 'Failed to update reminder', 'error');
    }
  };

  const handleSaveReminder = async (reminderData) => {
    if (!selectedReminderEvent) return;

    await handleSaveReminderForEvent(
      selectedReminderEvent,
      reminderData
    );

    setSelectedReminderEvent(null);
  };

  const handleDeleteReminder = async (event) => {
    await handleSaveReminderForEvent(event, {
      reminder_enabled: false,
      reminder_datetime: null,
      notes: '',
    });
  };

  return (
    <div className="saved-events-view">
      <div className="view-header">
        <div>
          <h1>❤️ Saved Events</h1>
          <p>
            Events you bookmarked, reminders you set, and experiences you want to revisit.
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
        <div className="events-toolbar">
          <div className="filter-buttons">
            {['all', 'eventbrite', 'ticketmaster', 'local'].map((source) => (
              <button
                key={source}
                className={sourceFilter === source ? 'active' : ''}
                onClick={() => setSourceFilter(source)}
              >
                {source === 'all' ? 'All' : source}
              </button>
            ))}
          </div>

          <p className="toolbar-count">
            {filteredEvents.length} saved event
            {filteredEvents.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      {loading && <StateViews.Loading />}

      {error && (
        <StateViews.Error
          message={error}
          onRetry={fetchSavedEvents}
        />
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <StateViews.Empty
          message="No saved events yet. Start exploring and save events you are interested in!"
        />
      )}

      {!loading && !error && filteredEvents.length > 0 && (
        <div className="saved-events-list">
          {filteredEvents.map((event) => (
            <div
              key={`${event.source}-${event.saved_event_id}`}
              className="saved-event-wrapper"
            >
              <EventGrid
                events={[event]}
                onEventClick={onEventClick}
                onToast={onToast}
                onSaveToggle={fetchSavedEvents}
                onDeleteEvent={handleRemoveSaved}
              />

              <div className="saved-event-actions">
                <button
                  type="button"
                  onClick={() => setSelectedReminderEvent(event)}
                >
                  ⏰ {event.reminder_datetime ? 'Edit Reminder' : 'Set Reminder'}
                </button>

                {event.reminder_datetime && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDeleteReminder(event)}
                  >
                    🗑️ Delete Reminder
                  </button>
                )}

                {event.reminder_datetime && (
                  <span>
                    Reminder: {new Date(event.reminder_datetime).toLocaleString()}
                  </span>
                )}

                {event.notes && (
                  <p className="saved-reminder-note">
                    Message: {event.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReminderEvent && (
        <ReminderModal
          event={selectedReminderEvent}
          onClose={() => setSelectedReminderEvent(null)}
          onSaveReminder={handleSaveReminder}
        />
      )}
    </div>
  );
};

export default SavedEventsView;