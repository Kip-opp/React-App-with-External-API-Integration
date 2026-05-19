import authService from './authService';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

class SavedEventsService {
  async getSavedEvents(page = 1, limit = 10) {
    const token = authService.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/user/saved-events?page=${page}&limit=${limit}`,
      {
        headers: authService.getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch saved events');
    }

    return data;
  }

  async saveEvent(event, reminderOptions = {}) {
    const token = authService.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const externalEventId =
      event.external_event_id ||
      event.eventbrite_id ||
      event.ticketmaster_id ||
      event.id;

    const payload = {
      external_event_id: String(externalEventId),

      source: event.source || 'local',

      event_name:
        event.name ||
        event.title ||
        'Untitled Event',

      event_description:
        event.description || '',

      venue_name:
        event.venue_name ||
        event.venue ||
        '',

      venue_address:
        event.venue_address || '',

      image_url:
        event.image_url ||
        event.image ||
        '',

      event_url:
        event.event_url ||
        event.checkout_url ||
        event.url ||
        '',

      event_date:
        event.start_date ||
        event.date ||
        '',

      category:
        event.category ||
        event.segment ||
        event.genre ||
        '',

      reminder_enabled:
        reminderOptions.reminder_enabled ?? true,

      reminder_datetime:
        reminderOptions.reminder_datetime || null,

      notes:
        reminderOptions.notes || '',
    };

    const response = await fetch(
      `${API_BASE_URL}/user/saved-events`,
      {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save event');
    }

    return data;
  }

  async updateSavedEvent(savedEventId, updateData) {
    const token = authService.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/user/saved-events/${savedEventId}`,
      {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updateData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update saved event');
    }

    return data;
  }

  async unsaveEvent(savedEventId) {
    const token = authService.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/user/saved-events/${savedEventId}`,
      {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove event');
    }

    return data;
  }

  async getReminders() {
    const token = authService.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/user/saved-events/reminders`,
      {
        headers: authService.getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch reminders');
    }

    return data;
  }

  async checkIfSaved(eventId, eventSource) {
    const token = authService.getToken();

    if (!token) {
      return {
        is_saved: false,
        saved_event_id: null,
      };
    }

    try {
      const data = await this.getSavedEvents();

      const saved = data.saved_events?.find(
        (event) =>
          String(event.external_event_id) === String(eventId) &&
          event.source === eventSource
      );

      return {
        is_saved: !!saved,
        saved_event_id: saved?.id || null,
      };
    } catch {
      return {
        is_saved: false,
        saved_event_id: null,
      };
    }
  }
}

export default new SavedEventsService();