import { useEffect, useRef, useState } from 'react';
import EventbriteCheckoutButton from './EventbriteCheckoutButton';
import authService from '../services/authService';
import savedEventsService from '../services/savedEventsService';
import './style/EventDetails.css';

const API_BASE = 'http://localhost:5000/api';

const EventDetails = ({ eventId, eventSource, eventData, onClose, onToast }) => {
  const [event, setEvent] = useState(eventData);
  const [loading, setLoading] = useState(!eventData);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedEventId, setSavedEventId] = useState(null);
  const [saving, setSaving] = useState(false);

  const source = event?.source || eventSource || 'local';
  const externalEventId =
    event?.external_event_id ||
    event?.eventbrite_id ||
    event?.ticketmaster_id ||
    event?.id ||
    eventId;

  const isEventbriteEvent = source === 'eventbrite';
  const isTicketmasterEvent = source === 'ticketmaster';
  const isLocalEvent = source === 'local';

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/events/${eventId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }

      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRef = useRef(fetchEventDetails);

  useEffect(() => {
    if (!eventData) {
      fetchRef.current();
    }
  }, [eventId, eventData]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!authService.isAuthenticated() || !externalEventId) return;

      try {
        const result = await savedEventsService.checkIfSaved(
          externalEventId,
          source
        );

        setIsSaved(result.is_saved);
        setSavedEventId(result.saved_event_id);
      } catch (err) {
        console.error('Saved status check failed:', err);
      }
    };

    checkSavedStatus();
  }, [externalEventId, source]);

  const handleSaveToggle = async () => {
    if (!authService.isAuthenticated()) {
      if (onToast) onToast('Please login to save events', 'error');
      return;
    }

    setSaving(true);

    try {
      if (isSaved) {
        await savedEventsService.unsaveEvent(savedEventId);
        setIsSaved(false);
        setSavedEventId(null);

        if (onToast) onToast('Event removed from saved events', 'info');
      } else {
        const result = await savedEventsService.saveEvent(event);

        setIsSaved(true);
        setSavedEventId(result.saved_event.id);

        if (onToast) onToast('Event saved successfully', 'success');
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Could not update saved event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return 'Date TBA';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = () => {
    if (event?.is_free) return 'FREE';

    if (event?.min_price) {
      return `${event.currency || 'KES'} ${event.min_price}${
        event.max_price ? ` - ${event.max_price}` : ''
      }`;
    }

    return 'Paid Event';
  };

  if (loading) {
    return (
      <div className="event-details-overlay" onClick={onClose}>
        <div className="event-details-loading">Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-details-overlay" onClick={onClose}>
        <div className="event-details-error">Error: {error}</div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="event-details-overlay" onClick={onClose}>
      <div className="event-details" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className={`event-source-badge badge-${source}`}>
          {isTicketmasterEvent && '🎟️ Ticketmaster Event'}
          {isEventbriteEvent && '🎫 Eventbrite Event'}
          {isLocalEvent && '🏠 Community Event'}
        </div>

        {isLocalEvent && event.status && (
          <div className={`event-status-badge status-${event.status}`}>
            {event.status}
          </div>
        )}

        {event.image_url ? (
          <div className="event-details__hero">
            <img src={event.image_url} alt={event.name} />
          </div>
        ) : (
          <div className="event-details__hero event-details__hero--placeholder">
            <span className="placeholder-icon">🎪</span>
            <span className="placeholder-text">{event.name}</span>
          </div>
        )}

        <div className="event-details__content">
          <div className="event-details__top-row">
            {event.category && (
              <span className="event-details__category">
                {event.category}
              </span>
            )}

            <button
              type="button"
              className={`details-save-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSaveToggle}
              disabled={saving}
            >
              {saving ? 'Saving...' : isSaved ? '❤️ Saved' : '🤍 Save Event'}
            </button>
          </div>

          <h1 className="event-details__title">{event.name}</h1>

          <div className="event-details__summary">
            <span>{formatPrice()}</span>
            <span>{event.online_event ? 'Online' : 'In person'}</span>
            {event.capacity && <span>{event.capacity} capacity</span>}
          </div>

          <div className="event-details__info">
            <div className="info-item">
              <span className="icon">📅</span>
              <div>
                <strong>Date & Time</strong>
                <p>{formatDate(event.start_date)}</p>
                {event.end_date && <p>to {formatDate(event.end_date)}</p>}
              </div>
            </div>

            <div className="info-item">
              <span className="icon">{event.online_event ? '💻' : '📍'}</span>
              <div>
                <strong>Location</strong>

                {event.online_event ? (
                  <p>Online Event</p>
                ) : (
                  <>
                    {event.venue_name && <p><strong>{event.venue_name}</strong></p>}
                    {event.venue_address && <p>{event.venue_address}</p>}
                    {event.venue_phone && <p>📞 {event.venue_phone}</p>}
                    {event.venue_capacity && (
                      <p>👥 Capacity: {event.venue_capacity.toLocaleString()}</p>
                    )}
                    {event.venue_url && (
                      <p>
                        <a href={event.venue_url} target="_blank" rel="noopener noreferrer">
                          Venue Website →
                        </a>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {isTicketmasterEvent && event.artists?.length > 0 && (
              <div className="info-item">
                <span className="icon">🎤</span>
                <div>
                  <strong>Artists</strong>
                  <p>{event.artists.join(', ')}</p>
                </div>
              </div>
            )}

            {isTicketmasterEvent && event.genre && (
              <div className="info-item">
                <span className="icon">🎵</span>
                <div>
                  <strong>Genre</strong>
                  <p>{event.genre}</p>
                </div>
              </div>
            )}
          </div>

          <div className="event-details__description">
            <h2>About this event</h2>
            <p>{event.description || 'No description provided.'}</p>
          </div>

          {!isTicketmasterEvent && event.tickets?.length > 0 && (
            <div className="event-details__tickets">
              <h2>Tickets</h2>

              <div className="tickets-list">
                {event.tickets.map((ticket, index) => (
                  <div key={ticket.id || index} className="ticket-item">
                    <div className="ticket-info">
                      <h3>{ticket.name}</h3>

                      {ticket.description && <p>{ticket.description}</p>}

                      {ticket.quantity_available !== undefined && (
                        <div className="ticket-availability">
                          {ticket.quantity_available} / {ticket.quantity_total} available
                        </div>
                      )}
                    </div>

                    <div className="ticket-price">
                      {ticket.price === 0 ? (
                        <span className="free">FREE</span>
                      ) : (
                        <span className="price">
                          {event.currency || 'KES'} {ticket.price?.toFixed(2) || '0.00'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="event-details__action">
            {isEventbriteEvent ? (
              <EventbriteCheckoutButton
                eventbriteId={event.eventbrite_id || externalEventId}
                eventUrl={event.checkout_url || event.event_url || event.url}
                isFree={event.is_free}
                className="checkout-btn-large"
              />
            ) : isTicketmasterEvent ? (
              <div className="ticketmaster-cta">
                <p className="cta-message">
                  🎟️ Get tickets for this event on Ticketmaster
                </p>

                <a
                  href={event.checkout_url || event.event_url || event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ticketmaster-button"
                >
                  View on Ticketmaster →
                </a>
              </div>
            ) : (
              <div className="no-checkout-message">
                <p>
                  🎉 This is a community event. Contact the organizer for attendance details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;