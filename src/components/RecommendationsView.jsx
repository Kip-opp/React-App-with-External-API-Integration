import { useMemo } from 'react';
import EventGrid from './EventGrid';
import StateViews from './StateViews';
import './style/RecommendationsView.css';

const RecommendationsView = ({
  events = [],
  savedEvents = [],
  onEventClick,
  onToast,
  onClose,
}) => {
  const recommendedEvents = useMemo(() => {
    const savedCategories = savedEvents
      .map((event) => event.category)
      .filter(Boolean);

    if (savedCategories.length === 0) {
      return events.slice(0, 6);
    }

    return events
      .filter((event) => savedCategories.includes(event.category))
      .slice(0, 8);
  }, [events, savedEvents]);

  return (
    <section className="recommendations-view">
      <div className="dashboard-header">
        <div>
          <span className="section-eyebrow">AI Recommendations</span>
          <h1>🤖 Recommended For You</h1>
          <p>
            Personalized event suggestions based on your interests, saved events,
            and browsing activity.
          </p>
        </div>

        {onClose && (
          <button onClick={onClose}>
            ← Back
          </button>
        )}
      </div>

      {recommendedEvents.length === 0 ? (
        <StateViews.Empty
          title="No recommendations yet"
          message="Save a few events first so EventSphere can learn what you like."
        />
      ) : (
        <EventGrid
          events={recommendedEvents}
          onEventClick={onEventClick}
          onToast={onToast}
        />
      )}
    </section>
  );
};

export default RecommendationsView;