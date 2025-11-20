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
  TextField,
  Alert,
  IconButton,
  Avatar,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Badge
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  subscribeToPatientRecords, 
  getPatientById,
  type MedicalRecord,
  updateMedicalRecord,
  getMedicalHistory,
  createMedicalHistory,
  type MedicalHistory
} from '@/services/firestore';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import { logger } from '@/services/logger';
import { MedicalHistoryForm } from '@/components/medical-history';

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();

  const [patient, setPatient] = useState<Record<string, unknown> | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<MedicalRecord> | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Estados para Historia Clínica
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Estados para modal de información del paciente
  const [patientInfoOpen, setPatientInfoOpen] = useState(false);
  const [medicalAlertsExpanded, setMedicalAlertsExpanded] = useState(true);

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

        // Cargar historia clínica
        setLoadingHistory(true);
        const history = await getMedicalHistory(id);
        setMedicalHistory(history);
        setLoadingHistory(false);
      } catch (error) {
        logger.error("Error fetching patient", 'PatientDetails', error);
        setLoadingHistory(false);
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

  const handleSaveMedicalHistory = async (historyData: Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!id || !user) return;

    try {
      const historyToSave = {
        ...historyData,
        doctorId: user.uid,
        doctorName: user.displayName || user.email || 'Doctor',
      };

      await createMedicalHistory(historyToSave);
      showSuccess('Historia clínica guardada exitosamente');
      logger.info('Medical history created', 'PatientDetails', { patientId: id });
      
      // Recargar la historia clínica
      const updatedHistory = await getMedicalHistory(id);
      setMedicalHistory(updatedHistory);
      setShowHistoryForm(false);
    } catch (error) {
      logger.error('Error saving medical history', 'PatientDetails', error);
      showError('Error al guardar la historia clínica');
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
          {/* Header Mejorado */}
          <Box mb={4}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Button
                onClick={() => navigate('/doctor-dashboard')}
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                size="large"
              >
                Volver
              </Button>
              
              <Box flex={1} />
              
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={() => setShowHistoryForm(true)}
                size="large"
                color={medicalHistory ? "primary" : "warning"}
              >
                {medicalHistory ? 'Ver Historia Clínica' : 'Crear Historia'}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  if (!medicalHistory) {
                    showError('Debe crear la Historia Clínica antes de registrar consultas');
                    setShowHistoryForm(true);
                  } else {
                    navigate(`/consultation/${id}`);
                  }
                }}
                size="large"
                disabled={!medicalHistory}
              >
                Nueva Consulta
              </Button>
            </Stack>

            {/* Card de Paciente Compacta */}
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'white',
                      color: '#667eea',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      boxShadow: 3
                    }}
                  >
                    {patientName.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Box flex={1}>
                    <Typography variant="h4" fontWeight="700" color="white" gutterBottom>
                      {patientName}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      <Chip 
                        label={`${records.length} consultas`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                      />
                      {calculateAge(patientBirthDate) !== null && (
                        <Chip 
                          label={`${calculateAge(patientBirthDate)} años`}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                        />
                      )}
                      {patientGender && (
                        <Chip 
                          label={patientGender}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                        />
                      )}
                      {patientBloodType && (
                        <Chip 
                          label={patientBloodType}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 700 }}
                        />
                      )}
                    </Stack>
                  </Box>
                  
                  <Button
                    variant="contained"
                    startIcon={<InfoOutlinedIcon />}
                    onClick={() => setPatientInfoOpen(true)}
                    size="large"
                    sx={{
                      bgcolor: 'white',
                      color: '#667eea',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    Ver Información
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Alerta si no tiene historia clínica */}
            {!medicalHistory && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600">
                  Este paciente aún no tiene Historia Clínica completa
                </Typography>
                <Typography variant="body2">
                  Complete la Historia Clínica antes de registrar consultas médicas.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Alertas Médicas Colapsables */}
          {(patientAllergies.length > 0 || patientConditions.length > 0 || allAllergies.length > 0) && (
            <Card sx={{ mb: 3, borderRadius: 2, border: '2px solid #fbbf24' }}>
              <CardContent>
                <Box 
                  onClick={() => setMedicalAlertsExpanded(!medicalAlertsExpanded)}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="h6" fontWeight="600" color="warning.main">
                    Alertas Médicas Importantes
                  </Typography>
                  <IconButton size="small">
                    {medicalAlertsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                
                <Collapse in={medicalAlertsExpanded}>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {/* Alergias del perfil */}
                    {patientAllergies.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                          Alergias Conocidas
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {patientAllergies.map((allergy, index) => (
                            <Chip key={index} label={allergy} color="warning" size="medium" />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Alergias de consultas */}
                    {allAllergies.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                          Alergias Registradas en Consultas
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {allAllergies.map((allergy, index) => (
                            <Chip key={index} label={allergy} color="warning" variant="outlined" size="medium" />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Condiciones crónicas */}
                    {patientConditions.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                          Condiciones Crónicas
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {patientConditions.map((condition, index) => (
                            <Chip key={index} label={condition} color="error" size="medium" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Collapse>
              </CardContent>
            </Card>
          )}

          {/* Historial Médico */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Historial de Consultas
              </Typography>

              {records.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <AssignmentIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Sin consultas registradas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Registre la primera consulta para comenzar el historial médico
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      if (!medicalHistory) {
                        showError('Debe crear la Historia Clínica primero');
                        setShowHistoryForm(true);
                      } else {
                        navigate(`/consultation/${id}`);
                      }
                    }}
                    size="large"
                    disabled={!medicalHistory}
                  >
                    Crear Primera Consulta
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {records.map((record) => (
                    <Fade in timeout={300} key={record.id}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          '&:hover': { 
                            borderColor: 'primary.main',
                            boxShadow: 2
                          }, 
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleOpenModal(record)}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Box
                              sx={{
                                minWidth: 60,
                                height: 60,
                                borderRadius: 2,
                                bgcolor: 'primary.main',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                              }}
                            >
                              <Typography variant="h6">
                                {new Date(record.date).getDate()}
                              </Typography>
                              <Typography variant="caption">
                                {new Date(record.date).toLocaleDateString('es-MX', { month: 'short' })}
                              </Typography>
                            </Box>
                            
                            <Box flex={1}>
                              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                {new Date(record.date).toLocaleDateString('es-MX', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Dr. {record.doctorName}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  mt: 1,
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  display: '-webkit-box', 
                                  WebkitLineClamp: 2, 
                                  WebkitBoxOrient: 'vertical' 
                                }}
                              >
                                {record.diagnosis}
                              </Typography>
                            </Box>
                            
                            <Stack spacing={1}>
                              {record.vitalSigns?.bloodPressure && (
                                <Chip 
                                  label={`${record.vitalSigns.bloodPressure}`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                              {record.vitalSigns?.heartRate && (
                                <Chip 
                                  label={`${record.vitalSigns.heartRate} bpm`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Fade>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Modal - Información del Paciente */}
          <Dialog
            open={patientInfoOpen}
            onClose={() => setPatientInfoOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {patientName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {patientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Información del Paciente
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setPatientInfoOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Información Personal */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom color="primary">
                    Información Personal
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={patientEmail}
                      />
                    </ListItem>
                    {patientPhone && (
                      <ListItem>
                        <ListItemText
                          primary="Teléfono"
                          secondary={patientPhone}
                        />
                      </ListItem>
                    )}
                    {calculateAge(patientBirthDate) !== null && (
                      <ListItem>
                        <ListItemText
                          primary="Edad"
                          secondary={`${calculateAge(patientBirthDate)} años`}
                        />
                      </ListItem>
                    )}
                    {patientGender && (
                      <ListItem>
                        <ListItemText
                          primary="Género"
                          secondary={patientGender}
                        />
                      </ListItem>
                    )}
                    {patientAddress && (
                      <ListItem>
                        <ListItemText
                          primary="Dirección"
                          secondary={patientAddress}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>

                <Divider />

                {/* Información Médica */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom color="primary">
                    Información Médica
                  </Typography>
                  <List dense>
                    {patientBloodType && (
                      <ListItem>
                        <ListItemText
                          primary="Tipo de Sangre"
                          secondary={
                            <Chip 
                              label={patientBloodType} 
                              size="small" 
                              color="error"
                              sx={{ fontWeight: 700 }}
                            />
                          }
                        />
                      </ListItem>
                    )}
                    {(patientHeight || patientWeight) && (
                      <>
                        {patientHeight && (
                          <ListItem>
                            <ListItemText
                              primary="Altura"
                              secondary={`${patientHeight} cm`}
                            />
                          </ListItem>
                        )}
                        {patientWeight && (
                          <ListItem>
                            <ListItemText
                              primary="Peso"
                              secondary={`${patientWeight} kg`}
                            />
                          </ListItem>
                        )}
                        {patientHeight && patientWeight && (
                          <ListItem>
                            <ListItemText
                              primary="IMC"
                              secondary={`${((patientWeight / ((patientHeight / 100) ** 2))).toFixed(1)} kg/m²`}
                            />
                          </ListItem>
                        )}
                      </>
                    )}
                    <ListItem>
                      <ListItemText
                        primary="Consultas Registradas"
                        secondary={`${records.length} ${records.length === 1 ? 'consulta' : 'consultas'}`}
                      />
                    </ListItem>
                  </List>
                </Box>

                {/* Medicamentos */}
                {(patientMedications.length > 0 || allMedications.length > 0) && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom color="primary">
                        Medicamentos
                      </Typography>
                      {patientMedications.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Del Perfil:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {patientMedications.map((med, index) => (
                              <Chip key={index} label={med} size="small" color="info" />
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {allMedications.length > 0 && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            De Consultas:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {allMedications.map((med, index) => (
                              <Chip key={index} label={med} size="small" color="info" variant="outlined" />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {/* Cirugías */}
                {patientSurgeries.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom color="primary">
                        Cirugías Previas
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {patientSurgeries.map((surgery, index) => (
                          <Chip key={index} label={surgery} size="small" color="secondary" />
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}

                {/* Contacto de Emergencia */}
                {emergencyContact && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom color="primary">
                        Contacto de Emergencia
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Nombre"
                            secondary={emergencyContact.name}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Relación"
                            secondary={emergencyContact.relationship}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Teléfono"
                            secondary={emergencyContact.phone}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </>
                )}

                {/* Última Consulta */}
                {lastRecord && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom color="primary">
                        Última Consulta
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(lastRecord.date).toLocaleDateString('es-MX', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                      {getLatestBMI() && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          IMC en última consulta: <strong>{getLatestBMI()} kg/m²</strong>
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPatientInfoOpen(false)} variant="contained">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal - Consulta Completa */}
          <Dialog 
            open={modalOpen} 
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight="600">
                  Consulta del {selectedRecord && new Date(selectedRecord.date).toLocaleDateString('es-MX')}
                </Typography>
                <IconButton onClick={handleCloseModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ mt: 1 }}>
              {selectedRecord && (
                <Stack spacing={3}>
                  {/* Header Info */}
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(selectedRecord.date).toLocaleString('es-MX')}
                    </Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                      Dr. {selectedRecord.doctorName}
                    </Typography>
                  </Paper>

                  {/* Signos Vitales */}
                  {selectedRecord.vitalSigns && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        Signos Vitales
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedRecord.vitalSigns.bloodPressure && (
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Presión Arterial
                              </Typography>
                              <Typography variant="h6" fontWeight="600" color="primary">
                                {selectedRecord.vitalSigns.bloodPressure}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                        {selectedRecord.vitalSigns.heartRate && (
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Frecuencia Cardíaca
                              </Typography>
                              <Typography variant="h6" fontWeight="600" color="primary">
                                {selectedRecord.vitalSigns.heartRate}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                        {selectedRecord.vitalSigns.temperature && (
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Temperatura
                              </Typography>
                              <Typography variant="h6" fontWeight="600" color="primary">
                                {selectedRecord.vitalSigns.temperature}°C
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                        {selectedRecord.vitalSigns.weight && (
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Peso
                              </Typography>
                              <Typography variant="h6" fontWeight="600" color="primary">
                                {selectedRecord.vitalSigns.weight} kg
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                        {selectedRecord.vitalSigns.height && (
                          <Grid size={{ xs: 6, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Altura
                              </Typography>
                              <Typography variant="h6" fontWeight="600" color="primary">
                                {selectedRecord.vitalSigns.height} cm
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {/* Alergias */}
                  {selectedRecord.allergies && selectedRecord.allergies.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom color="warning.main">
                        Alergias Reportadas
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedRecord.allergies.map((allergy, index) => (
                          <Chip key={index} label={allergy} color="warning" size="medium" />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Medicamentos */}
                  {selectedRecord.currentMedications && selectedRecord.currentMedications.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom color="info.main">
                        Medicamentos Actuales
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedRecord.currentMedications.map((med, index) => (
                          <Chip key={index} label={med} color="info" size="medium" />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  {/* Diagnosis */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Diagnóstico
                    </Typography>
                    {!editMode ? (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {selectedRecord.diagnosis}
                        </Typography>
                      </Paper>
                    ) : (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editData?.diagnosis || ''}
                        onChange={(e) => setEditData({ ...editData, diagnosis: e.target.value })}
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Prescription */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Indicaciones y Tratamiento
                    </Typography>
                    {!editMode ? (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {selectedRecord.prescription}
                        </Typography>
                      </Paper>
                    ) : (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editData?.prescription || ''}
                        onChange={(e) => setEditData({ ...editData, prescription: e.target.value })}
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Notes */}
                  {(selectedRecord.notes || editMode) && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        Notas Adicionales
                      </Typography>
                      {!editMode ? (
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                            {selectedRecord.notes || 'Sin notas adicionales'}
                          </Typography>
                        </Paper>
                      ) : (
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={editData?.notes || ''}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  )}
                </Stack>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              {!editMode ? (
                <>
                  <Button onClick={handleCloseModal} size="large">
                    Cerrar
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    size="large"
                  >
                    Editar
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setEditMode(false)}
                    disabled={savingEdit}
                    size="large"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    size="large"
                  >
                    {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>

          {/* Dialog Historia Clínica */}
          <Dialog
            open={showHistoryForm}
            onClose={() => setShowHistoryForm(false)}
            maxWidth="lg"
            fullWidth
            scroll="paper"
          >
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <AssignmentIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="600">
                    {medicalHistory ? 'Historia Clínica' : 'Nueva Historia Clínica'}
                  </Typography>
                </Stack>
                <IconButton onClick={() => setShowHistoryForm(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              {loadingHistory ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <MedicalHistoryForm
                  patientId={id || ''}
                  patientName={patientName}
                  patientGender={patientGender as 'Masculino' | 'Femenino' | 'Otro' | undefined}
                  existingHistory={medicalHistory || undefined}
                  onSave={handleSaveMedicalHistory}
                  onCancel={() => setShowHistoryForm(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </Box>
      </Fade>
    </Layout>
  );
};

export default PatientDetails;
