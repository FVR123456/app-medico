import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');
  const [duration, setDuration] = useState(4000);

  const showNotification = useCallback((msg: string, sev: AlertColor = 'info', dur: number = 4000) => {
    setMessage(msg);
    setSeverity(sev);
    setDuration(dur);
    setOpen(true);
  }, []);

  const showError = useCallback((msg: string, dur?: number) => {
    showNotification(msg, 'error', dur ?? 6000);
  }, [showNotification]);

  const showSuccess = useCallback((msg: string, dur?: number) => {
    showNotification(msg, 'success', dur ?? 4000);
  }, [showNotification]);

  const showWarning = useCallback((msg: string, dur?: number) => {
    showNotification(msg, 'warning', dur ?? 5000);
  }, [showNotification]);

  const showInfo = useCallback((msg: string, dur?: number) => {
    showNotification(msg, 'info', dur ?? 4000);
  }, [showNotification]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showError, showSuccess, showWarning, showInfo }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionProps={{
          enter: true,
          exit: true,
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 2,
          }
        }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          elevation={6}
          sx={{ 
            minWidth: '300px',
            maxWidth: '500px',
            borderRadius: 2,
            fontWeight: 500,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            },
            '& .MuiAlert-message': {
              fontSize: '0.95rem',
              py: 0.5
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

