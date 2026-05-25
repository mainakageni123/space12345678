import { API_BASE_URL } from '../config/api';

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const toAbsoluteUrl = (maybeRelative) => {
  if (!maybeRelative) return undefined;
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  // If it's just a filename (no slash), prepend /uploads/
  if (!maybeRelative.startsWith('/')) {
    return `${API_ORIGIN}/uploads/${maybeRelative}`;
  }
  return `${API_ORIGIN}${maybeRelative}`;
};

export function mapVehicle(apiVehicle) {
  if (!apiVehicle) return null;

  const name = apiVehicle?.name || '';
  const [firstWord, ...restWords] = name.split(' ').filter(Boolean);
  const derivedMake = firstWord || 'Vehicle';
  const derivedModel = restWords.length > 0 ? restWords.join(' ') : firstWord || name;

  // Handle various possible image formats
  let images = [];
  
  // Handle imageUrls array from backend (preferred)
  if (Array.isArray(apiVehicle?.imageUrls) && apiVehicle.imageUrls.length > 0) {
    images = apiVehicle.imageUrls.map(toAbsoluteUrl);
  }
  // Handle image URLs
  else if (apiVehicle?.imageUrl) {
    images = [toAbsoluteUrl(apiVehicle.imageUrl)];
  }
  // Legacy image field
  else if (apiVehicle?.image) {
    if (typeof apiVehicle.image === 'string') {
      images = [toAbsoluteUrl(apiVehicle.image)];
    }
  }
  // Images array
  else if (Array.isArray(apiVehicle?.images) && apiVehicle.images.length > 0) {
    images = apiVehicle.images.map(toAbsoluteUrl);
  }

  return {
    id: apiVehicle?._id || apiVehicle?.id,
    make: apiVehicle?.make || derivedMake,
    model: apiVehicle?.model || derivedModel,
    year: apiVehicle?.year,
    class: apiVehicle?.type || apiVehicle?.category,
    category: apiVehicle?.type || apiVehicle?.category,
    description: apiVehicle?.description,
    price: Number(apiVehicle?.price || apiVehicle?.dailyRate || 0),
    imageUrl: images[0],
    images: images,
    originalPrice: apiVehicle?.originalPrice,
    available: apiVehicle?.availability ?? apiVehicle?.available ?? true,
    transmission: apiVehicle?.specifications?.transmission || apiVehicle?.transmission,
    passengers: apiVehicle?.seats ?? apiVehicle?.specifications?.seats ?? apiVehicle?.passengers,
    seats: apiVehicle?.seats ?? apiVehicle?.specifications?.seats ?? apiVehicle?.passengers,
    fuelType: apiVehicle?.specifications?.fuelType || apiVehicle?.fuelType,
    fuelEfficiency: apiVehicle?.fuelEfficiency,
    rating: apiVehicle?.rating,
    specialFeatures: apiVehicle?.features || apiVehicle?.specialFeatures,
    pricing: apiVehicle?.pricing,
    createdAt: apiVehicle?.createdAt,
    isPopular: apiVehicle?.isPopular,
    isNew: apiVehicle?.createdAt ? (new Date(apiVehicle.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) : false,
    _raw: apiVehicle
  };
}

export function mapVehicles(list) {
  return Array.isArray(list) ? list.map(mapVehicle).filter(Boolean) : [];
}


