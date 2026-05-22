import { useCallback } from 'react';
import useEventbrite from 'react-eventbrite-popup-checkout';
import './style/EventbriteCheckoutButton.css';

const EventbriteCheckoutButton = ({
  eventbriteId,
  eventUrl,
  isFree = false,
  className = '',
  disabled = false,
}) => {
  const handleOrderComplete = useCallback(() => {
    alert('🎉 Ticket purchase successful! Check your email for confirmation.');
  }, []);

  // Use the official hook from the package
  const eb = useEventbrite({
    eventId: eventbriteId,
    modal: true,
    onOrderComplete: handleOrderComplete,
  });

  // Fallback when no eventbriteId is provided
  if (!eventbriteId) {
    return (
      <button
        type="button"
        className={`eventbrite-checkout-btn ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          if (eventUrl) window.open(eventUrl, '_blank', 'noopener,noreferrer');
        }}
        disabled={disabled}
      >
        {disabled ? 'Unavailable' : 'View on Eventbrite'}
      </button>
    );
  }

  // While the script is loading
  if (!eb) {
    return (
      <button
        type="button"
        className={`eventbrite-checkout-btn ${className}`}
        disabled
      >
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
      onClick={(e) => e.stopPropagation()}
    >
      {disabled ? 'Unavailable' : (isFree ? '🎟️ Register Free' : '🎫 Buy Tickets')}
    </button>
  );
};

export default EventbriteCheckoutButton;