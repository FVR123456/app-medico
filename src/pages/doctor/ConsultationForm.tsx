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
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MedicationIcon from '@mui/icons-material/Medication';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ConsultationForm = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [patient, setPatient] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasMedicalHistory, setHasMedicalHistory] = useState(false);

  // Form state
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({});
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
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
    setDiagnosis('');
    setPrescription('');
    setNotes('');
    setAllergies([]);
    setAllergyInput('');
    setMedications([]);
    setMedicationInput('');
    setError('');
  };

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

    if (!diagnosis.trim() || !prescription.trim()) {
      setError('El diagnóstico y las indicaciones son obligatorios');
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
          prescription,
          Object.keys(vitalSigns).length > 0 ? vitalSigns : undefined,
          allergies.length > 0 ? allergies : undefined,
          medications.length > 0 ? medications : undefined,
          notes || undefined
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
            sx={{ mb: 3 }}
          >
            Volver a detalles del paciente
          </Button>

          {/* Alerta si no tiene historia clínica */}
          {!hasMedicalHistory && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="600">
                ⚠️ Este paciente no tiene Historia Clínica registrada
              </Typography>
              <Typography variant="body2">
                Debe completar la Historia Clínica antes de poder crear consultas médicas.
                <Button 
                  size="small" 
                  onClick={() => navigate(`/patient-details/${patientId}`)}
                  sx={{ ml: 1 }}
                >
                  Ir a Historia Clínica
                </Button>
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left - Patient Info Summary */}
            <Grid size={{ xs: 12, lg: 3 }}>
              <Card sx={{ position: 'sticky', top: 20 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {patientName.charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        {patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Paciente
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.5} sx={{ fontSize: '0.875rem' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {patientEmail}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Teléfono
                      </Typography>
                      <Typography variant="body2">
                        {patientPhone}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Edad
                      </Typography>
                      <Typography variant="body2">
                        {patientAge()} años
                      </Typography>
                    </Box>
                  </Stack>

                  <Alert 
                    severity="info" 
                    sx={{ mt: 2, fontSize: '0.8rem' }}
                    icon={<CheckCircleIcon fontSize="small" />}
                  >
                    Todos los campos se guardarán en el historial médico
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            {/* Right - Form */}
            <Grid size={{ xs: 12, lg: 9 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                    Nueva Consulta
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                      {/* Signos Vitales Section */}
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          📊 Signos Vitales
                        </Typography>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                          <VitalSignsForm vitalSigns={vitalSigns} onChange={setVitalSigns} />
                        </Paper>
                      </Box>

                      <Divider />

                      {/* Alergias Section */}
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningAmberIcon fontSize="small" color="warning" />
                          Alergias Detectadas
                        </Typography>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 1 }}>
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
                            />
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              onClick={handleAddAllergy}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              Agregar
                            </Button>
                          </Box>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {allergies.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                Sin alergias registradas
                              </Typography>
                            ) : (
                              allergies.map((allergy, index) => (
                                <Chip
                                  key={index}
                                  label={allergy}
                                  onDelete={() => handleRemoveAllergy(index)}
                                  color="warning"
                                  deleteIcon={<CloseIcon />}
                                />
                              ))
                            )}
                          </Box>
                        </Paper>
                      </Box>

                      <Divider />

                      {/* Medicamentos Section */}
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MedicationIcon fontSize="small" color="info" />
                          Medicamentos Actuales
                        </Typography>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: 1 }}>
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
                            />
                            <Button
                              size="small"
                              variant="contained"
                              color="info"
                              onClick={handleAddMedication}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              Agregar
                            </Button>
                          </Box>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {medications.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
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
                                />
                              ))
                            )}
                          </Box>
                        </Paper>
                      </Box>

                      <Divider />

                      {/* Diagnóstico Section */}
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          🔍 Diagnóstico
                        </Typography>
                        <TextField
                          fullWidth
                          label="Diagnóstico *"
                          multiline
                          rows={4}
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          placeholder="Describe el diagnóstico basado en el examen y los signos vitales..."
                          required
                          variant="outlined"
                        />
                      </Box>

                      {/* Indicaciones Section */}
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          💊 Receta / Indicaciones
                        </Typography>
                        <TextField
                          fullWidth
                          label="Receta / Indicaciones *"
                          multiline
                          rows={4}
                          value={prescription}
                          onChange={(e) => setPrescription(e.target.value)}
                          placeholder="Medicamentos, dosis, duración, frecuencia y recomendaciones del tratamiento..."
                          required
                          variant="outlined"
                        />
                      </Box>

                      {/* Notas Section */}
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          📝 Notas Adicionales
                        </Typography>
                        <TextField
                          fullWidth
                          label="Notas Adicionales (opcional)"
                          multiline
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Observaciones, seguimiento, recomendaciones o notas importantes..."
                          variant="outlined"
                        />
                      </Box>

                      <Divider />

                      {/* Action Buttons */}
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => {
                            resetForm();
                            navigate(`/patient-details/${patientId}`);
                          }}
                          disabled={submitting || !hasMedicalHistory}
                          startIcon={<ArrowBackIcon />}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={submitting || !hasMedicalHistory}
                          startIcon={submitting ? undefined : <SaveIcon />}
                          sx={{ minWidth: 200 }}
                        >
                          {submitting ? 'Guardando...' : 'Guardar Consulta'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Layout>
  );
};

export default ConsultationForm;
