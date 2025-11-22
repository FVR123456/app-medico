import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Divider,
  alpha,
  useTheme,
  InputAdornment,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import type { PatientProfile } from '../../types';

interface CreatePatientDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = ['Datos Personales', 'Contacto', 'Información Adicional'];

const CreatePatientDialog = ({ open, onClose, onSuccess }: CreatePatientDialogProps) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Datos del paciente
  const [formData, setFormData] = useState<Partial<PatientProfile>>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: undefined,
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    insurance: {
      provider: '',
      policyNumber: ''
    }
  });

  const handleChange = (field: string, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof PatientProfile] as Record<string, unknown>),
        [field]: value
      }
    }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.name?.trim()) {
          setError('El nombre es requerido');
          return false;
        }
        if (!formData.email?.trim()) {
          setError('El correo electrónico es requerido');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('El correo electrónico no es válido');
          return false;
        }
        if (!formData.birthDate) {
          setError('La fecha de nacimiento es requerida');
          return false;
        }
        if (!formData.gender) {
          setError('El género es requerido');
          return false;
        }
        return true;

      case 1:
        if (!formData.phone?.trim()) {
          setError('El teléfono es requerido');
          return false;
        }
        if (!formData.address?.trim()) {
          setError('La dirección es requerida');
          return false;
        }
        return true;

      case 2:
        // Contacto de emergencia es opcional
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError('');

    try {
      const { createPatientByDoctor } = await import('../../services/auth');
      await createPatientByDoctor(formData as Omit<PatientProfile, 'id' | 'role' | 'profileCompleted'>);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado');
      } else {
        setError(error.message || 'Error al crear el paciente');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setActiveStep(0);
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: undefined,
        address: '',
        emergencyContact: { name: '', phone: '', relationship: '' },
        insurance: { provider: '', policyNumber: '' }
      });
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              label="Nombre completo"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            />

            <TextField
              label="Correo electrónico"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              fullWidth
              helperText="Se enviará un correo para establecer contraseña"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            />

            <TextField
              label="Fecha de nacimiento"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CakeIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            />

            <FormControl 
              fullWidth 
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            >
              <InputLabel>Género</InputLabel>
              <Select
                value={formData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                label="Género"
                startAdornment={
                  <InputAdornment position="start">
                    <WcIcon color="primary" />
                  </InputAdornment>
                }
              >
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Femenino">Femenino</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              fullWidth
              placeholder="Ej: 5512345678"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            />

            <TextField
              label="Dirección"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              fullWidth
              multiline
              rows={3}
              placeholder="Calle, número, colonia, código postal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <HomeIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <ContactEmergencyIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="600">
                  Contacto de Emergencia (Opcional)
                </Typography>
              </Stack>
              <Stack spacing={2}>
                <TextField
                  label="Nombre del contacto"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: '#fff',
                    },
                  }}
                />

                <TextField
                  label="Teléfono del contacto"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: '#fff',
                    },
                  }}
                />

                <TextField
                  label="Relación"
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                  fullWidth
                  placeholder="Ej: Esposo/a, Hijo/a, Hermano/a"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: '#fff',
                    },
                  }}
                />
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: alpha(theme.palette.success.main, 0.04),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <LocalHospitalIcon color="success" />
                <Typography variant="subtitle1" fontWeight="600">
                  Seguro Médico (Opcional)
                </Typography>
              </Stack>
              <Stack spacing={2}>
                <TextField
                  label="Aseguradora"
                  value={formData.insurance?.provider || ''}
                  onChange={(e) => handleNestedChange('insurance', 'provider', e.target.value)}
                  fullWidth
                  placeholder="Ej: IMSS, ISSSTE, Seguro privado"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: '#fff',
                    },
                  }}
                />

                <TextField
                  label="Número de póliza"
                  value={formData.insurance?.policyNumber || ''}
                  onChange={(e) => handleNestedChange('insurance', 'policyNumber', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: '#fff',
                    },
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <PersonAddIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight="700">
              Crear Nuevo Paciente
            </Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Paciente creado exitosamente. Se ha enviado un correo electrónico para establecer su contraseña.
            </Alert>
          ) : (
            <>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {renderStepContent(activeStep)}
            </>
          )}
        </Box>
      </DialogContent>

      {!success && (
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3,
            pt: 2,
            background: alpha(theme.palette.primary.main, 0.02),
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          {activeStep > 0 && (
            <Button 
              onClick={handleBack} 
              disabled={loading}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Atrás
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleNext} 
              disabled={loading}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              {loading ? 'Creando...' : 'Crear Paciente'}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CreatePatientDialog;
