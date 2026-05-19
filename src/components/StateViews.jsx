import './style/StateViews.css';

export function Loader({
  message = 'Loading events...',
}) {
  return (
    <div className="state-view">
      <div className="loader-spinner" />

      <h3>Loading</h3>

      <p>{message}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}) {
  return (
    <div className="state-view error-state">
      <div className="state-icon">
        ⚠️
      </div>

      <h3>
        Something went wrong
      </h3>

      <p>
        {message ||
          'An unexpected error occurred.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="retry-btn"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'No events found',
  message,
  icon = '🎟️',
  actionLabel,
  onAction,
}) {
  return (
    <div className="state-view empty-state">
      <div className="state-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>
        {message ||
          'There is nothing to display right now.'}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="retry-btn"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const StateViews = {
  Loading: Loader,
  Error: ErrorState,
  Empty: EmptyState,
};

export default StateViews;