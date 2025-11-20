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
  Stack
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';

const PatientProfile = () => {
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

  // Seguro médico
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');

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
          
          if (profile.insurance) {
            setInsuranceProvider(profile.insurance.provider || '');
            setInsurancePolicyNumber(profile.insurance.policyNumber || '');
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

      // Solo agregar seguro si se proporcionó
      if (insuranceProvider && insurancePolicyNumber) {
        profileData.insurance = {
          provider: insuranceProvider,
          policyNumber: insurancePolicyNumber
        };
      }

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
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="600" gutterBottom>
              Mi Perfil
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mantén tu información actualizada
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Información Personal */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="primary" />
                    Información Personal
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
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
                    <Grid size={{ xs: 12, md: 6 }}>
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
                  </Grid>

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
                    label="Dirección"
                    multiline
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, colonia, ciudad (opcional)"
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Contacto de Emergencia */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ContactEmergencyIcon color="primary" />
                    Contacto de Emergencia
                  </Typography>

                  <TextField
                    fullWidth
                    required
                    label="Nombre Completo"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    error={!!errors.emergencyName}
                    helperText={errors.emergencyName}
                  />

                  <Grid container spacing={2}>
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
                        placeholder="Ej: Esposo/a, Padre, Madre"
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            {/* Seguro Médico */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" gutterBottom>
                    Seguro Médico (Opcional)
                  </Typography>

                  <TextField
                    fullWidth
                    label="Aseguradora"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="Ej: IMSS, ISSSTE, Seguros Monterrey"
                  />

                  <TextField
                    fullWidth
                    label="Número de Póliza"
                    value={insurancePolicyNumber}
                    onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/patient-dashboard')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default PatientProfile;
