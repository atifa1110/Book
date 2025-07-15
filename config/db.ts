import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../db/schema';// sesuaikan dengan lokasi schema Drizzle kamu

// Setting WebSocket constructor (WAJIB untuk Neon)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Drizzle DB client (bisa dipakai di controller atau service)
export const db = drizzle(pool, { schema });
