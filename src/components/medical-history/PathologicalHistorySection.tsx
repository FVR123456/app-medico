import { memo, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  IconButton,
  Chip,
  Stack,
  Box,
  Divider,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import MedicationIcon from '@mui/icons-material/Medication';
import type { MedicalHistory } from '@/types';

interface PathologicalHistorySectionProps {
  data: MedicalHistory['pathologicalHistory'];
  onUpdateField: (field: string, value: string) => void;
  onUpdateNestedField: (subsection: string, field: string, value: boolean | string) => void;
  onAddToArray: (field: string, item: string | Record<string, string>) => void;
  onRemoveFromArray: (field: string, index: number) => void;
  onUpdateArrayItem: (arrayField: string, index: number, itemField: string, value: string) => void;
  readOnly?: boolean;
}

export const PathologicalHistorySection = memo(({
  data,
  onUpdateField,
  onUpdateNestedField,
  onAddToArray,
  onRemoveFromArray,
  onUpdateArrayItem,
  readOnly = false,
}: PathologicalHistorySectionProps) => {
  const [newAllergy, setNewAllergy] = useState('');
  const [newChronicDisease, setNewChronicDisease] = useState('');

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      onAddToArray('allergies', newAllergy.trim());
      setNewAllergy('');
    }
  };

  const handleAddChronicDisease = () => {
    if (newChronicDisease.trim()) {
      onAddToArray('chronicDiseases', newChronicDisease.trim());
      setNewChronicDisease('');
    }
  };

  return (
    <Accordion
      sx={{
        '&:before': { display: 'none' },
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <LocalHospitalIcon color="error" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Antecedentes Patológicos</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          {/* Alergias */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon color="warning" /> Alergias
            </Typography>
            {!readOnly && (
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nueva alergia"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleAddAllergy} edge="end" color="primary">
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {data.allergies?.map((allergy, index) => (
                <Chip
                  key={index}
                  label={allergy}
                  onDelete={readOnly ? undefined : () => onRemoveFromArray('allergies', index)}
                  color="warning"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Grid>

          {/* Enfermedades Crónicas */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Enfermedades Crónicas
            </Typography>
            {!readOnly && (
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nueva enfermedad crónica"
                  value={newChronicDisease}
                  onChange={(e) => setNewChronicDisease(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChronicDisease())}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleAddChronicDisease} edge="end" color="primary">
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {data.chronicDiseases?.map((disease, index) => (
                <Chip
                  key={index}
                  label={disease}
                  onDelete={readOnly ? undefined : () => onRemoveFromArray('chronicDiseases', index)}
                  color="error"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Cirugías Previas */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Cirugías Previas</Typography>
              {!readOnly && (
                <IconButton
                  color="primary"
                  onClick={() => onAddToArray('previousSurgeries', { surgery: '', date: '', complications: '' })}
                >
                  <AddIcon />
                </IconButton>
              )}
            </Box>
            {data.previousSurgeries?.map((surgery, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Cirugía"
                      value={surgery.surgery}
                      onChange={(e) => onUpdateArrayItem('previousSurgeries', index, 'surgery', e.target.value)}
                      InputProps={{ readOnly }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Fecha"
                      value={surgery.date}
                      onChange={(e) => onUpdateArrayItem('previousSurgeries', index, 'date', e.target.value)}
                      InputProps={{ readOnly }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Complicaciones"
                      value={surgery.complications}
                      onChange={(e) => onUpdateArrayItem('previousSurgeries', index, 'complications', e.target.value)}
                      InputProps={{ readOnly }}
                    />
                  </Grid>
                  {!readOnly && (
                    <Grid size={{ xs: 12, md: 1 }}>
                      <IconButton color="error" onClick={() => onRemoveFromArray('previousSurgeries', index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Grid>

          {/* Traumatismos y Transfusiones */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Traumatismos"
              value={data.traumas}
              onChange={(e) => onUpdateField('traumas', e.target.value)}
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Transfusiones"
              value={data.transfusions}
              onChange={(e) => onUpdateField('transfusions', e.target.value)}
              InputProps={{ readOnly }}
            />
          </Grid>

          {/* Hospitalizaciones */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Hospitalizaciones</Typography>
              {!readOnly && (
                <IconButton
                  color="primary"
                  onClick={() => onAddToArray('hospitalizations', { reason: '', date: '', duration: '' })}
                >
                  <AddIcon />
                </IconButton>
              )}
            </Box>
            {data.hospitalizations?.map((hosp, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Motivo"
                      value={hosp.reason}
                      onChange={(e) => onUpdateArrayItem('hospitalizations', index, 'reason', e.target.value)}
                      InputProps={{ readOnly }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Fecha"
                      value={hosp.date}
                      onChange={(e) => onUpdateArrayItem('hospitalizations', index, 'date', e.target.value)}
                      InputProps={{ readOnly }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Duración"
                      value={hosp.duration}
                      onChange={(e) => onUpdateArrayItem('hospitalizations', index, 'duration', e.target.value)}
                      InputProps={{ readOnly }}
                    />
                  </Grid>
                  {!readOnly && (
                    <Grid size={{ xs: 12, md: 1 }}>
                      <IconButton color="error" onClick={() => onRemoveFromArray('hospitalizations', index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <MedicationIcon color="warning" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Adicciones y Hábitos
              </Typography>
            </Stack>
          </Grid>

          {/* Tabaquismo */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.addictions?.smoking || false}
                  onChange={(e) => onUpdateNestedField('addictions', 'smoking', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <SmokingRoomsIcon fontSize="small" />
                  <span>Tabaquismo</span>
                </Stack>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              disabled={!data.addictions?.smoking || readOnly}
              label="Detalles de tabaquismo"
              value={data.addictions?.smokingDetails || ''}
              onChange={(e) => onUpdateNestedField('addictions', 'smokingDetails', e.target.value)}
              placeholder="Ej: 10 cigarrillos/día por 5 años"
              InputProps={{ readOnly }}
            />
          </Grid>

          {/* Alcoholismo */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.addictions?.alcohol || false}
                  onChange={(e) => onUpdateNestedField('addictions', 'alcohol', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocalBarIcon fontSize="small" />
                  <span>Alcoholismo</span>
                </Stack>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              disabled={!data.addictions?.alcohol || readOnly}
              label="Detalles de consumo de alcohol"
              value={data.addictions?.alcoholDetails || ''}
              onChange={(e) => onUpdateNestedField('addictions', 'alcoholDetails', e.target.value)}
              placeholder="Ej: Ocasional, frecuencia y cantidad"
              InputProps={{ readOnly }}
            />
          </Grid>

          {/* Drogas */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.addictions?.drugs || false}
                  onChange={(e) => onUpdateNestedField('addictions', 'drugs', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <MedicationIcon fontSize="small" />
                  <span>Drogas</span>
                </Stack>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              disabled={!data.addictions?.drugs || readOnly}
              label="Detalles de consumo de drogas"
              value={data.addictions?.drugsDetails || ''}
              onChange={(e) => onUpdateNestedField('addictions', 'drugsDetails', e.target.value)}
              placeholder="Ej: Tipo de sustancia, frecuencia"
              InputProps={{ readOnly }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

PathologicalHistorySection.displayName = 'PathologicalHistorySection';
