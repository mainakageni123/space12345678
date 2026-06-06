// Detect local/dev environment at runtime based on hostname
const _host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const _isLocal =
  _host === 'localhost' ||
  _host === '127.0.0.1' ||
  /^192\.168\./.test(_host) ||
  /^10\./.test(_host) ||
  /^172\.(1[6-9]|2[0-9]|3[01])\./.test(_host);

// In production (Vercel), use the Railway backend URL via VITE_API_URL env variable.
// In development, use localhost:3001.
const RAILWAY_URL = import.meta.env.VITE_API_URL || '';

export const API_BASE_URL = _isLocal
  ? `http://${_host}:3001/api`
  : `${RAILWAY_URL}/api`;

export const UPLOADS_URL = _isLocal ? `http://${_host}:3001` : RAILWAY_URL;

export const defaultFetchOptions = {
  mode: 'cors',
  credentials: 'omit',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};
