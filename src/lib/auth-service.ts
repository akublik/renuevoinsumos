import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';

// Simple error handler for Firebase Auth errors
const handleAuthError = (error: any): string => {
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'El formato del correo electrónico es incorrecto.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Correo electrónico o contraseña incorrectos.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/operation-not-allowed':
        return 'La autenticación por correo y contraseña no está habilitada. Por favor, actívala en la Consola de Firebase.';
      default:
        return `Ocurrió un error inesperado: ${error.code}`;
    }
  }
  return 'Ocurrió un error desconocido. Por favor, intenta de nuevo.';
};

// Register a new user
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

// Login an existing user
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

// Logout the current user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw new Error('No se pudo cerrar la sesión.');
  }
};

// Listen for authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
