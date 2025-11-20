import { memo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BadgeIcon from '@mui/icons-material/Badge';
import type { MedicalHistory } from '@/types';

interface IdentificationSectionProps {
  data: MedicalHistory['identification'];
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const IdentificationSection = memo(({ data, onChange, readOnly = false }: IdentificationSectionProps) => {
  return (
    <Accordion 
      defaultExpanded
      sx={{
        '&:before': { display: 'none' },
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        '&:not(:last-child)': { mb: 0 },
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
          <BadgeIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Ficha de Identificación</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Ocupación"
              value={data.occupation}
              onChange={(e) => onChange('occupation', e.target.value)}
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Estado Civil"
              value={data.maritalStatus}
              onChange={(e) => onChange('maritalStatus', e.target.value)}
              InputProps={{ readOnly }}
              SelectProps={{ disabled: readOnly }}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              <MenuItem value="Soltero">Soltero</MenuItem>
              <MenuItem value="Casado">Casado</MenuItem>
              <MenuItem value="Divorciado">Divorciado</MenuItem>
              <MenuItem value="Viudo">Viudo</MenuItem>
              <MenuItem value="Unión Libre">Unión Libre</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Escolaridad"
              value={data.education}
              onChange={(e) => onChange('education', e.target.value)}
              InputProps={{ readOnly }}
              SelectProps={{ disabled: readOnly }}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              <MenuItem value="Sin estudios">Sin estudios</MenuItem>
              <MenuItem value="Primaria">Primaria</MenuItem>
              <MenuItem value="Secundaria">Secundaria</MenuItem>
              <MenuItem value="Preparatoria">Preparatoria</MenuItem>
              <MenuItem value="Universidad">Universidad</MenuItem>
              <MenuItem value="Posgrado">Posgrado</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Lugar de Nacimiento"
              value={data.placeOfBirth}
              onChange={(e) => onChange('placeOfBirth', e.target.value)}
              InputProps={{ readOnly }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Residencia Actual"
              value={data.currentResidence}
              onChange={(e) => onChange('currentResidence', e.target.value)}
              InputProps={{ readOnly }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

IdentificationSection.displayName = 'IdentificationSection';
