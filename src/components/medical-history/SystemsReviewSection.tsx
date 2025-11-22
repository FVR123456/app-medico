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
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import type { MedicalHistory } from '@/types';

interface SystemsReviewSectionProps {
  data: MedicalHistory['systemsReview'];
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const SystemsReviewSection = memo(({ data, onChange, readOnly = false }: SystemsReviewSectionProps) => {
  const systems = [
    { field: 'general', label: 'General', placeholder: 'Fiebre, fatiga, pérdida de peso...' },
    { field: 'respiratory', label: 'Respiratorio', placeholder: 'Tos, disnea, dolor torácico...' },
    { field: 'cardiovascular', label: 'Cardiovascular', placeholder: 'Palpitaciones, dolor precordial, edema...' },
    { field: 'digestive', label: 'Digestivo', placeholder: 'Náusea, vómito, diarrea, estreñimiento...' },
    { field: 'urinary', label: 'Urinario', placeholder: 'Disuria, hematuria, incontinencia...' },
    { field: 'musculoskeletal', label: 'Musculoesquelético', placeholder: 'Dolor articular, debilidad muscular...' },
    { field: 'neurological', label: 'Neurológico', placeholder: 'Cefalea, mareos, parestesias, convulsiones...' },
  ];

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
          <HealthAndSafetyIcon color="secondary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Interrogatorio por Aparatos y Sistemas</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {systems.map(({ field, label, placeholder }) => (
            <Grid size={{ xs: 12, md: 6 }} key={field}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={label}
                value={data[field as keyof typeof data]}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={placeholder}
                disabled={readOnly}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

SystemsReviewSection.displayName = 'SystemsReviewSection';
