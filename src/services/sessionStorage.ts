import * as SecureStore from 'expo-secure-store';

import type { Sesion } from '@/domain/types';

const CLAVE_SESION = 'epmaps.sesion';

/** Sesión cifrada con el Keystore de Android; sobrevive al cierre de la app (R1). */
export async function leerSesion(): Promise<Sesion | null> {
  const guardada = await SecureStore.getItemAsync(CLAVE_SESION);
  if (!guardada) return null;
  try {
    return JSON.parse(guardada) as Sesion;
  } catch {
    await SecureStore.deleteItemAsync(CLAVE_SESION);
    return null;
  }
}

export async function guardarSesion(sesion: Sesion): Promise<void> {
  await SecureStore.setItemAsync(CLAVE_SESION, JSON.stringify(sesion));
}

export async function borrarSesion(): Promise<void> {
  await SecureStore.deleteItemAsync(CLAVE_SESION);
}
