import { API_BASE_URL } from '../config/api';
import { optimizeCloudinaryUrl } from './cloudinaryUrl';

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const toAbsoluteUrl = (maybeRelative) => {
  if (!maybeRelative) return undefined;
  if (/^https?:\/\//i.test(maybeRelative)) return optimizeCloudinaryUrl(maybeRelative);
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

  // Collect every image URL (primary + gallery) — order: images[] first, then image, imageUrls
  const images = [];
  const addImage = (src) => {
    const url = toAbsoluteUrl(src);
    if (url && !images.includes(url)) images.push(url);
  };
  if (Array.isArray(apiVehicle?.images)) {
    apiVehicle.images.forEach((img) => {
      if (typeof img === 'string') addImage(img);
    });
  }
  if (typeof apiVehicle?.image === 'string') addImage(apiVehicle.image);
  if (Array.isArray(apiVehicle?.imageUrls)) {
    apiVehicle.imageUrls.forEach(addImage);
  }
  if (apiVehicle?.imageUrl) addImage(apiVehicle.imageUrl);

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


