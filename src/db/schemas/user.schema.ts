import { pgTable, serial, text, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  country_code: varchar('country_code', { length: 10 }),
  phone_no: varchar('phone_no', { length: 15 }),
  is_google: boolean('is_google').default(false).notNull(),
  image: text('image'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  is_disabled: boolean('is_disabled').default(false).notNull(),
  is_deleted: boolean('is_deleted').default(false).notNull(),
  email_verified: boolean('email_verified').default(false).notNull(),
  refresh_token: varchar('refresh_token', { length: 1000 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  role: text('roles').array().default(['NORMAL']),
});

// Define relations - we're using a function to avoid circular dependencies
export const getUserRelations = () => {
  // Need to use dynamic import to avoid circular dependency
  const { notes } = require('./note.schema');
  return relations(users, ({ many }) => ({
    notes: many(notes),
  }));
};

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert; 