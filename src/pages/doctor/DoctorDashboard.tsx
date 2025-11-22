import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import CreatePatientDialog from '@/components/doctor/CreatePatientDialog';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  Avatar, 
  Box, 
  CircularProgress, 
  TextField, 
  InputAdornment, 
  Fade, 
  Stack, 
  Button,
  alpha,
  useTheme,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllPatients, subscribeToAppointments } from '@/services/firestore';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import type { Appointment } from '@/services/firestore';
import { logger } from '@/services/logger';

const DoctorDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess } = useNotification();
  const [patients, setPatients] = useState<unknown[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<unknown[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePatientDialog, setShowCreatePatientDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPatients();
        setPatients(data);
        setFilteredPatients(data);
        logger.info(`Loaded ${data.length} patients`, 'DoctorDashboard');
      } catch (error) {
        logger.error("Error fetching patients", 'DoctorDashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Suscribirse a citas para obtener estadísticas
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAppointments(user.uid, 'doctor', (data) => {
      setAppointments(data);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const filtered = patients.filter((patient: unknown) => {
      const p = patient as { name?: string; email?: string };
      return p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.email?.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  // Calcular estadísticas
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const todayAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.date).toDateString();
    const today = new Date().toDateString();
    return appointmentDate === today && a.status === 'accepted';
  }).length;

  if (loading) {
    return (
      <Layout title="Panel Médico">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Panel Médico">
      <Fade in timeout={500}>
        <Box>
          {/* Header de bienvenida con glassmorphism */}
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  background: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <PeopleOutlineIcon sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                  Panel Médico
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestiona tus pacientes y citas médicas
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Stats Section */}
          <Stack spacing={3} sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    background: alpha('#fff', 0.8),
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        Total Pacientes
                      </Typography>
                      <Typography variant="h3" fontWeight="700" color="primary.main">
                        {patients.length}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PeopleOutlineIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    background: alpha('#fff', 0.8),
                    border: `2px solid ${alpha('#f59e0b', 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha('#f59e0b', 0.15)}`,
                      borderColor: alpha('#f59e0b', 0.3),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        Pendientes
                      </Typography>
                      <Typography variant="h3" fontWeight="700" sx={{ color: '#f59e0b' }}>
                        {pendingAppointments}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: alpha('#f59e0b', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <WarningIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    background: alpha('#fff', 0.8),
                    border: `2px solid ${alpha('#10b981', 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha('#10b981', 0.15)}`,
                      borderColor: alpha('#10b981', 0.3),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        Citas Hoy
                      </Typography>
                      <Typography variant="h3" fontWeight="700" sx={{ color: '#10b981' }}>
                        {todayAppointments}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: alpha('#10b981', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <EventIcon sx={{ fontSize: 32, color: '#10b981' }} />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    background: alpha('#fff', 0.8),
                    border: `2px solid ${alpha('#8b5cf6', 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha('#8b5cf6', 0.15)}`,
                      borderColor: alpha('#8b5cf6', 0.3),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        Total Citas
                      </Typography>
                      <Typography variant="h3" fontWeight="700" sx={{ color: '#8b5cf6' }}>
                        {appointments.length}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: alpha('#8b5cf6', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>

          {/* Alert for pending appointments */}
          {pendingAppointments > 0 && (
            <Paper
              elevation={0}
              sx={{ 
                mb: 4, 
                p: 3,
                borderRadius: 3,
                background: alpha('#f59e0b', 0.08),
                border: `2px solid ${alpha('#f59e0b', 0.3)}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${alpha('#f59e0b', 0.3)}`,
                  }}
                >
                  <WarningIcon sx={{ color: '#fff', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#b45309' }}>
                    Tienes {pendingAppointments} cita{pendingAppointments > 1 ? 's' : ''} pendiente{pendingAppointments > 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#92400e' }}>
                    Accede al Gestor de Citas para revisarlas y responder
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Search Section */}
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <TextField
                fullWidth
                placeholder="Buscar paciente por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: { sm: 500 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: alpha('#fff', 0.8),
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowCreatePatientDialog(true)}
                sx={{ 
                  whiteSpace: 'nowrap', 
                  minWidth: 180,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                Nuevo Paciente
              </Button>
            </Stack>
          </Box>

          {/* Patients List */}
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
              {searchQuery ? `Resultados (${filteredPatients.length})` : 'Mis Pacientes'}
            </Typography>

            {filteredPatients.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="300px"
                sx={{ opacity: 0.6 }}
              >
                <PeopleOutlineIcon sx={{ fontSize: 80, mb: 2, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'Intenta con otro término de búsqueda' : 'Los pacientes aparecerán aquí cuando se registren'}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredPatients.map((patient: unknown) => {
                  const p = patient as { id: string; name: string; email: string };
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
                      <Fade in timeout={300}>
                        <Paper
                          elevation={0}
                          sx={{
                            height: '100%',
                            borderRadius: 3,
                            background: alpha('#fff', 0.8),
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            transition: 'all 0.3s',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                            },
                          }}
                        >
                          <CardActionArea
                            onClick={() => navigate(`/patient-details/${p.id}`)}
                            sx={{ height: '100%' }}
                          >
                            <CardContent sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              p: 3,
                              textAlign: 'center',
                              gap: 2,
                            }}>
                              <Box
                                sx={{
                                  width: 72,
                                  height: 72,
                                  borderRadius: 3,
                                  background: theme.palette.primary.main,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.75rem',
                                  fontWeight: 700,
                                  color: '#fff',
                                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                }}
                              >
                                {p.name?.charAt(0).toUpperCase() || <PersonIcon fontSize="large" />}
                              </Box>
                              <Box sx={{ width: '100%' }}>
                                <Typography 
                                  variant="h6" 
                                  fontWeight="700" 
                                  sx={{ 
                                    mb: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {p.name}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {p.email}
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Paper>
                      </Fade>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Box>
      </Fade>

      {/* Dialog para crear paciente */}
      <CreatePatientDialog
        open={showCreatePatientDialog}
        onClose={() => setShowCreatePatientDialog(false)}
        onSuccess={async () => {
          showSuccess('Paciente creado exitosamente. Se ha enviado un correo para establecer contraseña.');
          // Recargar lista de pacientes
          try {
            const data = await getAllPatients();
            setPatients(data);
            setFilteredPatients(data);
          } catch (error) {
            logger.error("Error reloading patients", 'DoctorDashboard', error);
          }
        }}
      />
    </Layout>
  );
};

export default DoctorDashboard;
