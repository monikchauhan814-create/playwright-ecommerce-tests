
import type { RowDataPacket } from 'mysql2';
import { queryDB } from './db.js';

export async function queryRows<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  const result = await queryDB(sql, params);

  if (!Array.isArray(result)) {
    throw new TypeError(
      'Expected SELECT query to return an array of rows'
    );
  }

  return result as T[];
}
