import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StateContext from '../context/StateContext';

const SessionHandler = ({ children }) => {
  const stateContext = useContext(StateContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in and redirect to dashboard if on root
    if (stateContext.state.user && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [stateContext.state.user, location.pathname, navigate]);

  return children;
};

export default SessionHandler;
