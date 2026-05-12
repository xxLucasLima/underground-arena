import { execute, queryAll } from './query';
import { migrations } from './migrations';

async function ensureMigrationsTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function initializeDatabase(): Promise<void> {
  await ensureMigrationsTable();

  const rows = await queryAll<{ id: number }>('SELECT id FROM migrations;');
  const executedIds = new Set(rows.map((row) => row.id));

  for (const migration of migrations) {
    if (executedIds.has(migration.id)) continue;

    await migration.up();
    await execute('INSERT INTO migrations (id, name) VALUES (?, ?);', [migration.id, migration.name]);
  }
}
