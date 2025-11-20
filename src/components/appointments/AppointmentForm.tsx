import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import type { Appointment, FamilyMember } from '../../types';
import {
  getAvailableSlots,
  createAppointment,
  updateAppointment
} from '../../services/firestore';
import {
  getScheduleInfo,
  formatTime,
  isWeekend
} from '../../services/appointmentScheduler';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person';

interface AppointmentFormProps {
  userId: string;
  userName: string;
  familyMembers: FamilyMember[];
  editingAppointment?: Appointment | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const AppointmentForm = ({
  userId,
  userName,
  familyMembers,
  editingAppointment,
  onSuccess,
  onCancel
}: AppointmentFormProps) => {
  const [selectedPatient, setSelectedPatient] = useState<'self' | string>('self');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [scheduleInfo, setScheduleInfo] = useState('');

  // Cargar datos si es edición
  useEffect(() => {
    if (editingAppointment) {
      setDate(editingAppointment.date);
      setTime(editingAppointment.time);
      setReason(editingAppointment.reason);
      
      // Detectar si es el usuario o un familiar
      if (editingAppointment.patientName === userName) {
        setSelectedPatient('self');
      } else {
        const member = familyMembers.find(m => m.name === editingAppointment.patientName);
        if (member) {
          setSelectedPatient(member.id);
        }
      }
    }
  }, [editingAppointment, userName, familyMembers]);

  useEffect(() => {
    if (date) {
      setScheduleInfo(getScheduleInfo(date));
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setTime('');
      setScheduleInfo('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    setError('');
    try {
      const slots = await getAvailableSlots(date);
      
      // Si estamos editando, incluir el horario actual como disponible
      if (editingAppointment && editingAppointment.date === date) {
        if (!slots.includes(editingAppointment.time)) {
          slots.push(editingAppointment.time);
          slots.sort();
        }
      }
      
      setAvailableSlots(slots);
      
      if (slots.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
        setTime('');
      } else if (editingAppointment && editingAppointment.date === date) {
        // Mantener el horario actual si estamos editando
        setTime(editingAppointment.time);
      } else {
        setTime('');
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
    maxDate.setMonth(maxDate.getMonth() + 3);
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
      // Determinar el nombre del paciente
      let patientName = userName;
      if (selectedPatient !== 'self') {
        const member = familyMembers.find(m => m.id === selectedPatient);
        if (member) {
          patientName = member.name;
        }
      }

      if (editingAppointment) {
        // Editar cita existente
        await updateAppointment(
          editingAppointment.id,
          date,
          time,
          reason.trim()
        );
      } else {
        // Crear nueva cita
        await createAppointment(
          userId,
          patientName,
          date,
          time,
          reason.trim()
        );
      }

      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la cita';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isWeekendDate = date ? isWeekend(date) : false;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Selector de paciente */}
        <FormControl fullWidth>
          <InputLabel>¿Para quién es la cita?</InputLabel>
          <Select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            label="¿Para quién es la cita?"
            startAdornment={<PersonIcon sx={{ mr: 1, color: 'action.active' }} />}
            disabled={!!editingAppointment}
          >
            <MenuItem value="self">Para mí ({userName})</MenuItem>
            {familyMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name} ({member.relationship})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider />

        {/* Fecha */}
        <Box>
          <TextField
            label="Fecha"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: getTodayDate(),
              max: getMaxDate()
            }}
            InputProps={{
              startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
          
          {scheduleInfo && (
            <Paper
              elevation={0}
              sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: isWeekendDate ? 'info.lighter' : 'success.lighter',
                border: 1,
                borderColor: isWeekendDate ? 'info.main' : 'success.main'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <InfoOutlinedIcon 
                  fontSize="small" 
                  sx={{ 
                    mt: 0.3,
                    color: isWeekendDate ? 'info.main' : 'success.main'
                  }} 
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {scheduleInfo}
                  </Typography>
                  {isWeekendDate && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Las citas de fin de semana requieren confirmación del doctor
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Horario */}
        <FormControl fullWidth disabled={!date || loadingSlots}>
          <InputLabel>Horario</InputLabel>
          <Select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            label="Horario"
            startAdornment={<AccessTimeIcon sx={{ mr: 1, color: 'action.active' }} />}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300
                }
              }
            }}
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
                  {formatTime(slot)}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Motivo */}
        <TextField
          label="Motivo de la consulta"
          multiline
          rows={4}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe brevemente el motivo de tu consulta (mínimo 10 caracteres)"
          helperText={`${reason.length}/10 caracteres mínimos`}
        />

        {/* Botones */}
        <Stack direction="row" spacing={2}>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              fullWidth
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !date || !time || !reason.trim() || reason.trim().length < 10}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Procesando...
              </>
            ) : editingAppointment ? (
              'Actualizar cita'
            ) : (
              'Agendar cita'
            )}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AppointmentForm;
