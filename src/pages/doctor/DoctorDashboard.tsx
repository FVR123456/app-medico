import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Typography, Grid, Card, CardContent, CardActionArea, Avatar, Box, CircularProgress, TextField, InputAdornment, Fade, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllPatients, subscribeToAppointments } from '@/services/firestore';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '@/context/AuthContext';
import type { Appointment } from '@/services/firestore';
import { logger } from '@/services/logger';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<unknown[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<unknown[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
          {/* Stats Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Pacientes
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {patients.length}
                      </Typography>
                    </Box>
                    <PeopleOutlineIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        ⏳ Pendientes
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {pendingAppointments}
                      </Typography>
                    </Box>
                    <WarningIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        📅 Hoy
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {todayAppointments}
                      </Typography>
                    </Box>
                    <EventIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        📊 Total
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {appointments.length}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Alert for pending appointments */}
          {pendingAppointments > 0 && (
            <Card sx={{ mb: 4, backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <WarningIcon sx={{ color: '#f59e0b' }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="#b45309">
                      ⚠️ Tienes {pendingAppointments} cita(s) pendiente(s)
                    </Typography>
                    <Typography variant="caption" color="#92400e">
                      Accede al Gestor de Citas para revisarlas
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Search Section */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Buscar paciente por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: { md: 500 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                }
              }}
            />
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
                        <Card sx={{
                          height: '100%',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          }
                        }}>
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
                              gap: 2
                            }}>
                              <Avatar sx={{
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                width: 64,
                                height: 64,
                                fontSize: '1.5rem'
                              }}>
                                {p.name?.charAt(0).toUpperCase() || <PersonIcon />}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
                                  {p.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                  {p.email}
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Fade>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Box>
      </Fade>
    </Layout>
  );
};

export default DoctorDashboard;
