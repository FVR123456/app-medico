import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  useScrollTrigger,
  Slide,
  Chip,
  Avatar,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HistoryIcon from "@mui/icons-material/History";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import { useNotification } from "../context/NotificationContext";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const HideOnScroll = ({ children }: { children: React.ReactElement }) => {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const handleLogout = async () => {
    try {
      await logout();
      showNotification("Sesión cerrada exitosamente", "success");
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
      showNotification("Error al cerrar sesión", "error");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}
    >
      <HideOnScroll>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalHospitalIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  display: { xs: "none", sm: "block" },
                }}
              >
                MediControl
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Navigation Links based on Role */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {role === "patient" && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/patient-dashboard")}
                    startIcon={<DashboardIcon />}
                    sx={{
                      fontWeight: isActive("/patient-dashboard") ? 700 : 400,
                      bgcolor: isActive("/patient-dashboard")
                        ? "action.selected"
                        : "transparent",
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/book-appointment")}
                    startIcon={<CalendarMonthIcon />}
                    sx={{
                      fontWeight: isActive("/book-appointment") ? 700 : 400,
                      bgcolor: isActive("/book-appointment")
                        ? "action.selected"
                        : "transparent",
                    }}
                  >
                    Citas
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/medical-history")}
                    startIcon={<HistoryIcon />}
                    sx={{
                      fontWeight: isActive("/medical-history") ? 700 : 400,
                      bgcolor: isActive("/medical-history")
                        ? "action.selected"
                        : "transparent",
                    }}
                  >
                    Historial
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/patient/profile")}
                    startIcon={<PersonIcon />}
                    sx={{
                      fontWeight: isActive("/patient/profile") ? 700 : 400,
                      bgcolor: isActive("/patient/profile")
                        ? "action.selected"
                        : "transparent",
                    }}
                  >
                    Perfil
                  </Button>
                </>
              )}

              {role === "doctor" && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/doctor-dashboard")}
                    startIcon={<PeopleIcon />}
                    sx={{
                      fontWeight: isActive("/doctor-dashboard") ? 700 : 400,
                      bgcolor: isActive("/doctor-dashboard")
                        ? "action.selected"
                        : "transparent",
                    }}
                  >
                    Pacientes
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/appointments")}
                    startIcon={<CalendarMonthIcon />}
                    sx={{
                      fontWeight: isActive("/appointments") ? 700 : 400,
                      bgcolor: isActive("/appointments")
                        ? "action.selected"
                        : "transparent",
                    }}
                  >
                    Citas
                  </Button>
                </>
              )}
            </Box>

            <Chip
              avatar={
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {user?.displayName?.charAt(0) || "U"}
                </Avatar>
              }
              label={user?.displayName || "Usuario"}
              sx={{ display: { xs: "none", sm: "flex" } }}
            />

            <IconButton
              color="inherit"
              onClick={handleLogout}
              title="Cerrar Sesión"
              sx={{
                "&:hover": {
                  bgcolor: "error.main",
                  color: "white",
                },
                transition: "all 0.2s",
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            {title}
          </Typography>
        </Box>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
