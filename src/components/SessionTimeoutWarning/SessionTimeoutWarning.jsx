import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const SessionTimeoutWarning = ({ 
  isOpen, 
  onExtend, 
  onLogout, 
  timeRemaining,
  warningThreshold = 5 // minutes
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (isOpen && timeRemaining > 0) {
      setCountdown(timeRemaining);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onLogout(); // Auto logout when time expires
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [isOpen, timeRemaining, onLogout]);

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours === 1 ? '' : 's'}${mins > 0 ? ` and ${mins} minute${mins === 1 ? '' : 's'}` : ''}`;
  };

  return (
    <Dialog 
      open={isOpen} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
      aria-labelledby="session-timeout-dialog-title"
    >
      <DialogTitle id="session-timeout-dialog-title">
        Session Timeout Warning
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Your session will expire in <strong>{formatTime(countdown)}</strong>.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Would you like to extend your session or log out now?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onLogout} 
          color="secondary"
          variant="outlined"
        >
          Log Out Now
        </Button>
        <Button 
          onClick={onExtend} 
          color="primary"
          variant="contained"
          autoFocus
        >
          Extend Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutWarning;
