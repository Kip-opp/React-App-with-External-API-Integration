import { useEffect } from 'react';

import './style/Toast.css';

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
  reminder: '⏰',
};

const TOAST_TITLES = {
  success: 'Success',
  error: 'Error',
  info: 'Notice',
  warning: 'Warning',
  reminder: 'Event Reminder',
};

const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 4000,
  persistent = false,
}) => {
  useEffect(() => {
    if (!onClose || persistent) return;

    const timer = setTimeout(
      onClose,
      duration
    );

    return () =>
      clearTimeout(timer);
  }, [onClose, duration, persistent]);

  return (
    <div
      className={`toast toast-${type} ${
        persistent ? 'toast-persistent' : ''
      }`}
      role="alert"
    >
      <div className="toast__icon">
        {TOAST_ICONS[type] || '🔔'}
      </div>

      <div className="toast__body">
        <h4 className="toast__title">
          {TOAST_TITLES[type] || 'Notification'}
        </h4>

        <p className="toast__message">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          className="toast__close"
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;