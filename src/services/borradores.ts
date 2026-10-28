import type { SQLiteDatabase } from 'expo-sqlite';

import {
  eliminarBorrador,
  fotoEnUso,
  obtenerBorrador,
  type Borrador,
} from '@/database/repositories/borradorRepository';
import { obtenerLectura, obtenerLecturaPorClave } from '@/database/repositories/lecturaRepository';
import { claveLectura, periodoDe } from '@/domain/medidor.rules';

import { eliminarFoto } from './imageStorage';

/** R8: no sirve el borrador de una lectura ya enviada o de un medidor ya registrado este mes. */
async function esObsoleto(db: SQLiteDatabase, b: Borrador): Promise<boolean> {
  if (b.lecturaId !== null) {
    const lectura = await obtenerLectura(db, b.lecturaId);
    return lectura === null || lectura.estadoEnvio !== 'PENDIENTE';
  }
  const clave = claveLectura(b.codigoMedidor, periodoDe(new Date()));
  return (await obtenerLecturaPorClave(db, clave)) !== null;
}

/** Borrador del técnico; los obsoletos se descartan sin preguntar. */
export async function borradorDe(db: SQLiteDatabase, tecnicoCodigo: string): Promise<Borrador | null> {
  const borrador = await obtenerBorrador(db);
  if (!borrador || borrador.tecnicoCodigo !== tecnicoCodigo) return null;
  if (await esObsoleto(db, borrador)) {
    await descartarBorrador(db);
    return null;
  }
  return borrador;
}

/** Descarta el registro a medias (R8) y su foto, salvo que pertenezca a una lectura guardada. */
export async function descartarBorrador(db: SQLiteDatabase): Promise<void> {
  const borrador = await obtenerBorrador(db);
  await eliminarBorrador(db);
  const foto = borrador?.datos.fotoUri;
  if (foto && !(await fotoEnUso(db, foto))) eliminarFoto(foto);
}
