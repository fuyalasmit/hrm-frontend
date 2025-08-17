import axios from 'axios';

// Request interceptor to include session token
axios.interceptors.request.use(
  (config) => {
    // Get session token from SessionManager
    try {
      const SessionManager = require("./sessionManager").default;
      const sessionToken = SessionManager.getSessionToken();
      if (sessionToken) {
        config.headers['x-session-token'] = sessionToken;
      }
    } catch (error) {
      console.error('Error getting session token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiry
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) responses - session expired
    if (error.response && error.response.status === 401) {
      console.log('Session expired, clearing stored session');
      
      // Clear stored session
      try {
        const SessionManager = require("./sessionManager").default;
        SessionManager.clearSession();
      } catch (sessionError) {
        console.error('Error clearing session:', sessionError);
      }
      
      // Redirect to login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;
