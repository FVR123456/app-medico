import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePatientProfile, getPatientProfile } from '../../services/firestore';
import type { PatientProfile as PatientProfileType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Layout from '../../components/Layout';
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
  InputAdornment,
  Grid,
  Divider,
  Card,
  CardContent,
  Stack,
  Fade,
  alpha,
  useTheme
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const PatientProfile = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Información personal
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Masculino' | 'Femenino' | 'Otro'>('Masculino');
  const [address, setAddress] = useState('');

  // Contacto de emergencia
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const profile = await getPatientProfile(user.uid);
        if (profile) {
          setPhone(profile.phone || '');
          setBirthDate(profile.birthDate || '');
          setGender(profile.gender || 'Masculino');
          setAddress(profile.address || '');
          
          if (profile.emergencyContact) {
            setEmergencyName(profile.emergencyContact.name || '');
            setEmergencyPhone(profile.emergencyContact.phone || '');
            setEmergencyRelationship(profile.emergencyContact.relationship || '');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        showError('Error al cargar el perfil');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user, showError]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida';
    if (!emergencyName.trim()) newErrors.emergencyName = 'El nombre del contacto es requerido';
    if (!emergencyPhone.trim()) newErrors.emergencyPhone = 'El teléfono del contacto es requerido';
    if (!emergencyRelationship.trim()) newErrors.emergencyRelationship = 'La relación es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      showError('No hay usuario autenticado');
      return;
    }

    setLoading(true);
    try {
      const profileData: Partial<PatientProfileType> = {
        phone,
        birthDate,
        gender,
        address: address || undefined,
        profileCompleted: true,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship
        }
      };

      await updatePatientProfile(user.uid, profileData);

      showSuccess('Perfil actualizado exitosamente');
      navigate('/patient-dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el perfil';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout title="Mi Perfil">
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Typography>No hay usuario autenticado</Typography>
        </Container>
      </Layout>
    );
  }

  if (loadingProfile) {
    return (
      <Layout title="Mi Perfil">
        <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Mi Perfil">
      <Box 
        sx={{ 
          minHeight: '100vh',
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={500}>
            <Box sx={{ py: 4 }}>
              {/* Botón de regreso */}
              <Box sx={{ mb: 3 }}>
                <Button
                  onClick={() => navigate('/patient-dashboard')}
                  startIcon={<ArrowBackIcon />}
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Volver al Dashboard
                </Button>
              </Box>

              {/* Header mejorado con glassmorphism */}
              <Box sx={{ mb: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="700" gutterBottom sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    Mi Perfil
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    Mantén tu información actualizada para una mejor atención médica
                  </Typography>
                </Paper>
              </Box>

              {/* Contenedor del formulario */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: alpha(theme.palette.background.paper, 0.6),
                }}
              >
                <Box component="form" onSubmit={handleSubmit}>
                  {/* Información Personal */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      />
                      Información Personal
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Teléfono"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">+52</InputAdornment>
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Fecha de Nacimiento"
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          error={!!errors.birthDate}
                          helperText={errors.birthDate}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ max: new Date().toISOString().split('T')[0] }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Género</InputLabel>
                          <Select
                            value={gender}
                            label="Género"
                            onChange={(e) => setGender(e.target.value as 'Masculino' | 'Femenino' | 'Otro')}
                          >
                            <MenuItem value="Masculino">Masculino</MenuItem>
                            <MenuItem value="Femenino">Femenino</MenuItem>
                            <MenuItem value="Otro">Otro</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Dirección"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Calle, colonia, ciudad (opcional)"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Contacto de Emergencia */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      />
                      Contacto de Emergencia
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          label="Nombre Completo"
                          value={emergencyName}
                          onChange={(e) => setEmergencyName(e.target.value)}
                          error={!!errors.emergencyName}
                          helperText={errors.emergencyName}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Teléfono"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          error={!!errors.emergencyPhone}
                          helperText={errors.emergencyPhone}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">+52</InputAdornment>
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required
                          label="Relación"
                          value={emergencyRelationship}
                          onChange={(e) => setEmergencyRelationship(e.target.value)}
                          error={!!errors.emergencyRelationship}
                          helperText={errors.emergencyRelationship}
                          placeholder="Ej: Esposo/a, Padre, Madre"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/patient-dashboard')}
                      disabled={loading}
                      size="large"
                      sx={{ 
                        borderRadius: 3,
                        px: 4,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      size="large"
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                          boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                        }
                      }}
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Layout>
  );
};

export default PatientProfile;
