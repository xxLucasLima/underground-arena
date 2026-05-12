import { db } from './client';
import type { SqlParams } from '@/types/database';

export async function execute(sql: string, params: SqlParams = []): Promise<void> {
  await db.runAsync(sql, params);
}

export async function queryAll<T>(sql: string, params: SqlParams = []): Promise<T[]> {
  return db.getAllAsync<T>(sql, params);
}
