// Session Manager for handling authentication sessions
const SESSION_KEY = 'hrm_session';
const SESSION_EXPIRY_KEY = 'hrm_session_expiry';
const SESSION_TOKEN_KEY = 'hrm_session_token';

class SessionManager {
  /**
   * Store session data in localStorage with expiration
   * @param {Object} userData - User data to store
   * @param {number} expiryHours - Hours until expiration (default: 24)
   */
  static setSession(userData, expiryHours = 24) {
    try {
      const expiryTime = new Date().getTime() + (expiryHours * 60 * 60 * 1000);
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
      
      console.log(`Session stored with ${expiryHours} hour(s) expiration`);
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Get session data if still valid
   * @returns {Object|null} User data or null if expired/invalid
   */
  static getSession() {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
      
      if (!sessionData || !expiry) {
        return null;
      }

      const currentTime = new Date().getTime();
      const expiryTime = parseInt(expiry);

      if (currentTime > expiryTime) {
        // Session expired, clean up
        this.clearSession();
        console.log('Session expired, cleared from storage');
        return null;
      }

      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear session data
   */
  static clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      console.log('Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if session is valid
   * @returns {boolean} True if session exists and is not expired
   */
  static isSessionValid() {
    const session = this.getSession();
    const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
    return session !== null && sessionToken !== null;
  }

  /**
   * Extend session expiration
   * @param {number} expiryHours - Hours to extend (default: 24)
   */
  static extendSession(expiryHours = 24) {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const expiryTime = new Date().getTime() + (expiryHours * 60 * 60 * 1000);
        localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
        console.log(`Session extended by ${expiryHours} hour(s)`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  }

  /**
   * Get time remaining in session (in minutes)
   * @returns {number} Minutes remaining or 0 if expired
   */
  static getTimeRemaining() {
    try {
      const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
      if (!expiry) return 0;

      const currentTime = new Date().getTime();
      const expiryTime = parseInt(expiry);
      const remaining = expiryTime - currentTime;

      return remaining > 0 ? Math.floor(remaining / (1000 * 60)) : 0;
    } catch (error) {
      console.error('Failed to get time remaining:', error);
      return 0;
    }
  }

  /**
   * Get session token
   * @returns {string|null} Session token or null if not found
   */
  static getSessionToken() {
    try {
      return localStorage.getItem(SESSION_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get session token:', error);
      return null;
    }
  }

  /**
   * Set session token
   * @param {string} token - Session token to store
   */
  static setSessionToken(token) {
    try {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to set session token:', error);
    }
  }
}

export default SessionManager;