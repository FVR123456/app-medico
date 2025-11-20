import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ConfirmDialog from '@/components/ConfirmDialog';
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
  Divider, 
  Stack
} from '@mui/material';
import type { ChipPropsColorOverrides } from "@mui/material/Chip";
import type { OverridableStringUnion } from "@mui/types";
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { subscribeToAppointments, updateAppointmentStatus, type Appointment } from '@/services/firestore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { logger } from '@/services/logger';

const AppointmentManager = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appointmentId: string;
    action: 'accepted' | 'rejected';
    patientName: string;
  }>({
    open: false,
    appointmentId: '',
    action: 'accepted',
    patientName: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToAppointments(user.uid, 'doctor', (data) => {
      setAppointments(data);
      logger.debug(`Loaded ${data.length} appointments`, 'AppointmentManager');
    });

    return () => unsubscribe();
  }, [user]);

  const handleStatusUpdateRequest = (
    id: string, 
    status: 'accepted' | 'rejected',
    patientName: string
  ) => {
    setConfirmDialog({
      open: true,
      appointmentId: id,
      action: status,
      patientName
    });
  };

  const handleConfirmStatusUpdate = async () => {
    setActionLoading(true);
    try {
      await updateAppointmentStatus(
        confirmDialog.appointmentId, 
        confirmDialog.action
      );
      
      const actionText = confirmDialog.action === 'accepted' ? 'aceptada' : 'rechazada';
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

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout title="Gestión de Citas">
      <Fade in timeout={500}>
        <Box>
          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <PendingIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{pendingCount}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Pendientes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{acceptedCount}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Aceptadas</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <CancelIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{rejectedCount}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Rechazadas</Typography>
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
                    <Card sx={{ height: '100%', position: 'relative' }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" fontWeight="600">
                            {apt.patientName}
                          </Typography>
                          <Chip
                            label={getStatusLabel(apt.status)}
                            color={getStatusColor(apt.status)}
                            size="small"
                          />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={1.5}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              📅 Fecha
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {formatDate(apt.date)}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              🕐 Hora
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {apt.time}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              💬 Motivo
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {apt.reason}
                            </Typography>
                          </Box>
                        </Stack>

                        {apt.status === 'pending' && (
                          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              fullWidth
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleStatusUpdateRequest(apt.id, 'accepted', apt.patientName)}
                            >
                              Aceptar
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              fullWidth
                              startIcon={<CancelIcon />}
                              onClick={() => handleStatusUpdateRequest(apt.id, 'rejected', apt.patientName)}
                            >
                              Rechazar
                            </Button>
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.action === 'accepted' ? 'Aceptar Cita' : 'Rechazar Cita'}
        message={`¿Estás seguro que deseas ${confirmDialog.action === 'accepted' ? 'aceptar' : 'rechazar'} la cita de ${confirmDialog.patientName}?`}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        confirmText={confirmDialog.action === 'accepted' ? 'Aceptar Cita' : 'Rechazar Cita'}
        type={confirmDialog.action === 'accepted' ? 'success' : 'warning'}
        loading={actionLoading}
      />
    </Layout>
  );
};

export default AppointmentManager;

