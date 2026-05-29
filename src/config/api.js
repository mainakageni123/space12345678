// API base URL: relative /api in prod (Netlify), localhost in dev
const DEV_HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const API_BASE_URL = import.meta.env.DEV ? `http://${DEV_HOST}:3001/api` : '/api';
export const UPLOADS_URL = import.meta.env.DEV ? `http://${DEV_HOST}:3001` : '';

export const defaultFetchOptions = {
  mode: 'cors',
  credentials: 'omit',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};
