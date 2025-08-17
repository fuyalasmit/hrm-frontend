import { useState, useEffect, useContext } from 'react';
import StateContext from '../context/StateContext';

const useSessionTimeout = (warningThreshold = 5) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const stateContext = useContext(StateContext);

  useEffect(() => {
    let intervalId;

    const checkSessionTimeout = () => {
      try {
        const SessionManager = require("../utils/sessionManager").default;
        const remaining = SessionManager.getTimeRemaining();
        
        setTimeRemaining(remaining);

        if (remaining <= warningThreshold && remaining > 0) {
          setShowWarning(true);
        } else if (remaining <= 0) {
          // Session expired
          handleLogout();
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        console.error('Error checking session timeout:', error);
      }
    };

    // Only check timeout if user is logged in
    if (stateContext.state.user) {
      checkSessionTimeout(); // Initial check
      intervalId = setInterval(checkSessionTimeout, 60000); // Check every minute
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [stateContext.state.user, warningThreshold]);

  const handleExtendSession = () => {
    try {
      const SessionManager = require("../utils/sessionManager").default;
      const extended = SessionManager.extendSession(24); // Extend by 24 hours
      
      if (extended) {
        setShowWarning(false);
        setTimeRemaining(SessionManager.getTimeRemaining());
        console.log('Session extended successfully');
      }
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  const handleLogout = () => {
    try {
      const SessionManager = require("../utils/sessionManager").default;
      SessionManager.clearSession();
      stateContext.clearState();
      setShowWarning(false);
      
      // Redirect to login page
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    showWarning,
    timeRemaining,
    handleExtendSession,
    handleLogout
  };
};

export default useSessionTimeout;
