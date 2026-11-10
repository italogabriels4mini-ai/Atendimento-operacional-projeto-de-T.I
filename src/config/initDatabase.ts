import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getPool, closeDatabase } from './database';

async function main(): Promise<void> {
  const content = await fs.readFile(path.resolve(process.cwd(), 'database/schema.sql'), 'utf8');
  const statements = content.split(';').map((part) => part.trim()).filter((part) => part && !/^CREATE DATABASE/i.test(part) && !/^USE /i.test(part));
  for (const statement of statements) await getPool().query(statement);
  console.log(`Schema aplicado: ${statements.length} instruções.`);
  await closeDatabase();
}

main().catch(async (error) => { console.error(error); await closeDatabase(); process.exitCode = 1; });

