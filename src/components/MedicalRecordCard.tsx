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
  Paper
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';

import type { MedicalRecord } from '../services/firestore';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  editable?: boolean;
  onSave?: (updated: MedicalRecord) => void;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ record, editable = false, onSave }) => {
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

  // Card resumen comprimido
  return (
    <>
      <Fade in timeout={300}>
        <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={handleOpen}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography variant="h6" fontWeight="600">Consulta</Typography>
              <Chip
                label={new Date(record.date).toLocaleDateString('es-MX', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <LocalHospitalIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Dr. {record.doctorName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Stack>
            {/* Diagnóstico breve */}
            <Typography variant="body2" color="text.secondary" mt={1} noWrap>
              {record.diagnosis}
            </Typography>
          </CardContent>
        </Card>
      </Fade>
      {/* Modal flotante */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Detalles de la Consulta
          {editable && !editMode && (
            <IconButton onClick={handleEdit} sx={{ ml: 1 }} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {/* Mostrar detalles o formulario de edición */}
          {/* ...similar a PatientDetails, pero modular... */}
          <Stack spacing={2}>
            {/* Signos vitales */}
            {form.vitalSigns && Object.keys(form.vitalSigns).length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ fontSize: '0.8rem' }}>
                  Signos Vitales
                </Typography>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
                  {form.vitalSigns.bloodPressure && (
                    <Paper variant="outlined" sx={{ p: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>PA</Typography>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>{form.vitalSigns.bloodPressure}</Typography>
                    </Paper>
                  )}
                  {form.vitalSigns.heartRate && (
                    <Paper variant="outlined" sx={{ p: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>FC</Typography>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>{form.vitalSigns.heartRate} bpm</Typography>
                    </Paper>
                  )}
                  {form.vitalSigns.temperature && (
                    <Paper variant="outlined" sx={{ p: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Temp</Typography>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>{form.vitalSigns.temperature}°C</Typography>
                    </Paper>
                  )}
                  {form.vitalSigns.weight && (
                    <Paper variant="outlined" sx={{ p: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Peso</Typography>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>{form.vitalSigns.weight} kg</Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            )}
            {/* Alergias */}
            {form.allergies && form.allergies.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem' }}>
                  <WarningAmberIcon fontSize="small" sx={{ fontSize: '1rem' }} color="warning" />
                  Alergias
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {form.allergies.map((allergy, index) => (
                    <Chip key={index} label={allergy} color="warning" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                  ))}
                </Box>
              </Box>
            )}
            {/* Medicamentos */}
            {form.currentMedications && form.currentMedications.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem' }}>
                  <MedicationIcon fontSize="small" sx={{ fontSize: '1rem' }} color="info" />
                  Medicamentos
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {form.currentMedications.map((med, index) => (
                    <Chip key={index} label={med} color="info" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                  ))}
                </Box>
              </Box>
            )}
            {/* Diagnóstico */}
            <Box>
              <Typography
                variant="subtitle2"
                color="primary"
                fontWeight="600"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <DescriptionIcon fontSize="small" />
                Diagnóstico
              </Typography>
              {editMode ? (
                <textarea
                  value={form.diagnosis}
                  onChange={e => handleChange('diagnosis', e.target.value)}
                  style={{ width: '100%', minHeight: 40 }}
                />
              ) : (
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {form.diagnosis}
                </Typography>
              )}
            </Box>
            {/* Receta */}
            <Box>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight="600"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <MedicationIcon fontSize="small" />
                Indicaciones / Receta
              </Typography>
              {editMode ? (
                <textarea
                  value={form.prescription}
                  onChange={e => handleChange('prescription', e.target.value)}
                  style={{ width: '100%', minHeight: 40 }}
                />
              ) : (
                <Typography variant="body1" sx={{ pl: 3.5, whiteSpace: 'pre-line', color: 'text.secondary' }}>
                  {form.prescription}
                </Typography>
              )}
            </Box>
            {/* Notas */}
            {form.notes && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="600" gutterBottom>
                  Notas
                </Typography>
                {editMode ? (
                  <textarea
                    value={form.notes}
                    onChange={e => handleChange('notes', e.target.value)}
                    style={{ width: '100%', minHeight: 30 }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {form.notes}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={handleCancelEdit}>Cancelar</Button>
              <Button onClick={handleSave} variant="contained">Guardar</Button>
            </>
          ) : (
            <Button onClick={handleClose}>Cerrar</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MedicalRecordCard;
