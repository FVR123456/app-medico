import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import VitalSignsForm from '@/components/VitalSignsForm';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { 
  addMedicalRecord, 
  getPatientById, 
  getMedicalHistory,
  type VitalSigns 
} from '@/services/firestore';
import { logger } from '@/services/logger';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Alert,
  Divider,
  Paper,
  Chip,
  Grid,
  Fade,
  CircularProgress,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MedicationIcon from '@mui/icons-material/Medication';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const ConsultationForm = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const theme = useTheme();

  const [patient, setPatient] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasMedicalHistory, setHasMedicalHistory] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({});
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  const [prognosis, setPrognosis] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setError('ID de paciente no válido');
        setLoading(false);
        return;
      }

      try {
        const patientData = await getPatientById(patientId);
        if (!patientData) {
          setError('Paciente no encontrado');
        } else {
          setPatient(patientData);
        }

        // Verificar si tiene historia clínica
        const history = await getMedicalHistory(patientId);
        setHasMedicalHistory(!!history);
        
        if (!history) {
          setError('Este paciente no tiene Historia Clínica registrada. Debe completarla antes de crear consultas.');
        }
      } catch (err) {
        logger.error('Error fetching patient', 'ConsultationForm', err);
        setError('Error al cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddMedication = () => {
    if (medicationInput.trim() && !medications.includes(medicationInput.trim())) {
      setMedications([...medications, medicationInput.trim()]);
      setMedicationInput('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setVitalSigns({});
    setSubjective('');
    setObjective('');
    setAnalysis('');
    setDiagnosis('');
    setPlan('');
    setPrognosis('');
    setAllergies([]);
    setAllergyInput('');
    setMedications([]);
    setMedicationInput('');
    setError('');
    setActiveStep(0);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const steps = [
    {
      label: 'Signos Vitales',
      icon: <MonitorHeartIcon />,
      optional: true
    },
    {
      label: 'Nota SOAP',
      icon: <AssignmentIcon />,
      optional: false
    },
    {
      label: 'Información Complementaria',
      icon: <MedicationIcon />,
      optional: true
    }
  ];

  // Getters seguros para propiedades del paciente
  const patientName = typeof patient?.name === 'string' ? patient.name : 'Paciente';
  const patientEmail = typeof patient?.email === 'string' ? patient.email : '';
  const patientPhone = typeof patient?.phone === 'string' ? patient.phone : 'No registrado';
  const patientAge = () => {
    if (typeof patient?.birthDate !== 'string') return 'No registrada';
    return Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMedicalHistory) {
      setError('Debe completar la Historia Clínica antes de crear consultas');
      showError('Debe completar la Historia Clínica antes de crear consultas');
      return;
    }

    if (!diagnosis.trim() || !plan.trim()) {
      setError('El diagnóstico y el plan de tratamiento son obligatorios');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (patientId && user) {
        await addMedicalRecord(
          patientId,
          user.displayName || 'Doctor',
          diagnosis,
          plan, // prescription ahora es plan
          Object.keys(vitalSigns).length > 0 ? vitalSigns : undefined,
          allergies.length > 0 ? allergies : undefined,
          medications.length > 0 ? medications : undefined,
          undefined, // notes (ahora está en campos SOAP)
          subjective || undefined,
          objective || undefined,
          analysis || undefined,
          prognosis || undefined
        );

        logger.info('Medical record created successfully', 'ConsultationForm');
        showSuccess('Consulta guardada exitosamente');
        
        // Redirigir después de guardar
        setTimeout(() => {
          navigate(`/patient-details/${patientId}`);
        }, 1000);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar la consulta';
      logger.error('Error creating medical record', 'ConsultationForm', err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Nueva Consulta">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout title="Error">
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="error" gutterBottom>
              {error || 'Paciente no encontrado'}
            </Typography>
            <Button
              onClick={() => navigate('/doctor-dashboard')}
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2 }}
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title={`Consulta: ${patient.name}`}>
      <Fade in timeout={500}>
        <Box>
          {/* Back Button */}
          <Button
            onClick={() => navigate(`/patient-details/${patientId}`)}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              mb: 3,
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
            }}
          >
            Volver a detalles del paciente
          </Button>

          {/* Alerta si no tiene historia clínica */}
          {!hasMedicalHistory && (
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 3,
                background: alpha(theme.palette.error.main, 0.08),
                border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: theme.palette.error.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <WarningAmberIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="body1" fontWeight={700} color="error" gutterBottom>
                    Este paciente no tiene Historia Clínica registrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Debe completar la Historia Clínica antes de poder crear consultas médicas.
                  </Typography>
                </Box>
                <Button 
                  variant="contained"
                  color="error"
                  size="small" 
                  onClick={() => navigate(`/patient-details/${patientId}`)}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Ir a Historia Clínica
                </Button>
              </Stack>
            </Paper>
          )}

          <Grid container spacing={3}>
            {/* Left - Patient Info Summary */}
            <Grid size={{ xs: 12, lg: 3 }}>
              <Paper 
                elevation={0}
                sx={{ 
                  position: 'sticky', 
                  top: 20,
                  borderRadius: 3,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  background: alpha(theme.palette.primary.main, 0.04),
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    background: alpha(theme.palette.primary.main, 0.08),
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      {patientName.charAt(0).toUpperCase()}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {patientName}
                      </Typography>
                      <Chip 
                        label="Paciente" 
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.5 }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>
                        {patientEmail}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.5 }}>
                        Teléfono
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {patientPhone}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.5 }}>
                        Edad
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {patientAge()} años
                      </Typography>
                    </Box>
                  </Stack>

                  <Paper
                    elevation={0}
                    sx={{ 
                      mt: 3, 
                      p: 2,
                      borderRadius: 2,
                      background: alpha(theme.palette.info.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleIcon 
                        fontSize="small" 
                        sx={{ color: theme.palette.info.main, mt: 0.2 }}
                      />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        Todos los campos se guardarán en el historial médico
                      </Typography>
                    </Stack>
                  </Paper>
                </Box>
              </Paper>
            </Grid>

            {/* Right - Form */}
            <Grid size={{ xs: 12, lg: 9 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    background: alpha(theme.palette.primary.main, 0.04),
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <AssignmentIcon />
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      Nueva Consulta
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ p: 4 }}>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Stepper activeStep={activeStep} orientation="vertical">
                      {/* PASO 1: Signos Vitales */}
                      <Step>
                        <StepLabel
                          optional={
                            <Typography variant="caption" color="text.secondary">
                              Opcional - Datos vitales del paciente
                            </Typography>
                          }
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: activeStep >= 0 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.2),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                transition: 'all 0.3s',
                              }}
                            >
                              <MonitorHeartIcon />
                            </Box>
                          )}
                        >
                          <Typography variant="h6" fontWeight={700}>
                            Signos Vitales
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 3, 
                              mt: 2,
                              mb: 2,
                              bgcolor: 'background.default',
                              borderRadius: 2,
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            <VitalSignsForm vitalSigns={vitalSigns} onChange={setVitalSigns} />
                          </Paper>
                          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              onClick={handleNext}
                              endIcon={<NavigateNextIcon />}
                              sx={{ 
                                borderRadius: 2,
                                fontWeight: 600,
                              }}
                            >
                              Continuar
                            </Button>
                          </Stack>
                        </StepContent>
                      </Step>

                      {/* PASO 2: Nota SOAP */}
                      <Step>
                        <StepLabel
                          optional={
                            <Typography variant="caption" color="text.secondary">
                              Requerido - Formato SOAP de documentación clínica
                            </Typography>
                          }
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: activeStep >= 1 ? theme.palette.success.main : alpha(theme.palette.success.main, 0.2),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                transition: 'all 0.3s',
                              }}
                            >
                              <AssignmentIcon />
                            </Box>
                          )}
                        >
                          <Typography variant="h6" fontWeight={700}>
                            Nota SOAP
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Stack spacing={3} sx={{ mt: 2 }}>
                            {/* Subjetivo */}
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    bgcolor: '#1976d2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <PersonIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={700} color="#1976d2">
                                    Subjetivo
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Lo que el paciente reporta
                                  </Typography>
                                </Box>
                              </Stack>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={subjective}
                                onChange={(e) => setSubjective(e.target.value)}
                                placeholder="Ej: Paciente refiere dolor abdominal de 3 días de evolución..."
                                variant="outlined"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: alpha('#1976d2', 0.04),
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            </Box>

                            {/* Objetivo */}
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    bgcolor: '#2e7d32',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <VisibilityIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={700} color="#2e7d32">
                                    Objetivo
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Lo que el médico observa
                                  </Typography>
                                </Box>
                              </Stack>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                placeholder="Ej: Paciente consciente, orientado. Abdomen blando..."
                                variant="outlined"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: alpha('#2e7d32', 0.04),
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            </Box>

                            {/* Análisis */}
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    bgcolor: '#ed6c02',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <ScienceIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={700} color="#ed6c02">
                                    Análisis
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Interpretación de los datos
                                  </Typography>
                                </Box>
                              </Stack>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={analysis}
                                onChange={(e) => setAnalysis(e.target.value)}
                                placeholder="Ej: Cuadro clínico compatible con..."
                                variant="outlined"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: alpha('#ed6c02', 0.04),
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            </Box>

                            {/* Diagnóstico */}
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    bgcolor: '#d32f2f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <LocalHospitalIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={700} color="#d32f2f">
                                    Diagnóstico *
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Conclusión médica
                                  </Typography>
                                </Box>
                              </Stack>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Ej: Colecistitis aguda litiásica"
                                required
                                variant="outlined"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: alpha('#d32f2f', 0.04),
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            </Box>

                            {/* Plan */}
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    bgcolor: '#9c27b0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <MedicalServicesIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={700} color="#9c27b0">
                                    Plan de Tratamiento *
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Tratamiento e indicaciones
                                  </Typography>
                                </Box>
                              </Stack>
                              <TextField
                                fullWidth
                                multiline
                                rows={5}
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                placeholder="Ej: 1. Ayuno&#10;2. Hidratación IV&#10;3. Analgesia: Ketorolaco 30mg..."
                                required
                                variant="outlined"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: alpha('#9c27b0', 0.04),
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            </Box>

                            {/* Pronóstico */}
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    bgcolor: '#0288d1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <TrendingUpIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={700} color="#0288d1">
                                    Pronóstico
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Evolución esperada
                                  </Typography>
                                </Box>
                              </Stack>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                value={prognosis}
                                onChange={(e) => setPrognosis(e.target.value)}
                                placeholder="Ej: Favorable con manejo quirúrgico oportuno..."
                                variant="outlined"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: alpha('#0288d1', 0.04),
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            <Button
                              variant="outlined"
                              onClick={handleBack}
                              startIcon={<NavigateBeforeIcon />}
                              sx={{ 
                                borderRadius: 2,
                                fontWeight: 600,
                              }}
                            >
                              Anterior
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleNext}
                              endIcon={<NavigateNextIcon />}
                              disabled={!diagnosis.trim() || !plan.trim()}
                              sx={{ 
                                borderRadius: 2,
                                fontWeight: 600,
                              }}
                            >
                              Continuar
                            </Button>
                          </Stack>
                        </StepContent>
                      </Step>

                      {/* PASO 3: Información Complementaria */}
                      <Step>
                        <StepLabel
                          optional={
                            <Typography variant="caption" color="text.secondary">
                              Opcional - Alergias y medicamentos actuales
                            </Typography>
                          }
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: activeStep >= 2 ? theme.palette.warning.main : alpha(theme.palette.warning.main, 0.2),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                transition: 'all 0.3s',
                              }}
                            >
                              <MedicationIcon />
                            </Box>
                          )}
                        >
                          <Typography variant="h6" fontWeight={700}>
                            Información Complementaria
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Stack spacing={3} sx={{ mt: 2 }}>
                            {/* Alergias */}
                            <Box>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 2,
                                  background: alpha('#f59e0b', 0.08),
                                  border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <WarningAmberIcon sx={{ color: '#f59e0b' }} />
                                  <Typography variant="subtitle1" fontWeight={700}>
                                    Alergias Detectadas
                                  </Typography>
                                </Stack>
                              </Paper>
                              <Box display="flex" gap={1} mb={2}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Escribir alergia y presionar Enter..."
                                  value={allergyInput}
                                  onChange={(e) => setAllergyInput(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddAllergy();
                                    }
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      bgcolor: 'white',
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={handleAddAllergy}
                                  sx={{ 
                                    whiteSpace: 'nowrap',
                                    bgcolor: '#f59e0b',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 3,
                                    '&:hover': {
                                      bgcolor: '#d97706',
                                    }
                                  }}
                                >
                                  Agregar
                                </Button>
                              </Box>
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {allergies.length === 0 ? (
                                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    Sin alergias registradas
                                  </Typography>
                                ) : (
                                  allergies.map((allergy, index) => (
                                    <Chip
                                      key={index}
                                      label={allergy}
                                      onDelete={() => handleRemoveAllergy(index)}
                                      deleteIcon={<CloseIcon />}
                                      sx={{
                                        bgcolor: '#f59e0b',
                                        color: 'white',
                                        fontWeight: 600,
                                        '& .MuiChip-deleteIcon': {
                                          color: 'white',
                                          '&:hover': {
                                            color: 'rgba(255,255,255,0.8)',
                                          }
                                        }
                                      }}
                                    />
                                  ))
                                )}
                              </Box>
                            </Box>

                            <Divider />

                            {/* Medicamentos */}
                            <Box>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 2,
                                  background: alpha(theme.palette.info.main, 0.08),
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <MedicationIcon sx={{ color: theme.palette.info.main }} />
                                  <Typography variant="subtitle1" fontWeight={700}>
                                    Medicamentos Actuales
                                  </Typography>
                                </Stack>
                              </Paper>
                              <Box display="flex" gap={1} mb={2}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Escribir medicamento y presionar Enter..."
                                  value={medicationInput}
                                  onChange={(e) => setMedicationInput(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddMedication();
                                    }
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      bgcolor: 'white',
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="info"
                                  onClick={handleAddMedication}
                                  sx={{ 
                                    whiteSpace: 'nowrap',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 3,
                                  }}
                                >
                                  Agregar
                                </Button>
                              </Box>
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {medications.length === 0 ? (
                                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    Sin medicamentos registrados
                                  </Typography>
                                ) : (
                                  medications.map((med, index) => (
                                    <Chip
                                      key={index}
                                      label={med}
                                      onDelete={() => handleRemoveMedication(index)}
                                      color="info"
                                      deleteIcon={<CloseIcon />}
                                      sx={{ fontWeight: 600 }}
                                    />
                                  ))
                                )}
                              </Box>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            <Button
                              variant="outlined"
                              onClick={handleBack}
                              startIcon={<NavigateBeforeIcon />}
                              disabled={submitting}
                              sx={{ 
                                borderRadius: 2,
                                fontWeight: 600,
                              }}
                            >
                              Anterior
                            </Button>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={submitting || !hasMedicalHistory}
                              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                              sx={{ 
                                minWidth: 200,
                                borderRadius: 2,
                                fontWeight: 600,
                                px: 4,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                '&:hover': {
                                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                                }
                              }}
                            >
                              {submitting ? 'Guardando...' : 'Guardar Consulta'}
                            </Button>
                          </Stack>
                        </StepContent>
                      </Step>
                    </Stepper>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Layout>
  );
};

export default ConsultationForm;
