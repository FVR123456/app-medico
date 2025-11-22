import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Avatar,
  alpha,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
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
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNotification } from "../context/NotificationContext";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}



const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const theme = useTheme();
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const patientMenuItems = [
    { label: 'Dashboard', path: '/patient-dashboard', icon: <DashboardIcon /> },
    { label: 'Citas', path: '/book-appointment', icon: <CalendarMonthIcon /> },
    { label: 'Historial', path: '/medical-history', icon: <HistoryIcon /> },
    { label: 'Perfil', path: '/patient/profile', icon: <PersonIcon /> },
  ];

  const doctorMenuItems = [
    { label: 'Pacientes', path: '/doctor-dashboard', icon: <PeopleIcon /> },
    { label: 'Citas', path: '/appointments', icon: <CalendarMonthIcon /> },
  ];

  const menuItems = role === 'patient' ? patientMenuItems : doctorMenuItems;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar con diseño moderno */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 100%)`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        <Toolbar>
          {/* Menu Icon para mobile */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LocalHospitalIcon />
            MediControl
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  background: isActive(item.path) 
                    ? alpha('#fff', 0.25)
                    : 'transparent',
                  '&:hover': {
                    background: alpha('#fff', 0.2),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#fff', 0.3), width: 32, height: 32 }}>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user?.displayName || user?.email}
              </Typography>
            </Box>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                border: `1px solid ${alpha('#fff', 0.3)}`,
                transition: 'all 0.3s',
                '&:hover': {
                  background: alpha('#fff', 0.2),
                  borderColor: alpha('#fff', 0.5),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                Salir
              </Box>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 100%)`,
            color: '#fff',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospitalIcon />
              Menú
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ bgcolor: alpha('#fff', 0.2), mb: 2 }} />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    background: isActive(item.path) 
                      ? alpha('#fff', 0.25)
                      : 'transparent',
                    '&:hover': {
                      background: alpha('#fff', 0.2),
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: '100%',
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          {title && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title}
              </Typography>
            </Box>
          )}
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
