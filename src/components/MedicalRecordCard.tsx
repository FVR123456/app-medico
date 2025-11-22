import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Chip,
  Box,
  Typography,
  Stack,
  Fade,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  alpha,
  useTheme,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ScienceIcon from '@mui/icons-material/Science';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ScaleIcon from '@mui/icons-material/Scale';
import HeightIcon from '@mui/icons-material/Height';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import type { MedicalRecord } from '../services/firestore';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  editable?: boolean;
  onSave?: (updated: MedicalRecord) => void;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ record, editable = false, onSave }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(record);

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setForm(record);
  };
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
  };
  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => {
    setEditMode(false);
    setForm(record);
  };
  const handleChange = <K extends keyof MedicalRecord>(field: K, value: MedicalRecord[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleSave = () => {
    if (onSave) onSave(form);
    setEditMode(false);
    setOpen(false);
  };

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'bloodPressure': return <MonitorHeartIcon />;
      case 'heartRate': return <FavoriteIcon />;
      case 'temperature': return <ThermostatIcon />;
      case 'weight': return <ScaleIcon />;
      case 'height': return <HeightIcon />;
      default: return <MonitorHeartIcon />;
    }
  };

  // Card resumen mejorado con diseño 2025
  return (
    <>
      <Fade in timeout={300}>
        <Card 
          sx={{ 
            height: '100%',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: alpha(theme.palette.background.paper, 0.8),
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
              borderColor: theme.palette.primary.main,
            },
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
          <CardContent sx={{ p: 3 }}>
            {/* Header con fecha y hora */}
            <Box mb={2}>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                <Typography variant="body2" fontWeight="700" color="primary.main">
                  {new Date(record.date).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Stack>
              <Chip
                label="Consulta"
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Doctor info */}
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40
                }}
              >
                {record.doctorName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Atendido por
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  Dr. {record.doctorName}
                </Typography>
              </Box>
            </Stack>

            {/* Botón simple para abrir */}
            <Button 
              variant="text" 
              size="small" 
              fullWidth
              onClick={handleOpen}
              sx={{ 
                mt: 1,
                color: 'primary.main',
                fontWeight: 600,
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Ver detalles →
            </Button>
          </CardContent>
        </Card>
      </Fade>
      {/* Modal flotante mejorado */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar 
                sx={{ 
                  bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  width: 48,
                  height: 48
                }}
              >
                <AssignmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="700">
                  Detalles de la Consulta
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(record.date).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Diagnóstico */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: alpha(theme.palette.error.main, 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.2)
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="700"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: theme.palette.error.main }}
              >
                <LocalHospitalIcon />
                Diagnóstico
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {form.diagnosis}
              </Typography>
            </Paper>

            {/* Plan de Tratamiento */}
            {form.plan && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha(theme.palette.secondary.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.secondary.main, 0.2)
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="700"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: theme.palette.secondary.main }}
                >
                  <MedicalServicesIcon />
                  Plan de Tratamiento
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                  {form.plan}
                </Typography>
              </Paper>
            )}

            {/* Receta (legacy - solo si no hay plan) */}
            {form.prescription && !form.plan && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha(theme.palette.secondary.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.secondary.main, 0.2)
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="700"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: theme.palette.secondary.main }}
                >
                  <MedicationIcon />
                  Indicaciones / Receta
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                  {form.prescription}
                </Typography>
              </Paper>
            )}

            {/* Signos vitales al final */}
            {form.vitalSigns && Object.keys(form.vitalSigns).length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha(theme.palette.primary.main, 0.03),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mb: 2 }}>
                  📊 Signos Vitales
                </Typography>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  {form.vitalSigns.bloodPressure && (
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: alpha(theme.palette.error.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <MonitorHeartIcon sx={{ color: theme.palette.error.main }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Presión Arterial</Typography>
                          <Typography variant="body1" fontWeight="700">{form.vitalSigns.bloodPressure}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}
                  {form.vitalSigns.heartRate && (
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: alpha(theme.palette.error.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FavoriteIcon sx={{ color: theme.palette.error.main }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Frecuencia Cardíaca</Typography>
                          <Typography variant="body1" fontWeight="700">{form.vitalSigns.heartRate} bpm</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}
                  {form.vitalSigns.temperature && (
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: alpha(theme.palette.warning.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ThermostatIcon sx={{ color: theme.palette.warning.main }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Temperatura</Typography>
                          <Typography variant="body1" fontWeight="700">{form.vitalSigns.temperature}°C</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}
                  {form.vitalSigns.weight && (
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: alpha(theme.palette.success.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ScaleIcon sx={{ color: theme.palette.success.main }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Peso</Typography>
                          <Typography variant="body1" fontWeight="700">{form.vitalSigns.weight} kg</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}
                </Box>
              </Paper>
            )}
            
            {/* Alergias */}
            {form.allergies && form.allergies.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha(theme.palette.warning.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.main, 0.2)
                }}
              >
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WarningAmberIcon sx={{ color: theme.palette.warning.main }} />
                  Alergias Conocidas
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {form.allergies.map((allergy, index) => (
                    <Chip 
                      key={index} 
                      label={allergy} 
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.15),
                        color: theme.palette.warning.dark,
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.warning.main, 0.3)
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            )}
            {/* Medicamentos */}
            {form.currentMedications && form.currentMedications.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha(theme.palette.info.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.2)
                }}
              >
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MedicationIcon sx={{ color: theme.palette.info.main }} />
                  Medicamentos Actuales
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {form.currentMedications.map((med, index) => (
                    <Chip 
                      key={index} 
                      label={med} 
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.15),
                        color: theme.palette.info.dark,
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.info.main, 0.3)
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            )}
            
            {/* Notas */}
            {form.notes && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha(theme.palette.grey[500], 0.05),
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mb: 2 }}>
                  📝 Notas Adicionales
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                  {form.notes}
                </Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose}
            variant="contained"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MedicalRecordCard;
