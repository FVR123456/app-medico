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
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import type { Appointment } from '../../types';
import { formatDate, formatTime } from '../../services/appointmentScheduler';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';

interface DoctorAppointmentCardProps {
  appointment: Appointment;
  onAccept: (id: string, patientName: string) => void;
  onReject: (id: string, patientName: string) => void;
  onCancel: (id: string, patientName: string) => void;
  onEdit: (appointment: Appointment) => void;
}

const DoctorAppointmentCard = ({
  appointment,
  onAccept,
  onReject,
  onCancel,
  onEdit
}: DoctorAppointmentCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  const canModify = appointment.status !== 'cancelled' && appointment.status !== 'rejected';
  const isPending = appointment.status === 'pending';
  const isAccepted = appointment.status === 'accepted';

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        },
        ...(appointment.requiresApproval && appointment.status === 'pending' && {
          borderLeft: 4,
          borderColor: 'info.main'
        })
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" fontWeight="600">
            {appointment.patientName}
          </Typography>
          
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              label={getStatusLabel(appointment.status)}
              color={getStatusColor(appointment.status)}
              size="small"
            />
            {appointment.requiresApproval && appointment.status === 'pending' && (
              <Tooltip title="Cita de fin de semana - Requiere tu aprobación">
                <InfoOutlinedIcon color="info" fontSize="small" />
              </Tooltip>
            )}
            {canModify && (
              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{ ml: 0.5 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Fecha
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {formatDate(appointment.date)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Hora
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {formatTime(appointment.time)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <DescriptionIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Motivo
              </Typography>
              <Typography variant="body2">
                {appointment.reason}
              </Typography>
            </Box>
          </Box>

          {appointment.requiresApproval && appointment.status === 'pending' && (
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                bgcolor: 'info.lighter',
                borderRadius: 1,
                border: 1,
                borderColor: 'info.main'
              }}
            >
              <Typography variant="caption" color="info.dark" sx={{ fontWeight: 500 }}>
                Esta es una cita de fin de semana y requiere tu aprobación explícita
              </Typography>
            </Box>
          )}
        </Stack>

        {isPending && (
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              fullWidth
              startIcon={<CheckCircleIcon />}
              onClick={() => onAccept(appointment.id, appointment.patientName)}
            >
              Aceptar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              fullWidth
              startIcon={<CancelIcon />}
              onClick={() => onReject(appointment.id, appointment.patientName)}
            >
              Rechazar
            </Button>
          </Stack>
        )}

        {/* Menu de opciones */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {isAccepted && (
            <MenuItem
              onClick={() => {
                onEdit(appointment);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Reagendar</ListItemText>
            </MenuItem>
          )}
          
          {(isPending || isAccepted) && (
            <MenuItem
              onClick={() => {
                onCancel(appointment.id, appointment.patientName);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Cancelar cita</ListItemText>
            </MenuItem>
          )}

          {isPending && (
            <>
              <Divider />
              <MenuItem
                onClick={() => {
                  onReject(appointment.id, appointment.patientName);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <BlockIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Rechazar</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>
      </CardContent>
    </Card>
  );
};

export default DoctorAppointmentCard;
