import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AddFamilyMemberDialog from '../../components/AddFamilyMemberDialog';
import AppointmentList from '../../components/appointments/AppointmentList';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import { 
  Typography, 
  Button, 
  Box, 
  Fade, 
  Stack, 
  Card, 
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Container,
  Paper,
  alpha,
  useTheme,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  subscribeToAppointments,
  updateAppointmentStatus,
  getPatientProfile,
  addFamilyMember,
  type FamilyMember,
  type Appointment
} from '../../services/firestore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';

const BookAppointment = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // Estados principales
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [, setLoadingProfile] = useState(true);
  const [showAddFamilyDialog, setShowAddFamilyDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [success, setSuccess] = useState(false);

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

  // Suscribirse a las citas del usuario
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToAppointments(user.uid, 'patient', (data) => {
      setAppointments(data);
    });

    return () => unsubscribe();
  }, [user]);

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

  const handleFormSuccess = () => {
    setShowFormDialog(false);
    setEditingAppointment(null);
    setSuccess(true);
    
    const message = editingAppointment 
      ? 'Cita actualizada exitosamente' 
      : 'Cita solicitada exitosamente';
    showSuccess(message);
    
    setTimeout(() => {
      setSuccess(false);
      setTabValue(0); // Volver a la pestaña de citas
    }, 2000);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowFormDialog(true);
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'cancelled');
      showSuccess('Cita cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showError('Error al cancelar la cita');
    }
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setShowFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setShowFormDialog(false);
    setEditingAppointment(null);
  };

  return (
    <Layout title="Gestión de Citas">
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
                    <CalendarMonthIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="700" gutterBottom sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    Gestión de Citas Médicas
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                    Agenda, edita y gestiona todas tus citas médicas en un solo lugar
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setShowAddFamilyDialog(true)}
                    size="large"
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      }
                    }}
                  >
                    Agregar Familiar
                  </Button>
                </Paper>
              </Box>

              {/* Contenedor principal de citas */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: alpha(theme.palette.background.paper, 0.6),
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ borderBottom: 1, borderColor: 'divider', background: alpha(theme.palette.primary.main, 0.02) }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={(_, newValue) => setTabValue(newValue)}
                    sx={{
                      px: 2,
                      '& .MuiTab-root': {
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        minHeight: 64,
                      }
                    }}
                  >
                    <Tab 
                      icon={<EventNoteIcon />} 
                      iconPosition="start" 
                      label="Mis Citas" 
                    />
                    <Tab 
                      icon={<AddIcon />} 
                      iconPosition="start" 
                      label="Nueva Cita" 
                    />
                  </Tabs>
                </Box>

                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  {/* Pestaña de Mis Citas */}
                  {tabValue === 0 && (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                        <Box>
                          <Typography variant="h5" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              }}
                            />
                            Tus Citas Médicas
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Gestiona y visualiza todas tus citas programadas
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleNewAppointment}
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
                          Nueva Cita
                        </Button>
                      </Stack>

                      {success && (
                        <Fade in timeout={300}>
                          <Paper
                            elevation={0}
                            sx={{ 
                              mb: 3,
                              p: 3,
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.05)})`,
                              border: '2px solid',
                              borderColor: theme.palette.success.main,
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
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
                                <CheckCircleOutlineIcon sx={{ color: 'white', fontSize: 28 }} />
                              </Box>
                              <Box>
                                <Typography variant="h6" fontWeight="600" color="success.dark">
                                  ¡Operación Exitosa!
                                </Typography>
                                <Typography variant="body2" color="success.dark">
                                  La cita se ha procesado correctamente
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Fade>
                      )}

                      <AppointmentList
                        appointments={appointments}
                        onEdit={handleEdit}
                        onCancel={handleCancel}
                      />
                    </Box>
                  )}

                  {/* Pestaña de Nueva Cita */}
                  {tabValue === 1 && (
                    <Box>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }}
                          />
                          Agendar Nueva Cita
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completa el formulario para solicitar tu cita médica
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 4 }} />

                      {user && (
                        <AppointmentForm
                          userId={user.uid}
                          userName={user.displayName || 'Usuario'}
                          familyMembers={familyMembers}
                          onSuccess={handleFormSuccess}
                          onCancel={() => setTabValue(0)}
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
              </Paper>

              {/* Dialog para formulario de cita (cuando se edita desde la lista) */}
              <Dialog
            open={showFormDialog}
            onClose={handleCloseFormDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
              }
            }}
          >
            <DialogTitle sx={{ 
              pb: 1,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventNoteIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseFormDialog} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3 }}>
              {user && (
                <AppointmentForm
                  userId={user.uid}
                  userName={user.displayName || 'Usuario'}
                  familyMembers={familyMembers}
                  editingAppointment={editingAppointment}
                  onSuccess={handleFormSuccess}
                  onCancel={handleCloseFormDialog}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Dialog para agregar familiar */}
          <AddFamilyMemberDialog
            open={showAddFamilyDialog}
            onClose={() => setShowAddFamilyDialog(false)}
            onAdd={handleAddFamilyMember}
          />
            </Box>
          </Fade>
        </Container>
      </Box>
    </Layout>
  );
};

export default BookAppointment;
