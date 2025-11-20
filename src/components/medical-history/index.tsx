import { useState } from 'react';
import { Box, Button, Paper, Typography, Divider, Chip, Alert, Stack } from '@mui/material';
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
    setIsEditMode(false);
    if (onCancel) {
      onCancel();
    }
  };

  const isReadOnly = !isEditMode;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AssignmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Historia Clínica Completa
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5.5 }}>
              Paciente: <strong>{patientName}</strong>
            </Typography>
          </Stack>
          {isReadOnly && (
            <Chip
              icon={<LockIcon />}
              label="Solo Lectura"
              color="info"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>
        
        {isReadOnly && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
          >
            La historia clínica está protegida. Presiona <strong>"Editar"</strong> para realizar modificaciones.
          </Alert>
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
            borderTop: '1px solid',
            borderColor: 'divider',
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
                  sx={{ minWidth: 120 }}
                >
                  Cerrar
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                color="primary"
                size="large"
                sx={{ minWidth: 180 }}
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
                sx={{ minWidth: 120 }}
              >
                {existingHistory ? 'Cancelar' : 'Cerrar'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
                size="large"
                sx={{ minWidth: 180 }}
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
