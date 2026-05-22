import { useEffect, useState } from 'react';
import EventbriteCheckoutButton from './EventbriteCheckoutButton';
import authService from '../services/authService';
import eventbriteService from '../services/eventbriteService';
import savedEventsService from '../services/savedEventsService';
import './style/EventCard.css';

const EventCard = ({
  event,
  onClick,
  onSaveToggle,
  onToast,
  onCheckoutAuth,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [savedEventId, setSavedEventId] = useState(null);
  const [saving, setSaving] = useState(false);

  const currentUser = authService.getCurrentUser?.();
  const role = currentUser?.role;

  const eventId = event.external_event_id || event.eventbrite_id || event.ticketmaster_id || event.id;
  const source = event.source || 'local';

  const isLocal = source === 'local';
  const isTicketmaster = source === 'ticketmaster';
  const isEventbrite = source === 'eventbrite';

  const canManageEvent =
    currentUser &&
    isLocal &&
    (role === 'admin' || Number(event.user_id) === Number(currentUser.id));

  const canVetEvent =
    currentUser &&
    role === 'admin' &&
    isLocal &&
    event.status === 'pending';

  useEffect(() => {
    checkIfSaved();
  }, [eventId, source]);

  const checkIfSaved = async () => {
    if (!authService.isAuthenticated()) return;

    try {
      const result = await savedEventsService.checkIfSaved(eventId, source);

      setIsSaved(result.is_saved);
      setSavedEventId(result.saved_event_id);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();

    if (!authService.isAuthenticated()) {
      if (onToast) {
        onToast('Please login to save events', 'error');
      } else {
        alert('Please login to save events');
      }

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
    } catch (error) {
      console.error('Error toggling save:', error);

      if (onToast) {
        onToast(error.message || 'Could not update saved event', 'error');
      } else {
        alert(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = (e) => {
    if (
      e.target.closest('.eventbrite-checkout-btn') ||
      e.target.closest('.ticketmaster-link-btn') ||
      e.target.closest('.favorite-btn') ||
      e.target.closest('.event-card__button') ||
      e.target.closest('.event-admin-actions')
    ) {
      return;
    }

    onClick(event);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();

    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();

    if (onDelete) {
      onDelete(event);
    }
  };

  const handleApproveClick = async (e) => {
    e.stopPropagation();
    try {
      const token = authService.getToken();
      if (!token) {
        onToast?.('You must be logged in', 'error');
        return;
      }
      const result = await eventbriteService.approveEvent(event.id, token);
      onToast?.(result.message || 'Event approved successfully', 'success');
      window.dispatchEvent(new CustomEvent('events-updated'));
    } catch (err) {
      onToast?.(err.message || 'Failed to approve event', 'error');
    }
  };

  const handleRejectClick = async (e) => {
    e.stopPropagation();
    const note = prompt('Optional rejection reason/note (can be empty):') || '';
    try {
      const token = authService.getToken();
      if (!token) {
        onToast?.('You must be logged in', 'error');
        return;
      }
      const result = await eventbriteService.rejectEvent(event.id, token, note);
      onToast?.(result.message || 'Event rejected', 'success');
      window.dispatchEvent(new CustomEvent('events-updated'));
    } catch (err) {
      onToast?.(err.message || 'Failed to reject event', 'error');
    }
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();

    const shareUrl =
      checkout_url ||
      event.event_url ||
      event.url ||
      window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `Check out ${name}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        if (onToast) {
          onToast(
            'Event link copied!',
            'success'
          );
        }
      }
    } catch (error) {
      console.error(
        'Share failed:',
        error
      );
    }
  };

  const {
    name = 'Untitled Event',
    description,
    start_date,
    image_url,
    venue_name,
    venue_address,
    is_free,
    online_event,
    category,
    eventbrite_id,
    checkout_url,
    min_price,
    max_price,
    currency = 'KES',
    status,
  } = event;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return 'Date TBA';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = () => {
    if (is_free) return 'FREE';

    if (min_price) {
      return max_price && max_price !== min_price
        ? `${currency} ${min_price} - ${max_price}`
        : `${currency} ${min_price}`;
    }

    return 'Paid Event';
  };

  const placeholderGradients = [
    'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
    'linear-gradient(135deg, #f97316 0%, #fb7185 100%)',
    'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #111827 0%, #f97316 100%)',
    'linear-gradient(135deg, #0369a1 0%, #f59e0b 100%)',
  ];

  const getPlaceholder = () => {
    const hash = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return placeholderGradients[hash % placeholderGradients.length];
  };

  return (
    <div className="event-card" onClick={handleCardClick}>
      <div
        className="event-card__image"
        style={!image_url ? { background: getPlaceholder() } : undefined}
      >
        {image_url ? (
          <img src={image_url} alt={name} />
        ) : (
          <div className="event-card__placeholder">
            <span className="placeholder-icon">🎪</span>
            <span className="placeholder-text">{name}</span>
          </div>
        )}

        {category && (
          <span className="event-card__badge">
            {category}
          </span>
        )}

        {source && (
          <span className={`source-badge source-${source}`}>
            {isTicketmaster
              ? '🎟️ Ticketmaster'
              : isEventbrite
                ? '🎫 Eventbrite'
                : '🏠 Local'}
          </span>
        )}

        {status && isLocal && (
          <span className={`status-badge status-${status}`}>
            {status}
          </span>
        )}

        <button
          className={`favorite-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveToggle}
          disabled={saving}
          title={isSaved ? 'Remove from saved events' : 'Save event'}
        >
          {saving ? '…' : isSaved ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="event-card__content">
        <div className="event-card__meta">
          <span>📅 {formatDate(start_date)}</span>
          <span>{online_event ? '💻 Online' : '📍 In person'}</span>
        </div>

        <h3 className="event-card__title">{name}</h3>

        <div className="event-card__venue">
          {online_event ? (
            <>Online Event</>
          ) : (
            <>{venue_name || venue_address || 'Venue TBA'}</>
          )}
        </div>

        {description && (
          <p className="event-card__description">
            {description.length > 115
              ? `${description.substring(0, 115)}...`
              : description}
          </p>
        )}

        <div className="event-card__footer">
          <span className="event-card__price">
            {formatPrice()}
          </span>

          <button
            className="event-card__button"
            onClick={handleShareClick}
          >
            🔗 Share
          </button>

          {isEventbrite ? (
            <EventbriteCheckoutButton
              eventbriteId={eventbrite_id || eventId}
              eventUrl={checkout_url || event.event_url || event.url}
              isFree={is_free}
              className="event-card__button"
            />
          ) : isTicketmaster ? (
            <a
              href={checkout_url || event.event_url || event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="event-card__button ticketmaster-link-btn"
              onClick={(e) => e.stopPropagation()}
            >
              View Tickets →
            </a>
          ) : (
            <button className="event-card__button view-details-btn">
              View Details →
            </button>
          )}
        </div>

        {canManageEvent && (
          <div className="event-admin-actions">
            <button type="button" onClick={handleEditClick}>
              Edit
            </button>

            <button type="button" className="danger" onClick={handleDeleteClick}>
              Delete
            </button>
          </div>
        )}

        {canVetEvent && (
          <div className="event-vetting-actions">
            <button
              type="button"
              className="approve-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onApprove) {
                  onApprove(event);
                } else {
                  handleApproveClick(e);
                }
              }}
            >
              ✓ Approve
            </button>
            <button
              type="button"
              className="reject-btn danger"
              onClick={(e) => {
                e.stopPropagation();
                if (onReject) {
                  onReject(event);
                } else {
                  handleRejectClick(e);
                }
              }}
            >
              ✗ Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;