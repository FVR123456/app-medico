import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  CircularProgress,
  Fade,
  Divider,
  Stack,
  Paper,
  Container,
  alpha,
  useTheme,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
} from "@mui/material";
import type { ChipPropsColorOverrides } from "@mui/material/Chip";
import type { OverridableStringUnion } from "@mui/types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscribeToAppointments, updateAppointment, deleteAppointment, type Appointment } from "../../services/firestore";
import { useNotification } from "../../context/NotificationContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

const PatientDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToAppointments(user.uid, 'patient', (data) => {
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (
    status: string
  ): OverridableStringUnion<
    "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning",
    ChipPropsColorOverrides
  > => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Aceptada";
      case "rejected":
        return "Rechazada";
      default:
        return "Pendiente";
    }
  };

  const pendingCount = appointments.filter(
    (apt) => apt.status === "pending"
  ).length;
  const upcomingCount = appointments.filter(
    (apt) => apt.status === "accepted"
  ).length;
  const totalAppointments = appointments.length;

  // Manejar clic en una cita
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditing(false);
    // Preparar datos para edición
    const aptDate = new Date(appointment.date);
    setEditDate(aptDate.toISOString().split('T')[0]);
    setEditTime(aptDate.toTimeString().slice(0, 5));
    setEditReason(appointment.reason);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setSelectedAppointment(null);
    setIsEditing(false);
    setEditReason("");
    setEditDate("");
    setEditTime("");
  };

  // Cancelar cita
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;

    setSubmitting(true);
    try {
      await deleteAppointment(selectedAppointment.id);
      showSuccess("Cita cancelada exitosamente");
      handleCloseDialog();
    } catch (error) {
      console.error("Error al cancelar cita:", error);
      showError("Error al cancelar la cita");
    } finally {
      setSubmitting(false);
    }
  };

  // Actualizar cita
  const handleUpdateAppointment = async () => {
    if (!selectedAppointment || !editDate || !editTime || !editReason.trim()) {
      showError("Por favor completa todos los campos");
      return;
    }

    setSubmitting(true);
    try {
      const newDateTime = new Date(`${editDate}T${editTime}`);
      await updateAppointment(selectedAppointment.id, {
        date: newDateTime.toISOString(),
        reason: editReason,
        status: 'pending', // Reiniciar a pendiente cuando se edita
      });
      showSuccess("Cita actualizada exitosamente. Esperando confirmación del doctor.");
      handleCloseDialog();
    } catch (error) {
      console.error("Error al actualizar cita:", error);
      showError("Error al actualizar la cita");
    } finally {
      setSubmitting(false);
    }
  };

  // Skeleton de carga con el mismo estilo
  if (loading) {
    return (
      <Layout title={`Hola, ${user?.displayName || "Paciente"}`}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            {/* Skeleton del header */}
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '2rem', maxWidth: 400, mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem', maxWidth: 250, mx: 'auto' }} />
            </Box>
            
            {/* Skeleton de las tarjetas de estadísticas */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <Skeleton variant="rounded" height={140} />
                </Grid>
              ))}
            </Grid>

            {/* Skeleton de acciones rápidas y citas */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rounded" height={400} />
              </Grid>
              <Grid item xs={12} md={8}>
                <Skeleton variant="rounded" height={400} />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title={`Hola, ${user?.displayName || "Paciente"}`}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={500}>
            <Box sx={{ py: 4 }}>
              {/* Header mejorado con glassmorphism - igual que Medical History */}
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
                    <DashboardIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="700" gutterBottom sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    ¡Bienvenido, {user?.displayName || "Paciente"}!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    Gestiona tus citas médicas y accede a tu información de salud de forma rápida y sencilla
                  </Typography>
                </Paper>
              </Box>

              {/* Tarjetas de estadísticas mejoradas - Distribución horizontal compacta */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: alpha(theme.palette.background.paper, 0.8),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(theme.palette.success.main, 0.2)}`,
                      borderColor: theme.palette.success.main,
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EventAvailableIcon sx={{ color: theme.palette.success.main, fontSize: 24 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                        Confirmadas
                      </Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="700" color="success.main">
                      {upcomingCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Citas aceptadas
                    </Typography>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: alpha(theme.palette.background.paper, 0.8),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(theme.palette.warning.main, 0.2)}`,
                      borderColor: theme.palette.warning.main,
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTimeIcon sx={{ color: theme.palette.warning.main, fontSize: 24 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                        Pendientes
                      </Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="700" color="warning.main">
                      {pendingCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      En espera de confirmación
                    </Typography>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: alpha(theme.palette.background.paper, 0.8),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(theme.palette.info.main, 0.2)}`,
                      borderColor: theme.palette.info.main,
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TrendingUpIcon sx={{ color: theme.palette.info.main, fontSize: 24 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                        Total Citas
                      </Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="700" color="info.main">
                      {totalAppointments}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Historial completo
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>

              {/* Contenedor principal con el mismo ancho que el header */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: alpha(theme.palette.background.paper, 0.6),
                }}
              >
                <Grid container spacing={3}>
                {/* Quick Actions - Mejoradas con el nuevo estilo */}
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      gutterBottom
                      sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      />
                      Acciones Rápidas
                    </Typography>
                    <Stack spacing={2}>
                      <Card
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          color: "white",
                          cursor: "pointer",
                          transition: 'all 0.3s ease',
                          border: 'none',
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                          },
                        }}
                        onClick={() => navigate("/book-appointment")}
                      >
                        <CardContent
                          sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: alpha('#fff', 0.2),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <AddCircleOutlineIcon sx={{ fontSize: 28 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="600">
                              Nueva Cita
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Solicitar consulta
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>

                      <Card
                        sx={{
                          cursor: "pointer",
                          transition: 'all 0.3s ease',
                          border: '1px solid',
                          borderColor: 'divider',
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                        onClick={() => navigate("/medical-history")}
                      >
                        <CardContent
                          sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: alpha(theme.palette.primary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <HistoryIcon sx={{ fontSize: 28, color: "primary.main" }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="600">
                              Mi Historial
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ver consultas previas
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>

                      <Card
                        sx={{
                          cursor: "pointer",
                          transition: 'all 0.3s ease',
                          border: '1px solid',
                          borderColor: 'divider',
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.15)}`,
                            borderColor: theme.palette.secondary.main,
                          },
                        }}
                        onClick={() => navigate("/patient/profile")}
                      >
                        <CardContent
                          sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: alpha(theme.palette.secondary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 28, color: "secondary.main" }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="600">
                              Mi Perfil
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Editar información personal
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Box>
                </Grid>

                {/* Upcoming Appointments - Mejorada */}
                <Grid item xs={12} md={8}>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      gutterBottom
                      sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      />
                      Mis Citas
                    </Typography>
                    {appointments.length === 0 ? (
                      <Box 
                        sx={{ 
                          textAlign: "center", 
                          py: 8,
                          px: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '20px',
                            background: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                          }}
                        >
                          <CalendarTodayIcon
                            sx={{
                              fontSize: 40,
                              color: theme.palette.primary.main,
                            }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                          fontWeight="600"
                        >
                          No tienes citas programadas
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
                        >
                          Agenda tu primera consulta médica para comenzar tu atención personalizada
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddCircleOutlineIcon />}
                          onClick={() => navigate("/book-appointment")}
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
                          Agendar Mi Primera Cita
                        </Button>
                      </Box>
                    ) : (
                      <Stack spacing={2}>
                        {appointments.map((apt) => (
                          <Fade in timeout={300} key={apt.id}>
                            <Card
                              elevation={0}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                                  borderColor: theme.palette.primary.main,
                                }
                              }}
                              onClick={() => handleAppointmentClick(apt)}
                            >
                              <CardContent sx={{ p: 3 }}>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="flex-start"
                                  flexWrap="wrap"
                                  gap={2}
                                >
                                  <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                      <CalendarTodayIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                                      <Typography
                                        variant="h6"
                                        fontWeight="600"
                                      >
                                        {new Date(apt.date).toLocaleDateString(
                                          "es-MX",
                                          {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          }
                                        )}
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                      <AccessTimeIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                                      <Typography
                                        variant="body1"
                                        color="text.secondary"
                                      >
                                        {new Date(apt.date).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </Typography>
                                    </Stack>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mt: 1 }}
                                    >
                                      <strong>Motivo:</strong> {apt.reason}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={getStatusLabel(apt.status)}
                                    color={getStatusColor(apt.status)}
                                    size="medium"
                                    sx={{ 
                                      fontWeight: 600,
                                      px: 1,
                                    }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </Fade>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Grid>
              </Grid>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Diálogo de detalles/edición de cita */}
      <Dialog 
        open={!!selectedAppointment} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEditing ? (
              <EditIcon color="primary" />
            ) : (
              <InfoIcon color="primary" />
            )}
            <Typography variant="h6" fontWeight="600">
              {isEditing ? 'Editar Cita' : 'Detalles de la Cita'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ pt: 3 }}>
          {selectedAppointment && (
            <Stack spacing={3}>
              {!isEditing ? (
                // Vista de solo lectura
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="600">
                      Estado
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={getStatusLabel(selectedAppointment.status)}
                        color={getStatusColor(selectedAppointment.status)}
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="600">
                      Fecha y Hora
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                      <Typography variant="body1" fontWeight="500">
                        {new Date(selectedAppointment.date).toLocaleDateString("es-MX", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                      <Typography variant="body1">
                        {new Date(selectedAppointment.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="600">
                      Motivo de la Consulta
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mt: 1,
                        background: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body1">
                        {selectedAppointment.reason}
                      </Typography>
                    </Paper>
                  </Box>

                  {selectedAppointment.status === 'rejected' && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        background: alpha(theme.palette.error.main, 0.1),
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.2),
                      }}
                    >
                      <Typography variant="body2" color="error.main" fontWeight="500">
                        Esta cita ha sido rechazada por el doctor.
                      </Typography>
                    </Paper>
                  )}
                </>
              ) : (
                // Vista de edición
                <>
                  <TextField
                    label="Fecha"
                    type="date"
                    fullWidth
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
                    }}
                  />

                  <TextField
                    label="Hora"
                    type="time"
                    fullWidth
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    label="Motivo de la Consulta"
                    multiline
                    rows={4}
                    fullWidth
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Describe el motivo de tu consulta..."
                  />

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      background: alpha(theme.palette.warning.main, 0.1),
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.warning.main, 0.2),
                    }}
                  >
                    <Typography variant="caption" color="warning.dark">
                      Al editar la cita, volverá al estado "Pendiente" y deberá ser confirmada nuevamente por el doctor.
                    </Typography>
                  </Paper>
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          {!isEditing ? (
            <>
              {selectedAppointment?.status !== 'rejected' && (
                <Button
                  onClick={() => setIsEditing(true)}
                  startIcon={<EditIcon />}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  Editar
                </Button>
              )}
              <Button
                onClick={handleCancelAppointment}
                startIcon={<DeleteIcon />}
                color="error"
                variant="outlined"
                disabled={submitting}
                sx={{ borderRadius: 2 }}
              >
                Cancelar Cita
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                sx={{ borderRadius: 2 }}
              >
                Cerrar
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                disabled={submitting}
                sx={{ borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                onClick={handleUpdateAppointment}
                variant="contained"
                disabled={submitting || !editDate || !editTime || !editReason.trim()}
                sx={{ borderRadius: 2 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Guardar Cambios'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default PatientDashboard;
