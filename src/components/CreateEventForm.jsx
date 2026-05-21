import EventForm from './EventForm';

// Thin wrapper to keep backward compatibility for existing imports/usages.
// All logic now lives in the reusable EventForm (supports create + edit modes).
const CreateEventForm = ({ onEventCreated, onCancel }) => {
  return (
    <EventForm
      onEventSaved={onEventCreated}
      onCancel={onCancel}
    />
  );
};

export default CreateEventForm;