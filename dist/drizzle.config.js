"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString);
const user = url.username;
const password = url.password;
const host = url.hostname;
const port = parseInt(url.port);
const database = url.pathname.substring(1);
exports.default = {
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
};
//# sourceMappingURL=drizzle.config.js.map