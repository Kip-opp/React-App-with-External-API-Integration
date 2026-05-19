import { useEffect, useState } from 'react';
import EventbriteCheckoutButton from './EventbriteCheckoutButton';
import authService from '../services/authService';
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
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [savedEventId, setSavedEventId] = useState(null);
  const [saving, setSaving] = useState(false);

  const currentUser = authService.getCurrentUser?.();
  const role = currentUser?.role;

  const eventId =
    event.external_event_id ||
    event.eventbrite_id ||
    event.ticketmaster_id ||
    event.id;

  const source = event.source || 'local';

  const isLocal = source === 'local';
  const isTicketmaster = source === 'ticketmaster';
  const isEventbrite = source === 'eventbrite';

  const canManageEvent =
    currentUser &&
    isLocal &&
    (
      role === 'admin' ||
      Number(event.user_id) === Number(currentUser.id)
    );

  useEffect(() => {
    checkIfSaved();
  }, [eventId, source]);

  const checkIfSaved = async () => {
    if (!authService.isAuthenticated()) return;

    try {
      const result =
        await savedEventsService.checkIfSaved(
          eventId,
          source
        );

      setIsSaved(result.is_saved);
      setSavedEventId(result.saved_event_id);

    } catch (error) {

      console.error(
        'Error checking saved status:',
        error
      );

    }
  };

  const handleSaveToggle = async (e) => {

    e.stopPropagation();

    if (!authService.isAuthenticated()) {

      if (onToast) {
        onToast(
          'Please login to save events',
          'error'
        );
      }

      return;
    }

    setSaving(true);

    try {

      if (isSaved) {

        await savedEventsService.unsaveEvent(
          savedEventId
        );

        setIsSaved(false);
        setSavedEventId(null);

      } else {

        const result =
          await savedEventsService.saveEvent(
            event
          );

        setIsSaved(true);

        setSavedEventId(
          result.saved_event.id
        );

      }

      if (onSaveToggle)
        onSaveToggle();

    } catch (error) {

      if (onToast) {

        onToast(
          error.message,
          'error'
        );

      }

    } finally {

      setSaving(false);

    }
  };


  // NEW SHARE FUNCTION
  const handleShareClick =
    async (e) => {

    e.stopPropagation();

    const shareUrl =
      event.checkout_url ||
      event.event_url ||
      window.location.href;

    try {

      if (navigator.share) {

        await navigator.share({

          title:
            event.name,

          text:
            `Check out ${event.name}`,

          url:
            shareUrl

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
        'Share failed',
        error
      );

    }

  };


  const handleCardClick =
    (e) => {

    if (

      e.target.closest(
        '.eventbrite-checkout-btn'
      ) ||

      e.target.closest(
        '.ticketmaster-link-btn'
      ) ||

      e.target.closest(
        '.favorite-btn'
      ) ||

      e.target.closest(
        '.event-card__button'
      )

    ) {

      return;

    }

    onClick(event);

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
  } = event;


  const formatDate =
    (dateString) => {

    if (!dateString)
      return 'Date TBA';

    return new Date(
      dateString
    ).toLocaleDateString(
      'en-US',
      {

        weekday:'short',
        month:'short',
        day:'numeric',
        year:'numeric'

      }

    );

  };


  const formatPrice =
    () => {

    if (is_free)
      return 'FREE';

    return min_price
      ? `${currency} ${min_price}`
      : 'Paid Event';

  };


  return (

<div
className="event-card"
onClick={handleCardClick}
>

<div className="event-card__content">

<h3>

{name}

</h3>


<p>

{description}

</p>


<div
className="event-card__footer"
>

<span>

{formatPrice()}

</span>


<button

className="event-card__button"

onClick={
handleShareClick
}

>

🔗 Share

</button>



{isEventbrite ? (

<EventbriteCheckoutButton

eventbriteId={
eventbrite_id
}

eventUrl={
checkout_url
}

isFree={
is_free
}

/>

) : (

<button
className="
event-card__button
"
>

View Details →

</button>

)}

</div>


<button

className={
`favorite-btn ${
isSaved
? 'saved'
: ''
}`

}

onClick={
handleSaveToggle
}

>

{
isSaved
? '❤️'
: '🤍'
}

</button>


</div>

</div>

);

};

export default EventCard;