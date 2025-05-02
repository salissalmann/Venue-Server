"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueRelations = exports.noteRelations = exports.userRelations = exports.notePriorityEnum = exports.events = exports.venues = exports.notes = exports.users = void 0;
const user_schema_1 = require("./user.schema");
Object.defineProperty(exports, "users", { enumerable: true, get: function () { return user_schema_1.users; } });
const note_schema_1 = require("./note.schema");
Object.defineProperty(exports, "notes", { enumerable: true, get: function () { return note_schema_1.notes; } });
Object.defineProperty(exports, "notePriorityEnum", { enumerable: true, get: function () { return note_schema_1.notePriorityEnum; } });
const venue_scheme_1 = require("./venue.scheme");
Object.defineProperty(exports, "venues", { enumerable: true, get: function () { return venue_scheme_1.venues; } });
const events_schema_1 = require("./events.schema");
Object.defineProperty(exports, "events", { enumerable: true, get: function () { return events_schema_1.events; } });
const userRelations = (0, user_schema_1.getUserRelations)();
exports.userRelations = userRelations;
const noteRelations = (0, note_schema_1.getNoteRelations)();
exports.noteRelations = noteRelations;
const venueRelations = (0, venue_scheme_1.getVenueRelations)();
exports.venueRelations = venueRelations;
//# sourceMappingURL=index.js.map