import './style/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-section">
          <h2 className="footer-brand">
            🎟️ EventSphere
          </h2>

          <p className="footer-tagline">
            Discover, create, and experience unforgettable events.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Platform</h4>

            <a href="#events">
              Explore Events
            </a>

            <a href="#saved-events">
              Saved Events
            </a>

            <a href="#create-event">
              Create Event
            </a>
          </div>

          <div className="footer-column">
            <h4>Features</h4>

            <span>🎫 Ticket Booking</span>

            <span>📍 Event Discovery</span>

            <span>🤖 AI Recommendations</span>

            <span>🌙 Dark Mode</span>
          </div>

          <div className="footer-column">
            <h4>Community</h4>

            <span>👤 Users</span>

            <span>🎤 Organizers</span>

            <span>🛡️ Admin Dashboard</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          © {new Date().getFullYear()} EventSphere. All rights reserved.
        </p>

        <p className="footer-made">
          Built with React, Flask, Eventbrite & Ticketmaster APIs
        </p>
      </div>
    </footer>
  );
}

export default Footer;