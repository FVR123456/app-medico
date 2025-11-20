import { Box, Grid, Paper, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ScaleIcon from '@mui/icons-material/Scale';
import HeightIcon from '@mui/icons-material/Height';
import AirIcon from '@mui/icons-material/Air';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import type { VitalSigns } from '@/types';

interface VitalSignsDisplayProps {
  vitalSigns: VitalSigns;
}

const VitalSignsDisplay = ({ vitalSigns }: VitalSignsDisplayProps) => {
  const items = [
    {
      label: 'Presión Arterial',
      value: vitalSigns.bloodPressure,
      unit: 'mmHg',
      icon: <FavoriteIcon fontSize="small" />,
      color: '#ef4444',
    },
    {
      label: 'Frecuencia Cardíaca',
      value: vitalSigns.heartRate,
      unit: 'bpm',
      icon: <FavoriteIcon fontSize="small" />,
      color: '#f59e0b',
    },
    {
      label: 'Temperatura',
      value: vitalSigns.temperature,
      unit: '°C',
      icon: <ThermostatIcon fontSize="small" />,
      color: '#10b981',
    },
    {
      label: 'Peso',
      value: vitalSigns.weight,
      unit: 'kg',
      icon: <ScaleIcon fontSize="small" />,
      color: '#3b82f6',
    },
    {
      label: 'Altura',
      value: vitalSigns.height,
      unit: 'cm',
      icon: <HeightIcon fontSize="small" />,
      color: '#8b5cf6',
    },
    {
      label: 'Saturación O₂',
      value: vitalSigns.oxygenSaturation,
      unit: '%',
      icon: <AirIcon fontSize="small" />,
      color: '#06b6d4',
    },
    {
      label: 'Glucosa',
      value: vitalSigns.glucose,
      unit: 'mg/dL',
      icon: <BloodtypeIcon fontSize="small" />,
      color: '#ec4899',
    },
  ];

  const hasAnyVitalSign = items.some((item) => item.value !== undefined && item.value !== null);

  if (!hasAnyVitalSign) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
        Signos Vitales
      </Typography>
      <Grid container spacing={1.5}>
        {items.map(
          (item) =>
            (item.value !== undefined && item.value !== null) && (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item.label}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight="600" noWrap>
                      {item.value} {item.unit}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )
        )}
      </Grid>
    </Paper>
  );
};

export default VitalSignsDisplay;
