const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'access_token';
    this.USER_KEY = 'user_data';
  }

  async register(payload) {
    const response = await fetch(
      `${API_BASE_URL}/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    this.saveSession(data);
    return data;
  }

  async login(email, password) {
    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    this.saveSession(data);
    return data;
  }

  async getMe() {
    const token = this.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/auth/me`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      this.logout();
      throw new Error(data.error || 'Failed to fetch current user');
    }

    if (data.user) {
      this.setUser(data.user);
    }

    return data.user;
  }

  saveSession(data) {
    this.setToken(data.access_token);
    this.setUser(data.user);

    window.dispatchEvent(
      new CustomEvent('auth-change', {
        detail: {
          user: data.user,
          redirectView: data.redirect_view,
        },
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    window.dispatchEvent(new CustomEvent('auth-change'));
  }

  logoutAndRedirect() {
    this.logout();
    window.location.href = '/';
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      this.logout();
      return null;
    }
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token) {
    if (!token) return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setUser(user) {
    if (!user) return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  isOrganizer() {
    return this.hasRole('organizer');
  }

  isUser() {
    return this.hasRole('user');
  }

  isOrganizerVerified() {
    const user = this.getCurrentUser();
    return user?.role === 'organizer' && user?.organizer_verified === true;
  }

  canCreateEvents() {
    const user = this.getCurrentUser();

    return (
      user?.role === 'admin' ||
      (user?.role === 'organizer' && user?.organizer_verified === true)
    );
  }

  getRedirectView() {
    const user = this.getCurrentUser();

    if (!user) return 'home';

    if (user.role === 'admin') return 'admin-dashboard';

    if (user.role === 'organizer') return 'organizer-dashboard';

    return 'user-dashboard';
  }

  getAuthHeaders() {
    const token = this.getToken();

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }
}

export default new AuthService();