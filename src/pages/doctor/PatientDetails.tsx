import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Box, 
  CircularProgress, 
  Divider, 
  Stack, 
  Fade, 
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  subscribeToPatientRecords, 
  getPatientById,
  type MedicalRecord,
  updateMedicalRecord
} from '@/services/firestore';
import { useNotification } from '@/context/NotificationContext';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicationIcon from '@mui/icons-material/Medication';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CakeIcon from '@mui/icons-material/Cake';
import PhoneIcon from '@mui/icons-material/Phone';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { logger } from '@/services/logger';

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [patient, setPatient] = useState<Record<string, unknown> | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<MedicalRecord> | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      try {
        const patientData = await getPatientById(id);
        if (patientData) {
          setPatient(patientData);
          if (typeof patientData === 'object' && patientData !== null && 'name' in patientData) {
            logger.debug(`Loaded patient: ${patientData.name}`, 'PatientDetails');
          }
        }
      } catch (error) {
        logger.error("Error fetching patient", 'PatientDetails', error);
      }
    };

    fetchPatient();

    const unsubscribe = subscribeToPatientRecords(id, (data) => {
      setRecords(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Calcular edad
  const calculateAge = (birthDate: unknown): number | null => {
    if (typeof birthDate !== 'string') return null;
    return Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  // Getters seguros para propiedades del paciente
  const patientName = typeof patient?.name === 'string' ? patient.name : 'Paciente';
  const patientEmail = typeof patient?.email === 'string' ? patient.email : '';
  const patientPhone = typeof patient?.phone === 'string' ? patient.phone : undefined;
  const patientBirthDate = typeof patient?.birthDate === 'string' ? patient.birthDate : undefined;
  const patientGender = typeof patient?.gender === 'string' ? patient.gender : undefined;
  const patientAddress = typeof patient?.address === 'string' ? patient.address : undefined;
  const patientBloodType = typeof patient?.bloodType === 'string' ? patient.bloodType : undefined;
  const patientHeight = typeof patient?.height === 'number' ? patient.height : undefined;
  const patientWeight = typeof patient?.weight === 'number' ? patient.weight : undefined;
  const patientAllergies = Array.isArray(patient?.knownAllergies) ? patient.knownAllergies as string[] : [];
  const patientConditions = Array.isArray(patient?.chronicConditions) ? patient.chronicConditions as string[] : [];
  const patientMedications = Array.isArray(patient?.currentMedications) ? patient.currentMedications as string[] : [];
  const patientSurgeries = Array.isArray(patient?.previousSurgeries) ? patient.previousSurgeries as string[] : [];
  const emergencyContact = typeof patient?.emergencyContact === 'object' && patient.emergencyContact !== null 
    ? patient.emergencyContact as { name: string; phone: string; relationship: string }
    : undefined;

  // Obtener consulta más reciente
  const lastRecord = records.length > 0 ? records[0] : null;

  // Obtener todas las alergias únicas del historial
  const allAllergies = Array.from(
    new Set(records.flatMap(r => r.allergies || []))
  );

  // Obtener todos los medicamentos únicos del historial
  const allMedications = Array.from(
    new Set(records.flatMap(r => r.currentMedications || []))
  );

  // Calcular IMC si hay peso y altura
  const getLatestBMI = () => {
    for (const record of records) {
      if (record.vitalSigns?.weight && record.vitalSigns?.height) {
        const heightInMeters = record.vitalSigns.height / 100;
        return (record.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(1);
      }
    }
    return null;
  };

  const handleOpenModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setEditData({ ...record });
    setEditMode(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setSelectedRecord(null);
    setEditData(null);
  };

  const handleSaveEdit = async () => {
    if (!editData || !selectedRecord?.id) return;

    setSavingEdit(true);
    try {
      await updateMedicalRecord(selectedRecord.id, editData);
      showSuccess('Consulta actualizada exitosamente');
      logger.info('Medical record updated', 'PatientDetails', { recordId: selectedRecord.id });
      setEditMode(false);
      handleCloseModal();
    } catch (error) {
      logger.error('Error updating record', 'PatientDetails', error);
      showError('Error al actualizar la consulta');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Detalles del Paciente">
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
            <Typography variant="h6" gutterBottom>Paciente no encontrado</Typography>
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
    <Layout title={patientName}>
      <Fade in timeout={500}>
        <Box>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Button
              onClick={() => navigate('/doctor-dashboard')}
              startIcon={<ArrowBackIcon />}
            >
              Volver a pacientes
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/consultation/${id}`)}
              size="large"
            >
              Nueva Consulta
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Left Sidebar - Patient Info */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={3}>
                {/* Patient Card */}
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {patientName.charAt(0).toUpperCase()}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="h5" fontWeight="600">
                          {patientName}
                        </Typography>
                        <Chip label="Paciente" size="small" color="primary" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                      {/* Email */}
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <EmailIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Email
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {patientEmail}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Phone */}
                      {patientPhone && (
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <PhoneIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Teléfono
                            </Typography>
                            <Typography variant="body2">
                              {patientPhone}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Age */}
                      {calculateAge(patientBirthDate) !== null && (
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <CakeIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Edad
                            </Typography>
                            <Typography variant="body2">
                              {calculateAge(patientBirthDate)} años
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Gender */}
                      {patientGender && (
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Género
                            </Typography>
                            <Typography variant="body2">
                              {patientGender}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Blood Type */}
                      {patientBloodType && (
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Tipo de Sangre
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color="error.main">
                              {patientBloodType}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Height & Weight */}
                      {(patientHeight || patientWeight) && (
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Medidas
                            </Typography>
                            <Typography variant="body2">
                              {patientHeight && `${patientHeight} cm`}
                              {patientHeight && patientWeight && ' • '}
                              {patientWeight && `${patientWeight} kg`}
                              {patientHeight && patientWeight && (
                                <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
                                  (IMC: {((patientWeight / ((patientHeight / 100) ** 2))).toFixed(1)})
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Records Count */}
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <HistoryIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Historial
                          </Typography>
                          <Typography variant="body2">
                            {records.length} {records.length === 1 ? 'consulta' : 'consultas'}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Patient Profile Allergies (from profile, not records) */}
                {patientAllergies.length > 0 && (
                  <Card sx={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fef3c7' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon fontSize="small" color="warning" />
                        Alergias Conocidas (Perfil)
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {patientAllergies.map((allergy, index) => (
                          <Chip key={index} label={allergy} size="small" color="warning" variant="filled" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Medical Alerts from records */}
                {allAllergies.length > 0 && (
                  <Card sx={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fef3c7' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon fontSize="small" color="warning" />
                        Alergias Detectadas en Consultas
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {allAllergies.map((allergy, index) => (
                          <Chip key={index} label={allergy} size="small" color="warning" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Chronic Conditions */}
                {patientConditions.length > 0 && (
                  <Card sx={{ borderLeft: '4px solid #ef4444', backgroundColor: '#fee2e2' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MedicationIcon fontSize="small" color="error" />
                        Condiciones Crónicas
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {patientConditions.map((condition, index) => (
                          <Chip key={index} label={condition} size="small" color="error" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Current Medications from profile */}
                {patientMedications.length > 0 && (
                  <Card sx={{ borderLeft: '4px solid #3b82f6', backgroundColor: '#eff6ff' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MedicationIcon fontSize="small" color="info" />
                        Medicamentos Actuales (Perfil)
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {patientMedications.map((med, index) => (
                          <Chip key={index} label={med} size="small" color="info" variant="filled" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Current Medications from records */}
                {allMedications.length > 0 && (
                  <Card sx={{ borderLeft: '4px solid #3b82f6', backgroundColor: '#eff6ff' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MedicationIcon fontSize="small" color="info" />
                        Medicamentos en Consultas
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {allMedications.map((med, index) => (
                          <Chip key={index} label={med} size="small" color="info" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Previous Surgeries */}
                {patientSurgeries.length > 0 && (
                  <Card sx={{ borderLeft: '4px solid #8b5cf6', backgroundColor: '#f5f3ff' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon fontSize="small" color="secondary" />
                        Cirugías Previas
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {patientSurgeries.map((surgery, index) => (
                          <Chip key={index} label={surgery} size="small" color="secondary" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Emergency Contact */}
                {emergencyContact && (
                  <Card sx={{ borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="success" />
                        Contacto de Emergencia
                      </Typography>
                      <Box mt={1}>
                        <Typography variant="body2" fontWeight="600">
                          {emergencyContact.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {emergencyContact.relationship}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {emergencyContact.phone}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Address */}
                {patientAddress && (
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        Dirección
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {patientAddress}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Last Visit Info */}
                {lastRecord && (
                  <Card sx={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        Última Consulta
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {new Date(lastRecord.date).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                      {getLatestBMI() && (
                        <Box mt={1}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            IMC Actual
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {getLatestBMI()} kg/m²
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Grid>

            {/* Right - Medical History */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <HistoryIcon color="primary" />
                  <Typography variant="h5" fontWeight="600">
                    Historial Médico
                  </Typography>
                  <Chip label={`${records.length}`} size="small" />
                </Box>

                {records.length === 0 ? (
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <DescriptionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Sin registros médicos
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Crea la primera consulta para comenzar a llevar el historial médico
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/consultation/${id}`)}
                      >
                        Crear Primera Consulta
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Stack spacing={2}>
                    {records.map((record) => (
                      <Fade in timeout={300} key={record.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { 
                              boxShadow: 4, 
                              transform: 'translateY(-2px)',
                              backgroundColor: 'action.hover'
                            }, 
                            transition: 'all 0.3s'
                          }}
                          onClick={() => handleOpenModal(record)}
                        >
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                              <Box flex={1}>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {new Date(record.date).toLocaleDateString('es-MX', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(record.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • Dr. {record.doctorName}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                  {record.diagnosis}
                                </Typography>
                              </Box>
                              <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
                                {record.vitalSigns?.bloodPressure && (
                                  <Chip label={`PA: ${record.vitalSigns.bloodPressure}`} size="small" variant="outlined" />
                                )}
                                {record.vitalSigns?.heartRate && (
                                  <Chip label={`FC: ${record.vitalSigns.heartRate} bpm`} size="small" variant="outlined" />
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Fade>
                    ))}
                  </Stack>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Modal - Consulta Completa */}
          <Dialog 
            open={modalOpen} 
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="600">
                Consulta del {selectedRecord && new Date(selectedRecord.date).toLocaleDateString('es-MX')}
              </Typography>
              <Button 
                onClick={handleCloseModal}
                size="small"
                variant="outlined"
                startIcon={<CloseIcon />}
              >
                Cerrar
              </Button>
            </DialogTitle>

            <DialogContent sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
              {selectedRecord && (
                <Stack spacing={3}>
                  {/* Header Info */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(selectedRecord.date).toLocaleString('es-MX')} • Dr. {selectedRecord.doctorName}
                    </Typography>
                  </Box>

                  {/* Signos Vitales */}
                  {selectedRecord.vitalSigns && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        📊 Signos Vitales
                      </Typography>
                      <Grid container spacing={1}>
                        {selectedRecord.vitalSigns.bloodPressure && (
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">PA</Typography>
                              <Typography variant="body2" fontWeight="600">{selectedRecord.vitalSigns.bloodPressure}</Typography>
                            </Paper>
                          </Grid>
                        )}
                        {selectedRecord.vitalSigns.heartRate && (
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">FC</Typography>
                              <Typography variant="body2" fontWeight="600">{selectedRecord.vitalSigns.heartRate}</Typography>
                            </Paper>
                          </Grid>
                        )}
                        {selectedRecord.vitalSigns.temperature && (
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">Temp.</Typography>
                              <Typography variant="body2" fontWeight="600">{selectedRecord.vitalSigns.temperature}</Typography>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {/* Alergias */}
                  {selectedRecord.allergies && selectedRecord.allergies.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon fontSize="small" color="warning" />
                        Alergias
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {selectedRecord.allergies.map((allergy, index) => (
                          <Chip key={index} label={allergy} color="warning" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Medicamentos */}
                  {selectedRecord.currentMedications && selectedRecord.currentMedications.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MedicationIcon fontSize="small" color="info" />
                        Medicamentos
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {selectedRecord.currentMedications.map((med, index) => (
                          <Chip key={index} label={med} color="info" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Diagnosis */}
                  {!editMode ? (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        🔍 Diagnóstico
                      </Typography>
                      <Typography variant="body2" sx={{ p: 1.5, backgroundColor: 'background.default', borderRadius: 1, whiteSpace: 'pre-line' }}>
                        {selectedRecord.diagnosis}
                      </Typography>
                    </Box>
                  ) : (
                    <TextField
                      fullWidth
                      label="Diagnóstico"
                      multiline
                      rows={3}
                      value={editData?.diagnosis || ''}
                      onChange={(e) => setEditData({ ...editData, diagnosis: e.target.value })}
                      variant="outlined"
                    />
                  )}

                  {/* Prescription */}
                  {!editMode ? (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        💊 Indicaciones y Tratamiento
                      </Typography>
                      <Typography variant="body2" sx={{ p: 1.5, backgroundColor: 'background.default', borderRadius: 1, whiteSpace: 'pre-line' }}>
                        {selectedRecord.prescription}
                      </Typography>
                    </Box>
                  ) : (
                    <TextField
                      fullWidth
                      label="Indicaciones"
                      multiline
                      rows={3}
                      value={editData?.prescription || ''}
                      onChange={(e) => setEditData({ ...editData, prescription: e.target.value })}
                      variant="outlined"
                    />
                  )}

                  {/* Notes */}
                  {selectedRecord.notes && (
                    !editMode ? (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                          📝 Notas Adicionales
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ p: 1.5, backgroundColor: 'background.default', borderRadius: 1, whiteSpace: 'pre-line' }}>
                          {selectedRecord.notes}
                        </Typography>
                      </Box>
                    ) : (
                      <TextField
                        fullWidth
                        label="Notas"
                        multiline
                        rows={2}
                        value={editData?.notes || ''}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        variant="outlined"
                      />
                    )
                  )}
                </Stack>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
              {!editMode ? (
                <>
                  <Button onClick={handleCloseModal}>Cerrar</Button>
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Editar
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setEditMode(false)}
                    disabled={savingEdit}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                  >
                    {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Layout>
  );
};

export default PatientDetails;
