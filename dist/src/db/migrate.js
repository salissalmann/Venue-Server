"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_postgres_1 = require("drizzle-orm/node-postgres");
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function main() {
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    const db = (0, node_postgres_1.drizzle)(pool);
    console.log('Running migrations...');
    await (0, migrator_1.migrate)(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed!');
    await pool.end();
}
main().catch((err) => {
    console.error('Migration failed!');
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map