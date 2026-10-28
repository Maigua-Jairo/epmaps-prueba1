import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { autenticar } from '@/domain/tecnicos';
import type { Sesion } from '@/domain/types';
import { borrarSesion, guardarSesion, leerSesion } from '@/services/sessionStorage';

interface SessionContextValue {
  sesion: Sesion | null;
  cargando: boolean;
  iniciarSesion: (codigo: string, clave: string) => Promise<boolean>;
  cerrarSesion: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    leerSesion()
      .then(setSesion)
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = async (codigo: string, clave: string) => {
    const tecnico = autenticar(codigo, clave);
    if (!tecnico) return false;
    const nueva: Sesion = { tecnico, iniciadaEn: new Date().toISOString() };
    await guardarSesion(nueva);
    setSesion(nueva);
    return true;
  };

  const cerrarSesion = async () => {
    await borrarSesion();
    setSesion(null);
  };

  return (
    <SessionContext value={{ sesion, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </SessionContext>
  );
}

export function useSession(): SessionContextValue {
  const ctx = use(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return ctx;
}
