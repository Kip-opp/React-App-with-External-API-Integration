import { useState } from 'react';

import './style/ReminderModal.css';

const ReminderModal = ({
  event,
  onClose,
  onSaveReminder,
}) => {
  const existingReminder = event?.reminder_datetime
    ? event.reminder_datetime.slice(0, 16)
    : '';

  const [reminderDateTime, setReminderDateTime] =
    useState(existingReminder);

  const [notes, setNotes] =
    useState(event?.notes || '');

  const [reminderEnabled, setReminderEnabled] =
    useState(event?.reminder_enabled ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();

    const reminderISO =
      reminderEnabled && reminderDateTime
        ? new Date(reminderDateTime).toISOString()
        : null;

    onSaveReminder?.({
      reminder_enabled: reminderEnabled,
      reminder_datetime: reminderISO,
      notes,
    });

    onClose();
  };

  return (
    <div className="reminder-modal-overlay" onClick={onClose}>
      <div className="reminder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reminder-modal__header">
          <div>
            <h2>⏰ Event Reminder</h2>
            <p>{event?.name || event?.event_name || 'Saved Event'}</p>
          </div>

          <button
            type="button"
            className="reminder-modal__close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="reminder-modal__body" onSubmit={handleSubmit}>
          <label className="reminder-checkbox">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
            />
            Enable reminder
          </label>

          <div className="reminder-form-group">
            <label>Reminder Date & Time</label>
            <input
              type="datetime-local"
              value={reminderDateTime}
              onChange={(e) => setReminderDateTime(e.target.value)}
              disabled={!reminderEnabled}
              required={reminderEnabled}
            />
          </div>

          <div className="reminder-form-group">
            <label>Notes</label>
            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note for this event..."
            />
          </div>

          <div className="reminder-modal__actions">
            <button
              type="button"
              className="reminder-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="reminder-btn-save">
              Save Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;