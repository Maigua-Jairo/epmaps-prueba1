import type { SQLiteDatabase } from 'expo-sqlite';

import {
  eliminarBorrador,
  fotoEnUso,
  obtenerBorrador,
  type Borrador,
} from '@/database/repositories/borradorRepository';

import { eliminarFoto } from './imageStorage';

/** Borrador pendiente del técnico, si lo hay. Los de otro técnico se ignoran. */
export async function borradorDe(db: SQLiteDatabase, tecnicoCodigo: string): Promise<Borrador | null> {
  const borrador = await obtenerBorrador(db);
  return borrador?.tecnicoCodigo === tecnicoCodigo ? borrador : null;
}

/** Descarta el registro a medias (R8) y su foto, salvo que pertenezca a una lectura guardada. */
export async function descartarBorrador(db: SQLiteDatabase): Promise<void> {
  const borrador = await obtenerBorrador(db);
  await eliminarBorrador(db);
  const foto = borrador?.datos.fotoUri;
  if (foto && !(await fotoEnUso(db, foto))) eliminarFoto(foto);
}
