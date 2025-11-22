import { memo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import type { MedicalHistory } from '@/types';

interface NonPathologicalHistorySectionProps {
  data: MedicalHistory['nonPathologicalHistory'];
  onUpdateField: (field: string, value: string) => void;
  onUpdateNestedField: (subsection: string, field: string, value: boolean | string) => void;
  readOnly?: boolean;
}

export const NonPathologicalHistorySection = memo(({
  data,
  onUpdateField,
  onUpdateNestedField,
  readOnly = false,
}: NonPathologicalHistorySectionProps) => {
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
          <HomeIcon color="success" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Antecedentes No Patológicos</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Vivienda
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.housing?.basicServices ?? true}
                  onChange={(e) => onUpdateNestedField('housing', 'basicServices', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label="Servicios Básicos"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.housing?.overcrowding || false}
                  onChange={(e) => onUpdateNestedField('housing', 'overcrowding', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label="Hacinamiento"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Mascotas"
              value={data.housing?.pets || ''}
              onChange={(e) => onUpdateNestedField('housing', 'pets', e.target.value)}
              placeholder="Tipo y cantidad"
              disabled={readOnly}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Alimentación"
              value={data.diet}
              onChange={(e) => onUpdateField('diet', e.target.value)}
              placeholder="Describe los hábitos alimenticios del paciente..."
              disabled={readOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Actividad Física"
              value={data.physicalActivity}
              onChange={(e) => onUpdateField('physicalActivity', e.target.value)}
              placeholder="Tipo, frecuencia y duración de ejercicio..."
              disabled={readOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Higiene"
              value={data.hygiene}
              onChange={(e) => onUpdateField('hygiene', e.target.value)}
              placeholder="Hábitos de higiene personal..."
              disabled={readOnly}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Inmunizaciones"
              value={data.immunizations}
              onChange={(e) => onUpdateField('immunizations', e.target.value)}
              placeholder="Vacunas aplicadas y esquema de vacunación..."
              disabled={readOnly}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

NonPathologicalHistorySection.displayName = 'NonPathologicalHistorySection';
