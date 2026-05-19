import { useEffect, useState } from 'react';
import authService from '../services/authService';
import eventbriteService from '../services/eventbriteService';
import StateViews from './StateViews';
import './style/AnalyticsDashboard.css';

const AnalyticsDashboard = ({ onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const token = authService.getToken();

      try {
        const analyticsData = await eventbriteService.getAnalytics(token);
        setAnalytics(analyticsData);
      } catch {
        setAnalytics(null);
      }

      const eventData = await eventbriteService.getMyEvents(token);
      setEvents(eventData.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <StateViews.Loading message="Loading analytics..." />;

  if (error) {
    return (
      <StateViews.Error
        message={error}
        onRetry={fetchAnalytics}
      />
    );
  }

  const totalEvents = events.length;
  const approvedEvents = events.filter((event) => event.status === 'approved').length;
  const pendingEvents = events.filter((event) => event.status === 'pending').length;

  return (
    <section className="analytics-dashboard">
      <div className="dashboard-header">
        <div>
          <span className="section-eyebrow">Analytics</span>
          <h1>📊 EventSphere Analytics</h1>
          <p>Track event activity, approval flow, and platform performance.</p>
        </div>

        <button onClick={onClose}>← Back</button>
      </div>

      <div className="dashboard-stats">
        <div><h3>{totalEvents}</h3><p>Total Events</p></div>
        <div><h3>{approvedEvents}</h3><p>Approved Events</p></div>
        <div><h3>{pendingEvents}</h3><p>Pending Review</p></div>
      </div>

      <div className="dashboard-card">
        <h2>Backend Analytics</h2>

        {analytics ? (
          <pre>{JSON.stringify(analytics, null, 2)}</pre>
        ) : (
          <p>Analytics endpoint is not connected yet. This page is ready for backend analytics data.</p>
        )}
      </div>
    </section>
  );
};

export default AnalyticsDashboard;