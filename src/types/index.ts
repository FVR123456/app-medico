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
     updatedAt?: string;
     doctorNotes?: string;
     requiresApproval?: boolean; // true para citas de fin de semana
     isWeekend?: boolean; // indica si es fin de semana
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
     profileCompleted?: boolean;  // Indica si completó el registro
     photoURL?: string;  // Para usuarios de Google
     createdByDoctor?: boolean;  // Indica si fue creado por el doctor
     
     // Datos personales básicos
     phone?: string;
     birthDate?: string;
     gender?: 'Masculino' | 'Femenino' | 'Otro';
     address?: string;
     
     // Multi-perfil familiar
     familyMembers?: FamilyMember[];
     
     // Contacto de emergencia
     emergencyContact?: {
          name: string;
          phone: string;
          relationship: string;
     };
     
     // Seguro médico (opcional)
     insurance?: {
          provider: string;
          policyNumber: string;
     };
     
     // Indica si tiene historia clínica completa (creada por el doctor)
     hasMedicalHistory?: boolean;
}

// Historia Clínica Completa (Primera Consulta)
export interface MedicalHistory {
     id: string;
     patientId: string;
     doctorId: string;
     doctorName: string;
     createdAt: string;
     updatedAt: string;
     
     // 1. Ficha de Identificación
     identification: {
          occupation?: string;
          maritalStatus?: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Unión Libre' | '';
          education?: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'Licenciatura' | 'Posgrado' | '';
          placeOfBirth?: string;
          currentResidence?: string;
     };
     
     // C. Antecedentes Heredo-Familiares
     familyHistory: {
          diabetes?: boolean;
          hypertension?: boolean;
          cancer?: boolean;
          heartDisease?: boolean;
          neurologicalDisorders?: boolean;
          mentalDisorders?: boolean;
          other?: string;  // Campo de texto libre
     };
     
     // D. Antecedentes Personales Patológicos
     pathologicalHistory: {
          allergies?: string[];  // Crítico
          chronicDiseases?: string[];
          previousSurgeries?: Array<{
               surgery: string;
               date: string;
               complications?: string;
          }>;
          traumas?: string;  // Campo de texto libre
          transfusions?: string;  // Campo de texto libre
          hospitalizations?: Array<{
               reason: string;
               date: string;
               duration?: string;
          }>;
          addictions?: {
               smoking?: boolean;
               smokingDetails?: string;  // cigarrillos/día, años fumando
               alcohol?: boolean;
               alcoholDetails?: string;  // frecuencia, cantidad
               drugs?: boolean;
               drugsDetails?: string;
          };
     };
     
     // E. Antecedentes Personales No Patológicos
     nonPathologicalHistory: {
          housing?: {
               basicServices?: boolean;  // agua, luz, drenaje
               overcrowding?: boolean;
               pets?: string;
          };
          diet?: string;  // Campo de texto libre
          physicalActivity?: string;  // Campo de texto libre
          hygiene?: string;  // Campo de texto libre
          immunizations?: string;  // Campo de texto libre
     };
     
     // F. Antecedentes Gineco-Obstétricos (solo mujeres)
     gynecologicalHistory?: {
          menarche?: number;  // edad en años
          menstrualCycle?: string;  // ej: "28/4" (días de ciclo/días de sangrado)
          lastMenstrualPeriod?: string;  // fecha ISO
          pregnancies?: number;  // G
          births?: number;  // P
          cesareans?: number;  // C
          abortions?: number;  // A
          contraception?: string;
          lastPapSmear?: string;  // fecha ISO
          lastMammogram?: string;  // fecha ISO
     } | null;
     
     // 3. Interrogatorio por Aparatos y Sistemas
     systemsReview: {
          general?: string;  // fiebre, astenia, adinamia, pérdida de peso
          respiratory?: string;  // tos, disnea, dolor torácico
          cardiovascular?: string;  // palpitaciones, edema, síncope
          digestive?: string;  // náusea, vómito, diarrea, estreñimiento
          urinary?: string;  // disuria, poliuria, hematuria
          musculoskeletal?: string;  // dolor articular, limitación
          neurological?: string;  // cefalea, mareo, convulsiones
     };
}
