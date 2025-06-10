import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let databaseUrl = process.env.DATABASE_URL; // Capture the database URL

if (!databaseUrl) {
  // For development/demo purposes, use SQLite as fallback
  console.warn("DATABASE_URL not set, using SQLite fallback for demo");
  databaseUrl = "file:./demo.db";
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
