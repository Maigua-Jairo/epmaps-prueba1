import type { SQLiteDatabase } from 'expo-sqlite';

import type { LecturaFormValues } from '@/domain/medidor.schema';

export type PasoRegistro = 'estado' | 'datos' | 'foto' | 'resumen';

/** Registro a medio llenar (R8). */
export interface Borrador {
  codigoMedidor: string;
  /** Lectura que se estaba corrigiendo (R10); null si era un registro nuevo. */
  lecturaId: number | null;
  tecnicoCodigo: string;
  paso: PasoRegistro;
  datos: Partial<LecturaFormValues>;
  actualizadoEn: string;
}

interface BorradorRow {
  codigo_medidor: string;
  lectura_id: number | null;
  tecnico_codigo: string;
  paso: PasoRegistro;
  datos: string;
  actualizado_en: string;
}

export async function obtenerBorrador(db: SQLiteDatabase): Promise<Borrador | null> {
  const row = await db.getFirstAsync<BorradorRow>('SELECT * FROM borrador WHERE id = 1');
  if (!row) return null;
  return {
    codigoMedidor: row.codigo_medidor,
    lecturaId: row.lectura_id,
    tecnicoCodigo: row.tecnico_codigo,
    paso: row.paso,
    datos: JSON.parse(row.datos) as Partial<LecturaFormValues>,
    actualizadoEn: row.actualizado_en,
  };
}

export async function guardarBorrador(
  db: SQLiteDatabase,
  b: Omit<Borrador, 'actualizadoEn'>,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO borrador
       (id, codigo_medidor, lectura_id, tecnico_codigo, paso, datos, actualizado_en)
     VALUES (1, ?, ?, ?, ?, ?, ?)`,
    b.codigoMedidor,
    b.lecturaId,
    b.tecnicoCodigo,
    b.paso,
    JSON.stringify(b.datos),
    new Date().toISOString(),
  );
}

export async function eliminarBorrador(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM borrador');
}

/** True si alguna lectura guardada usa esa foto (no se debe borrar). */
export async function fotoEnUso(db: SQLiteDatabase, uri: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM lecturas WHERE foto_uri = ?',
    uri,
  );
  return (row?.n ?? 0) > 0;
}
