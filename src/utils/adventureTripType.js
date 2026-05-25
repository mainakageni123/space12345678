/** Trip type options shown on cards, filters, and admin */
export const TRIP_TYPE_OPTIONS = [
  { value: 'Family', label: 'Family' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Group', label: 'Group' },
  { value: 'Private', label: 'Private' },
  { value: 'Adventure', label: 'Adventure' },
];

/** Map legacy difficulty values to trip type for older records */
const LEGACY_DIFFICULTY_TO_TRIP_TYPE = {
  easy: 'Family',
  moderate: 'Regular',
  challenging: 'Corporate',
  expert: 'Corporate',
};

/**
 * Resolve trip type from adventure document (supports tripType field or legacy difficulty).
 */
export const getTripType = (adventure) => {
  if (!adventure) return 'Regular';
  if (adventure.tripType) return adventure.tripType;
  const legacy = LEGACY_DIFFICULTY_TO_TRIP_TYPE[adventure.difficulty?.toLowerCase()];
  if (legacy) return legacy;
  if (adventure.difficulty) return adventure.difficulty;
  return 'Regular';
};

export const getTripTypeFilterOptions = () => [
  { value: 'all', label: 'All Types' },
  ...TRIP_TYPE_OPTIONS.map((o) => ({ value: o.value.toLowerCase(), label: o.label })),
];

export const TRIP_TYPE_VALUES = TRIP_TYPE_OPTIONS.map((o) => o.value);

/**
 * Normalize a trip type string for saving (form input or legacy difficulty).
 */
export const normalizeTripTypeForSave = (tripType, legacyDifficulty) => {
  const raw = tripType || legacyDifficulty;
  if (!raw) return 'Regular';

  const legacy = LEGACY_DIFFICULTY_TO_TRIP_TYPE[String(raw).toLowerCase()];
  if (legacy) return legacy;

  const matched = TRIP_TYPE_VALUES.find(
    (t) => t.toLowerCase() === String(raw).toLowerCase()
  );
  return matched || 'Regular';
};
