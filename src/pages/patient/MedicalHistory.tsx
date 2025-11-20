import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  CircularProgress, 
  Fade
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { subscribeToPatientRecords, type MedicalRecord, updateMedicalRecord } from '../../services/firestore';
import DescriptionIcon from '@mui/icons-material/Description';
import MedicalRecordCard from '../../components/MedicalRecordCard';

const MedicalHistory = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToPatientRecords(user.uid, (data) => {
      setRecords(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <Layout title="Historial Médico">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Historial Médico">
      <Fade in timeout={500}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <DescriptionIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Mi Historial Clínico
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {records.length} {records.length === 1 ? 'consulta registrada' : 'consultas registradas'}
            </Typography>
          </Box>

          {/* Records */}
          {records.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <DescriptionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sin Consultas Previas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tu historial médico aparecerá aquí después de tu primera consulta
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
              {records.map((record) => (
                <Box key={record.id}>
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
              ))}
            </Box>
          )}
        </Box>
      </Fade>
    </Layout>
  );
};

export default MedicalHistory;
