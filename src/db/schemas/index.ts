// Import all schema entities
import { users, getUserRelations, User, NewUser } from './user.schema';
import { notes, getNoteRelations, notePriorityEnum, Note, NewNote } from './note.schema';
import { venues, getVenueRelations, Venue, NewVenue } from './venue.scheme';
import { events, Event, NewEvent } from './events.schema';

// Initialize all relations
const userRelations = getUserRelations();
const noteRelations = getNoteRelations();
const venueRelations = getVenueRelations();

// Re-export everything
export {
  // Schemas
  users,
  notes,
  venues,
  events,
  // Enums
  notePriorityEnum,
  
  // Relations
  userRelations,
  noteRelations,
  venueRelations,

  // Types
  User,
  NewUser,
  Note,
  NewNote,
  Venue,
  NewVenue,
  Event,
  NewEvent
}; 