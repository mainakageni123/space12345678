/**
 * Apply Cloudinary delivery transforms to an existing upload URL.
 * Safe to use on display — does not affect upload signatures.
 */
export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url;
  }

  const {
    width = 1000,
    crop = 'limit',
    quality = 'auto',
    format = 'auto'
  } = options;

  const transform = `c_${crop},w_${width}/q_${quality}/f_${format}`;

  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  return url;
}
