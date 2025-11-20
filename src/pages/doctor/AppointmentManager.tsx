import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ConfirmDialog from '@/components/ConfirmDialog';
import DoctorAppointmentCard from '@/components/appointments/DoctorAppointmentCard';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Box, 
  Grid, 
  Tabs, 
  Tab, 
  Fade, 
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { 
  subscribeToAppointments, 
  updateAppointmentStatus,
  getPatientProfile,
  type Appointment,
  type FamilyMember
} from '@/services/firestore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CloseIcon from '@mui/icons-material/Close';
import { logger } from '@/services/logger';

const AppointmentManager = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appointmentId: string;
    action: 'accepted' | 'rejected' | 'cancelled';
    patientName: string;
  }>({
    open: false,
    appointmentId: '',
    action: 'accepted',
    patientName: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToAppointments(user.uid, 'doctor', (data) => {
      setAppointments(data);
      logger.debug(`Loaded ${data.length} appointments`, 'AppointmentManager');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAccept = (id: string, patientName: string) => {
    setConfirmDialog({
      open: true,
      appointmentId: id,
      action: 'accepted',
      patientName
    });
  };

  const handleReject = (id: string, patientName: string) => {
    setConfirmDialog({
      open: true,
      appointmentId: id,
      action: 'rejected',
      patientName
    });
  };

  const handleCancel = (id: string, patientName: string) => {
    setConfirmDialog({
      open: true,
      appointmentId: id,
      action: 'cancelled',
      patientName
    });
  };

  const handleEdit = async (appointment: Appointment) => {
    // Cargar familiares del paciente si es necesario
    try {
      const profile = await getPatientProfile(appointment.patientId);
      if (profile?.familyMembers) {
        setFamilyMembers(profile.familyMembers);
      }
    } catch (error) {
      console.error('Error loading patient profile:', error);
    }
    
    setEditingAppointment(appointment);
    setShowEditDialog(true);
  };

  const handleConfirmStatusUpdate = async () => {
    setActionLoading(true);
    try {
      await updateAppointmentStatus(
        confirmDialog.appointmentId, 
        confirmDialog.action
      );
      
      const actionText = 
        confirmDialog.action === 'accepted' ? 'aceptada' : 
        confirmDialog.action === 'rejected' ? 'rechazada' : 'cancelada';
      showSuccess(`Cita ${actionText} exitosamente`);
      logger.info(`Appointment ${confirmDialog.action}`, 'AppointmentManager', { id: confirmDialog.appointmentId });
    } catch (error) {
      logger.error("Error updating status", 'AppointmentManager', error);
      showError('Error al actualizar la cita');
    } finally {
      setActionLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingAppointment(null);
    showSuccess('Cita reagendada exitosamente');
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditingAppointment(null);
  };

  const getStatusColor = (
    status: string
  ): OverridableStringUnion<
    "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning",
    ChipPropsColorOverrides
  > => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'cancelled': return 'Cancelada';
      default: return 'Pendiente';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const acceptedCount = appointments.filter(apt => apt.status === 'accepted').length;
  const rejectedCount = appointments.filter(apt => apt.status === 'rejected').length;
  
  // Separar citas de fin de semana que requieren aprobación
  const weekendPendingCount = appointments.filter(
    apt => apt.status === 'pending' && apt.requiresApproval
  ).length;

  return (
    <Layout title="Gestión de Citas">
      <Fade in timeout={500}>
        <Box>
          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <PendingIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{pendingCount}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Pendientes</Typography>
                  {weekendPendingCount > 0 && (
                    <Chip
                      size="small"
                      label={`${weekendPendingCount} fin de semana`}
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{acceptedCount}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Aceptadas</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <CancelIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{rejectedCount}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Rechazadas</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <EventNoteIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{appointments.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filter Tabs */}
          <Card sx={{ mb: 3 }}>
            <Tabs
              value={filter}
              onChange={(_, newValue) => setFilter(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={`Todas (${appointments.length})`} value="all" />
              <Tab label={`Pendientes (${pendingCount})`} value="pending" />
              <Tab label={`Aceptadas (${acceptedCount})`} value="accepted" />
              <Tab label={`Rechazadas (${rejectedCount})`} value="rejected" />
            </Tabs>
          </Card>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <EventNoteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No hay citas {filter !== 'all' ? getStatusLabel(filter).toLowerCase() : 'registradas'}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredAppointments.map((apt) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={apt.id}>
                  <Fade in timeout={300}>
                    <Box>
                      <DoctorAppointmentCard
                        appointment={apt}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onCancel={handleCancel}
                        onEdit={handleEdit}
                      />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>

      {/* Dialog para reagendar */}
      <Dialog
        open={showEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600">
              Reagendar Cita
            </Typography>
            <IconButton onClick={handleCloseEditDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {editingAppointment && (
            <Box sx={{ pt: 1 }}>
              <AppointmentForm
                userId={editingAppointment.patientId}
                userName={editingAppointment.patientName}
                familyMembers={familyMembers}
                editingAppointment={editingAppointment}
                onSuccess={handleEditSuccess}
                onCancel={handleCloseEditDialog}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={
          confirmDialog.action === 'accepted' ? 'Aceptar Cita' : 
          confirmDialog.action === 'rejected' ? 'Rechazar Cita' : 'Cancelar Cita'
        }
        message={
          confirmDialog.action === 'accepted' 
            ? `¿Estás seguro que deseas aceptar la cita de ${confirmDialog.patientName}?`
            : confirmDialog.action === 'rejected'
            ? `¿Estás seguro que deseas rechazar la cita de ${confirmDialog.patientName}?`
            : `¿Estás seguro que deseas cancelar la cita de ${confirmDialog.patientName}?`
        }
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        confirmText={
          confirmDialog.action === 'accepted' ? 'Aceptar Cita' : 
          confirmDialog.action === 'rejected' ? 'Rechazar Cita' : 'Cancelar Cita'
        }
        type={
          confirmDialog.action === 'accepted' ? 'success' : 'warning'
        }
        loading={actionLoading}
      />
    </Layout>
  );
};

export default AppointmentManager;

