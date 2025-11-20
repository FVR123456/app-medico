import { 
     createUserWithEmailAndPassword, 
     signInWithEmailAndPassword, 
     signInWithPopup,
     GoogleAuthProvider,
     updateProfile,
     sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, secondaryAuth, db } from "../firebase-config";
import type { PatientProfile } from "../types";

export const registerUser = async (email: string, pass: string, name: string, role: 'doctor' | 'patient') => {
     try {
          // 1. Create user in Firebase Auth (Firebase maneja hash automáticamente con bcrypt)
          const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
          const user = userCredential.user;

          // 2. Update display name
          await updateProfile(user, { displayName: name });

          // 3. Create user document in Firestore
          await setDoc(doc(db, "users", user.uid), {
               uid: user.uid,
               name: name,
               email: email,
               role: role,
               createdAt: new Date().toISOString()
          });

          return user;
     } catch (error) {
          throw error;
     }
};

/**
 * Crea un perfil de paciente por parte del doctor (sin contraseña inicial)
 * Se envía un correo para que el paciente establezca su contraseña
 * IMPORTANTE: Usa una instancia secundaria de Auth para no afectar la sesión del doctor
 */
export const createPatientByDoctor = async (patientData: Omit<PatientProfile, 'id' | 'role' | 'profileCompleted'>) => {
     try {
          // Verificar que hay un doctor con sesión activa
          const currentUser = auth.currentUser;
          if (!currentUser) {
               throw new Error('No hay sesión activa de doctor');
          }

          // Generar una contraseña temporal aleatoria
          const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
          
          // 1. Crear usuario en Firebase Auth usando la instancia SECUNDARIA
          // Esto no afecta la sesión actual del doctor
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, patientData.email, tempPassword);
          const newUser = userCredential.user;

          // 2. Actualizar nombre del usuario
          await updateProfile(newUser, { displayName: patientData.name });

          // 3. Crear documento completo del paciente en Firestore
          await setDoc(doc(db, "users", newUser.uid), {
               ...patientData,
               uid: newUser.uid,
               id: newUser.uid,
               role: 'patient',
               profileCompleted: true,
               createdAt: new Date().toISOString(),
               createdByDoctor: true,
               createdBy: currentUser.uid // Guardar quién lo creó
          });

          // 4. Cerrar la sesión en la instancia secundaria
          await secondaryAuth.signOut();

          // 5. Enviar correo para restablecer contraseña (desde la auth principal)
          // Usamos la auth principal solo para enviar el correo
          await sendPasswordResetEmail(auth, patientData.email, {
               url: window.location.origin + '/login',
               handleCodeInApp: false
          });

          return { userId: newUser.uid, email: patientData.email };
     } catch (error) {
          // Asegurarse de limpiar la sesión secundaria en caso de error
          try {
               await secondaryAuth.signOut();
          } catch (signOutError) {
               console.error('Error signing out secondary auth:', signOutError);
          }
          throw error;
     }
};
export const loginUser = (email: string, pass: string) => {
     return signInWithEmailAndPassword(auth, email, pass);
};

// Autenticación con Google
export const signInWithGoogle = async () => {
     try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({
               prompt: 'select_account'
          });
          
          const result = await signInWithPopup(auth, provider);
          const user = result.user;

          // Verificar si el usuario ya existe en Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (!userDoc.exists()) {
               // Crear documento para nuevo usuario de Google
               await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: user.displayName || '',
                    email: user.email || '',
                    role: 'patient', // Por defecto paciente, puede cambiar después
                    profileCompleted: false,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString()
               });
          }

          return user;
     } catch (error) {
          throw error;
     }
};
