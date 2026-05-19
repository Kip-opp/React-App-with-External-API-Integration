import { useEffect, useRef, useState } from 'react';

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
import SavedEventsView from './components/SavedEventsView';
import MyEventsView from './components/MyEventsView';
import AdminDashboard from './components/AdminDashboard';
import OrganizerDashboard from './components/OrganizerDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import RecommendationsView from './components/RecommendationsView';
import Pagination from './components/Pagination';

import authService from './services/authService';
import eventbriteService from './services/eventbriteService';
import savedEventsService from './services/savedEventsService';

import { useEvents } from './hooks/useEvents';
import { useDebounce } from './hooks/useDebounce';
import { useLocalStorage } from './hooks/useLocalStorage';

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
  const [user, setUser] = useState(authService.getCurrentUser?.());

  const [darkMode, setDarkMode] = useLocalStorage(
    'eventsphere_dark_mode',
    false
  );

  const { debouncedValue: debouncedSearch } =
    useDebounce(searchQuery, 500);

  const createFormRef = useRef(null);
  const eventsRef = useRef(null);
  const shownRemindersRef = useRef(new Set());
  const reminderAudioRef = useRef(null);

  const {
    events,
    loading,
    error,
    total,
    page,
    totalPages,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    goToPage,
    refetch,
  } = useEvents(debouncedSearch, activeSource);

  const featuredEvent = events?.[0];

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    reminderAudioRef.current = new Audio('/sound.mp3');
    reminderAudioRef.current.loop = true;
    reminderAudioRef.current.volume = 0.85;

    return () => {
      if (reminderAudioRef.current) {
        reminderAudioRef.current.pause();
        reminderAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const stopReminderSound = () => {
    if (reminderAudioRef.current) {
      reminderAudioRef.current.pause();
      reminderAudioRef.current.currentTime = 0;
    }
  };

  const playReminderSound = () => {
    try {
      if (!reminderAudioRef.current) {
        reminderAudioRef.current = new Audio('/sound.mp3');
        reminderAudioRef.current.loop = true;
        reminderAudioRef.current.volume = 0.85;
      }

      reminderAudioRef.current.currentTime = 0;
      reminderAudioRef.current.play().catch((error) => {
        console.error('Reminder sound blocked or failed:', error);
      });
    } catch (error) {
      console.error('Reminder sound failed:', error);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }

    const checkReminders = async () => {
      try {
        const data = await savedEventsService.getReminders();
        const reminders = data.reminders || [];
        const now = new Date();

        reminders.forEach((reminder) => {
          if (!reminder.reminder_datetime) return;

          if (shownRemindersRef.current.has(reminder.id)) return;

          const reminderTime = new Date(reminder.reminder_datetime);

          const diff =
            reminderTime.getTime() -
            now.getTime();

          if (
            diff <= 5 * 60 * 1000 &&
            diff >= -60 * 1000
          ) {
            playReminderSound();

            setToast({
              type: 'reminder',
              persistent: true,
              message: reminder.notes?.trim()
                ? reminder.notes
                : `Reminder: ${reminder.event_name} starts soon`,
            });

            shownRemindersRef.current.add(reminder.id);
          }
        });
      } catch (error) {
        console.error('Reminder polling failed:', error);
      }
    };

    checkReminders();

    const interval =
      setInterval(checkReminders, 60000);

    return () =>
      clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const syncUser = () => {
      setUser(authService.getCurrentUser?.());
    };

    window.addEventListener('auth-change', syncUser);

    return () =>
      window.removeEventListener('auth-change', syncUser);
  }, []);

  useEffect(() => {
    if (currentView === 'create' && createFormRef.current) {
      createFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [currentView]);

  const showToast = (
    message,
    type = 'success',
    options = {}
  ) => {
    setToast({
      message,
      type,
      persistent: options.persistent || false,
    });
  };

  const handleCloseToast = () => {
    stopReminderSound();
    setToast(null);
  };

  const scrollToEvents = () => {
    setTimeout(() => {
      eventsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handleSourceChange = (source) => {
    setActiveSource(source);
    setCurrentView('all-events');
    scrollToEvents();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentView('all-events');
    scrollToEvents();
  };

  const handleEventCreated = () => {
    setCurrentView('all-events');
    refetch();
    showToast('Event submitted successfully', 'success');
  };

  const handleEventClick = (event) => {
    if (!authService.isAuthenticated()) {
      setPendingEvent(event);
      setShowAuthModal(true);
      return;
    }

    setSelectedEvent(event);
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

    if (!authService.canCreateEvents()) {
      showToast(
        'Only organizers and admins can create events',
        'error'
      );
      return;
    }

    setCurrentView('create');
  };

  const handleBackToAllEvents = () => {
    setCurrentView('all-events');
    refetch();
  };

  const handleLogout = () => {
    stopReminderSound();
    shownRemindersRef.current.clear();
    setUser(null);
    setCurrentView('all-events');
    showToast('Logged out successfully', 'info');
  };

  const handleAuthSuccess = () => {
    const currentUser = authService.getCurrentUser?.();

    stopReminderSound();
    shownRemindersRef.current.clear();
    setUser(currentUser);
    setShowAuthModal(false);
    showToast('Welcome to EventSphere!', 'success');

    if (pendingEvent) {
      if (pendingEvent.eventbriteId && pendingEvent.eventUrl) {
        window.open(
          pendingEvent.eventUrl,
          '_blank',
          'noopener,noreferrer'
        );
      } else {
        setSelectedEvent(pendingEvent);
      }

      setPendingEvent(null);
      return;
    }

    if (currentUser?.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else if (currentUser?.role === 'organizer') {
      setCurrentView('organizer-dashboard');
    } else {
      setCurrentView('all-events');
    }
  };

  const handleDeleteEvent = async (event) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event.name}"?`
    );

    if (!confirmDelete) return;

    try {
      const token = authService.getToken();

      await eventbriteService.deleteEvent(event.id, token);

      showToast('Event deleted successfully', 'success');
      refetch();
    } catch (err) {
      showToast(
        err.message || 'Failed to delete event',
        'error'
      );
    }
  };

  const handleEditEvent = (event) => {
    showToast('Edit event form will be connected next', 'info');
    setSelectedEvent(event);
  };

  const handleAdminDashboardClick = () => {
    setCurrentView('admin-dashboard');
  };

  return (
    <div className={`app ${darkMode ? 'app-dark' : ''}`}>
      <NavBar
        onCreateEventClick={handleCreateEventClick}
        onMyEventsClick={() =>
          setCurrentView(
            user?.role === 'organizer'
              ? 'organizer-dashboard'
              : 'my-events'
          )
        }
        onSavedEventsClick={() => setCurrentView('saved-events')}
        onAdminDashboardClick={handleAdminDashboardClick}
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
        onLogout={handleLogout}
        onAuthSuccess={handleAuthSuccess}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {currentView === 'all-events' && (
        <SearchHero
          onSearch={handleSearch}
          featuredEvent={featuredEvent}
          onExploreClick={scrollToEvents}
          onCategoryClick={handleSourceChange}
          activeSource={activeSource}
          user={user}
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

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            onClose={handleBackToAllEvents}
            onToast={showToast}
          />
        )}

        {currentView === 'organizer-dashboard' && (
          <OrganizerDashboard
            onClose={handleBackToAllEvents}
            onCreateEvent={handleCreateEventClick}
            onEventClick={handleEventClick}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onToast={showToast}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsDashboard onClose={handleBackToAllEvents} />
        )}

        {currentView === 'recommendations' && (
          <RecommendationsView
            events={events}
            savedEvents={[]}
            onEventClick={handleEventClick}
            onToast={showToast}
            onClose={handleBackToAllEvents}
          />
        )}

        {currentView === 'my-events' && (
          <MyEventsView
            onEventClick={handleEventClick}
            onClose={handleBackToAllEvents}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onToast={showToast}
          />
        )}

        {currentView === 'saved-events' && (
          <SavedEventsView
            onEventClick={handleEventClick}
            onClose={handleBackToAllEvents}
            onToast={showToast}
          />
        )}

        {currentView === 'all-events' && (
          <div ref={eventsRef}>
            <section className="discovery-panel">
              <div className="discovery-panel__header">
                <div>
                  <span className="section-eyebrow">Browse by mood</span>
                  <h2>
                    Find the next event worth leaving the house for.
                  </h2>
                </div>

                {authService.canCreateEvents() && (
                  <button
                    className="create-event-pill"
                    onClick={handleCreateEventClick}
                  >
                    + Create Event
                  </button>
                )}
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

            {error && (
              <ErrorState
                message={error}
                onRetry={refetch}
              />
            )}

            {!loading && !error && events.length === 0 && (
              <EmptyState message="No events found. Try a different search or create your first event!" />
            )}

            {!loading && !error && events.length > 0 && (
              <>
                <EventGrid
                  events={events}
                  onEventClick={handleEventClick}
                  onSaveToggle={refetch}
                  onToast={showToast}
                  onCheckoutAuth={handleCheckoutAuth}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                />

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                  onNext={nextPage}
                  onPrevious={previousPage}
                  onPageChange={goToPage}
                />
              </>
            )}
          </div>
        )}
      </main>

      {selectedEvent && (
        <EventDetails
          eventId={selectedEvent.id}
          eventSource={selectedEvent.source}
          eventData={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onToast={showToast}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setPendingEvent(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          persistent={toast.persistent}
          onClose={handleCloseToast}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;