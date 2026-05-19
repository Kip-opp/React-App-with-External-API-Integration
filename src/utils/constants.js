/**
 * Regions / locations used throughout EventSphere.
 * Backend now handles all filtering, so values are simplified.
 */
export const REGIONS = [
  {
    label: 'All Regions',
    value: '',
  },

  {
    label: 'Kenya',
    value: 'Kenya',
  },

  {
    label: 'Nairobi',
    value: 'Nairobi',
  },

  {
    label: 'Mombasa',
    value: 'Mombasa',
  },

  {
    label: 'Kisumu',
    value: 'Kisumu',
  },

  {
    label: 'South Africa',
    value: 'South Africa',
  },

  {
    label: 'United States',
    value: 'United States',
  },

  {
    label: 'United Kingdom',
    value: 'United Kingdom',
  },

  {
    label: 'Canada',
    value: 'Canada',
  },

  {
    label: 'Australia',
    value: 'Australia',
  },

  {
    label: 'Global',
    value: 'Global',
  },
];

/**
 * Event categories.
 * These work for Eventbrite, Ticketmaster,
 * and local platform events.
 */
export const CATEGORIES = [
  {
    label: 'All Categories',
    value: '',
  },

  {
    label: 'Music',
    value: 'Music',
  },

  {
    label: 'Sports',
    value: 'Sports',
  },

  {
    label: 'Technology',
    value: 'Technology',
  },

  {
    label: 'Business',
    value: 'Business',
  },

  {
    label: 'Education',
    value: 'Education',
  },

  {
    label: 'Arts & Theatre',
    value: 'Arts & Theatre',
  },

  {
    label: 'Film',
    value: 'Film',
  },

  {
    label: 'Food & Drink',
    value: 'Food & Drink',
  },

  {
    label: 'Fashion',
    value: 'Fashion',
  },

  {
    label: 'Networking',
    value: 'Networking',
  },

  {
    label: 'Community',
    value: 'Community',
  },

  {
    label: 'Health & Wellness',
    value: 'Health & Wellness',
  },

  {
    label: 'Gaming',
    value: 'Gaming',
  },

  {
    label: 'Lifestyle',
    value: 'Lifestyle',
  },

  {
    label: 'Miscellaneous',
    value: 'Miscellaneous',
  },
];

/**
 * User roles.
 */
export const USER_ROLES = {
  USER: 'user',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

/**
 * Event statuses.
 */
export const EVENT_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

/**
 * Event sources.
 */
export const EVENT_SOURCES = {
  ALL: 'all',
  EVENTBRITE: 'eventbrite',
  TICKETMASTER: 'ticketmaster',
  LOCAL: 'local',
};

/**
 * Organizer access code.
 * Must match backend config.
 */
export const ORGANIZER_ACCESS_CODE =
  'EVENTSPHERE_ORG_2026';

/**
 * Pagination defaults.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
};

/**
 * Theme storage key.
 */
export const DARK_MODE_STORAGE_KEY =
  'eventsphere_dark_mode';