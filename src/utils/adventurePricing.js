/**
 * Adventure price from admin = total amount customer pays (not per-person math).
 */
export function getAdventurePrice(adventure) {
  const value = Number(adventure?.price);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function formatKes(amount) {
  return `KES ${Number(amount || 0).toLocaleString()}`;
}
