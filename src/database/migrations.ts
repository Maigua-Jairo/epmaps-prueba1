import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 3;

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

  if (currentVersion < 2) {
    // v2: lecturas registradas en el teléfono (R4). La clave única impide
    // registrar dos veces el mismo medidor en el mismo mes (R10).
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lecturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clave TEXT NOT NULL UNIQUE,
        codigo_medidor TEXT NOT NULL,
        periodo TEXT NOT NULL,
        tecnico_codigo TEXT NOT NULL,
        estado_medidor TEXT NOT NULL,
        lectura REAL,
        lectura_anterior REAL,
        consumo REAL,
        consumo_promedio REAL,
        es_anomalo INTEGER NOT NULL DEFAULT 0,
        revision_confirmada INTEGER NOT NULL DEFAULT 0,
        observacion TEXT,
        foto_uri TEXT,
        verificacion TEXT NOT NULL,
        estado_envio TEXT NOT NULL DEFAULT 'PENDIENTE',
        registrada_en TEXT NOT NULL
      );
    `);
  }

  if (currentVersion < 3) {
    // v3: datos del envío al sistema de la oficina (R9).
    await db.execAsync(`
      ALTER TABLE lecturas ADD COLUMN id_remoto TEXT;
      ALTER TABLE lecturas ADD COLUMN enviada_en TEXT;
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
