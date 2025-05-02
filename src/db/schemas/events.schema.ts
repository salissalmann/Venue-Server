import {
    pgTable,
    serial,
    text,
    varchar,
    boolean,
    timestamp,
    json,
    numeric,
    integer,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const events = pgTable('events', {
    id: serial('id').primaryKey(),

    // Basic Info
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    categories: text('categories').array().default([]),

    // Location & Time
    date: timestamp('date').notNull(),
    start_time: varchar('start_time', { length: 50 }).notNull(),
    end_time: varchar('end_time', { length: 50 }),

    place_name: varchar('place_name', { length: 255 }).notNull(),
    latitude: numeric('latitude'),
    longitude: numeric('longitude'),

    // Organizer
    organizer_name: varchar('organizer_name', { length: 255 }).notNull(),
    organizer_contacts: json('organizer_contacts').notNull(), // [{ type, value }]
    capacity: varchar('capacity', { length: 50 }),
    rsvp_required: boolean('rsvp_required').default(false).notNull(),

    // Tickets
    ticket_types: json('ticket_types'), // array of ticket objects
    currency: varchar('currency', { length: 10 }).default('PKR'),

    // Links & Media
    event_images: json('event_images'), // array of image objects
    event_link: varchar('event_link', { length: 2048 }),
    facebook_link: varchar('facebook_link', { length: 2048 }),
    linkedin_link: varchar('linkedin_link', { length: 2048 }),
    youtube_link: varchar('youtube_link', { length: 2048 }),
    instagram_link: varchar('instagram_link', { length: 2048 }),

    // Admin
    status: varchar('status', { length: 50 }).notNull(),

    // Timestamps
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),

    created_by: integer('created_by').references(() => users.id),
});


export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;