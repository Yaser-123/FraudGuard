// db.js - Database connection using Drizzle ORM and Neon
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

// Neon database connection string
const DATABASE_URL = 'DB_URL';

// Create connection
const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });

// Export schema for use in other files
export { schema };
