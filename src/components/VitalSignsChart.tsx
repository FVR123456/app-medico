import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Paper
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import type { MedicalRecord } from '@/types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface VitalSignsChartProps {
  records: MedicalRecord[];
}

const VitalSignsChart: React.FC<VitalSignsChartProps> = ({ records }) => {
  const [selectedMetric, setSelectedMetric] = React.useState<string>('all');

  // Procesar datos de los registros médicos
  const chartData = useMemo(() => {
    return records
      .filter(record => record.vitalSigns && Object.keys(record.vitalSigns).length > 0)
      .map(record => {
        const date = new Date(record.date);
        const bloodPressure = record.vitalSigns?.bloodPressure;
        let systolic, diastolic;
        
        if (bloodPressure && bloodPressure.includes('/')) {
          const [sys, dia] = bloodPressure.split('/').map(Number);
          systolic = sys;
          diastolic = dia;
        }

        return {
          date: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
          fullDate: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
          timestamp: date.getTime(),
          systolic,
          diastolic,
          heartRate: record.vitalSigns?.heartRate,
          temperature: record.vitalSigns?.temperature,
          weight: record.vitalSigns?.weight,
          glucose: record.vitalSigns?.glucose,
          oxygenSaturation: record.vitalSigns?.oxygenSaturation,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [records]);

  // Calcular tendencias
  const getTrend = (dataKey: string) => {
    const values = chartData.map(d => d[dataKey as keyof typeof d]).filter(v => v !== undefined) as number[];
    if (values.length < 2) return null;
    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;
    return { change, direction: change > 0 ? 'up' : 'down' };
  };

  // Calcular promedios
  const getAverage = (dataKey: string) => {
    const values = chartData.map(d => d[dataKey as keyof typeof d]).filter(v => v !== undefined) as number[];
    if (values.length === 0) return null;
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1);
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No hay datos de signos vitales para mostrar gráficas
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { key: 'all', label: 'Todos' },
    { key: 'bloodPressure', label: 'Presión Arterial', color: '#d32f2f' },
    { key: 'heartRate', label: 'Frecuencia Cardíaca', color: '#1976d2' },
    { key: 'temperature', label: 'Temperatura', color: '#ed6c02' },
    { key: 'weight', label: 'Peso', color: '#2e7d32' },
    { key: 'glucose', label: 'Glucosa', color: '#9c27b0' },
    { key: 'oxygenSaturation', label: 'Saturación O₂', color: '#0288d1' },
  ];

  const hasData = (key: string) => {
    if (key === 'bloodPressure') {
      return chartData.some(d => d.systolic !== undefined);
    }
    return chartData.some(d => d[key as keyof typeof d] !== undefined);
  };

  const renderChart = (metricKey: string) => {
    if (metricKey === 'bloodPressure' && hasData('bloodPressure')) {
      return (
        <Box key="bloodPressure" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Presión Arterial (mmHg)
            {getTrend('systolic') && (
              <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrend('systolic')!.direction === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                {Math.abs(getTrend('systolic')!.change).toFixed(1)}%
              </Box>
            )}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">Promedio Sistólica</Typography>
                <Typography variant="h6" color="error.main">{getAverage('systolic')} mmHg</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">Promedio Diastólica</Typography>
                <Typography variant="h6" color="error.main">{getAverage('diastolic')} mmHg</Typography>
              </Grid>
            </Grid>
          </Paper>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 180]} />
              <Tooltip 
                labelFormatter={(label) => chartData.find(d => d.date === label)?.fullDate || label}
                formatter={(value: number, name: string) => [`${value} mmHg`, name === 'systolic' ? 'Sistólica' : 'Diastólica']}
              />
              <Legend formatter={(value) => value === 'systolic' ? 'Sistólica' : 'Diastólica'} />
              <Area type="monotone" dataKey="systolic" stroke="#d32f2f" fill="#d32f2f" fillOpacity={0.3} />
              <Area type="monotone" dataKey="diastolic" stroke="#f44336" fill="#f44336" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    if (metricKey === 'heartRate' && hasData('heartRate')) {
      return (
        <Box key="heartRate" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Frecuencia Cardíaca (bpm)
            {getTrend('heartRate') && (
              <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrend('heartRate')!.direction === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                {Math.abs(getTrend('heartRate')!.change).toFixed(1)}%
              </Box>
            )}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Promedio</Typography>
            <Typography variant="h6" color="primary">{getAverage('heartRate')} bpm</Typography>
          </Paper>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[40, 120]} />
              <Tooltip 
                labelFormatter={(label) => chartData.find(d => d.date === label)?.fullDate || label}
                formatter={(value: number) => [`${value} bpm`, 'FC']}
              />
              <Legend formatter={() => 'Frecuencia Cardíaca'} />
              <Line type="monotone" dataKey="heartRate" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    if (metricKey === 'temperature' && hasData('temperature')) {
      return (
        <Box key="temperature" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Temperatura (°C)
            {getTrend('temperature') && (
              <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrend('temperature')!.direction === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                {Math.abs(getTrend('temperature')!.change).toFixed(1)}%
              </Box>
            )}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Promedio</Typography>
            <Typography variant="h6" color="warning.main">{getAverage('temperature')} °C</Typography>
          </Paper>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[35, 40]} />
              <Tooltip 
                labelFormatter={(label) => chartData.find(d => d.date === label)?.fullDate || label}
                formatter={(value: number) => [`${value} °C`, 'Temperatura']}
              />
              <Legend formatter={() => 'Temperatura'} />
              <Line type="monotone" dataKey="temperature" stroke="#ed6c02" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    if (metricKey === 'weight' && hasData('weight')) {
      return (
        <Box key="weight" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Peso (kg)
            {getTrend('weight') && (
              <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrend('weight')!.direction === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                {Math.abs(getTrend('weight')!.change).toFixed(1)}%
              </Box>
            )}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Promedio</Typography>
            <Typography variant="h6" color="success.main">{getAverage('weight')} kg</Typography>
          </Paper>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => chartData.find(d => d.date === label)?.fullDate || label}
                formatter={(value: number) => [`${value} kg`, 'Peso']}
              />
              <Legend formatter={() => 'Peso'} />
              <Area type="monotone" dataKey="weight" stroke="#2e7d32" fill="#2e7d32" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    if (metricKey === 'glucose' && hasData('glucose')) {
      return (
        <Box key="glucose" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Glucosa (mg/dL)
            {getTrend('glucose') && (
              <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrend('glucose')!.direction === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                {Math.abs(getTrend('glucose')!.change).toFixed(1)}%
              </Box>
            )}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Promedio</Typography>
            <Typography variant="h6" sx={{ color: '#9c27b0' }}>{getAverage('glucose')} mg/dL</Typography>
          </Paper>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 200]} />
              <Tooltip 
                labelFormatter={(label) => chartData.find(d => d.date === label)?.fullDate || label}
                formatter={(value: number) => [`${value} mg/dL`, 'Glucosa']}
              />
              <Legend formatter={() => 'Glucosa'} />
              <Line type="monotone" dataKey="glucose" stroke="#9c27b0" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    if (metricKey === 'oxygenSaturation' && hasData('oxygenSaturation')) {
      return (
        <Box key="oxygenSaturation" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Saturación de Oxígeno (%)
            {getTrend('oxygenSaturation') && (
              <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrend('oxygenSaturation')!.direction === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                {Math.abs(getTrend('oxygenSaturation')!.change).toFixed(1)}%
              </Box>
            )}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Promedio</Typography>
            <Typography variant="h6" color="info.main">{getAverage('oxygenSaturation')} %</Typography>
          </Paper>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[85, 100]} />
              <Tooltip 
                labelFormatter={(label) => chartData.find(d => d.date === label)?.fullDate || label}
                formatter={(value: number) => [`${value} %`, 'SpO₂']}
              />
              <Legend formatter={() => 'Saturación O₂'} />
              <Line type="monotone" dataKey="oxygenSaturation" stroke="#0288d1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="600">
            Evolución de Signos Vitales
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Visualización de la tendencia de signos vitales a lo largo del tiempo
          </Typography>

          <ToggleButtonGroup
            value={selectedMetric}
            exclusive
            onChange={(_, newValue) => newValue && setSelectedMetric(newValue)}
            size="small"
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
          >
            {metrics.filter(m => m.key === 'all' || hasData(m.key)).map(metric => (
              <ToggleButton key={metric.key} value={metric.key} sx={{ textTransform: 'none' }}>
                {metric.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box>
          {selectedMetric === 'all' ? (
            metrics.slice(1).map(metric => renderChart(metric.key))
          ) : (
            renderChart(selectedMetric)
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VitalSignsChart;
