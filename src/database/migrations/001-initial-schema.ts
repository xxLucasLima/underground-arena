import { execute } from '../query';
import type { Migration } from '@/types/database';

export const initialSchemaMigration: Migration = {
  id: 1,
  name: 'initial-schema',
  up: async () => {
    await execute(`
      CREATE TABLE IF NOT EXISTS fighters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rarity TEXT NOT NULL,
        metadata_json TEXT NOT NULL
      );
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        item_type TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0
      );
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS decks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        card_ids_json TEXT NOT NULL
      );
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS rewards (
        id TEXT PRIMARY KEY,
        reward_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        payload_json TEXT NOT NULL
      );
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL
      );
    `);
  },
};
