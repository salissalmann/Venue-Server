"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_schema_1 = require("./user.schema");
exports.events = (0, pg_core_1.pgTable)('events', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    categories: (0, pg_core_1.text)('categories').array().default([]),
    date: (0, pg_core_1.timestamp)('date').notNull(),
    start_time: (0, pg_core_1.varchar)('start_time', { length: 50 }).notNull(),
    end_time: (0, pg_core_1.varchar)('end_time', { length: 50 }),
    place_name: (0, pg_core_1.varchar)('place_name', { length: 255 }).notNull(),
    latitude: (0, pg_core_1.numeric)('latitude'),
    longitude: (0, pg_core_1.numeric)('longitude'),
    organizer_name: (0, pg_core_1.varchar)('organizer_name', { length: 255 }).notNull(),
    organizer_contacts: (0, pg_core_1.json)('organizer_contacts').notNull(),
    capacity: (0, pg_core_1.varchar)('capacity', { length: 50 }),
    rsvp_required: (0, pg_core_1.boolean)('rsvp_required').default(false).notNull(),
    ticket_types: (0, pg_core_1.json)('ticket_types'),
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).default('PKR'),
    event_images: (0, pg_core_1.json)('event_images'),
    event_link: (0, pg_core_1.varchar)('event_link', { length: 2048 }),
    facebook_link: (0, pg_core_1.varchar)('facebook_link', { length: 2048 }),
    linkedin_link: (0, pg_core_1.varchar)('linkedin_link', { length: 2048 }),
    youtube_link: (0, pg_core_1.varchar)('youtube_link', { length: 2048 }),
    instagram_link: (0, pg_core_1.varchar)('instagram_link', { length: 2048 }),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    created_by: (0, pg_core_1.integer)('created_by').references(() => user_schema_1.users.id),
});
//# sourceMappingURL=events.schema.js.map