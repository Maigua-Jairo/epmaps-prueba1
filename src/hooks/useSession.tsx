import { ProveedorSesion, useSesion } from '@/context/sesion';
import type { Sesion } from '@/domain/types';

export const SessionProvider = ProveedorSesion;

export function useSession() {
  const { usuario, nombre, cargando, errorCarga, iniciarSesion, cerrarSesion } = useSesion();

  const sesion: Sesion | null = usuario
    ? {
        tecnico: {
          codigo: usuario.uid,
          nombre: nombre?.trim() || usuario.email || 'Usuario',
        },
        iniciadaEn: usuario.metadata.lastSignInTime ?? '',
      }
    : null;

  return {
    sesion,
    nombre,
    correo: usuario?.email ?? null,
    cargando,
    errorCarga,
    iniciarSesion,
    cerrarSesion,
  };
}
