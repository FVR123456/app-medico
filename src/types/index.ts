// Types for Medical Records System

export interface VitalSigns {
     bloodPressure?: string;      // "120/80"
     heartRate?: number;           // bpm
     temperature?: number;         // Celsius
     weight?: number;              // kg
     height?: number;              // cm
     oxygenSaturation?: number;    // %
     glucose?: number;             // mg/dL
}

export interface Attachment {
     name: string;
     url: string;
     type: string;
     uploadedAt: string;
}

export interface MedicalRecord {
     id: string;
     patientId: string;
     doctorName: string;
     date: string;
     diagnosis: string;
     prescription: string;
     vitalSigns?: VitalSigns;
     allergies?: string[];
     currentMedications?: string[];
     attachments?: Attachment[];
     notes?: string;
}

export interface Appointment {
     id: string;
     patientId: string;
     patientName: string;
     date: string;
     time: string;
     reason: string;
     status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
     createdAt: string;
     doctorNotes?: string;
}

export interface FamilyMember {
     id: string;
     name: string;
     relationship: string;  // "hijo", "hija", "esposo", "esposa", "padre", "madre", etc.
     birthDate: string;     // ISO date string
     notes?: string;        // Notas adicionales opcionales
}

export interface PatientProfile {
     id: string;
     name: string;
     email: string;
     role?: 'patient' | 'doctor';
     profileCompleted?: boolean;  // Indica si completó el wizard
     photoURL?: string;  // Para usuarios de Google
     
     // Datos personales básicos
     phone?: string;
     birthDate?: string;
     gender?: 'Masculino' | 'Femenino' | 'Otro';
     address?: string;
     
     // Información médica
     bloodType?: string;
     height?: number;  // cm
     weight?: number;  // kg
     chronicConditions?: string[];
     knownAllergies?: string[];
     currentMedications?: string[];
     previousSurgeries?: string[];
     
     // Multi-perfil familiar
     familyMembers?: FamilyMember[];
     
     // Contacto de emergencia
     emergencyContact?: {
          name: string;
          phone: string;
          relationship: string;
     };
     
     // Seguro médico
     insurance?: {
          provider: string;
          policyNumber: string;
     };
}
