import { fetchEvents as fetchTicketmasterEvents } from './ticketmasterService';
import eventbriteService from './eventbriteService';

const API_BASE_URL = 'http://localhost:5000/api';

// Normalize Ticketmaster events
const normalizeTicketmasterEvent = (event) => {
  const dates = event.dates?.start;
  return {
    id: event.id,
    source: 'ticketmaster',
    name: event.name,
    description: event.description || '',
    image_url: event.images?.[0]?.url || '',
    start_date: dates?.dateTime || dates?.localDate || '',
    venue_name: event._embedded?.venues?.[0]?.name || 'Venue TBA',
    venue_address: event._embedded?.venues?.[0]?.address?.address1 || '',
    is_free: false,
    online_event: false,
    category: event.classifications?.[0]?.segment?.name || 'Event',
    checkout_url: event.url || '',
    min_price: event.priceRanges?.[0]?.minPrice || 0,
    max_price: event.priceRanges?.[0]?.maxPrice || 0,
    currency: event.priceRanges?.[0]?.currency || 'USD',
  };
};

// Normalize Eventbrite events
const normalizeEventbriteEvent = (event) => {
  return {
    id: event.id,
    source: 'eventbrite',
    name: event.name?.text || event.name || '',
    description: event.description?.text || event.description || '',
    image_url: event.logo?.url || event.image?.url || '',
    start_date: event.start?.utc || event.start?.local || '',
    venue_name: event.venue?.name || 'Venue TBA',
    venue_address: event.venue?.address?.address_1 || '',
    is_free: event.status === 'live' && !event.price,
    online_event: event.online_event || false,
    category: 'Experience',
    eventbrite_id: event.id,
    checkout_url: event.url || '',
    min_price: 0,
    max_price: 0,
    currency: 'USD',
  };
};

// Normalize local events
const normalizeLocalEvent = (event) => {
  return {
    ...event,
    source: event.source || 'local',
    id: event.id || `local-${Math.random()}`,
  };
};

const eventService = {
  // Get all events from all sources
  getAllEvents: async () => {
    try {
      const allEvents = [];
      
      // Try to fetch from backend search endpoint first
      try {
        const response = await fetch(`${API_BASE_URL}/events/search?source=all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.events && Array.isArray(data.events)) {
            return data.events.map((e) => normalizeLocalEvent(e));
          }
          if (Array.isArray(data)) {
            return data.map((e) => normalizeLocalEvent(e));
          }
          console.warn('Backend /events/search response format not recognized, falling back to direct API calls:', data);
        } else {
          console.warn('/events/search returned non-ok response:', response.status);
        }
      } catch (err) {
        console.warn('Backend events search endpoint failed, falling back to direct API calls:', err);
      }

      // Fetch from Ticketmaster
      try {
        const tmData = await fetchTicketmasterEvents({
          size: 20,
          countryCode: 'US',
        });
        if (tmData.events && Array.isArray(tmData.events)) {
          allEvents.push(...tmData.events.map(normalizeTicketmasterEvent));
        }
      } catch (err) {
        console.warn('Ticketmaster fetch failed:', err);
      }

      // Fetch from Eventbrite
      try {
        const ebData = await eventbriteService.searchEvents('', 'all', 1);
        if (ebData.events && Array.isArray(ebData.events)) {
          allEvents.push(...ebData.events.map(normalizeEventbriteEvent));
        }
      } catch (err) {
        console.warn('Eventbrite fetch failed:', err);
      }

      if (allEvents.length === 0) {
        console.warn('No events were loaded from backend or external APIs.');
      }

      return allEvents;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Get events by user (created by user)
  getEventsByUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user events');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  },

  // Create event
  createEvent: async (eventData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  updateEvent: async (id, eventData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Search events
  searchEvents: async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to search events');
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  },

  // Filter events
  filterEvents: async (filters) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/events/filter?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to filter events');
      }
      return await response.json();
    } catch (error) {
      console.error('Error filtering events:', error);
      throw error;
    }
  },
};

export default eventService;
