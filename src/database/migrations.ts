import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

/** Aplica en orden las migraciones pendientes según PRAGMA user_version. */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion < 1) {
    // v1: caché de medidores consultados (R3).
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS medidores (
        codigo TEXT PRIMARY KEY NOT NULL,
        direccion TEXT NOT NULL,
        sector TEXT NOT NULL,
        numero_cuenta TEXT NOT NULL,
        estado TEXT NOT NULL,
        ultima_lectura REAL NOT NULL,
        fecha_ultima_lectura TEXT NOT NULL,
        consumo_promedio REAL NOT NULL,
        consultado_en TEXT NOT NULL
      );
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
