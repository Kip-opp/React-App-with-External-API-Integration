import { useEffect, useState } from 'react';
import './style/SearchHero.css';

const backgroundImages = [
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
];

const categoryPills = [
  { key: 'all', label: 'All', icon: '🌐' },
  { key: 'ticketmaster', label: 'Music', icon: '🎤' },
  { key: 'eventbrite', label: 'Experiences', icon: '🎫' },
  { key: 'local', label: 'Community', icon: '🏠' },
];

const SearchHero = ({
  onSearch,
  featuredEvent,
  onExploreClick,
  onCategoryClick,
  activeSource,
  user,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const role = user?.role || 'guest';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue.trim());
  };

  const getHeroTitle = () => {
    if (role === 'admin') return 'Manage, approve, and grow every event experience.';
    if (role === 'organizer') return 'Create events your audience will remember.';
    return 'Discover events that match your energy.';
  };

  const getHeroSubtitle = () => {
    if (role === 'admin') {
      return 'Review community events, monitor platform activity, and keep EventSphere organized from one central experience.';
    }

    if (role === 'organizer') {
      return 'Submit events, track approval status, manage tickets, and reach people looking for unforgettable experiences.';
    }

    return 'Search concerts, festivals, community meetups, and unforgettable live experiences from Eventbrite, Ticketmaster, and local creators.';
  };

  return (
    <section className="search-hero">
      {backgroundImages.map((image, index) => (
        <div
          key={image}
          className={`hero-background ${index === currentImageIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}

      <div className="hero-overlay" />

      <div className="search-hero__content">
        <div className="hero-copy">
          <span className="hero-kicker">
            {role === 'guest'
              ? 'EventSphere Live'
              : `${role} dashboard`}
          </span>

          <h1 className="search-hero__title">
            {getHeroTitle()}
          </h1>

          <p className="search-hero__subtitle">
            {getHeroSubtitle()}
          </p>

          <form className="search-hero__form" onSubmit={handleSubmit}>
            <div className="search-inputs">
              <input
                type="text"
                className="search-input"
                placeholder="Search artist, venue, city, or keyword"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <button type="submit" className="search-button">
              Find events →
            </button>
          </form>

          <div className="hero-category-pills">
            {categoryPills.map((category) => (
              <button
                key={category.key}
                className={`hero-pill ${activeSource === category.key ? 'active' : ''}`}
                onClick={() => onCategoryClick?.(category.key)}
                type="button"
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          <div className="hero-stats">
            <div>
              <strong>3</strong>
              <span>Event sources</span>
            </div>

            <div>
              <strong>Roles</strong>
              <span>User / Organizer / Admin</span>
            </div>

            <div>
              <strong>Save</strong>
              <span>Your favourites</span>
            </div>
          </div>
        </div>

        <aside className="hero-showcase">
          <div className="phone-card">
            <div className="phone-card__top">
              <span>9:41</span>
              <span>●●●</span>
            </div>

            <div className="phone-card__image">
              {featuredEvent?.image_url ? (
                <img src={featuredEvent.image_url} alt={featuredEvent.name} />
              ) : (
                <div className="phone-card__placeholder">🎤</div>
              )}
            </div>

            <div className="phone-card__body">
              <span className="phone-tag">
                {role === 'admin'
                  ? 'Platform overview'
                  : role === 'organizer'
                    ? 'Organizer tools'
                    : 'Featured event'}
              </span>

              <h3>{featuredEvent?.name || 'Featured Event'}</h3>

              <p>
                {featuredEvent?.venue_name ||
                  featuredEvent?.venue_address ||
                  'Live experiences near you'}
              </p>

              <button type="button" onClick={onExploreClick}>
                Explore events
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="hero-indicators">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            type="button"
          />
        ))}
      </div>
    </section>
  );
};

export default SearchHero;