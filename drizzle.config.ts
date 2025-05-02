import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

// Parse connection string
const connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString);
const user = url.username;
const password = url.password;
const host = url.hostname;
const port = parseInt(url.port);
const database = url.pathname.substring(1);

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host,
    port,
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: false,
    },
  },
} satisfies Config; 