import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, signInWithGoogle } from '../services/auth';
import { useNotification } from '../context/NotificationContext';
import { validateRegisterForm } from '../services/validation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GoogleIcon from '@mui/icons-material/Google';

const Register = () => {
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Campos básicos de registro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'patient'>('patient');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validar formulario
    const validationErrors = validateRegisterForm(email, password, confirmPassword, name, role);
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
      await registerUser(email, password, name, role);
      showSuccess('Cuenta creada exitosamente. Completa tu perfil para continuar.');
      
      // Redirigir al wizard de completar perfil
      if (role === 'patient') {
        navigate('/complete-profile');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showSuccess('Inicio de sesión exitoso con Google');
      navigate('/complete-profile'); // Siempre redirigir a completar perfil
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LocalHospitalIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" fontWeight="600" gutterBottom>
            Crear Cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Regístrate para comenzar
          </Typography>
        </Box>

        {/* Google Sign In */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleGoogleSignIn}
          disabled={loading}
          startIcon={<GoogleIcon />}
          sx={{ mb: 3 }}
        >
          Continuar con Google
        </Button>

        <Divider sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            o con correo electrónico
          </Typography>
        </Divider>

        {/* Formulario de registro */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            required
            label="Nombre Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            autoFocus
          />
          <TextField
            fullWidth
            margin="normal"
            required
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            margin="normal"
            required
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password || 'Mínimo 6 caracteres'}
          />
          <TextField
            fullWidth
            margin="normal"
            required
            label="Repetir Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          
          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel>Soy...</InputLabel>
            <Select
              value={role}
              label="Soy..."
              onChange={(e) => setRole(e.target.value as 'doctor' | 'patient')}
            >
              <MenuItem value="patient">Paciente</MenuItem>
              <MenuItem value="doctor">Médico</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Cuenta'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                ¿Ya tienes cuenta? Inicia sesión
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
