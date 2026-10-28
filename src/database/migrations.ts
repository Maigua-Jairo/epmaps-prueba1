import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 6;

/** Columnas agregadas a `lecturas` después de la v2, con su definición. */
const COLUMNAS_V3 = {
  id_remoto: 'TEXT',
  enviada_en: 'TEXT',
};
const COLUMNAS_V4 = {
  registro_id: 'TEXT',
  revision: 'INTEGER NOT NULL DEFAULT 0',
  motivo_rechazo: 'TEXT',
};

const CREAR_BORRADOR = `
  CREATE TABLE IF NOT EXISTS borrador (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    codigo_medidor TEXT NOT NULL,
    lectura_id INTEGER,
    tecnico_codigo TEXT NOT NULL,
    paso TEXT NOT NULL,
    datos TEXT NOT NULL,
    actualizado_en TEXT NOT NULL
  );
`;

/** SQLite no tiene ADD COLUMN IF NOT EXISTS: se revisa PRAGMA table_info para poder repetirla. */
async function agregarColumnasFaltantes(
  db: SQLiteDatabase,
  tabla: string,
  columnas: Record<string, string>,
): Promise<void> {
  const existentes = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tabla})`);
  const nombres = new Set(existentes.map((c) => c.name));
  for (const [nombre, definicion] of Object.entries(columnas)) {
    if (!nombres.has(nombre)) {
      await db.execAsync(`ALTER TABLE ${tabla} ADD COLUMN ${nombre} ${definicion}`);
    }
  }
}

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
    // v2: lecturas (R4); la clave única impide dos registros del mismo medidor en el mes (R10).
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
    await agregarColumnasFaltantes(db, 'lecturas', COLUMNAS_V3);
  }

  if (currentVersion < 4) {
    // v4: corrección de lecturas pendientes y rechazo de duplicados (R10).
    await agregarColumnasFaltantes(db, 'lecturas', COLUMNAS_V4);
  }

  if (currentVersion < 5) {
    // v5: registro a medio llenar que sobrevive al cierre de la app (R8). Solo uno a la vez.
    await db.execAsync(CREAR_BORRADOR);
  }

  if (currentVersion < 6) {
    // v6: reparación de bases marcadas en v4/v5 sin sus columnas (recarga en desarrollo).
    await agregarColumnasFaltantes(db, 'lecturas', { ...COLUMNAS_V3, ...COLUMNAS_V4 });
    await db.execAsync(CREAR_BORRADOR);
  }

  // Lecturas anteriores a v4 necesitan un registro_id para el envío idempotente.
  await db.execAsync(`UPDATE lecturas SET registro_id = 'v3-' || id WHERE registro_id IS NULL`);
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
