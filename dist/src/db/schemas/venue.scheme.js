"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVenueRelations = exports.venues = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_schema_1 = require("./user.schema");
exports.venues = (0, pg_core_1.pgTable)('venues', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    venue_name: (0, pg_core_1.varchar)('venue_name', { length: 255 }).notNull(),
    venue_description: (0, pg_core_1.text)('venue_description'),
    is_active: (0, pg_core_1.boolean)('is_active').default(true),
    halls: (0, pg_core_1.jsonb)('halls').$type(),
    start_price: (0, pg_core_1.integer)('start_price'),
    end_price: (0, pg_core_1.integer)('end_price'),
    location: (0, pg_core_1.jsonb)('location').$type(),
    time_slots: (0, pg_core_1.jsonb)('time_slots').$type(),
    contact_info: (0, pg_core_1.jsonb)('contact_info').$type(),
    amenities: (0, pg_core_1.text)('amenities').array(),
    categories: (0, pg_core_1.text)('categories').array(),
    images: (0, pg_core_1.jsonb)('images').$type(),
    is_disabled: (0, pg_core_1.boolean)('is_disabled').default(false),
    created_by: (0, pg_core_1.integer)('created_by').references(() => user_schema_1.users.id),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
const getVenueRelations = () => {
    return (0, drizzle_orm_1.relations)(exports.venues, ({ one }) => ({
        creator: one(user_schema_1.users, {
            fields: [exports.venues.created_by],
            references: [user_schema_1.users.id],
        }),
    }));
};
exports.getVenueRelations = getVenueRelations;
//# sourceMappingURL=venue.scheme.js.map