"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRelations = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    first_name: (0, pg_core_1.varchar)('first_name', { length: 100 }).notNull(),
    last_name: (0, pg_core_1.varchar)('last_name', { length: 100 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    country_code: (0, pg_core_1.varchar)('country_code', { length: 10 }),
    phone_no: (0, pg_core_1.varchar)('phone_no', { length: 15 }),
    is_google: (0, pg_core_1.boolean)('is_google').default(false).notNull(),
    image: (0, pg_core_1.text)('image'),
    city: (0, pg_core_1.varchar)('city', { length: 100 }),
    state: (0, pg_core_1.varchar)('state', { length: 100 }),
    country: (0, pg_core_1.varchar)('country', { length: 100 }),
    is_disabled: (0, pg_core_1.boolean)('is_disabled').default(false).notNull(),
    is_deleted: (0, pg_core_1.boolean)('is_deleted').default(false).notNull(),
    email_verified: (0, pg_core_1.boolean)('email_verified').default(false).notNull(),
    refresh_token: (0, pg_core_1.varchar)('refresh_token', { length: 1000 }),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    role: (0, pg_core_1.text)('roles').array().default(['NORMAL']),
});
const getUserRelations = () => {
    const { notes } = require('./note.schema');
    return (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
        notes: many(notes),
    }));
};
exports.getUserRelations = getUserRelations;
//# sourceMappingURL=user.schema.js.map