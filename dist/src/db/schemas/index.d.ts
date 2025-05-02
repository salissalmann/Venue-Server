import { users, User, NewUser } from './user.schema';
import { notes, notePriorityEnum, Note, NewNote } from './note.schema';
import { venues, Venue, NewVenue } from './venue.scheme';
import { events, Event, NewEvent } from './events.schema';
declare const userRelations: import("drizzle-orm").Relations<"users", {
    notes: import("drizzle-orm").Many<any>;
}>;
declare const noteRelations: import("drizzle-orm").Relations<"notes", {
    user: import("drizzle-orm").One<any, true>;
}>;
declare const venueRelations: import("drizzle-orm").Relations<"venues", {
    creator: import("drizzle-orm").One<"users", false>;
}>;
export { users, notes, venues, events, notePriorityEnum, userRelations, noteRelations, venueRelations, User, NewUser, Note, NewNote, Venue, NewVenue, Event, NewEvent };
