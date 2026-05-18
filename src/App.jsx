import { useState, useRef, useEffect } from 'react';
import './App.css';
import NavBar from './components/NavBar';
import SearchHero from './components/SearchHero';
import EventGrid from './components/EventGrid';
import Footer from './components/Footer';
import { Loader, ErrorState, EmptyState } from './components/StateViews';
import CreateEventForm from './components/CreateEventForm';
import EventDetails from './components/EventDetails';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import SavedEvents from "./components/profile/SavedEvents";
import MyEvents from './components/profile/MyEvents';
import authService from './services/authService';
import { useEvents } from './hooks/useEvents';
import { useDebounce } from './hooks/useDebounce';

const QUICK_CATEGORIES = [
  { key: 'all', label: 'All Events', icon: '🌐' },
  { key: 'ticketmaster', label: 'Concerts', icon: '🎤' },
  { key: 'eventbrite', label: 'Experiences', icon: '🎫' },
  { key: 'local', label: 'Community', icon: '🏠' },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('all-events');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSource, setActiveSource] = useState('all');
  const [pendingEvent, setPendingEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const createFormRef = useRef(null);
  const eventsRef = useRef(null);

  const { events, loading, error, total, refetch } = useEvents(
    debouncedSearch,
    activeSource
  );

  const featuredEvent = events?.[0];
  const previewEvents = events?.slice(0, 4) || [];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const scrollToEvents = () => {
    setTimeout(() => {
      eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSourceChange = (source) => {
    setActiveSource(source);
    setCurrentView('all-events');
    scrollToEvents();
  };

  useEffect(() => {
    if (currentView === 'create' && createFormRef.current) {
      createFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentView]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentView('all-events');
    scrollToEvents();
  };

  const handleEventCreated = () => {
    setCurrentView('all-events');
    refetch();
    showToast('Event created successfully!', 'success');
  };

  const handleEventClick = (event) => {
    if (!authService.isAuthenticated()) {
      setPendingEvent(event);
      setShowAuthModal(true);
    } else {
      setSelectedEvent(event);
    }
  };

  const handleCheckoutAuth = (checkoutInfo) => {
    if (!authService.isAuthenticated()) {
      setPendingEvent(checkoutInfo);
      setShowAuthModal(true);
    }
  };

  const handleCreateEventClick = () => {
    if (!authService.isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }

    setCurrentView('create');
  };

  const handleBackToAllEvents = () => {
    setCurrentView('all-events');
    refetch();
  };

  return (
    <div className="app">
      <NavBar
        onCreateEventClick={handleCreateEventClick}
        onMyEventsClick={() => setCurrentView('my-events')}
        onSavedEventsClick={() => setCurrentView('saved-events')}
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
        onLogout={() => showToast('Logged out successfully', 'info')}
        onAuthSuccess={(action) =>
          showToast(
            action === 'login' ? 'Welcome back!' : 'Account created successfully!',
            'success'
          )
        }
      />

      {currentView === 'all-events' && (
        <SearchHero
          onSearch={handleSearch}
          featuredEvent={featuredEvent}
          previewEvents={previewEvents}
          onExploreClick={scrollToEvents}
          onCategoryClick={handleSourceChange}
          activeSource={activeSource}
        />
      )}

      <main className="main-content">
        {currentView === 'create' && authService.isAuthenticated() && (
          <div ref={createFormRef} className="view-shell">
            <CreateEventForm
              onEventCreated={handleEventCreated}
              onCancel={handleBackToAllEvents}
            />
          </div>
        )}

        {currentView === 'my-events' && (
          <MyEvents
            onEventClick={handleEventClick}
            onClose={handleBackToAllEvents}
          />
        )}

        {currentView === 'saved-events' && (
          <SavedEvents
            onEventClick={handleEventClick}
            onClose={handleBackToAllEvents}
          />
        )}

        {currentView === 'all-events' && (
          <div ref={eventsRef}>
            <section className="discovery-panel">
              <div className="discovery-panel__header">
                <div>
                  <span className="section-eyebrow">Browse by mood</span>
                  <h2>Find the next event worth leaving the house for.</h2>
                </div>

                <button className="create-event-pill" onClick={handleCreateEventClick}>
                  + Create Event
                </button>
              </div>

              <div className="category-strip">
                {QUICK_CATEGORIES.map((category) => (
                  <button
                    key={category.key}
                    className={`category-card ${
                      activeSource === category.key ? 'active' : ''
                    }`}
                    onClick={() => handleSourceChange(category.key)}
                  >
                    <span>{category.icon}</span>
                    <strong>{category.label}</strong>
                    <small>
                      {category.key === 'all'
                        ? 'Everything'
                        : category.key === 'local'
                          ? 'Local picks'
                          : 'Live events'}
                    </small>
                  </button>
                ))}
              </div>
            </section>

            <div className="events-controls">
              {!loading && !error && events.length > 0 && (
                <div className="results-header">
                  <span className="section-eyebrow">Live results</span>
                  <h2>{total} events found</h2>
                </div>
              )}
            </div>

            {loading && <Loader />}

            {error && <ErrorState message={error} onRetry={refetch} />}

            {!loading && !error && events.length === 0 && (
              <EmptyState message="No events found. Try a different search or create your first event!" />
            )}

            {!loading && !error && events.length > 0 && (
              <EventGrid
                events={events}
                onEventClick={handleEventClick}
                onSaveToggle={refetch}
                onToast={showToast}
                onCheckoutAuth={handleCheckoutAuth}
              />
            )}
          </div>
        )}
      </main>

      {selectedEvent && (
        <EventDetails
          eventId={selectedEvent.id}
          eventSource={selectedEvent.source}
          eventData={selectedEvent.source !== 'local' ? selectedEvent : null}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setPendingEvent(null);
          }}
          onSuccess={() => {
            setShowAuthModal(false);
            window.dispatchEvent(new CustomEvent('auth-change'));
            showToast('Welcome back!', 'success');

            if (pendingEvent) {
              if (pendingEvent.eventbriteId && pendingEvent.eventUrl) {
                window.open(pendingEvent.eventUrl, '_blank', 'noopener,noreferrer');
              } else {
                setSelectedEvent(pendingEvent);
              }

              setPendingEvent(null);
            } else {
              setCurrentView('create');
              setTimeout(() => {
                createFormRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }, 100);
            }
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;