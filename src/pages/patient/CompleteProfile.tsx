import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePatientProfile, getPatientProfile } from '../../services/firestore';
import type { PatientProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
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
  Stepper,
  Step,
  StepLabel,
  Chip,
  Autocomplete,
  Stack,
  Card,
  CardContent,
  Divider,
  InputAdornment
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CompleteProfile = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Información personal
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Masculino' | 'Femenino' | 'Otro'>('Masculino');
  const [address, setAddress] = useState('');

  // Información médica
  const [bloodType, setBloodType] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [previousSurgeries, setPreviousSurgeries] = useState<string[]>([]);

  // Contacto de emergencia
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');

  const steps = ['Datos Personales', 'Historial Médico', 'Contacto de Emergencia'];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const commonAllergies = [
    'Penicilina',
    'Aspirina',
    'Ibuprofeno',
    'Polen',
    'Ácaros',
    'Mariscos',
    'Nueces',
    'Látex',
    'Ninguna'
  ];
  const commonConditions = [
    'Hipertensión',
    'Diabetes',
    'Asma',
    'Artritis',
    'Hipotiroidismo',
    'Colesterol alto',
    'Ansiedad',
    'Depresión',
    'Ninguna'
  ];

  useEffect(() => {
    // Verificar si ya completó el perfil
    const checkProfile = async () => {
      if (!user) return;
      
      try {
        const profile = await getPatientProfile(user.uid);
        if (profile?.phone && profile?.birthDate) {
          // Ya tiene perfil completo, redirigir
          navigate('/patient-dashboard');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };

    checkProfile();
  }, [user, navigate]);

  const handleNext = () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateCurrentStep = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {};

    if (activeStep === 0) {
      // Validar información personal
      if (!phone.trim()) stepErrors.phone = 'El teléfono es requerido';
      if (!birthDate) stepErrors.birthDate = 'La fecha de nacimiento es requerida';
    } else if (activeStep === 2) {
      // Validar contacto de emergencia
      if (!emergencyName.trim()) stepErrors.emergencyName = 'El nombre del contacto es requerido';
      if (!emergencyPhone.trim()) stepErrors.emergencyPhone = 'El teléfono del contacto es requerido';
      if (!emergencyRelationship.trim()) stepErrors.emergencyRelationship = 'La relación es requerida';
    }

    return stepErrors;
  };

  const handleSubmit = async () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (!user) {
      showError('No hay usuario autenticado');
      return;
    }

    setLoading(true);
    try {
      // Construir objeto con todos los datos (undefined se filtrará en updatePatientProfile)
      const profileData: Partial<PatientProfile> = {
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        role: 'patient',
        phone,
        birthDate,
        gender,
        profileCompleted: true
      };

      // Solo agregar campos opcionales si tienen valor
      if (address) profileData.address = address;
      if (bloodType) profileData.bloodType = bloodType;
      if (height) profileData.height = parseFloat(height);
      if (weight) profileData.weight = parseFloat(weight);
      if (allergies.length > 0) profileData.knownAllergies = allergies;
      if (chronicConditions.length > 0) profileData.chronicConditions = chronicConditions;
      if (currentMedications.length > 0) profileData.currentMedications = currentMedications;
      if (previousSurgeries.length > 0) profileData.previousSurgeries = previousSurgeries;
      if (emergencyName) {
        profileData.emergencyContact = {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship
        };
      }

      await updatePatientProfile(user.uid, profileData);

      showSuccess('¡Perfil completado exitosamente!');
      navigate('/patient-dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el perfil';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Información Personal
            </Typography>
            <TextField
              required
              fullWidth
              label="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: <InputAdornment position="start">+52</InputAdornment>
              }}
            />
            <TextField
              required
              fullWidth
              label="Fecha de Nacimiento"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              error={!!errors.birthDate}
              helperText={errors.birthDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
            />
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
            <TextField
              fullWidth
              label="Dirección (Opcional)"
              multiline
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicalServicesIcon color="primary" />
              Historial Médico
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta información ayudará al médico a brindarte mejor atención
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Datos Físicos
                </Typography>
                <Stack direction="row" spacing={2} mt={2}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Sangre</InputLabel>
                    <Select
                      value={bloodType}
                      label="Tipo de Sangre"
                      onChange={(e) => setBloodType(e.target.value)}
                    >
                      <MenuItem value="">Sin especificar</MenuItem>
                      {bloodTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Altura (cm)"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    inputProps={{ min: 50, max: 250 }}
                  />
                  <TextField
                    fullWidth
                    label="Peso (kg)"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    inputProps={{ min: 1, max: 300 }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Alergias Conocidas
                </Typography>
                <Autocomplete
                  multiple
                  freeSolo
                  options={commonAllergies}
                  value={allergies}
                  onChange={(_, newValue) => setAllergies(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option}
                          color="warning"
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Escribe o selecciona alergias"
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Condiciones Crónicas
                </Typography>
                <Autocomplete
                  multiple
                  freeSolo
                  options={commonConditions}
                  value={chronicConditions}
                  onChange={(_, newValue) => setChronicConditions(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option}
                          color="error"
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Escribe o selecciona condiciones"
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Medicamentos Actuales
                </Typography>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={currentMedications}
                  onChange={(_, newValue) => setCurrentMedications(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option}
                          color="info"
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Escribe los medicamentos que tomas"
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Cirugías Previas
                </Typography>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={previousSurgeries}
                  onChange={(_, newValue) => setPreviousSurgeries(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Ej: Apendicectomía, Cesárea..."
                    />
                  )}
                />
              </CardContent>
            </Card>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ContactEmergencyIcon color="primary" />
              Contacto de Emergencia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Persona a contactar en caso de emergencia médica
            </Typography>
            <TextField
              required
              fullWidth
              label="Nombre Completo"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              error={!!errors.emergencyName}
              helperText={errors.emergencyName}
            />
            <TextField
              required
              fullWidth
              label="Teléfono"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              error={!!errors.emergencyPhone}
              helperText={errors.emergencyPhone}
              InputProps={{
                startAdornment: <InputAdornment position="start">+52</InputAdornment>
              }}
            />
            <TextField
              required
              fullWidth
              label="Relación"
              value={emergencyRelationship}
              onChange={(e) => setEmergencyRelationship(e.target.value)}
              error={!!errors.emergencyRelationship}
              helperText={errors.emergencyRelationship}
              placeholder="Ej: Esposo/a, Padre, Madre, Hermano/a"
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography>No hay usuario autenticado</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LocalHospitalIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" fontWeight="600" gutterBottom>
            Completa tu Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta información nos ayudará a brindarte mejor atención médica
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 3 }} />

        {/* Content */}
        <Box sx={{ minHeight: 400 }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Atrás
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {loading ? 'Guardando...' : 'Finalizar'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
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
