import { 
     createUserWithEmailAndPassword, 
     signInWithEmailAndPassword, 
     signInWithPopup,
     GoogleAuthProvider,
     updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";

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
               profileCompleted: false, // Para saber si completó el wizard
               createdAt: new Date().toISOString()
          });

          return user;
     } catch (error) {
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
