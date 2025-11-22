import { memo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Grid,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import type { MedicalHistory } from '@/types';

interface GynecologicalHistorySectionProps {
  data: MedicalHistory['gynecologicalHistory'];
  onChange: (field: string, value: string | number | undefined) => void;
  readOnly?: boolean;
}

export const GynecologicalHistorySection = memo(({ data, onChange, readOnly = false }: GynecologicalHistorySectionProps) => {
  if (!data) return null;

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
          <PregnantWomanIcon sx={{ color: '#e91e63' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Antecedentes Gineco-Obstétricos</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Menarca (edad)"
              value={data.menarche || ''}
              onChange={(e) => onChange('menarche', e.target.value ? parseInt(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 8, max: 20 } }}
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Ciclo Menstrual"
              value={data.menstrualCycle}
              onChange={(e) => onChange('menstrualCycle', e.target.value)}
              placeholder="Ej: 28/4"
              helperText="días de ciclo / días de sangrado"
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Última Menstruación (FUM)"
              value={data.lastMenstrualPeriod}
              onChange={(e) => onChange('lastMenstrualPeriod', e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={readOnly}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              GPCA (Embarazos)
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Gestas (G)"
              value={data.pregnancies}
              onChange={(e) => onChange('pregnancies', parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Partos (P)"
              value={data.births}
              onChange={(e) => onChange('births', parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Cesáreas (C)"
              value={data.cesareans}
              onChange={(e) => onChange('cesareans', parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Abortos (A)"
              value={data.abortions}
              onChange={(e) => onChange('abortions', parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
              disabled={readOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Método Anticonceptivo"
              value={data.contraception}
              onChange={(e) => onChange('contraception', e.target.value)}
              placeholder="Ej: DIU, Píldoras, Condón"
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Último Papanicolaou"
              value={data.lastPapSmear}
              onChange={(e) => onChange('lastPapSmear', e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Última Mastografía"
              value={data.lastMammogram}
              onChange={(e) => onChange('lastMammogram', e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={readOnly}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

GynecologicalHistorySection.displayName = 'GynecologicalHistorySection';
