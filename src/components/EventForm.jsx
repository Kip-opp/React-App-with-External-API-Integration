import { useEffect, useState } from 'react';
import eventbriteService from '../services/eventbriteService';
import authService from '../services/authService';
import './style/CreateEventForm.css';

const initialFormData = {
  name: '',
  description: '',
  category: 'Other',
  start_date: '',
  end_date: '',
  venue_name: '',
  venue_address: '',
  online_event: false,
  is_free: false,
  capacity: 100,
  currency: 'KES',
  image_url: '',
  publish_to_eventbrite: false,
  tickets: [{ name: 'General', price: 0, quantity: 100 }],
};

const EventForm = ({ event, onEventSaved, onCancel }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const user = authService.getCurrentUser?.();
  const role = user?.role || 'user';
  const canCreateEvent = role === 'organizer' || role === 'admin';

  const isEdit = !!event;

  // Populate form when editing an existing event
  useEffect(() => {
    if (event) {
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
          const d = new Date(dateStr);
          if (Number.isNaN(d.getTime())) return '';
          // datetime-local expects YYYY-MM-DDTHH:mm (local time, no seconds/zone)
          const pad = (n) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch {
          return '';
        }
      };

      const initialTickets = (event.tickets && event.tickets.length > 0)
        ? event.tickets.map((t) => ({
            name: t.name || 'General',
            price: t.price ?? 0,
            quantity: t.quantity_total ?? t.quantity ?? 100,
          }))
        : initialFormData.tickets;

      setFormData({
        name: event.name || '',
        description: event.description || '',
        category: event.category || 'Other',
        start_date: formatDateForInput(event.start_date),
        end_date: formatDateForInput(event.end_date),
        venue_name: event.venue_name || '',
        venue_address: event.venue_address || '',
        online_event: !!event.online_event,
        is_free: !!event.is_free,
        capacity: event.capacity || 100,
        currency: event.currency || 'KES',
        image_url: event.image_url || '',
        publish_to_eventbrite: false, // not applicable on edit
        tickets: initialTickets,
      });

      setImagePreview(event.image_url || '');
    } else {
      setFormData(initialFormData);
      setImagePreview('');
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'image_url') {
      setImagePreview(value);
    }

    setError('');
  };

  const handleTicketChange = (index, field, value) => {
    const updatedTickets = [...formData.tickets];

    updatedTickets[index] = {
      ...updatedTickets[index],
      [field]: field === 'price' || field === 'quantity' ? Number(value) : value,
    };

    setFormData((prev) => ({
      ...prev,
      tickets: updatedTickets,
    }));
  };

  const addTicket = () => {
    setFormData((prev) => ({
      ...prev,
      tickets: [
        ...prev.tickets,
        { name: '', price: 0, quantity: 100 },
      ],
    }));
  };

  const removeTicket = (index) => {
    if (formData.tickets.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((_, ticketIndex) => ticketIndex !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Event name is required';
    }

    if (!formData.start_date || !formData.end_date) {
      return 'Start date and end date are required';
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      return 'End date cannot be before start date';
    }

    if (!canCreateEvent) {
      return 'Only organizers and admins can create or edit events';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error('You must be logged in to save this event');
      }

      const validationError = validateForm();

      if (validationError) {
        throw new Error(validationError);
      }

      const eventData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        capacity: Number(formData.capacity),
      };

      // Remove publish flag on edit (not used by update endpoint)
      if (isEdit) {
        delete eventData.publish_to_eventbrite;
      }

      let result;
      if (isEdit) {
        result = await eventbriteService.updateEvent(event.id, eventData, token);
      } else {
        result = await eventbriteService.createEvent(eventData, token);
      }

      // Reset only on create
      if (!isEdit) {
        setFormData(initialFormData);
        setImagePreview('');
      }

      if (onEventSaved) {
        onEventSaved(result);
      }

      // Notify any mounted event lists (My Events, Organizer, main grid, etc.) to refresh
      window.dispatchEvent(new CustomEvent('events-updated'));

      const baseMessage = isEdit
        ? 'Event updated successfully.'
        : (role === 'admin'
            ? '✅ Event created successfully and approved automatically.'
            : '✅ Event submitted successfully. It is now pending admin approval.');

      const editNote = isEdit && role !== 'admin'
        ? ' Your event has been moved back to pending status for admin review.'
        : '';

      // Use alert for parity with original; parent can also show toast via callback
      alert(baseMessage + editNote);
    } catch (err) {
      setError(err.message || (isEdit ? 'Failed to update event' : 'Failed to create event'));
    } finally {
      setLoading(false);
    }
  };

  if (!canCreateEvent) {
    return (
      <div className="create-event-form">
        <h2>{isEdit ? 'Edit Event' : 'Create New Event'}</h2>

        <div className="form-error">
          ⚠️ Only organizers and admins can {isEdit ? 'edit' : 'create'} events.
        </div>

        <p>
          Sign up as an event organizer using the organizer access code if you want
          to create and manage events.
        </p>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-form">
      <h2>{isEdit ? 'Edit Event' : 'Create New Event'}</h2>

      <p className="form-subtitle">
        {isEdit
          ? (role === 'admin'
              ? 'Updates by admins are applied immediately.'
              : 'Changes by organizers will return the event to pending status for re-review.')
          : (role === 'admin'
              ? 'Admin-created events are approved automatically.'
              : 'Organizer-created events will be reviewed by an admin before going live.')}
      </p>

      {error && (
        <div className="form-error">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Event Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Afrobeats Summer Festival"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Music">Music</option>
              <option value="Sports">Sports</option>
              <option value="Business">Business</option>
              <option value="Education">Education</option>
              <option value="Fashion">Fashion</option>
              <option value="Food">Food</option>
              <option value="Technology">Technology</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Tell people what makes your event special..."
          />
        </div>

        <div className="form-group">
          <label>Event Image URL</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/event-image.jpg"
          />

          {imagePreview && (
            <div className="image-preview">
              <img
                src={imagePreview}
                alt="Event preview"
                onError={() => setImagePreview('')}
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date & Time *</label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date & Time *</label>
            <input
              type="datetime-local"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Venue Name</label>
            <input
              type="text"
              name="venue_name"
              value={formData.venue_name}
              onChange={handleChange}
              placeholder="KICC, Nairobi"
              disabled={formData.online_event}
            />
          </div>

          <div className="form-group">
            <label>Venue Address</label>
            <input
              type="text"
              name="venue_address"
              value={formData.venue_address}
              onChange={handleChange}
              placeholder="Full venue address"
              disabled={formData.online_event}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div className="form-row checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="online_event"
              checked={formData.online_event}
              onChange={handleChange}
            />
            Online Event
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_free"
              checked={formData.is_free}
              onChange={handleChange}
            />
            Free Event
          </label>

          {!isEdit && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="publish_to_eventbrite"
                checked={formData.publish_to_eventbrite}
                onChange={handleChange}
              />
              Publish to Eventbrite
            </label>
          )}
        </div>

        <div className="tickets-section">
          <div className="tickets-header">
            <h3>Tickets</h3>

            <button
              type="button"
              className="btn-add-ticket"
              onClick={addTicket}
            >
              + Add Ticket
            </button>
          </div>

          {formData.tickets.map((ticket, index) => (
            <div key={index} className="ticket-row">
              <input
                type="text"
                placeholder="Ticket name"
                value={ticket.name}
                onChange={(e) =>
                  handleTicketChange(index, 'name', e.target.value)
                }
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={ticket.price}
                min="0"
                disabled={formData.is_free}
                onChange={(e) =>
                  handleTicketChange(index, 'price', e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Quantity"
                value={ticket.quantity}
                min="1"
                onChange={(e) =>
                  handleTicketChange(index, 'quantity', e.target.value)
                }
              />

              <button
                type="button"
                className="btn-remove-ticket"
                onClick={() => removeTicket(index)}
                disabled={formData.tickets.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading
              ? (isEdit ? 'Updating...' : 'Submitting...')
              : (isEdit
                  ? 'Update Event'
                  : (role === 'admin' ? 'Create & Approve Event' : 'Submit for Approval'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
