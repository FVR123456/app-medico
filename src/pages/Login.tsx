import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, signInWithGoogle } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { validateLoginForm } from '@/services/validation';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const { user, role } = useAuth();
  const { showError } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && role) {
      navigate(role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validationErrors = validateLoginForm(email, password);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { message: string } | Error | null;
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      const error = err as { message: string } | Error | null;
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión con Google';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LocalHospitalIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography component="h1" variant="h5" gutterBottom>
          Control Médico
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Inicie sesión para continuar
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleGoogleSignIn}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{ mb: 2 }}
          >
            Continuar con Google
          </Button>

          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              o con correo electrónico
            </Typography>
          </Divider>

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Ingresar'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                ¿No tienes cuenta? Regístrate aquí
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
