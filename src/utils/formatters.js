/**
 * Shared event normalization utilities.
 * Every event source should end up in the same frontend shape.
 */

/**
 * Format date safely.
 */
export function formatDate(dateString) {
  if (!dateString) {
    return 'Date TBA';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Date TBA';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format full date/time.
 */
export function formatDateTime(dateString) {
  if (!dateString) {
    return 'Date TBA';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Date TBA';
  }

  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format event price.
 */
export function formatPrice(event) {
  if (event?.is_free) {
    return 'FREE';
  }

  if (
    event?.min_price !== undefined &&
    event?.min_price !== null
  ) {
    return `${event.currency || 'KES'} ${event.min_price}${
      event.max_price
        ? ` - ${event.max_price}`
        : ''
    }`;
  }

  if (
    event?.price !== undefined &&
    event?.price !== null
  ) {
    return `${event.currency || 'KES'} ${event.price}`;
  }

  return 'Paid Event';
}

/**
 * Normalize Ticketmaster events.
 */
export function normalizeTicketmasterEvent(event) {
  return {
    id:
      event.id ||
      event.ticketmaster_id,

    ticketmaster_id:
      event.ticketmaster_id ||
      event.id,

    source: 'ticketmaster',

    name:
      event.name ||
      'Untitled Event',

    description:
      event.description || '',

    image_url:
      event.image_url ||
      event.images?.[0]?.url ||
      '',

    start_date:
      event.start_date ||
      event.dates?.start?.dateTime ||
      '',

    end_date:
      event.end_date || '',

    checkout_url:
      event.checkout_url ||
      event.url ||
      '',

    event_url:
      event.event_url ||
      event.url ||
      '',

    venue_name:
      event.venue_name ||
      event._embedded?.venues?.[0]
        ?.name ||
      'Venue TBA',

    venue_address:
      event.venue_address || '',

    venue_city:
      event.venue_city || '',

    venue_country:
      event.venue_country || '',

    category:
      event.category ||
      event.classifications?.[0]
        ?.segment?.name ||
      '',

    genre:
      event.genre ||
      event.classifications?.[0]
        ?.genre?.name ||
      '',

    subgenre:
      event.subgenre || '',

    min_price:
      event.min_price ??
      event.priceRanges?.[0]?.min ??
      null,

    max_price:
      event.max_price ??
      event.priceRanges?.[0]?.max ??
      null,

    currency:
      event.currency ||
      event.priceRanges?.[0]
        ?.currency ||
      'USD',

    online_event:
      event.online_event || false,

    artists:
      event.artists || [],

    status:
      event.status || 'active',
  };
}

/**
 * Normalize Eventbrite events.
 */
export function normalizeEventbriteEvent(event) {
  return {
    id:
      event.id ||
      event.eventbrite_id,

    eventbrite_id:
      event.eventbrite_id ||
      event.id,

    source: 'eventbrite',

    name:
      event.name ||
      'Untitled Event',

    description:
      event.description || '',

    image_url:
      event.image_url || '',

    start_date:
      event.start_date || '',

    end_date:
      event.end_date || '',

    checkout_url:
      event.checkout_url ||
      event.url ||
      '',

    event_url:
      event.event_url ||
      event.url ||
      '',

    venue_name:
      event.venue_name ||
      'Venue TBA',

    venue_address:
      event.venue_address || '',

    category:
      event.category || '',

    currency:
      event.currency || 'KES',

    is_free:
      event.is_free || false,

    online_event:
      event.online_event || false,

    capacity:
      event.capacity || null,

    status:
      event.status || 'active',

    tickets:
      event.tickets || [],
  };
}

/**
 * Normalize local platform events.
 */
export function normalizeLocalEvent(event) {
  return {
    id: event.id,

    source: 'local',

    name:
      event.name ||
      'Untitled Event',

    description:
      event.description || '',

    image_url:
      event.image_url || '',

    start_date:
      event.start_date || '',

    end_date:
      event.end_date || '',

    venue_name:
      event.venue_name ||
      'Venue TBA',

    venue_address:
      event.venue_address || '',

    category:
      event.category || '',

    currency:
      event.currency || 'KES',

    is_free:
      event.is_free || false,

    online_event:
      event.online_event || false,

    capacity:
      event.capacity || null,

    status:
      event.status || 'pending',

    admin_note:
      event.admin_note || null,

    tickets:
      event.tickets || [],
  };
}

/**
 * Generic normalizer.
 */
export function normalizeEvent(event) {
  if (
    event.source === 'ticketmaster' ||
    event.ticketmaster_id
  ) {
    return normalizeTicketmasterEvent(
      event
    );
  }

  if (
    event.source === 'eventbrite' ||
    event.eventbrite_id
  ) {
    return normalizeEventbriteEvent(
      event
    );
  }

  return normalizeLocalEvent(event);
}