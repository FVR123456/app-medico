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
  IconButton
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

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // Estados principales
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
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
      <Fade in timeout={500}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Button
              onClick={() => navigate('/patient-dashboard')}
              startIcon={<ArrowBackIcon />}
            >
              Volver al Dashboard
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => setShowAddFamilyDialog(true)}
            >
              Agregar Familiar
            </Button>
          </Stack>

          <Card sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                <Tab label="Mis Citas" />
                <Tab label="Nueva Cita" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {/* Pestaña de Mis Citas */}
              {tabValue === 0 && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="600">
                      Tus Citas Médicas
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleNewAppointment}
                    >
                      Nueva Cita
                    </Button>
                  </Stack>

                  {success && (
                    <Box sx={{ mb: 3 }}>
                      <Card sx={{ bgcolor: 'success.lighter', border: 1, borderColor: 'success.main' }}>
                        <CardContent>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <CheckCircleOutlineIcon color="success" />
                            <Typography>
                              Operación completada exitosamente
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Box>
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
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                    Agendar Nueva Cita
                  </Typography>

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
          </Card>

          {/* Dialog para formulario de cita (cuando se edita desde la lista) */}
          <Dialog
            open={showFormDialog}
            onClose={handleCloseFormDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="600">
                  {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
                </Typography>
                <IconButton onClick={handleCloseFormDialog} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {user && (
                <Box sx={{ pt: 1 }}>
                  <AppointmentForm
                    userId={user.uid}
                    userName={user.displayName || 'Usuario'}
                    familyMembers={familyMembers}
                    editingAppointment={editingAppointment}
                    onSuccess={handleFormSuccess}
                    onCancel={handleCloseFormDialog}
                  />
                </Box>
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
    </Layout>
  );
};

export default BookAppointment;
