import { useCallback } from 'react';
import useEventbrite from 'react-eventbrite-popup-checkout';
import './style/EventbriteCheckoutButton.css';

const ExternalButton = ({ eventUrl, className, disabled, isFree }) => (
  <button
    type="button"
    className={`eventbrite-checkout-btn ${className}`}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      if (eventUrl) window.open(eventUrl, '_blank', 'noopener,noreferrer');
    }}
  >
    {disabled ? 'Unavailable' : isFree ? 'Register on Eventbrite' : 'Buy on Eventbrite'}
  </button>
);

const PopupButton = ({ eventbriteId, className, disabled, isFree, onOrderComplete }) => {
  const eb = useEventbrite({
    eventId: eventbriteId,
    modal: true,
    onOrderComplete,
  });

  if (!eb) {
    return (
      <button type="button" className={`eventbrite-checkout-btn ${className}`} disabled>
        Loading Tickets...
      </button>
    );
  }

  return (
  <button
    id={eb.id}
    type="button"
    className={`eventbrite-checkout-btn ${className}`}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();

      if (eb.open) {
        eb.open();
      }
    }}
  >
      {disabled ? 'Unavailable' : isFree ? '🎟️ Register Free' : '🎫 Buy Tickets'}
    </button>
  );
};

const EventbriteCheckoutButton = (props) => {
  const { eventbriteId, eventUrl, isFree = false, className = '', disabled = false } = props;
  const isHttps = window.location.protocol === 'https:';

  const handleOrderComplete = useCallback(() => {
    alert('🎉 Ticket purchase successful! Check your email for confirmation.');
  }, []);

  if (!eventbriteId) {
    return (
      <ExternalButton
        eventUrl={eventUrl}
        className={className}
        disabled={disabled}
        isFree={isFree}
      />
    );
  }

  if (!isHttps) {
    return (
      <ExternalButton
        eventUrl={eventUrl}
        className={className}
        disabled={disabled}
        isFree={isFree}
      />
    );
  }

  return (
    <PopupButton
      eventbriteId={eventbriteId}
      className={className}
      disabled={disabled}
      isFree={isFree}
      onOrderComplete={handleOrderComplete}
    />
  );
};

export default EventbriteCheckoutButton;