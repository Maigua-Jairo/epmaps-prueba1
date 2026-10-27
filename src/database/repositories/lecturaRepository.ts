import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  EstadoEnvio,
  EstadoMedidor,
  Lectura,
  NuevaLectura,
  Verificacion,
} from '@/domain/types';

/** Ya existe una lectura de ese medidor en ese mes (R10). */
export class LecturaDuplicadaError extends Error {
  constructor(codigoMedidor: string) {
    super(`Ya registraste una lectura del medidor ${codigoMedidor} este mes`);
    this.name = 'LecturaDuplicadaError';
  }
}

interface LecturaRow {
  id: number;
  clave: string;
  codigo_medidor: string;
  periodo: string;
  tecnico_codigo: string;
  estado_medidor: EstadoMedidor;
  lectura: number | null;
  lectura_anterior: number | null;
  consumo: number | null;
  consumo_promedio: number | null;
  es_anomalo: number;
  revision_confirmada: number;
  observacion: string | null;
  foto_uri: string | null;
  verificacion: Verificacion;
  estado_envio: EstadoEnvio;
  registrada_en: string;
}

function aLectura(row: LecturaRow): Lectura {
  return {
    id: row.id,
    clave: row.clave,
    codigoMedidor: row.codigo_medidor,
    periodo: row.periodo,
    tecnicoCodigo: row.tecnico_codigo,
    estadoMedidor: row.estado_medidor,
    lectura: row.lectura,
    lecturaAnterior: row.lectura_anterior,
    consumo: row.consumo,
    consumoPromedio: row.consumo_promedio,
    esAnomalo: row.es_anomalo === 1,
    revisionConfirmada: row.revision_confirmada === 1,
    observacion: row.observacion,
    fotoUri: row.foto_uri,
    verificacion: row.verificacion,
    estadoEnvio: row.estado_envio,
    registradaEn: row.registrada_en,
  };
}

/** Guarda la lectura como pendiente de envío y devuelve su id local. */
export async function insertarLectura(db: SQLiteDatabase, l: NuevaLectura): Promise<number> {
  try {
    const result = await db.runAsync(
      `INSERT INTO lecturas
         (clave, codigo_medidor, periodo, tecnico_codigo, estado_medidor, lectura,
          lectura_anterior, consumo, consumo_promedio, es_anomalo, revision_confirmada,
          observacion, foto_uri, verificacion, registrada_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      l.clave,
      l.codigoMedidor,
      l.periodo,
      l.tecnicoCodigo,
      l.estadoMedidor,
      l.lectura,
      l.lecturaAnterior,
      l.consumo,
      l.consumoPromedio,
      l.esAnomalo ? 1 : 0,
      l.revisionConfirmada ? 1 : 0,
      l.observacion,
      l.fotoUri,
      l.verificacion,
      l.registradaEn,
    );
    return result.lastInsertRowId;
  } catch (e) {
    if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
      throw new LecturaDuplicadaError(l.codigoMedidor);
    }
    throw e;
  }
}

export async function obtenerLectura(db: SQLiteDatabase, id: number): Promise<Lectura | null> {
  const row = await db.getFirstAsync<LecturaRow>('SELECT * FROM lecturas WHERE id = ?', id);
  return row ? aLectura(row) : null;
}

/** Cola de envío en el orden en que se registraron (R9). */
export async function listarPendientesDeEnvio(db: SQLiteDatabase): Promise<Lectura[]> {
  const rows = await db.getAllAsync<LecturaRow>(
    `SELECT * FROM lecturas WHERE estado_envio = 'PENDIENTE' ORDER BY registrada_en`,
  );
  return rows.map(aLectura);
}

export async function contarPendientesDeEnvio(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM lecturas WHERE estado_envio = 'PENDIENTE'`,
  );
  return row?.total ?? 0;
}

/** Resultado de comparar una lectura pendiente de verificar con la anterior (R4). */
export async function guardarVerificacion(
  db: SQLiteDatabase,
  id: number,
  datos: Pick<
    Lectura,
    'lecturaAnterior' | 'consumo' | 'consumoPromedio' | 'esAnomalo' | 'verificacion'
  >,
): Promise<void> {
  await db.runAsync(
    `UPDATE lecturas
       SET lectura_anterior = ?, consumo = ?, consumo_promedio = ?, es_anomalo = ?, verificacion = ?
     WHERE id = ?`,
    datos.lecturaAnterior,
    datos.consumo,
    datos.consumoPromedio,
    datos.esAnomalo ? 1 : 0,
    datos.verificacion,
    id,
  );
}

export async function marcarEnviada(db: SQLiteDatabase, id: number, idRemoto: string): Promise<void> {
  await db.runAsync(
    `UPDATE lecturas SET estado_envio = 'ENVIADA', id_remoto = ?, enviada_en = ? WHERE id = ?`,
    idRemoto,
    new Date().toISOString(),
    id,
  );
}
