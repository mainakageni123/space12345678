const VALID_TRIP_TYPES = ['Family', 'Regular', 'Corporate', 'Group', 'Private', 'Adventure'];

const LEGACY_DIFFICULTY_TO_TRIP_TYPE = {
  easy: 'Family',
  moderate: 'Regular',
  challenging: 'Corporate',
  expert: 'Corporate',
};

/**
 * Normalize adventure payload before create/update (tripType, numbers, strip legacy difficulty).
 */
function normalizeAdventureData(data) {
  const out = { ...data };

  let tripType = out.tripType;
  if (!tripType && out.difficulty) {
    tripType = LEGACY_DIFFICULTY_TO_TRIP_TYPE[String(out.difficulty).toLowerCase()] || 'Regular';
  }
  if (tripType) {
    const matched = VALID_TRIP_TYPES.find(
      (t) => t.toLowerCase() === String(tripType).toLowerCase()
    );
    out.tripType = matched || 'Regular';
  } else {
    out.tripType = 'Regular';
  }

  delete out.difficulty;

  if (out.price !== undefined && out.price !== '') {
    out.price = parseFloat(out.price) || 0;
  }
  if (out.maxParticipants !== undefined && out.maxParticipants !== '') {
    out.maxParticipants = parseInt(out.maxParticipants, 10) || 0;
  }

  return out;
}

module.exports = { normalizeAdventureData, VALID_TRIP_TYPES };
