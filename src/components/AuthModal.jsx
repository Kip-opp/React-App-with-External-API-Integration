import { useState } from 'react';
import authService from '../services/authService';
import './style/AuthModal.css';

const AuthModal = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    organizer_code: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isOrganizerSignup = !isLogin && formData.role === 'organizer';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError('');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');

    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      organizer_code: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      let result;

      if (isLogin) {
        result = await authService.login(
          formData.email,
          formData.password
        );
      } else {
        result = await authService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          organizer_code: formData.organizer_code,
        });
      }

      if (onSuccess) {
        onSuccess(result);
      }

      onClose();
    } catch (err) {
      setError(
        err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="auth-modal__header">
          <span className="auth-badge">
            {isLogin ? 'Secure Login' : 'Create Your Account'}
          </span>

          <h2>
            {isLogin ? 'Welcome Back' : 'Join EventSphere'}
          </h2>

          <p>
            {isLogin
              ? 'Login to access saved events, tickets, dashboards, and event tools.'
              : 'Choose whether you are joining as a regular user or verified organizer.'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>

                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="johndoe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Account Type</label>

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="organizer">Event Organizer</option>
                </select>
              </div>

              {isOrganizerSignup && (
                <div className="form-group">
                  <label htmlFor="organizer_code">
                    Organizer Access Code
                  </label>

                  <input
                    type="text"
                    id="organizer_code"
                    name="organizer_code"
                    value={formData.organizer_code}
                    onChange={handleChange}
                    required
                    placeholder="Enter organizer verification code"
                  />

                  <small className="auth-help-text">
                    Organizers need a valid code from the EventSphere team.
                  </small>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Login'
                : formData.role === 'organizer'
                  ? 'Create Organizer Account'
                  : 'Create User Account'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin
            ? "Don't have an account? "
            : 'Already have an account? '}

          <button type="button" onClick={toggleAuthMode}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;