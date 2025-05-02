import { relations } from 'drizzle-orm';
import { pgTable, serial, text, varchar, timestamp, boolean, integer, pgEnum, jsonb, date, time } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

// Define notes table
export const venues = pgTable('venues', {
  id: serial('id').primaryKey(),
  venue_name: varchar('venue_name', { length: 255 }).notNull(),
  venue_description: text('venue_description'),
  is_active: boolean('is_active').default(true),
  halls: jsonb('halls').$type<{
    hall_name: string;
    hall_description: string;
    hall_capacity: number;
    hall_price: number;
    hall_is_active: boolean;
  }[]>(),
  start_price: integer('start_price'),    
  end_price: integer('end_price'),
  location: jsonb('location').$type<{
    location_name: string;
    latitude: number;
    longitude: number;
  }>(),
  time_slots: jsonb('time_slots').$type<{
    start_time: typeof time;
    end_time: typeof time;
  }[]>(),
  contact_info: jsonb('contact_info').$type<{
    name: string;
    phone: string;
    email: string;
    address: string;
  }[]>(),
  amenities: text('amenities').array(),
  categories: text('categories').array(),
  images: jsonb('images').$type<{
    image_url: string;
    is_cover: boolean;
  }[]>(),
  is_disabled: boolean('is_disabled').default(false),
  created_by: integer('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const getVenueRelations = () => {
  return relations(venues, ({ one }) => ({
    creator: one(users, {
      fields: [venues.created_by],
      references: [users.id],
    }),
  }));
};

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;