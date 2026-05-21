const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

class EventbriteService {
  async searchEvents({
    query = '',
    source = 'all',
    page = 1,
    limit = 12,
    category = '',
    region = '',
    eventType = '',
    sort = 'date',
  } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      source,
      sort,
    });

    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (region) params.append('location', region);
    if (eventType) params.append('event_type', eventType);

    const response = await fetch(
      `${API_BASE_URL}/events/search?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch events');
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
      throw new Error(data.error || 'Failed to fetch event');
    }

    return data;
  }

  async createEvent(eventData, token) {
    const response = await fetch(
      `${API_BASE_URL}/user/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          data.details ||
          'Failed to create event'
      );
    }

    return data;
  }

  async updateEvent(eventId, eventData, token) {
    const response = await fetch(
      `${API_BASE_URL}/user/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update event');
    }

    return data;
  }

  async deleteEvent(eventId, token) {
    const response = await fetch(
      `${API_BASE_URL}/user/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete event');
    }

    return data;
  }

  async getMyEvents(token, page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/user/events/my?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch your events');
    }

    return data;
  }

  async getPendingEvents(token) {
    const response = await fetch(
      `${API_BASE_URL}/admin/events/pending`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch pending events');
    }

    return data;
  }

  async approveEvent(eventId, token) {
    const response = await fetch(
      `${API_BASE_URL}/admin/events/${eventId}/approve`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to approve event');
    }

    return data;
  }

  async rejectEvent(eventId, token, adminNote = '') {
    const response = await fetch(
      `${API_BASE_URL}/admin/events/${eventId}/reject`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          admin_note: adminNote,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reject event');
    }

    return data;
  }

  async getAnalytics(token) {
    const response = await fetch(
      `${API_BASE_URL}/admin/analytics`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Analytics endpoint is not ready yet');
    }

    return data;
  }

  async getRecommendations(token) {
    const response = await fetch(
      `${API_BASE_URL}/recommendations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Recommendations endpoint is not ready yet');
    }

    return data;
  }

  async getAdminUsers(token, page = 1, perPage = 10, role = null, recent = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (role) params.append('role', role);
    if (recent) params.append('recent', recent);

    const response = await fetch(
      `${API_BASE_URL}/admin/users?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch admin users');
    }

    return data;
  }

  async getAdminEvents(token, page = 1, perPage = 10, category = null, status = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (category) params.append('category', category);
    if (status) params.append('status', status);

    const response = await fetch(
      `${API_BASE_URL}/admin/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch admin events');
    }

    return data;
  }

  async promoteUserToAdmin(userId, token) {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/promote`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to promote user');
    }

    return data;
  }

  async demoteAdminToUser(userId, token) {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/demote`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to demote user');
    }

    return data;
  }

  async getEventsBySource(token, page = 1, perPage = 10, source = 'EventSphere') {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      source,
    });

    const response = await fetch(
      `${API_BASE_URL}/admin/events/by-source?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch events by source');
    }

    return data;
  }

  async toggleUserStatus(userId, token) {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/toggle-status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to toggle user status');
    }

    return data;
  }
}

export default new EventbriteService();