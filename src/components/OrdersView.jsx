import { useEffect, useState } from 'react';
import ordersService from '../services/ordersService';
import { Loader, ErrorState, EmptyState } from './StateViews';

const OrdersView = ({ onClose, onEventClick }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersService.getMyOrders();
        console.log('Orders fetched:', data);
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  console.log('OrdersView state:', { loading, error, ordersCount: orders.length });

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;
  if (orders.length === 0) return <EmptyState message="You haven't purchased any tickets yet." />;

  return (
    <div className="orders-view">
      <div className="view-header">
        <h2>My Tickets & Orders</h2>
        <button onClick={onClose} className="close-btn">Back to Events</button>
      </div>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card" onClick={() => onEventClick(order.event)}>
            <img src={order.event?.image_url || 'https://via.placeholder.com/400x300'} alt={order.event?.name} />
            <div className="order-details">
              <h3>{order.event?.name || 'Unknown Event'}</h3>
              <p>Date: {order.event?.start_date ? new Date(order.event.start_date).toLocaleDateString() : 'TBD'}</p>
              <p>Tickets: {order.quantity}</p>
              <span className={`status-badge ${order.status}`}>{order.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersView;
