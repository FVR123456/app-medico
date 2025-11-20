import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import type { FamilyMember } from '../services/firestore';

interface AddFamilyMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (member: Omit<FamilyMember, 'id'>) => void;
}

const AddFamilyMemberDialog: React.FC<AddFamilyMemberDialogProps> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const relationships = [
    'Hijo',
    'Hija',
    'Esposo',
    'Esposa',
    'Padre',
    'Madre',
    'Hermano',
    'Hermana',
    'Abuelo',
    'Abuela',
    'Otro'
  ];

  const handleSubmit = () => {
    if (!name.trim() || !relationship || !birthDate) {
      setError('Por favor complete los campos obligatorios');
      return;
    }

    onAdd({
      name: name.trim(),
      relationship,
      birthDate,
      notes: notes.trim() || undefined
    });

    // Reset form
    setName('');
    setRelationship('');
    setBirthDate('');
    setNotes('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setRelationship('');
    setBirthDate('');
    setNotes('');
    setError('');
    onClose();
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" fontWeight="600">
            Agregar Familiar
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <TextField
            label="Nombre Completo *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Juan Pérez García"
            fullWidth
            autoFocus
          />

          <FormControl fullWidth>
            <InputLabel>Parentesco *</InputLabel>
            <Select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              label="Parentesco *"
            >
              {relationships.map((rel) => (
                <MenuItem key={rel} value={rel}>
                  {rel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Fecha de Nacimiento *"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: getMaxDate() }}
            fullWidth
          />

          <TextField
            label="Notas Adicionales (Opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Alergias, condiciones especiales..."
            multiline
            rows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFamilyMemberDialog;
