import { pgTable, serial, text, varchar, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { users } from './user.schema';

// Define note priority enum
export const notePriorityEnum = pgEnum('note_priority', ['low', 'medium', 'high']);

// Define notes table
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  userId: integer('user_id').notNull(),
  priority: notePriorityEnum('priority').default('medium'),
  isArchived: boolean('is_archived').default(false),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations - we're using a function to avoid circular dependencies
export const getNoteRelations = () => {
  // Need to use dynamic import to avoid circular dependency
  const { users } = require('./user.schema');
  return relations(notes, ({ one }) => ({
    user: one(users, {
      fields: [notes.userId],
      references: [users.id],
    }),
  }));
};

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert; 