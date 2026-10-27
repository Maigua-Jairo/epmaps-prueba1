import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  CorreccionLectura,
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

/** Se intentó corregir una lectura que ya llegó a la oficina (R10). */
export class LecturaYaEnviadaError extends Error {
  constructor() {
    super('Esta lectura ya se envió a la oficina y no se puede corregir');
    this.name = 'LecturaYaEnviadaError';
  }
}

interface LecturaRow {
  id: number;
  registro_id: string;
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
  motivo_rechazo: string | null;
  revision: number;
  registrada_en: string;
}

function aLectura(row: LecturaRow): Lectura {
  return {
    id: row.id,
    registroId: row.registro_id,
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
    motivoRechazo: row.motivo_rechazo,
    revision: row.revision,
    registradaEn: row.registrada_en,
  };
}

/** Guarda la lectura como pendiente de envío y devuelve su id local. */
export async function insertarLectura(db: SQLiteDatabase, l: NuevaLectura): Promise<number> {
  try {
    const result = await db.runAsync(
      `INSERT INTO lecturas
         (registro_id, clave, codigo_medidor, periodo, tecnico_codigo, estado_medidor, lectura,
          lectura_anterior, consumo, consumo_promedio, es_anomalo, revision_confirmada,
          observacion, foto_uri, verificacion, registrada_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      l.registroId,
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
    // La clave medidor_mes es UNIQUE: un segundo registro del mismo mes se rechaza (R10).
    if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
      throw new LecturaDuplicadaError(l.codigoMedidor);
    }
    throw e;
  }
}

/**
 * Corrige una lectura solo si sigue pendiente (R10). La condición va en el mismo
 * UPDATE, así no hay forma de corregir una lectura que se envió hace un instante.
 */
export async function corregirLectura(
  db: SQLiteDatabase,
  id: number,
  c: CorreccionLectura,
): Promise<void> {
  const result = await db.runAsync(
    `UPDATE lecturas
       SET estado_medidor = ?, lectura = ?, lectura_anterior = ?, consumo = ?, consumo_promedio = ?,
           es_anomalo = ?, revision_confirmada = ?, observacion = ?, foto_uri = ?, verificacion = ?,
           revision = revision + 1
     WHERE id = ? AND estado_envio = 'PENDIENTE'`,
    c.estadoMedidor,
    c.lectura,
    c.lecturaAnterior,
    c.consumo,
    c.consumoPromedio,
    c.esAnomalo ? 1 : 0,
    c.revisionConfirmada ? 1 : 0,
    c.observacion,
    c.fotoUri,
    c.verificacion,
    id,
  );
  if (result.changes === 0) throw new LecturaYaEnviadaError();
}

export async function obtenerLectura(db: SQLiteDatabase, id: number): Promise<Lectura | null> {
  const row = await db.getFirstAsync<LecturaRow>('SELECT * FROM lecturas WHERE id = ?', id);
  return row ? aLectura(row) : null;
}

export async function obtenerLecturaPorClave(
  db: SQLiteDatabase,
  clave: string,
): Promise<Lectura | null> {
  const row = await db.getFirstAsync<LecturaRow>('SELECT * FROM lecturas WHERE clave = ?', clave);
  return row ? aLectura(row) : null;
}

/** Lecturas del técnico, de la más reciente a la más antigua. */
export async function listarLecturasDeTecnico(
  db: SQLiteDatabase,
  tecnicoCodigo: string,
): Promise<Lectura[]> {
  const rows = await db.getAllAsync<LecturaRow>(
    'SELECT * FROM lecturas WHERE tecnico_codigo = ? ORDER BY registrada_en DESC',
    tecnicoCodigo,
  );
  return rows.map(aLectura);
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

/**
 * Marca como enviada la versión que se envió. Si el técnico la corrigió mientras
 * tanto (revision distinta), queda pendiente y el próximo ciclo envía la corrección.
 */
export async function marcarEnviada(
  db: SQLiteDatabase,
  id: number,
  revision: number,
  idRemoto: string,
): Promise<void> {
  await db.runAsync(
    `UPDATE lecturas SET estado_envio = 'ENVIADA', id_remoto = ?, enviada_en = ?
     WHERE id = ? AND revision = ?`,
    idRemoto,
    new Date().toISOString(),
    id,
    revision,
  );
}

export async function marcarRechazada(db: SQLiteDatabase, id: number, motivo: string): Promise<void> {
  await db.runAsync(
    `UPDATE lecturas SET estado_envio = 'RECHAZADA', motivo_rechazo = ? WHERE id = ?`,
    motivo,
    id,
  );
}
