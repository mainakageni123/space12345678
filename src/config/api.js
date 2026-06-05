// Detect local/dev environment at runtime based on hostname
// This is more reliable than import.meta.env.DEV for Netlify deployments
const _host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const _isLocal =
  _host === 'localhost' ||
  _host === '127.0.0.1' ||
  /^192\.168\./.test(_host) ||
  /^10\./.test(_host) ||
  /^172\.(1[6-9]|2[0-9]|3[01])\./.test(_host);

export const API_BASE_URL = _isLocal ? `http://${_host}:3001/api` : '/api';
export const UPLOADS_URL = _isLocal ? `http://${_host}:3001` : '';

export const defaultFetchOptions = {
  mode: 'cors',
  credentials: 'omit',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};
