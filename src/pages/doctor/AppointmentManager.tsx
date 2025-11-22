import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ConfirmDialog from '@/components/ConfirmDialog';
import DoctorAppointmentCard from '@/components/appointments/DoctorAppointmentCard';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { 
  Typography, 
  Card, 
  CardContent, 
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
  IconButton,
  Paper,
  useTheme,
  alpha
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
  const theme = useTheme();
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
          {/* Header */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4,
              background: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 3,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
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
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <EventNoteIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Gestión de Citas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administra las citas médicas de tus pacientes
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `2px solid ${alpha('#f59e0b', 0.2)}`,
                  background: alpha('#f59e0b', 0.08),
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha('#f59e0b', 0.2)}`,
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <PendingIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h4" fontWeight={700} color="#f59e0b">
                      {pendingCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Pendientes
                    </Typography>
                    {weekendPendingCount > 0 && (
                      <Chip
                        size="small"
                        label={`${weekendPendingCount} fin de semana`}
                        sx={{ 
                          mt: 0.5, 
                          bgcolor: alpha('#f59e0b', 0.2),
                          color: '#f59e0b',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `2px solid ${alpha('#10b981', 0.2)}`,
                  background: alpha('#10b981', 0.08),
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha('#10b981', 0.2)}`,
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h4" fontWeight={700} color="#10b981">
                      {acceptedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Aceptadas
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `2px solid ${alpha('#ef4444', 0.2)}`,
                  background: alpha('#ef4444', 0.08),
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha('#ef4444', 0.2)}`,
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h4" fontWeight={700} color="#ef4444">
                      {rejectedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Rechazadas
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  background: alpha(theme.palette.primary.main, 0.08),
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }
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
                    <EventNoteIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {appointments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Total
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Filter Tabs */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={filter}
              onChange={(_, newValue) => setFilter(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  minHeight: 56,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                }
              }}
            >
              <Tab label={`Todas (${appointments.length})`} value="all" />
              <Tab label={`Pendientes (${pendingCount})`} value="pending" />
              <Tab label={`Aceptadas (${acceptedCount})`} value="accepted" />
              <Tab label={`Rechazadas (${rejectedCount})`} value="rejected" />
            </Tabs>
          </Paper>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                textAlign: 'center', 
                py: 8,
                borderRadius: 3,
                border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                background: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <EventNoteIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                No hay citas {filter !== 'all' ? getStatusLabel(filter).toLowerCase() : 'registradas'}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Las citas aparecerán aquí cuando los pacientes las soliciten
              </Typography>
            </Paper>
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.primary.main,
                }}
              >
                <EventNoteIcon />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Reagendar Cita
              </Typography>
            </Box>
            <IconButton 
              onClick={handleCloseEditDialog} 
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.08),
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.15),
                }
              }}
            >
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

