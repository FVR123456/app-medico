import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import type { Appointment } from '../../types';
import { formatDate, formatTime } from '../../services/appointmentScheduler';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
}

const AppointmentList = ({ appointments, onEdit, onCancel }: AppointmentListProps) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  const handleCancel = async (appointmentId: string) => {
    setCancellingId(appointmentId);
    try {
      await onCancel(appointmentId);
    } finally {
      setCancellingId(null);
    }
  };

  const canEdit = (appointment: Appointment) => {
    return appointment.status === 'pending' || appointment.status === 'accepted';
  };

  const canCancel = (appointment: Appointment) => {
    return appointment.status !== 'cancelled' && appointment.status !== 'rejected';
  };

  if (appointments.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2
        }}
      >
        <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No tienes citas agendadas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Agenda tu primera cita para comenzar
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {appointments.map((appointment) => (
        <Card
          key={appointment.id}
          sx={{
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={getStatusLabel(appointment.status)}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                  {appointment.requiresApproval && appointment.status === 'pending' && (
                    <Tooltip title="Cita de fin de semana - Requiere aprobación del doctor">
                      <Chip
                        icon={<InfoOutlinedIcon />}
                        label="Requiere aprobación"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <Typography variant="h6" component="div" gutterBottom>
                  {appointment.patientName}
                </Typography>
              </Box>

              {canEdit(appointment) && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Editar cita">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(appointment)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {canCancel(appointment) && (
                    <Tooltip title="Cancelar cita">
                      <IconButton
                        size="small"
                        onClick={() => handleCancel(appointment.id)}
                        color="error"
                        disabled={cancellingId === appointment.id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(appointment.date)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatTime(appointment.time)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <DescriptionIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Motivo:
                  </Typography>
                  <Typography variant="body2">
                    {appointment.reason}
                  </Typography>
                </Box>
              </Box>

              {appointment.doctorNotes && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Notas del doctor:
                  </Typography>
                  <Typography variant="body2">
                    {appointment.doctorNotes}
                  </Typography>
                </Box>
              )}
            </Stack>

            {canCancel(appointment) && appointment.status !== 'cancelled' && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleCancel(appointment.id)}
                  disabled={cancellingId === appointment.id}
                  fullWidth
                >
                  {cancellingId === appointment.id ? 'Cancelando...' : 'Cancelar cita'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default AppointmentList;
