import { useCallback, useEffect, useMemo, useRef } from 'react';
import authService from '../services/authService';
import './style/EventbriteCheckoutButton.css';

const generateId = (eventbriteId, eventUrl) => {
  let hash = 0;

  const str = String(eventbriteId || eventUrl || '');

  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }

  return `eb-widget-${Math.abs(hash).toString(36)}`;
};

const EB_WIDGETS_URL = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';
let ebWidgetsPromise = null;

function loadEBWidgets() {
  if (ebWidgetsPromise) {
    return ebWidgetsPromise;
  }

  ebWidgetsPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.EBWidgets) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = EB_WIDGETS_URL;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => {
      ebWidgetsPromise = null; // allow retry on next attempt
      reject(new Error('Failed to load Eventbrite widgets script'));
    };

    document.head.appendChild(script);
  });

  return ebWidgetsPromise;
}

const EventbriteCheckoutButton = ({
  eventbriteId,
  eventUrl,
  isFree = false,
  className = '',
  onRequireAuth,
  disabled = false,
}) => {
  const triggerId = useMemo(
    () => generateId(eventbriteId, eventUrl),
    [eventbriteId, eventUrl]
  );

  const widgetInitializedRef = useRef(false);

  const shouldUseWidget = useMemo(() => {
    if (!eventbriteId || typeof window === 'undefined') return false;

    const { protocol, hostname } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    return protocol === 'https:' || isLocal;
  }, [eventbriteId]);

  const handleOrderComplete = useCallback(() => {
    alert(
      '🎉 Ticket purchase successful! Check your email for confirmation.'
    );
  }, []);

  useEffect(() => {
    if (!shouldUseWidget) return;

    let pollInterval = null;

    const initWidget = () => {
      if (!window.EBWidgets) return false;

      try {
        window.EBWidgets.createWidget({
          widgetType: 'checkout',
          eventId: eventbriteId,
          modal: true,
          modalTriggerElementId: triggerId,
          onOrderComplete: handleOrderComplete,
        });

        widgetInitializedRef.current = true;
        return true;
      } catch (error) {
        console.error('Error creating Eventbrite widget:', error);
        return false;
      }
    };

    const startPolling = () => {
      // Try immediately
      if (initWidget()) return;

      // Robust polling for race conditions
      pollInterval = setInterval(() => {
        if (initWidget()) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }, 100);

      // Stop polling after timeout
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
          console.warn(
            'Eventbrite widget initialization timed out for event',
            eventbriteId
          );
        }
      }, 5000);
    };

    loadEBWidgets()
      .then(startPolling)
      .catch((err) => {
        console.error('Failed to load Eventbrite widgets script:', err);
        // widgetInitializedRef remains false → will use fallback
      });

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [eventbriteId, triggerId, handleOrderComplete, shouldUseWidget]);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (disabled) return;

    if (!authService.isAuthenticated()) {
      if (onRequireAuth) {
        onRequireAuth({
          eventbriteId,
          eventUrl,
          isFree,
        });
      } else {
        alert('Please login or create an account to continue.');
      }
      return;
    }

    // Only let widget handle if it was successfully initialized
    if (shouldUseWidget && widgetInitializedRef.current) {
      return;
    }

    // Reliable fallback: open in new tab ONLY if widget failed to initialize
    if (eventUrl) {
      window.open(eventUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Checkout is not available for this event.');
    }
  };

  return (
    <button
      id={triggerId}
      type="button"
      className={`eventbrite-checkout-btn ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {disabled
        ? 'Unavailable'
        : isFree
          ? '🎟️ Register Free'
          : '🎫 Buy Tickets'}
    </button>
  );
};

export default EventbriteCheckoutButton;