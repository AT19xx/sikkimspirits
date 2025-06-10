
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations completed!');
}

main().catch(console.error);
