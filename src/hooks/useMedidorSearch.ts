import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';

import {
  guardarMedidorEnCache,
  obtenerMedidorEnCache,
} from '@/database/repositories/medidorRepository';
import { esDeLaJornada } from '@/domain/medidor.rules';
import type { MedidorEnCache } from '@/domain/types';
import { fetchMedidor, SinConexionError } from '@/services/api';

export type OrigenMedidor = 'red' | 'cache';

/**
 * Consulta de medidores con caché en SQLite (R3):
 * 1. Si se consultó hoy, se muestra desde la caché sin tocar la red.
 * 2. Si no, se descarga y se guarda.
 * 3. Sin conexión, se usa la caché aunque sea de otro día.
 * Solo debe llamarse con un código ya validado (R2).
 */
export function useMedidorSearch() {
  const db = useSQLiteContext();
  const [medidor, setMedidor] = useState<MedidorEnCache | null>(null);
  const [origen, setOrigen] = useState<OrigenMedidor | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Identifica la búsqueda vigente: una respuesta que llega tarde no debe pisar la pantalla.
  const busquedaActual = useRef(0);

  const limpiar = () => {
    busquedaActual.current++;
    setMedidor(null);
    setOrigen(null);
    setError(null);
    setCargando(false);
  };

  const buscar = async (codigo: string) => {
    limpiar();
    const id = busquedaActual.current;
    const vigente = () => id === busquedaActual.current;
    const mostrar = (m: MedidorEnCache, o: OrigenMedidor) => {
      if (!vigente()) return;
      setMedidor(m);
      setOrigen(o);
    };
    const fallar = (mensaje: string) => {
      if (vigente()) setError(mensaje);
    };

    setCargando(true);
    try {
      const enCache = await obtenerMedidorEnCache(db, codigo);
      if (enCache && esDeLaJornada(enCache.consultadoEn)) {
        mostrar(enCache, 'cache');
        return;
      }

      try {
        const remoto = await fetchMedidor(codigo);
        if (!remoto) {
          fallar(`No existe un medidor con el código ${codigo}`);
          return;
        }
        mostrar(await guardarMedidorEnCache(db, remoto), 'red');
      } catch (e) {
        if (enCache) {
          mostrar(enCache, 'cache');
        } else if (e instanceof SinConexionError) {
          fallar('Sin conexión y este medidor no se ha consultado antes en el teléfono');
        } else {
          fallar(e instanceof Error ? e.message : 'No se pudo consultar el medidor');
        }
      }
    } finally {
      if (vigente()) setCargando(false);
    }
  };

  return { medidor, origen, cargando, error, buscar, limpiar };
}
