import { useState } from 'react';
import { Box, Button, Paper, Typography, Divider, Chip, Alert, Stack, alpha, useTheme } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '@/context/AuthContext';
import type { MedicalHistory } from '@/types';
import { useMedicalHistoryForm } from './useMedicalHistoryForm';
import { IdentificationSection } from './IdentificationSection';
import { FamilyHistorySection } from './FamilyHistorySection';
import { PathologicalHistorySection } from './PathologicalHistorySection';
import { NonPathologicalHistorySection } from './NonPathologicalHistorySection';
import { GynecologicalHistorySection } from './GynecologicalHistorySection';
import { SystemsReviewSection } from './SystemsReviewSection';

interface MedicalHistoryFormProps {
  patientId: string;
  patientName: string;
  patientGender?: 'Masculino' | 'Femenino' | 'Otro';
  existingHistory?: MedicalHistory;
  onSave: (history: Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel?: () => void;
}

export const MedicalHistoryForm = ({
  patientId,
  patientName,
  patientGender,
  existingHistory,
  onSave,
  onCancel,
}: MedicalHistoryFormProps) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!existingHistory); // Modo edición solo si es nueva

  const {
    formData,
    updateField,
    updateNestedField,
    addToArray,
    removeFromArray,
    updateArrayItem,
    resetForm,
  } = useMedicalHistoryForm(patientId, patientGender, existingHistory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        doctorId: user?.uid || '',
        doctorName: user?.displayName || '',
      };
      await onSave(dataToSave);
      setIsEditMode(false); // Salir del modo edición después de guardar
    } catch (error) {
      console.error('Error al guardar historia clínica:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    // Si hay historia existente, recargar los datos originales
    if (existingHistory) {
      resetForm(existingHistory);
      setIsEditMode(false);
    } else if (onCancel) {
      // Si es nueva y no hay historia, cerrar
      onCancel();
    }
  };

  const isReadOnly = !isEditMode;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 3,
          borderRadius: 3,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          background: alpha('#fff', 0.9),
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <AssignmentIcon sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Historia Clínica Completa
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 7.5 }}>
              Paciente: <strong>{patientName}</strong>
            </Typography>
          </Stack>
          {isReadOnly && (
            <Chip
              icon={<LockIcon />}
              label="Solo Lectura"
              sx={{ 
                fontWeight: 600,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                borderRadius: 2,
                px: 1,
              }}
            />
          )}
        </Box>
        
        {isReadOnly && (
          <Paper
            elevation={0}
            sx={{ 
              mb: 3,
              p: 2.5,
              borderRadius: 2,
              background: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: theme.palette.info.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                La historia clínica está protegida. Presiona <strong>"Editar"</strong> para realizar modificaciones.
              </Typography>
            </Stack>
          </Paper>
        )}
        
        <Divider sx={{ mb: 3 }} />

        {/* Sección 1: Ficha de Identificación */}
        <Box sx={{ mb: 2 }}>
          <IdentificationSection
            data={formData.identification}
            onChange={(field, value) => updateField('identification', field, value)}
            readOnly={isReadOnly}
          />
        </Box>

        {/* Sección 2: Antecedentes Heredofamiliares */}
        <Box sx={{ mb: 2 }}>
          <FamilyHistorySection
            data={formData.familyHistory}
            onChange={(field, value) => updateField('familyHistory', field, value)}
            readOnly={isReadOnly}
          />
        </Box>

        {/* Sección 3: Antecedentes Patológicos */}
        <Box sx={{ mb: 2 }}>
          <PathologicalHistorySection
            data={formData.pathologicalHistory}
            onUpdateField={(field, value) => updateField('pathologicalHistory', field, value)}
            onUpdateNestedField={(subsection, field, value) =>
              updateNestedField('pathologicalHistory', subsection, field, value)
            }
            onAddToArray={(field, item) => addToArray('pathologicalHistory', field, item)}
            onRemoveFromArray={(field, index) => removeFromArray('pathologicalHistory', field, index)}
            onUpdateArrayItem={(arrayField, index, itemField, value) =>
              updateArrayItem('pathologicalHistory', arrayField, index, itemField, value)
            }
            readOnly={isReadOnly}
          />
        </Box>

        {/* Sección 4: Antecedentes No Patológicos */}
        <Box sx={{ mb: 2 }}>
          <NonPathologicalHistorySection
            data={formData.nonPathologicalHistory}
            onUpdateField={(field, value) => updateField('nonPathologicalHistory', field, value)}
            onUpdateNestedField={(subsection, field, value) =>
              updateNestedField('nonPathologicalHistory', subsection, field, value)
            }
            readOnly={isReadOnly}
          />
        </Box>

        {/* Sección 5: Antecedentes Gineco-Obstétricos (solo mujeres) */}
        {patientGender === 'Femenino' && formData.gynecologicalHistory && (
          <Box sx={{ mb: 2 }}>
            <GynecologicalHistorySection
              data={formData.gynecologicalHistory}
              onChange={(field, value) => updateField('gynecologicalHistory', field, value)}
              readOnly={isReadOnly}
            />
          </Box>
        )}

        {/* Sección 6: Interrogatorio por Aparatos y Sistemas */}
        <Box sx={{ mb: 2 }}>
          <SystemsReviewSection
            data={formData.systemsReview}
            onChange={(field, value) => updateField('systemsReview', field, value)}
            readOnly={isReadOnly}
          />
        </Box>

        {/* Botones de acción */}
        <Box 
          sx={{ 
            mt: 4, 
            pt: 3,
            borderTop: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}
        >
          {isReadOnly ? (
            <>
              {onCancel && (
                <Button 
                  variant="outlined" 
                  onClick={onCancel}
                  size="large"
                  sx={{ 
                    minWidth: 120,
                    borderRadius: 2,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  Cerrar
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                size="large"
                sx={{ 
                  minWidth: 180,
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                Editar Historia
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                disabled={loading}
                startIcon={<CancelIcon />}
                size="large"
                sx={{ 
                  minWidth: 120,
                  borderRadius: 2,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                {existingHistory ? 'Cancelar' : 'Cerrar'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
                size="large"
                sx={{ 
                  minWidth: 180,
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
