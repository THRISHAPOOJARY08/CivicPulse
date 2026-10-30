/**
 * CivicPulse System Constants
 * Central source of truth for categories, departments, status lifecycle and limits.
 * Based on approved architecture specifications.
 */

const ALLOWED_CATEGORIES = [
  'Roads and Potholes',
  'Garbage and Waste Management',
  'Water Supply',
  'Drainage and Sewage',
  'Streetlights and Electricity',
  'Public Sanitation',
  'Public Infrastructure',
  'Other'
];

const DEFAULT_CATEGORY = 'Other';

const CATEGORY_DEPARTMENT_MAP = {
  'Roads and Potholes': 'Public Works',
  'Garbage and Waste Management': 'Sanitation',
  'Water Supply': 'Water Supply',
  'Drainage and Sewage': 'Drainage',
  'Streetlights and Electricity': 'Electrical',
  'Public Sanitation': 'Public Health',
  'Public Infrastructure': 'Public Works',
  'Other': 'General Municipal Administration'
};

const STATUS_LIFECYCLE = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected'
];

const PRIORITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

const LIMITS = {
  TITLE_MAX_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 1000,
  STATUS_HISTORY_MAX_ENTRIES: 20,
  COMPLAINTS_QUERY_LIMIT: 100,
  HOTSPOT_GRID_SIZE_DEGREES: 0.01,
  HOTSPOT_MIN_COMPLAINTS: 3
};

module.exports = {
  ALLOWED_CATEGORIES,
  DEFAULT_CATEGORY,
  CATEGORY_DEPARTMENT_MAP,
  STATUS_LIFECYCLE,
  PRIORITY_LEVELS,
  LIMITS
};
