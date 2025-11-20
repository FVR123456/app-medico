import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase-config';
import { logger } from '@/services/logger';

interface AuthContextType {
     user: User | null;
     role: 'doctor' | 'patient' | null;
     profileCompleted: boolean;
     loading: boolean;
     logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
     user: null,
     role: null,
     profileCompleted: false,
     loading: true,
     logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [user, setUser] = useState<User | null>(null);
     const [role, setRole] = useState<'doctor' | 'patient' | null>(null);
     const [profileCompleted, setProfileCompleted] = useState(false);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
               setUser(currentUser);
               if (currentUser) {
                    // Fetch user role from Firestore
                    try {
                         const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                         if (userDoc.exists()) {
                              const userData = userDoc.data();
                              const userRole = userData.role as 'doctor' | 'patient';
                              setRole(userRole);
                              
                              // Doctors always have completed profile, patients need to complete it
                              setProfileCompleted(userRole === 'doctor' || userData.profileCompleted === true);
                              
                              logger.debug(`User role fetched: ${userRole}`, 'AuthContext', { uid: currentUser.uid });
                         } else {
                              logger.warn('User document not found in Firestore', 'AuthContext', { uid: currentUser.uid });
                              setRole(null);
                              setProfileCompleted(false);
                         }
                    } catch (error) {
                         logger.error("Error fetching user role", 'AuthContext', error);
                         setRole(null);
                         setProfileCompleted(false);
                    }
               } else {
                    setRole(null);
                    setProfileCompleted(false);
                    logger.debug('User logged out', 'AuthContext');
               }
               setLoading(false);
          });

          return () => unsubscribe();
     }, []);

     const logout = async () => {
          try {
               await firebaseSignOut(auth);
               logger.info('User logged out successfully', 'AuthContext');
          } catch (error) {
               logger.error('Error during logout', 'AuthContext', error);
               throw error;
          }
     };

     return (
          <AuthContext.Provider value={{ user, role, profileCompleted, loading, logout }}>
               {children}
          </AuthContext.Provider>
     );
};
