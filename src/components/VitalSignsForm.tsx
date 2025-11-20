import {
  Grid,
  TextField,
  Typography,
  Paper,
  InputAdornment,
} from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import type { VitalSigns } from '@/types';

interface VitalSignsFormProps {
  vitalSigns: VitalSigns;
  onChange: (vitalSigns: VitalSigns) => void;
}

const VitalSignsForm = ({ vitalSigns, onChange }: VitalSignsFormProps) => {
  const handleChange = (field: keyof VitalSigns) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    onChange({
      ...vitalSigns,
      [field]: field === 'bloodPressure' ? value : value ? parseFloat(value) : undefined,
    });
  };

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
      <Typography
        variant="subtitle1"
        fontWeight="600"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
      >
        <MonitorHeartIcon color="error" />
        Signos Vitales
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Presión Arterial"
            value={vitalSigns.bloodPressure || ''}
            onChange={handleChange('bloodPressure')}
            placeholder="120/80"
            InputProps={{
              endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Frecuencia Cardíaca"
            value={vitalSigns.heartRate || ''}
            onChange={handleChange('heartRate')}
            InputProps={{
              endAdornment: <InputAdornment position="end">bpm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Temperatura"
            value={vitalSigns.temperature || ''}
            onChange={handleChange('temperature')}
            inputProps={{ step: '0.1' }}
            InputProps={{
              endAdornment: <InputAdornment position="end">°C</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Peso"
            value={vitalSigns.weight || ''}
            onChange={handleChange('weight')}
            inputProps={{ step: '0.1' }}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Altura"
            value={vitalSigns.height || ''}
            onChange={handleChange('height')}
            InputProps={{
              endAdornment: <InputAdornment position="end">cm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Saturación O₂"
            value={vitalSigns.oxygenSaturation || ''}
            onChange={handleChange('oxygenSaturation')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Glucosa"
            value={vitalSigns.glucose || ''}
            onChange={handleChange('glucose')}
            InputProps={{
              endAdornment: <InputAdornment position="end">mg/dL</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default VitalSignsForm;
