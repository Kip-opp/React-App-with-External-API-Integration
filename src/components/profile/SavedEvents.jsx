import React, { useState, useEffect } from 'react';
import savedEventsService from "../../services/savedEventsService";
import EventGrid from '../EventGrid';
import StateViews from '../StateViews';
import '../style/SavedEvents.css';

const SavedEvents = ({ onEventClick, onClose }) => {
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const fetchSavedEvents = async () => {
    setLoading(true);
    try {
      const result = await savedEventsService.getSavedEvents();
      
      // Transform saved events to match event format
      const events = result.saved_events.map(saved => ({
        id: saved.event_id,
        source: saved.event_source,
        name: saved.event_name,
        image_url: saved.event_image,
        start_date: saved.event_date,
        saved_event_id: saved.id
      }));
      
      setSavedEvents(events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saved-events-view">
      <div className="view-header">
        <div>
          <h1>❤️ Saved Events</h1>
          <p>Events you've bookmarked for later</p>
        </div>
        <button className="close-view-btn" onClick={onClose}>
          ← Back to All Events
        </button>
      </div>

      {loading && <StateViews.Loading />}
      
      {error && (
        <StateViews.Error 
          message={error} 
          onRetry={fetchSavedEvents}
        />
      )}
      
      {!loading && !error && savedEvents.length === 0 && (
        <StateViews.Empty 
          message="No saved events yet. Start exploring and save events you're interested in!"
        />
      )}
      
      {!loading && !error && savedEvents.length > 0 && (
        <EventGrid 
          events={savedEvents} 
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
};

export default SavedEvents;
