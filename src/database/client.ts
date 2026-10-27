import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDbIfNeeded } from './migrations';

export const DATABASE_NAME = 'epmaps-lecturas.db';

/** Se pasa a `<SQLiteProvider onInit>`: corre antes de que se muestre cualquier pantalla. */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await migrateDbIfNeeded(db);
}
