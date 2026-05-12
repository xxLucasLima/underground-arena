import { initialSchemaMigration } from './001-initial-schema';
import type { Migration } from '@/types/database';

export const migrations: Migration[] = [initialSchemaMigration];
