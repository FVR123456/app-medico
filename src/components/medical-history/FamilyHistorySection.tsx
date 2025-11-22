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
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import type { MedicalHistory } from '@/types';

interface FamilyHistorySectionProps {
  data: MedicalHistory['familyHistory'];
  onChange: (field: string, value: boolean | string) => void;
  readOnly?: boolean;
}

export const FamilyHistorySection = memo(({ data, onChange, readOnly = false }: FamilyHistorySectionProps) => {
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
          <FamilyRestroomIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Antecedentes Heredofamiliares</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.diabetes}
                  onChange={(e) => onChange('diabetes', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label="Diabetes"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hypertension}
                  onChange={(e) => onChange('hypertension', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label="Hipertensión"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.cancer}
                  onChange={(e) => onChange('cancer', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label="Cáncer"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.heartDisease}
                  onChange={(e) => onChange('heartDisease', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label="Cardiopatías"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.neurologicalDisorders}
                  onChange={(e) => onChange('neurologicalDisorders', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label="Trastornos Neurológicos"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.mentalDisorders}
                  onChange={(e) => onChange('mentalDisorders', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label="Trastornos Mentales"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Otros antecedentes familiares"
              value={data.other}
              onChange={(e) => onChange('other', e.target.value)}
              placeholder="Especifique otros antecedentes relevantes..."
              disabled={readOnly}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

FamilyHistorySection.displayName = 'FamilyHistorySection';
