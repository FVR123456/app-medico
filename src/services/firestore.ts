import { 
     collection, 
     query, 
     where, 
     getDocs, 
     addDoc, 
     updateDoc, 
     doc, 
     getDoc,
     onSnapshot,
     deleteDoc,
     orderBy
} from "firebase/firestore";
import { db } from "../firebase-config";
import { retryWithBackoff } from "./retry";
import type { 
     Appointment, 
     MedicalRecord, 
     VitalSigns, 
     PatientProfile,
     FamilyMember
} from '../types';

// Re-export types for convenience
export type { Appointment, MedicalRecord, VitalSigns, PatientProfile, FamilyMember } from '../types';

// --- Appointments ---

// Real-time listener for appointments
export const subscribeToAppointments = (
     userId: string, 
     role: 'doctor' | 'patient',
     callback: (appointments: Appointment[]) => void
) => {
     const appointmentsRef = collection(db, "appointments");
     let q;

     if (role === 'doctor') {
          q = query(appointmentsRef, orderBy("date", "asc"));
     } else {
          q = query(
               appointmentsRef, 
               where("patientId", "==", userId),
               orderBy("date", "asc")
          );
     }

     return onSnapshot(q, (snapshot) => {
          const appointments = snapshot.docs.map(doc => ({
               id: doc.id,
               ...doc.data()
          } as Appointment));
          callback(appointments);
     });
};

export const getAppointments = async (userId: string, role: 'doctor' | 'patient') => {
     return retryWithBackoff(async () => {
          const appointmentsRef = collection(db, "appointments");
          let q;

          if (role === 'doctor') {
               q = query(appointmentsRef, orderBy("date", "asc"));
          } else {
               q = query(
                    appointmentsRef, 
                    where("patientId", "==", userId),
                    orderBy("date", "asc")
               );
          }

          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => ({ 
               id: doc.id, 
               ...doc.data() 
          } as Appointment));
     }, { maxRetries: 3, delay: 1000 });
};

export const createAppointment = async (
     patientId: string, 
     patientName: string, 
     date: string, 
     time: string,
     reason: string
) => {
     if (!date || !time || !reason.trim()) {
          throw new Error('Todos los campos son requeridos');
     }

     const appointmentDate = new Date(`${date}T${time}`);
     if (appointmentDate < new Date()) {
          throw new Error('No puedes agendar citas en el pasado');
     }

     return retryWithBackoff(async () => {
          await addDoc(collection(db, "appointments"), {
               patientId,
               patientName,
               date,
               time,
               reason: reason.trim(),
               status: 'pending',
               createdAt: new Date().toISOString()
          });
     }, { maxRetries: 3, delay: 1000 });
};

export const updateAppointmentStatus = async (
     appointmentId: string, 
     status: 'accepted' | 'rejected' | 'cancelled',
     doctorNotes?: string
) => {
     return retryWithBackoff(async () => {
          const appointmentRef = doc(db, "appointments", appointmentId);
          const updateData: Record<string, any> = { 
               status,
               updatedAt: new Date().toISOString()
          };
          
          if (doctorNotes) {
               updateData.doctorNotes = doctorNotes;
          }
          
          await updateDoc(appointmentRef, updateData);
     }, { maxRetries: 3, delay: 1000 });
};

export const deleteAppointment = async (appointmentId: string) => {
     const appointmentRef = doc(db, "appointments", appointmentId);
     await deleteDoc(appointmentRef);
};

// Generate available time slots
export const generateTimeSlots = (date: string): string[] => {
     const slots: string[] = [];
     const selectedDate = new Date(date);
     const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
     
     // Monday to Friday: 6:00 AM - 8:00 PM
     // Saturday: 8:00 AM - 2:00 PM
     // Sunday: 10:00 AM - 2:00 PM
     
     let startHour = 6;
     let endHour = 20;
     
     if (dayOfWeek === 6) { // Saturday
          startHour = 8;
          endHour = 14;
     } else if (dayOfWeek === 0) { // Sunday
          startHour = 10;
          endHour = 14;
     }
     
     for (let hour = startHour; hour < endHour; hour++) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
     }
     
     return slots;
};

export const getAvailableSlots = async (date: string): Promise<string[]> => {
     const allSlots = generateTimeSlots(date);
     
     // Get appointments for the selected date
     const appointmentsRef = collection(db, "appointments");
     const q = query(
          appointmentsRef,
          where("date", "==", date),
          where("status", "in", ["pending", "accepted"])
     );
     
     const snapshot = await getDocs(q);
     const bookedSlots = snapshot.docs.map(doc => doc.data().time);
     
     // Filter out booked slots
     return allSlots.filter(slot => !bookedSlots.includes(slot));
};

// --- Patients ---

export const getAllPatients = async () => {
     const q = query(collection(db, "users"), where("role", "==", "patient"));
     const querySnapshot = await getDocs(q);
     return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPatientById = async (patientId: string) => {
     const docRef = doc(db, "users", patientId);
     const docSnap = await getDoc(docRef); // Need to import getDoc
     if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
     } else {
          return null;
     }
};

// --- Medical Records ---

// Get patient records with real-time updates
export const subscribeToPatientRecords = (
     patientId: string,
     callback: (records: MedicalRecord[]) => void
) => {
     const recordsRef = collection(db, "records");
     const q = query(
          recordsRef,
          where("patientId", "==", patientId),
          orderBy("date", "desc")
     );

     return onSnapshot(q, (snapshot) => {
          const records = snapshot.docs.map(doc => ({
               id: doc.id,
               ...doc.data()
          } as MedicalRecord));
          callback(records);
     });
};

export const getPatientRecords = async (patientId: string): Promise<MedicalRecord[]> => {
     return retryWithBackoff(async () => {
          const q = query(
               collection(db, "records"),
               where("patientId", "==", patientId),
               orderBy("date", "desc")
          );
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => ({
               id: doc.id,
               ...doc.data()
          } as MedicalRecord));
     }, { maxRetries: 3, delay: 1000 });
};

export const addMedicalRecord = async (
     patientId: string,
     doctorName: string,
     diagnosis: string,
     prescription: string,
     vitalSigns?: VitalSigns,
     allergies?: string[],
     currentMedications?: string[],
     notes?: string
) => {
     return retryWithBackoff(async () => {
          const recordData: any = {
               patientId,
               doctorName,
               diagnosis: diagnosis.trim(),
               prescription: prescription.trim(),
               date: new Date().toISOString(),
          };

          if (vitalSigns) recordData.vitalSigns = vitalSigns;
          if (allergies && allergies.length > 0) recordData.allergies = allergies;
          if (currentMedications && currentMedications.length > 0) recordData.currentMedications = currentMedications;
          if (notes) recordData.notes = notes.trim();

          await addDoc(collection(db, "records"), recordData);
     }, { maxRetries: 3, delay: 1000 });
};

export const updateMedicalRecord = async (
     recordId: string,
     updates: Partial<MedicalRecord>
) => {
     const recordRef = doc(db, "records", recordId);
     await updateDoc(recordRef, {
          ...updates,
          updatedAt: new Date().toISOString()
     });
};

export const deleteMedicalRecord = async (recordId: string) => {
     const recordRef = doc(db, "records", recordId);
     await deleteDoc(recordRef);
};

// Patient Profile Management
export const updatePatientProfile = async (
     patientId: string,
     profileData: Partial<PatientProfile>
) => {
     // Filtrar campos undefined para evitar errores de Firestore
     const cleanData: Record<string, unknown> = {};
     Object.entries(profileData).forEach(([key, value]) => {
          if (value !== undefined) {
               cleanData[key] = value;
          }
     });
     
     const patientRef = doc(db, "users", patientId);
     await updateDoc(patientRef, {
          ...cleanData,
          updatedAt: new Date().toISOString()
     });
};

export const getPatientProfile = async (patientId: string): Promise<PatientProfile | null> => {
     const docRef = doc(db, "users", patientId);
     const docSnap = await getDoc(docRef);
     if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as PatientProfile;
     }
     return null;
};

// --- Family Members Management ---

export const addFamilyMember = async (
     userId: string,
     member: Omit<FamilyMember, 'id'>
): Promise<void> => {
     const userRef = doc(db, "users", userId);
     const userDoc = await getDoc(userRef);
     
     if (!userDoc.exists()) {
          throw new Error('Usuario no encontrado');
     }
     
     const userData = userDoc.data() as PatientProfile;
     const currentMembers = userData.familyMembers || [];
     const newMember: FamilyMember = {
          ...member,
          id: `fm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
     };
     
     await updateDoc(userRef, {
          familyMembers: [...currentMembers, newMember],
          updatedAt: new Date().toISOString()
     });
};

export const updateFamilyMember = async (
     userId: string,
     memberId: string,
     updates: Partial<Omit<FamilyMember, 'id'>>
): Promise<void> => {
     const userRef = doc(db, "users", userId);
     const userDoc = await getDoc(userRef);
     
     if (!userDoc.exists()) {
          throw new Error('Usuario no encontrado');
     }
     
     const userData = userDoc.data() as PatientProfile;
     const currentMembers = userData.familyMembers || [];
     const updatedMembers = currentMembers.map(member =>
          member.id === memberId ? { ...member, ...updates } : member
     );
     
     await updateDoc(userRef, {
          familyMembers: updatedMembers,
          updatedAt: new Date().toISOString()
     });
};

export const deleteFamilyMember = async (
     userId: string,
     memberId: string
): Promise<void> => {
     const userRef = doc(db, "users", userId);
     const userDoc = await getDoc(userRef);
     
     if (!userDoc.exists()) {
          throw new Error('Usuario no encontrado');
     }
     
     const userData = userDoc.data() as PatientProfile;
     const currentMembers = userData.familyMembers || [];
     const filteredMembers = currentMembers.filter(member => member.id !== memberId);
     
     await updateDoc(userRef, {
          familyMembers: filteredMembers,
          updatedAt: new Date().toISOString()
     });
};
