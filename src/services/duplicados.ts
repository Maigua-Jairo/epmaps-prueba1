import type { SQLiteDatabase } from 'expo-sqlite';

import { obtenerLecturaPorClave } from '@/database/repositories/lecturaRepository';
import { claveLectura, periodoDe } from '@/domain/medidor.rules';
import type { Lectura, Medidor } from '@/domain/types';

import { buscarLecturaRemota } from './api';
import { hayConexion } from './networkService';

export interface Duplicado {
  motivo: string;
  /** Si el duplicado está en el teléfono y sigue pendiente, se puede corregir en su lugar. */
  lecturaLocal: Lectura | null;
}

/** R10: se revisa en el teléfono, en la última lectura del medidor y, con señal, en la oficina. */
export async function buscarDuplicado(
  db: SQLiteDatabase,
  codigo: string,
  medidor: Medidor | null,
): Promise<Duplicado | null> {
  const periodo = periodoDe(new Date());
  const clave = claveLectura(codigo, periodo);

  const local = await obtenerLecturaPorClave(db, clave);
  if (local) {
    return {
      motivo:
        local.estadoEnvio === 'PENDIENTE'
          ? 'Ya registraste este medidor este mes. Aún no se envía, así que puedes corregirla.'
          : 'Ya registraste este medidor este mes y la lectura ya se envió a la oficina.',
      lecturaLocal: local,
    };
  }

  if (medidor && periodoDe(new Date(medidor.fechaUltimaLectura)) === periodo) {
    const fecha = new Date(medidor.fechaUltimaLectura).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
    });
    return {
      motivo: `El sistema de la oficina ya tiene la lectura de este mes (${fecha}).`,
      lecturaLocal: null,
    };
  }

  if (await hayConexion()) {
    try {
      if (await buscarLecturaRemota(clave)) {
        return {
          motivo: 'El sistema de la oficina ya tiene una lectura de este medidor en este mes.',
          lecturaLocal: null,
        };
      }
    } catch {
      // Sin respuesta de la oficina: se permite registrar; el envío volverá a revisarlo.
    }
  }
  return null;
}
