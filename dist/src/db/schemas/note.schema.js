"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNoteRelations = exports.notes = exports.notePriorityEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.notePriorityEnum = (0, pg_core_1.pgEnum)('note_priority', ['low', 'medium', 'high']);
exports.notes = (0, pg_core_1.pgTable)('notes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    content: (0, pg_core_1.text)('content'),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    priority: (0, exports.notePriorityEnum)('priority').default('medium'),
    isArchived: (0, pg_core_1.boolean)('is_archived').default(false),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
const getNoteRelations = () => {
    const { users } = require('./user.schema');
    return (0, drizzle_orm_1.relations)(exports.notes, ({ one }) => ({
        user: one(users, {
            fields: [exports.notes.userId],
            references: [users.id],
        }),
    }));
};
exports.getNoteRelations = getNoteRelations;
//# sourceMappingURL=note.schema.js.map