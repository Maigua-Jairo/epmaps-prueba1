import type { SQLiteDatabase } from 'expo-sqlite';

import {
  guardarVerificacion,
  listarPendientesDeEnvio,
  marcarEnviada,
} from '@/database/repositories/lecturaRepository';
import { guardarMedidorEnCache } from '@/database/repositories/medidorRepository';
import { calcularConsumo, esConsumoAnomalo } from '@/domain/medidor.rules';
import type { Lectura, Verificacion } from '@/domain/types';

import {
  actualizarLecturaRemota,
  buscarLecturaRemota,
  crearLecturaRemota,
  fetchMedidor,
  SinConexionError,
} from './api';

export interface ResultadoSync {
  enviadas: number;
  fallidas: number;
}

/**
 * R4: una lectura tomada sin señal se compara con la anterior al recuperar conexión.
 * Si resulta anómala sin la revisión y la foto exigidas, o menor que la anterior,
 * se envía marcada como REQUIERE_REVISION para que la oficina la revise.
 */
async function verificar(db: SQLiteDatabase, l: Lectura): Promise<Lectura> {
  if (l.verificacion !== 'PENDIENTE_VERIFICAR') return l;

  const medidor = await fetchMedidor(l.codigoMedidor);
  let datos: Pick<Lectura, 'lecturaAnterior' | 'consumo' | 'consumoPromedio' | 'esAnomalo'> & {
    verificacion: Verificacion;
  };

  if (!medidor) {
    datos = { ...l, verificacion: 'REQUIERE_REVISION' };
  } else {
    await guardarMedidorEnCache(db, medidor);
    const consumo = l.lectura !== null ? calcularConsumo(medidor, l.lectura) : null;
    const esAnomalo = consumo !== null && consumo >= 0 && esConsumoAnomalo(medidor, consumo);
    const respaldada = l.revisionConfirmada && l.fotoUri !== null;
    const requiereRevision = (consumo !== null && consumo < 0) || (esAnomalo && !respaldada);
    datos = {
      lecturaAnterior: medidor.ultimaLectura,
      consumo,
      consumoPromedio: medidor.consumoPromedio,
      esAnomalo,
      verificacion: requiereRevision ? 'REQUIERE_REVISION' : 'VERIFICADA',
    };
  }

  await guardarVerificacion(db, l.id, datos);
  return { ...l, ...datos };
}

/**
 * Envío idempotente (R9): la clave medidor_mes identifica la lectura en la oficina.
 * Si la señal se corta después de que el POST llegó pero antes de recibir la
 * respuesta, el siguiente intento la encuentra por clave y no la vuelve a crear;
 * solo la actualiza con los datos actuales.
 */
async function enviar(db: SQLiteDatabase, l: Lectura): Promise<void> {
  const existente = await buscarLecturaRemota(l.clave);
  if (existente) {
    await actualizarLecturaRemota(existente.id, l);
    await marcarEnviada(db, l.id, existente.id);
  } else {
    await marcarEnviada(db, l.id, await crearLecturaRemota(l));
  }
}

async function ejecutar(db: SQLiteDatabase): Promise<ResultadoSync> {
  const resultado: ResultadoSync = { enviadas: 0, fallidas: 0 };
  for (const pendiente of await listarPendientesDeEnvio(db)) {
    try {
      await enviar(db, await verificar(db, pendiente));
      resultado.enviadas++;
    } catch (e) {
      // Sin señal no tiene sentido seguir: se reintenta al recuperar la conexión.
      if (e instanceof SinConexionError) break;
      resultado.fallidas++;
    }
  }
  return resultado;
}

let enCurso: Promise<ResultadoSync> | null = null;

/** Procesa la cola. Si ya hay un envío en curso devuelve ese mismo, así nunca corren dos a la vez. */
export function procesarCola(db: SQLiteDatabase): Promise<ResultadoSync> {
  enCurso ??= ejecutar(db).finally(() => {
    enCurso = null;
  });
  return enCurso;
}
