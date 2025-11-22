import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getPatientProfile, updatePatientProfile } from '../../services/firestore';
import type { PatientProfile } from '../../types';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  Alert,
  LinearProgress,
  Fade,
  alpha,
  useTheme,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const steps = ['Información Personal', 'Contacto de Emergencia'];

const CompleteProfile = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Paso 1: Información Personal
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Masculino' | 'Femenino' | 'Otro'>('Masculino');
  const [address, setAddress] = useState('');

  // Paso 2: Contacto de Emergencia
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profile = await getPatientProfile(user.uid);
      if (profile) {
        // Cargar datos existentes si los hay
        if (profile.birthDate) setBirthDate(profile.birthDate);
        if (profile.gender) setGender(profile.gender);
        if (profile.address) setAddress(profile.address);
        if (profile.emergencyContact) {
          setEmergencyName(profile.emergencyContact.name || '');
          setEmergencyPhone(profile.emergencyContact.phone || '');
          setEmergencyRelationship(profile.emergencyContact.relationship || '');
        }

        // Si el perfil ya está completo, redirigir al dashboard
        if (profile.profileCompleted) {
          navigate('/patient-dashboard');
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!birthDate) {
        newErrors.birthDate = 'La fecha de nacimiento es requerida';
      }
      if (!address.trim()) {
        newErrors.address = 'La dirección es requerida';
      }
    } else if (step === 1) {
      if (!emergencyName.trim()) {
        newErrors.emergencyName = 'El nombre del contacto es requerido';
      }
      if (!emergencyPhone.trim()) {
        newErrors.emergencyPhone = 'El teléfono es requerido';
      }
      if (!emergencyRelationship.trim()) {
        newErrors.emergencyRelationship = 'La relación es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFinish = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileData: Partial<PatientProfile> = {
        birthDate,
        gender,
        address,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship
        },
        profileCompleted: true
      };

      await updatePatientProfile(user.uid, profileData);
      showSuccess('Perfil completado exitosamente');
      navigate('/patient-dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el perfil';
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 0:
        return <PersonIcon />;
      case 1:
        return <ContactPhoneIcon />;
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonIcon color="primary" />
              Información Personal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Completa tu información básica para que podamos conocerte mejor
            </Typography>

            <TextField
              fullWidth
              required
              margin="normal"
              label="Fecha de Nacimiento"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              error={!!errors.birthDate}
              helperText={errors.birthDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
            />

            <FormControl fullWidth margin="normal" required>
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

            <TextField
              fullWidth
              required
              margin="normal"
              label="Dirección Completa"
              multiline
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={!!errors.address}
              helperText={errors.address || 'Calle, número, colonia, ciudad, código postal'}
              placeholder="Ej: Calle 5 de Mayo #123, Centro, CDMX, 06000"
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ContactPhoneIcon color="primary" />
              Contacto de Emergencia
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Persona a quien contactar en caso de emergencia
            </Typography>

            <TextField
              fullWidth
              required
              margin="normal"
              label="Nombre Completo"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              error={!!errors.emergencyName}
              helperText={errors.emergencyName}
              placeholder="Nombre de tu contacto de emergencia"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
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
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Relación"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  error={!!errors.emergencyRelationship}
                  helperText={errors.emergencyRelationship}
                  placeholder="Ej: Esposo/a, Madre, Hermano/a"
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando perfil...</Typography>
      </Container>
    );
  }

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={500}>
          <Box>
            {/* Header mejorado */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                  mb: 3,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h3" fontWeight="700" gutterBottom sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Completa tu Perfil
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Solo necesitamos algunos datos para comenzar
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Progress bar */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" fontWeight="600" color="text.secondary">
                    Paso {activeStep + 1} de {steps.length}
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="primary.main">
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                />
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel icon={getStepIcon(index)}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step Content */}
              <Box sx={{ minHeight: 300, mb: 4 }}>
                {renderStepContent()}
              </Box>

              {/* Mostrar mensaje de éxito en el último paso */}
              {activeStep === steps.length - 1 && (
                <Fade in timeout={300}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 4,
                      borderRadius: 3,
                      background: alpha(theme.palette.success.main, 0.1),
                      border: '2px solid',
                      borderColor: theme.palette.success.main,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: theme.palette.success.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="600" color="success.dark">
                          ¡Casi listo!
                        </Typography>
                        <Typography variant="body2" color="success.dark">
                          Haz clic en "Finalizar" para acceder a tu panel de paciente
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              )}

              <Divider sx={{ mb: 4 }} />

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={activeStep === 0 || saving}
                  onClick={handleBack}
                  size="large"
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Anterior
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleFinish}
                    disabled={saving}
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.4)}`,
                      '&:hover': {
                        boxShadow: `0 6px 28px ${alpha(theme.palette.success.main, 0.5)}`,
                      }
                    }}
                  >
                    {saving ? 'Guardando...' : 'Finalizar'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
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
                    Siguiente
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default CompleteProfile;
