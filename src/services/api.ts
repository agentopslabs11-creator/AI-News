import axios from 'axios';

// Get cookie value helper
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// 1. Resolve raw API URL from environment variables
const rawEnvUrl = (
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  ''
).trim();

// 2. Reject outdated/broken domains or localhost in production
let resolvedOrigin = '';
if (
  rawEnvUrl &&
  !rawEnvUrl.includes('backend-rho-drab-16') &&
  !rawEnvUrl.includes('localhost') &&
  !rawEnvUrl.includes('127.0.0.1')
) {
  resolvedOrigin = rawEnvUrl.replace(/\/+$/, '');
}

// 3. Guarantee clean API_BASE_URL on same origin without duplicate '/api/api'
export const API_BASE_URL = resolvedOrigin
  ? (resolvedOrigin.endsWith('/api') ? resolvedOrigin : `${resolvedOrigin}/api`)
  : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for HttpOnly session cookie
  timeout: 12000,
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor to attach CSRF token and Bearer fallback
apiClient.interceptors.request.use((config) => {
  // Attach CSRF Token for mutating requests
  const csrfToken = getCookie('risenshine_csrf_token');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  // Attach token from localStorage as fallback if exists
  const storedToken = localStorage.getItem('risenshine_token');
  if (storedToken && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${storedToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on admin page, redirect or trigger state cleanup
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('risenshine_token');
        localStorage.removeItem('risenshine_admin');
        window.location.href = '/admin/login?session_expired=1';
      }
    }
    return Promise.reject(error);
  }
);
