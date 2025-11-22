import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  CircularProgress, 
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Chip,
  Paper,
  Grid,
  alpha,
  useTheme,
  Container,
  Divider,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { subscribeToPatientRecords, type MedicalRecord, updateMedicalRecord } from '../../services/firestore';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import MedicalRecordCard from '../../components/MedicalRecordCard';
import VitalSignsChart from '../../components/VitalSignsChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsightsIcon from '@mui/icons-material/Insights';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import FilterListIcon from '@mui/icons-material/FilterList';

const MedicalHistory = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [filterTab, setFilterTab] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToPatientRecords(user.uid, (data) => {
      setRecords(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filtrar registros según el período seleccionado
  const getFilteredRecords = () => {
    const now = new Date();
    const filtered = records.filter(record => {
      const recordDate = new Date(record.date);
      switch (filterTab) {
        case 1: // Último mes
          return (now.getTime() - recordDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        case 2: // Últimos 3 meses
          return (now.getTime() - recordDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
        case 3: // Último año
          return (now.getTime() - recordDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
        default: // Todos
          return true;
      }
    });
    return filtered;
  };

  const filteredRecords = getFilteredRecords();

  // Estadísticas básicas
  const getStats = () => {
    if (records.length === 0) return null;
    
    const lastRecord = records[0];
    const firstRecord = records[records.length - 1];
    const daysSinceFirst = Math.floor((new Date().getTime() - new Date(firstRecord.date).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      total: records.length,
      lastVisit: lastRecord.date,
      daysSinceFirst,
      recentVisits: records.filter(r => {
        const daysSince = (new Date().getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      }).length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Layout title="Historial Médico">
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            {/* Skeleton del header */}
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '2rem', maxWidth: 300, mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem', maxWidth: 200, mx: 'auto' }} />
            </Box>
            
            {/* Skeleton de las tarjetas de estadísticas */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <Skeleton variant="rounded" height={120} />
                </Grid>
              ))}
            </Grid>

            {/* Skeleton de las tarjetas de consultas */}
            <Grid container spacing={3}>
              {[1, 2].map((i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Skeleton variant="rounded" height={200} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Historial Médico">
      <Box 
        sx={{ 
          minHeight: '100vh',
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={500}>
            <Box sx={{ py: 4 }}>
              {/* Header mejorado con glassmorphism */}
              <Box sx={{ mb: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <HealthAndSafetyIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="700" gutterBottom sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    Mi Historial Médico
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                    Accede a toda tu información clínica y seguimiento médico en un solo lugar
                  </Typography>

                  {records.length > 0 && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                      <Button
                        variant="contained"
                        startIcon={<TrendingUpIcon />}
                        onClick={() => setShowCharts(true)}
                        size="large"
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                          '&:hover': {
                            boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                          }
                        }}
                      >
                        Ver Gráficas
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={viewMode === 'timeline' ? <CalendarMonthIcon /> : <TimelineIcon />}
                        onClick={() => setViewMode(viewMode === 'timeline' ? 'grid' : 'timeline')}
                        size="large"
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                          }
                        }}
                      >
                        {viewMode === 'timeline' ? 'Vista Grid' : 'Vista Timeline'}
                      </Button>
                    </Stack>
                  )}
                </Paper>
              </Box>

              {/* Tarjetas de estadísticas */}
              {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                        }
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <DescriptionIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                          <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                            Total Consultas
                          </Typography>
                        </Stack>
                        <Typography variant="h3" fontWeight="700" color="primary.main">
                          {stats.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Registradas en el sistema
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 24px ${alpha(theme.palette.secondary.main, 0.1)}`,
                        }
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarMonthIcon sx={{ color: theme.palette.secondary.main, fontSize: 24 }} />
                          <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                            Última Visita
                          </Typography>
                        </Stack>
                        <Typography variant="h3" fontWeight="700" color="secondary.main">
                          {new Date(stats.lastVisit).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(stats.lastVisit).toLocaleDateString('es-MX', { year: 'numeric' })}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 24px ${alpha(theme.palette.info.main, 0.1)}`,
                        }
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <InsightsIcon sx={{ color: theme.palette.info.main, fontSize: 24 }} />
                          <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                            Mes Actual
                          </Typography>
                        </Stack>
                        <Typography variant="h3" fontWeight="700" color="info.main">
                          {stats.recentVisits}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Consultas este mes
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Filtros */}
              {records.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}
                >
                  <Tabs
                    value={filterTab}
                    onChange={(_, newValue) => setFilterTab(newValue)}
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        py: 2,
                        fontWeight: 600,
                      }
                    }}
                  >
                    <Tab label="Todas" icon={<FilterListIcon />} iconPosition="start" />
                    <Tab label="Último mes" />
                    <Tab label="3 meses" />
                    <Tab label="Año" />
                  </Tabs>
                </Paper>
              )}

              {/* Records */}
              {filteredRecords.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 8,
                    textAlign: 'center',
                    borderRadius: 4,
                    border: '2px dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    background: alpha(theme.palette.primary.main, 0.02)
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <LocalHospitalIcon sx={{ fontSize: 60, color: theme.palette.primary.main, opacity: 0.5 }} />
                  </Box>
                  <Typography variant="h5" color="text.primary" fontWeight="600" gutterBottom>
                    {records.length === 0 ? 'Sin Consultas Previas' : 'No hay consultas en este período'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                    {records.length === 0 
                      ? 'Tu historial médico aparecerá aquí después de tu primera consulta con un médico'
                      : 'Intenta seleccionar otro período de tiempo para ver más consultas'}
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredRecords.map((record, index) => (
                    <Grid item xs={12} md={6} key={record.id}>
                      <Fade in timeout={300 + index * 100}>
                        <Box>
                          <MedicalRecordCard
                            record={record}
                            editable={true}
                            onSave={async (updated) => {
                              try {
                                await updateMedicalRecord(record.id, updated);
                                showSuccess('Registro actualizado exitosamente');
                              } catch (err) {
                                console.error('Error updating record:', err);
                                showError('Error al actualizar el registro');
                              }
                            }}
                          />
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Timeline view - opción alternativa */}
              {viewMode === 'timeline' && filteredRecords.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                    Línea de Tiempo
                  </Typography>
                  {/* Aquí podrías agregar una vista de timeline más visual */}
                </Box>
              )}
            </Box>
          </Fade>
        </Container>

        {/* Modal de Gráficas mejorado */}
        <Dialog
          open={showCharts}
          onClose={() => setShowCharts(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="700">
                    Evolución de Signos Vitales
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Análisis de tu progreso médico
                  </Typography>
                </Box>
              </Stack>
              <IconButton 
                onClick={() => setShowCharts(false)}
                sx={{
                  '&:hover': {
                    background: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3 }}>
            <VitalSignsChart records={records} />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowCharts(false)}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 4
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default MedicalHistory;
