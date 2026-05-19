const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

/**
 * Ticketmaster data should now come through our Flask backend.
 * This keeps API keys hidden from the frontend and returns events
 * in the same format as Eventbrite and local events.
 */
class TicketmasterService {
  async searchEvents({
    keyword = '',
    location = '',
    page = 1,
    limit = 12,
  } = {}) {
    const params = new URLSearchParams({
      source: 'ticketmaster',
      page: page.toString(),
      limit: limit.toString(),
    });

    if (keyword) {
      params.append('q', keyword);
    }

    if (location) {
      params.append('location', location);
    }

    const response = await fetch(
      `${API_BASE_URL}/events/search?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch Ticketmaster events');
    }

    return {
      events: data.events || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit,
      total_pages: data.total_pages || 1,
      has_next: data.has_next || false,
      has_previous: data.has_previous || false,
    };
  }

  async getEvent(eventId) {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch Ticketmaster event');
    }

    return data;
  }
}

export default new TicketmasterService();