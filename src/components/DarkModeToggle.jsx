import './style/DarkModeToggle.css';

const DarkModeToggle = ({ darkMode, onToggle }) => {
  return (
    <button
      type="button"
      className={`dark-mode-toggle ${darkMode ? 'active' : ''}`}
      onClick={onToggle}
      aria-label="Toggle dark mode"
    >
      <span>{darkMode ? '☀️' : '🌙'}</span>
      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

export default DarkModeToggle;