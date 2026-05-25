// Determine API base URL.
// - In development we use Vite's proxy so requests to '/api' are forwarded to the backend (avoids CORS issues).
// - If VITE_BACKEND_URL is provided we use it (useful for production or remote backends).
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// For Netlify deployment, use relative URLs in production
// In development, use full URL to avoid CORS issues, but support LAN IP
const DEV_HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const API_BASE_URL = import.meta.env.DEV ? `http://${DEV_HOST}:3001/api` : '/api';
export const UPLOADS_URL = import.meta.env.DEV ? `http://${DEV_HOST}:3001` : '';

// Log the API URLs for debugging
console.log('Backend URL:', BACKEND_URL);
console.log('API Base URL:', API_BASE_URL);

// Default fetch options
export const defaultFetchOptions = {
    mode: 'cors',
    credentials: 'omit',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

// Log the API URLs for debugging
console.log('API_BASE_URL:', API_BASE_URL);
console.log('UPLOADS_URL:', UPLOADS_URL);