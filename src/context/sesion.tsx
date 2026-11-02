/**
 * Contexto de sesión: el único lugar de la app que habla con Firebase Auth.
 *
 * Las pantallas no importan Firebase directamente; llaman a las funciones de
 * este contexto (iniciarSesion, registrarse, etc.). Así, si mañana se cambia
 * Firebase por otro proveedor, solo se reescribe este archivo.
 */
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';

import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { auth } from '@/config/firebase';

type ValorSesion={
 //Usuario conectado o null si no hay sesion 
 usuario: User | null;

 //Nombre del perfil (displayName), se actuaiza siempre tras el registro 
   nombre: string | null;

 cargando: boolean; //True mientras Firebase verifica si hay sesión activa
 errorCarga: string | null;

iniciarSesion: (correo: string, clave: string) => Promise<void>;
  registrarse: (nombre: string, correo: string, clave: string) => Promise<void>;
actualizarNombre: (nombre: string) => Promise<void>;
enviarCorreoRecuperacion: (correo: string) => Promise<void>;
  cambiarClave: (claveActual: string, claveNueva: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;

}

const ContextoSesion = createContext<ValorSesion | null>(null);
 
/** Hook para leer la sesión desde cualquier pantalla. */
export function useSesion(): ValorSesion {
  // `use` es la forma moderna (React 19) de leer un contexto.
  const valor = use(ContextoSesion);
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de <ProveedorSesion>.');
  }
  return valor;
}
 
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(() => Boolean(auth));
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  // Nombre del perfil guardado aparte: updateProfile modifica el mismo objeto
  // `user` sin cambiar su referencia, así que React no detectaría el cambio
  // si las pantallas leyeran usuario.displayName directamente.
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    // onAuthStateChanged se dispara al arrancar (con la sesión guardada o null)
    // y cada vez que alguien inicia o cierra sesión. Es la fuente de verdad:
    // la navegación (Stack.Protected en _layout.tsx) depende de este estado.
    const cancelarSuscripcion = onAuthStateChanged(
      auth,
      (usuarioFirebase) => {
        const usuarioVerificado = usuarioFirebase?.emailVerified ? usuarioFirebase : null;
        setUsuario(usuarioVerificado);
        setNombre(usuarioVerificado?.displayName ?? null);
        setErrorCarga(null);
        setCargando(false);
      },
      (errorAuth) => {
        console.error('No se pudo restaurar la sesión de Firebase', errorAuth);
        setUsuario(null);
        setNombre(null);
        setErrorCarga('No se pudo restaurar tu sesión. Inicia sesión nuevamente.');
        setCargando(false);
      },
    );
    // Al desmontar el proveedor dejamos de escuchar para no fugar memoria.
    return cancelarSuscripcion;
  }, []);
 
  async function iniciarSesion(correo: string, clave: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    setErrorCarga(null);
    const credencial = await signInWithEmailAndPassword(auth, correo.trim(), clave);

    if (!credencial.user.emailVerified) {
      await signOut(auth);
      throw new Error('auth/email-not-verified');
    }
  }

  async function registrarse(nombreCompleto: string, correo: string, clave: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    setErrorCarga(null);
    if (!nombreCompleto.trim()) throw new Error('Escribe tu nombre para crear la cuenta.');
    const credencial = await createUserWithEmailAndPassword(auth, correo.trim(), clave);
    const nombreLimpio = nombreCompleto.trim();

    await updateProfile(credencial.user, { displayName: nombreLimpio });
    await sendEmailVerification(credencial.user);

    // La cuenta se crea, se envía el correo de verificación y se cierra
    // la sesión para obligar a la validación antes de entrar al flujo principal.
    await signOut(auth);
    setNombre(nombreLimpio);
  }

  async function actualizarNombre(nombreCompleto: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    const nombreLimpio = nombreCompleto.trim();
    if (!nombreLimpio) throw new Error('Escribe un nombre antes de guardar.');

    const actual = auth.currentUser;
    if (!actual) throw new Error('No hay una sesión activa.');

    await updateProfile(actual, { displayName: nombreLimpio });
    setNombre(nombreLimpio);
  }
 
  async function enviarCorreoRecuperacion(correo: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    // Firebase envía un correo con un enlace a su página de restablecimiento.
    // Si el correo no existe, por la protección de enumeración NO lanza error:
    // por eso la pantalla muestra un mensaje neutro.
    await sendPasswordResetEmail(auth, correo.trim());
  }
 
  async function cambiarClave(claveActual: string, claveNueva: string) {
    if (!auth) throw new Error('Firebase no está configurado. Agrega las variables EXPO_PUBLIC_FIREBASE_*');

    const actual = auth.currentUser;
    if (!actual?.email) throw new Error('No hay una sesión activa.');
 
    // updatePassword es una operación sensible: Firebase la rechaza con
    // "auth/requires-recent-login" si la sesión no es reciente. Por eso
    // primero confirmamos la identidad con la contraseña actual.
    const credencial = EmailAuthProvider.credential(actual.email, claveActual);
    await reauthenticateWithCredential(actual, credencial);
    await updatePassword(actual, claveNueva);
  }
 
  async function cerrarSesion() {
    if (!auth) return;
    await signOut(auth);
  }
 
  return (
    <ContextoSesion
      value={{
        usuario,
        nombre,
        cargando,
        errorCarga,
        iniciarSesion,
        registrarse,
        actualizarNombre,
        enviarCorreoRecuperacion,
        cambiarClave,
        cerrarSesion,
      }}>
      {children}
    </ContextoSesion>
  );

}