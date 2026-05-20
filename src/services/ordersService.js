import authService from './authService';

const API_BASE = 'http://localhost:5000/api';

const ordersService = {
  async getMyOrders() {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE}/orders/my`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }
};

export default ordersService;
