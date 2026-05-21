import EventCard from './EventCard';
import './style/EventGrid.css';

function EventGrid({
  events = [],
  onEventClick,
  onToast,
  onCheckoutAuth,
  onSaveToggle,
  onEditEvent,
  onDeleteEvent,
  onApproveEvent,
  onRejectEvent,
  renderActions,
}) {
  if (!events.length) {
    return (
      <section className="events-section">
        <div className="empty-events">
          <span>🎟️</span>
          <h3>No events found</h3>
          <p>Try searching another keyword, changing filters, or checking back later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="events-section">
      <div className="events-grid">
        {events.map((event) => {
          const eventKey =
            event.external_event_id ||
            event.eventbrite_id ||
            event.ticketmaster_id ||
            event.id ||
            event.name;

          const card = (
            <EventCard
              key={`${event.source || 'local'}-${eventKey}`}
              event={event}
              onClick={onEventClick}
              onToast={onToast}
              onCheckoutAuth={onCheckoutAuth}
              onSaveToggle={onSaveToggle}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
              onApprove={onApproveEvent}
              onReject={onRejectEvent}
            />
          );

          return renderActions ? (
            <div key={`${event.source || 'local'}-${eventKey}-wrapper`} className="event-with-actions">
              {card}
              {renderActions(event)}
            </div>
          ) : card;
        })}
      </div>
    </section>
  );
}

export default EventGrid;