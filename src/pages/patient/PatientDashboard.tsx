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
} from "@mui/material";
import type { ChipPropsColorOverrides } from "@mui/material/Chip";
import type { OverridableStringUnion } from "@mui/types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscribeToAppointments, type Appointment } from "../../services/firestore";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout title={`Hola, ${user?.displayName || "Paciente"}`}>
      <Fade in timeout={500}>
        <Box>
          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <EventAvailableIcon
                    sx={{ fontSize: 40, mb: 1, opacity: 0.9 }}
                  />
                  <Typography variant="h4" fontWeight="bold">
                    {upcomingCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Confirmadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <CalendarTodayIcon
                    sx={{ fontSize: 40, mb: 1, opacity: 0.9 }}
                  />
                  <Typography variant="h4" fontWeight="bold">
                    {pendingCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pendientes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h6"
                fontWeight="600"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Acciones Rápidas
              </Typography>
              <Stack spacing={2}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "white",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                  onClick={() => navigate("/book-appointment")}
                >
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}
                  >
                    <AddCircleOutlineIcon sx={{ fontSize: 40 }} />
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
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                  onClick={() => navigate("/medical-history")}
                >
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}
                  >
                    <HistoryIcon sx={{ fontSize: 40, color: "primary.main" }} />
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
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                  onClick={() => navigate("/patient/profile")}
                >
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}
                  >
                    <PersonIcon sx={{ fontSize: 40, color: "secondary.main" }} />
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
            </Grid>

            {/* Upcoming Appointments */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography
                variant="h6"
                fontWeight="600"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Mis Citas
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                  <CircularProgress />
                </Box>
              ) : appointments.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: "center", py: 6 }}>
                    <CalendarTodayIcon
                      sx={{
                        fontSize: 60,
                        color: "text.secondary",
                        mb: 2,
                        opacity: 0.5,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No tienes citas programadas
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Agenda tu primera consulta para comenzar
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => navigate("/book-appointment")}
                    >
                      Agendar Cita
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={2}>
                  {appointments.map((apt) => (
                    <Fade in timeout={300} key={apt.id}>
                      <Card>
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            flexWrap="wrap"
                            gap={2}
                          >
                            <Box>
                              <Typography
                                variant="h6"
                                fontWeight="600"
                                gutterBottom
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
                              <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                🕐{" "}
                                {new Date(apt.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                <strong>Motivo:</strong> {apt.reason}
                              </Typography>
                            </Box>
                            <Chip
                              label={getStatusLabel(apt.status)}
                              color={getStatusColor(apt.status)}
                              size="medium"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  ))}
                </Stack>
              )}
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Layout>
  );
};

export default PatientDashboard;
