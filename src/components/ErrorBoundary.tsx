import React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '100%' }}>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Algo salió mal
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {this.state.error?.message || 'Ocurrió un error inesperado'}
              </Typography>
              <Button variant="contained" color="primary" onClick={this.handleReset}>
                Intentar de nuevo
              </Button>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
