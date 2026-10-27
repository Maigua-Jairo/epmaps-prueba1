import type { SQLiteDatabase } from 'expo-sqlite';

import type { Medidor, MedidorEnCache } from '@/domain/types';

interface MedidorRow {
  codigo: string;
  direccion: string;
  sector: string;
  numero_cuenta: string;
  estado: string;
  ultima_lectura: number;
  fecha_ultima_lectura: string;
  consumo_promedio: number;
  consultado_en: string;
}

export async function obtenerMedidorEnCache(
  db: SQLiteDatabase,
  codigo: string,
): Promise<MedidorEnCache | null> {
  const row = await db.getFirstAsync<MedidorRow>('SELECT * FROM medidores WHERE codigo = ?', codigo);
  if (!row) return null;
  return {
    codigo: row.codigo,
    direccion: row.direccion,
    sector: row.sector,
    numeroCuenta: row.numero_cuenta,
    estado: row.estado,
    ultimaLectura: row.ultima_lectura,
    fechaUltimaLectura: row.fecha_ultima_lectura,
    consumoPromedio: row.consumo_promedio,
    consultadoEn: row.consultado_en,
  };
}

export async function guardarMedidorEnCache(
  db: SQLiteDatabase,
  medidor: Medidor,
): Promise<MedidorEnCache> {
  const consultadoEn = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO medidores
       (codigo, direccion, sector, numero_cuenta, estado, ultima_lectura,
        fecha_ultima_lectura, consumo_promedio, consultado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    medidor.codigo,
    medidor.direccion,
    medidor.sector,
    medidor.numeroCuenta,
    medidor.estado,
    medidor.ultimaLectura,
    medidor.fechaUltimaLectura,
    medidor.consumoPromedio,
    consultadoEn,
  );
  return { ...medidor, consultadoEn };
}
