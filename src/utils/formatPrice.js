/**
 * Formats a price value with KSH currency and optional suffix
 * @param {number|string} price - The price value to format
 * @param {boolean} [showSuffix=true] - Whether to show the '/day' suffix
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, showSuffix = true) => {
  const priceValue = Number(price) || 0;
  return `KSH ${priceValue}${showSuffix ? '/day' : ''}`;
};

/**
 * Formats a price value with KSH currency for display in headings or prominent locations
 * @param {number|string} price - The price value to format
 * @returns {object} Object containing the main price and suffix separately
 */
export const formatPriceWithSeparateSuffix = (price) => {
  const priceValue = Number(price) || 0;
  return {
    mainPrice: `KSH ${priceValue}`,
    suffix: '/day'
  };
};