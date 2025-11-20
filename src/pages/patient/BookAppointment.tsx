import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AddFamilyMemberDialog from '../../components/AddFamilyMemberDialog';
import { 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert, 
  Fade, 
  Stack, 
  Card, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  createAppointment, 
  getAvailableSlots, 
  getPatientProfile,
  addFamilyMember,
  type FamilyMember
} from '../../services/firestore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  // 🆕 Estados para multi-perfil familiar
  const [selectedPatient, setSelectedPatient] = useState<'self' | string>('self');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showAddFamilyDialog, setShowAddFamilyDialog] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Cargar perfil del usuario y sus familiares
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const profile = await getPatientProfile(user.uid);
        if (profile?.familyMembers) {
          setFamilyMembers(profile.familyMembers);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (date) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setTime('');
    }
  }, [date]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const slots = await getAvailableSlots(date);
      setAvailableSlots(slots);
      if (slots.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Error loading slots:', err);
      setError('Error al cargar horarios disponibles');
    } finally {
      setLoadingSlots(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !reason.trim()) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (reason.trim().length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (user) {
        // Determinar el nombre del paciente según selección
        let patientName = user.displayName || 'Paciente';
        if (selectedPatient !== 'self') {
          const member = familyMembers.find(m => m.id === selectedPatient);
          if (member) {
            patientName = member.name;
          }
        }

        await createAppointment(
          user.uid,  // userId siempre es el titular de la cuenta
          patientName,  // Nombre del paciente real (usuario o familiar)
          date,
          time,
          reason.trim()
        );
        setSuccess(true);
        showSuccess('Cita solicitada exitosamente');
        setTimeout(() => {
          navigate('/patient-dashboard');
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al agendar cita';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = async (member: Omit<FamilyMember, 'id'>) => {
    if (!user) return;
    
    try {
      await addFamilyMember(user.uid, member);
      showSuccess(`${member.name} agregado exitosamente`);
      
      // Recargar perfil para obtener el nuevo familiar
      const profile = await getPatientProfile(user.uid);
      if (profile?.familyMembers) {
        setFamilyMembers(profile.familyMembers);
      }
    } catch (err) {
      console.error('Error adding family member:', err);
      showError('Error al agregar familiar');
    }
  };

  if (success) {
    return (
      <Layout title="Cita Agendada">
        <Fade in timeout={500}>
          <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: 50, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                ¡Cita Solicitada!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Tu solicitud ha sido enviada al doctor. Recibirás una confirmación pronto.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirigiendo al dashboard...
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Layout>
    );
  }

  return (
    <Layout title="Agendar Cita">
      <Fade in timeout={500}>
        <Box>
          <Button
            onClick={() => navigate('/patient-dashboard')}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 3 }}
          >
            Volver al Dashboard
          </Button>

          <Card sx={{ maxWidth: 800, mx: 'auto' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Nueva Solicitud de Cita
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completa la información para solicitar tu consulta
                </Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* 🆕 Selector de Paciente (Usuario o Familiar) */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FamilyRestroomIcon fontSize="small" color="primary" />
                      ¿Para quién es la cita?
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        displayEmpty
                        disabled={loadingProfile}
                      >
                        <MenuItem value="self">
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon fontSize="small" />
                            <Typography>Para mí ({user?.displayName || 'Usuario'})</Typography>
                          </Box>
                        </MenuItem>
                        {familyMembers.length > 0 && (
                          <>
                            {familyMembers.map((member) => (
                              <MenuItem key={member.id} value={member.id}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <PersonIcon fontSize="small" />
                                  <Typography>{member.name}</Typography>
                                  <Chip label={member.relationship} size="small" variant="outlined" sx={{ ml: 1 }} />
                                </Box>
                              </MenuItem>
                            ))}
                          </>
                        )}
                      </Select>
                    </FormControl>
                    <Button
                      startIcon={<PersonAddIcon />}
                      onClick={() => setShowAddFamilyDialog(true)}
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Agregar Familiar
                    </Button>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon fontSize="small" color="primary" />
                      Fecha de la Cita
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      inputProps={{
                        min: getTodayDate(),
                        max: getMaxDate()
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Lun-Vie: 6:00 AM - 8:00 PM | Sáb: 8:00 AM - 2:00 PM | Dom: 10:00 AM - 2:00 PM
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="primary" />
                      Hora de la Cita
                    </Typography>
                    <FormControl fullWidth required disabled={!date || loadingSlots}>
                      <InputLabel>Selecciona un horario</InputLabel>
                      <Select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        label="Selecciona un horario"
                      >
                        {loadingSlots ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Cargando horarios...
                          </MenuItem>
                        ) : availableSlots.length === 0 ? (
                          <MenuItem disabled>No hay horarios disponibles</MenuItem>
                        ) : (
                          availableSlots.map((slot) => (
                            <MenuItem key={slot} value={slot}>
                              {slot}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                    {!date && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Selecciona primero una fecha
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NoteAddIcon fontSize="small" color="primary" />
                      Motivo de la Consulta
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      placeholder="Describe el motivo de tu consulta, síntomas o dudas... (mínimo 10 caracteres)"
                      helperText={`${reason.length} caracteres (mínimo 10)`}
                    />
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/patient-dashboard')}
                      disabled={loading}
                      fullWidth
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || loadingSlots || availableSlots.length === 0}
                      size="large"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      }}
                    >
                      {loading ? 'Enviando...' : 'Solicitar Cita'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Dialog para agregar familiar */}
          <AddFamilyMemberDialog
            open={showAddFamilyDialog}
            onClose={() => setShowAddFamilyDialog(false)}
            onAdd={handleAddFamilyMember}
          />
        </Box>
      </Fade>
    </Layout>
  );
};

export default BookAppointment;
