import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { contarPendientesDeEnvio } from '@/database/repositories/lecturaRepository';
import { useToast } from '@/components/ToastProvider';
import { suscribirConexion } from '@/services/networkService';
import { procesarCola } from '@/services/syncQueue';

/** Reintento mientras haya pendientes y conexión, por si un envío falló con señal débil. */
const REINTENTO_MS = 30_000;

interface NetworkContextValue {
  /** null mientras NetInfo no reporta el primer estado. */
  enLinea: boolean | null;
  pendientes: number;
  sincronizando: boolean;
  /** Cambia cada vez que termina una sincronización, para que las pantallas recarguen. */
  ultimaSincronizacion: number;
  sincronizar: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

/** R9: envía al abrir, al reconectar, tras registrar y cada 30 s mientras haya pendientes. */
export function NetworkProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const db = useSQLiteContext();
  const notificar = useToast();
  const [enLinea, setEnLinea] = useState<boolean | null>(null);
  const [pendientes, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSincronizacion, setUltimaSincronizacion] = useState(0);
  const enLineaRef = useRef(false);
  const estadoAnterior = useRef<boolean | null>(null);

  const sincronizar = useCallback(async () => {
    if (!enabled) return;
    if (enLineaRef.current) {
      setSincronizando(true);
      try {
        await procesarCola(db);
      } finally {
        setSincronizando(false);
        setUltimaSincronizacion(Date.now());
      }
    }
    setPendientes(await contarPendientesDeEnvio(db));
  }, [db, enabled]);

  useEffect(
    () => {
      if (!enabled) {
        enLineaRef.current = false;
        estadoAnterior.current = null;
        return;
      }

      return suscribirConexion((conectado) => {
        const reconecto = conectado && !enLineaRef.current;
        if (estadoAnterior.current !== null && conectado !== estadoAnterior.current) {
          notificar(conectado ? 'Conexión restablecida. Sincronizando…' : 'Modo Offline Activado');
        }
        estadoAnterior.current = conectado;
        enLineaRef.current = conectado;
        setEnLinea(conectado);
        if (reconecto) sincronizar();
        else contarPendientesDeEnvio(db).then(setPendientes);
      });
    },
    [db, enabled, notificar, sincronizar],
  );

  useEffect(() => {
    if (!enabled || !enLinea || pendientes === 0) return;
    const timer = setInterval(sincronizar, REINTENTO_MS);
    return () => clearInterval(timer);
  }, [enabled, enLinea, pendientes, sincronizar]);

  return (
    <NetworkContext
      value={{ enLinea, pendientes, sincronizando, ultimaSincronizacion, sincronizar }}>
      {children}
    </NetworkContext>
  );
}

export function useNetworkStatus(): NetworkContextValue {
  const ctx = use(NetworkContext);
  if (!ctx) throw new Error('useNetworkStatus debe usarse dentro de <NetworkProvider>');
  return ctx;
}
