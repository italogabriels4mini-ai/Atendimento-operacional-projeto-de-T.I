import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import mysql, { type Pool } from 'mysql2/promise';
import localConfig from './database.json';

let pool: Pool | null = null;
let databaseReady = false;

function createPool(): Pool {
  if (pool) return pool;
  const dsn = process.env.DATABASE_URL;
  pool = dsn
    ? mysql.createPool({ uri: dsn, connectionLimit: 10, charset: 'utf8mb4', waitForConnections: true })
    : mysql.createPool({ ...localConfig, waitForConnections: true, connectionLimit: localConfig.connectionLimit });
  return pool;
}

export function getPool(): Pool {
  return createPool();
}

export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T> {
  const [rows] = await getPool().query(sql, params);
  return rows as T;
}

export async function ensureDatabase(): Promise<boolean> {
  if (databaseReady) return true;
  try {
    const schemaPath = path.resolve(process.cwd(), 'database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    const statements = schema
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement && !/^CREATE DATABASE/i.test(statement) && !/^USE /i.test(statement));
    for (const statement of statements) await getPool().query(statement);
    databaseReady = true;
    return true;
  } catch (error) {
    console.warn('[DB] Banco indisponível ou schema ainda não executado:', error instanceof Error ? error.message : error);
    return false;
  }
}

export async function checkDatabase(): Promise<{ connected: boolean; ready: boolean; message?: string }> {
  try {
    await getPool().query('SELECT 1 AS ok');
    return { connected: true, ready: databaseReady };
  } catch (error) {
    return { connected: false, ready: false, message: error instanceof Error ? error.message : 'Falha ao conectar' };
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) await pool.end();
}
