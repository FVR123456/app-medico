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
  Card,
  CardContent,
  Grid,
  Alert,
  LinearProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const steps = ['Información Personal', 'Contacto de Emergencia', 'Información Médica'];

const CompleteProfile = () => {
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

  // Paso 3: Información Médica (Opcional)
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');

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
        if (profile.insurance) {
          setInsuranceProvider(profile.insurance.provider || '');
          setInsurancePolicyNumber(profile.insurance.policyNumber || '');
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
    // Paso 2 (información médica) es opcional

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

      // Agregar información de seguro si está completa
      if (insuranceProvider && insurancePolicyNumber) {
        profileData.insurance = {
          provider: insuranceProvider,
          policyNumber: insurancePolicyNumber
        };
      }

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
      case 2:
        return <HealthAndSafetyIcon />;
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

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <HealthAndSafetyIcon color="primary" />
              Información de Seguro (Opcional)
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Esta información es opcional. Puedes completarla ahora o después desde tu perfil.
            </Alert>

            <TextField
              fullWidth
              margin="normal"
              label="Proveedor de Seguro"
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              placeholder="Ej: IMSS, ISSSTE, Seguros Monterrey"
            />

            <TextField
              fullWidth
              margin="normal"
              label="Número de Póliza"
              value={insurancePolicyNumber}
              onChange={(e) => setInsurancePolicyNumber(e.target.value)}
              placeholder="Ej: 123456789"
            />

            <Card sx={{ mt: 3, bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="subtitle1" fontWeight="600">
                    ¡Casi listo!
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Al finalizar, tendrás acceso completo a tu panel de paciente donde podrás:
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  <Typography component="li" variant="body2">Agendar citas médicas</Typography>
                  <Typography component="li" variant="body2">Ver tu historial clínico</Typography>
                  <Typography component="li" variant="body2">Actualizar tu información</Typography>
                </Box>
              </CardContent>
            </Card>
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            Completa tu Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Solo te tomará unos minutos
          </Typography>
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {Math.round(progress)}% completado
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconComponent={() => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                    color: 'white'
                  }}
                >
                  {getStepIcon(index)}
                </Box>
              )}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 300 }}>
          {renderStepContent()}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || saving}
            onClick={handleBack}
            size="large"
          >
            Anterior
          </Button>
          <Box sx={{ flex: 1 }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleFinish}
              disabled={saving}
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {saving ? 'Guardando...' : 'Finalizar'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              size="large"
            >
              Siguiente
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CompleteProfile;
