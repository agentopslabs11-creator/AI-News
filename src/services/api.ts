import axios from 'axios';

// Get cookie value helper
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const baseURL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // Crucial for HttpOnly session cookie
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
