# NestJS Authentication with Supabase and Drizzle

A complete NestJS starter project with authentication features using Supabase for auth and Drizzle ORM for database management.

## Features

- User registration and login
- Supabase integration for authentication
- PostgreSQL database with Drizzle ORM
- Environment configuration using dotenv
- Input validation with class-validator
- Password hashing with bcrypt
- File uploads with Supabase Storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (or use Supabase PostgreSQL)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Copy the `.env.example` file to `.env` and update with your credentials:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/nestjs_auth
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key_here
```

4. Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

5. Setup Supabase Storage:

Log in to your Supabase dashboard:
- Navigate to Storage > Buckets
- Create a new bucket named "media"
- Set the bucket to public
- Add appropriate CORS and RLS policies depending on your security requirements

### Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Health

- `GET /health` — Process and database check. No token is required.
  - `200` when the process is up and Postgres answers `select 1`
  - `503` when the database check fails

  Response:

  ```json
  {
    "status": "ok",
    "uptime_seconds": 42,
    "timestamp": "2026-10-16T14:00:00.000Z",
    "checks": {
      "database": "up"
    }
  }
  ```

  The server listens on `PORT` when it is set, and on `8787` otherwise.

### Authentication

- `POST /auth/signup` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123", "fullName": "John Doe" }`

- `POST /auth/login` - Login a user
  - Body: `{ "email": "user@example.com", "password": "password123" }`

### File Storage

- `POST /storage/upload` - Upload a file
  - Form data:
    - `file`: File to upload (PNG, JPEG, or SVG)
    - `folder` (optional): Folder path within the bucket

  - Response:
    ```json
    {
      "success": true,
      "url": "https://your-bucket-url.com/your-file.jpg",
      "filename": "original-filename.jpg",
      "size": 12345,
      "mimetype": "image/jpeg"
    }
    ```

## Database Management

- Generate migrations: `npm run db:generate`
- Apply migrations: `npm run db:migrate`
- View database with Drizzle Studio: `npm run db:studio`

## Database Schema Management with Drizzle ORM

This project uses Drizzle ORM for database operations and schema management. Below are instructions for working with the database schema.

### Database Schema Structure

The database schema is defined in separate files under the `src/db/schemas` directory. This modular approach helps organize your code as your application grows.

### Organizing Schemas in Multiple Files

We use a modular approach to organize our database schemas:

1. **Schema Directory Structure**:
   ```
   src/db/schemas/
   ├── index.ts          # Main export file
   ├── user.schema.ts    # User-related tables
   ├── note.schema.ts    # Note-related tables
   └── ... other schemas
   ```

2. **Individual Schema Files**:
   Each file defines related tables, enums, and relations:

   ```typescript
   // src/db/schemas/user.schema.ts
   import { pgTable, serial, varchar, ... } from 'drizzle-orm/pg-core';
   import { relations } from 'drizzle-orm';
   import type { notes } from './note.schema'; // Import as type to avoid circular dependencies

   export const users = pgTable('users', { ... });

   // Use a function to avoid circular dependencies
   export const getUserRelations = () => {
     const { notes } = require('./note.schema');
     return relations(users, ({ many }) => ({
       notes: many(notes),
     }));
   };

   export type User = typeof users.$inferSelect;
   export type NewUser = typeof users.$inferInsert;
   ```

3. **Index File to Combine All Schemas**:
   ```typescript
   // src/db/schemas/index.ts
   import { users, getUserRelations, User, NewUser } from './user.schema';
   import { notes, getNoteRelations, notePriorityEnum, Note, NewNote } from './note.schema';

   // Initialize all relations
   const userRelations = getUserRelations();
   const noteRelations = getNoteRelations();

   // Re-export everything
   export {
     users, notes, notePriorityEnum,
     userRelations, noteRelations,
     User, NewUser, Note, NewNote
   };
   ```

4. **Usage in Services**:
   ```typescript
   import { notes, Note, NewNote } from '../db/schemas';

   @Injectable()
   export class NotesService {
     constructor(@Inject('DATABASE_CONNECTION') private db: NodePgDatabase) {}

     async findAll(userId: number): Promise<Note[]> {
       return this.db.select().from(notes).where(eq(notes.userId, userId));
     }
   }
   ```

### Creating a New Schema/Table

To create a new schema/table, follow these steps:

1. **Create a new schema file in `src/db/schemas/`**

   ```typescript
   // src/db/schemas/product.schema.ts
   import { pgTable, serial, text, varchar, numeric, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
   import { relations } from 'drizzle-orm';
   import type { categories } from './category.schema';

   export const products = pgTable('products', {
     id: serial('id').primaryKey(),
     name: varchar('name', { length: 255 }).notNull(),
     description: text('description'),
     price: numeric('price').notNull(),
     categoryId: integer('category_id'),
     isActive: boolean('is_active').default(true),
     createdAt: timestamp('created_at').defaultNow().notNull(),
     updatedAt: timestamp('updated_at').defaultNow().notNull(),
   });
   
   export const getProductRelations = () => {
     const { categories } = require('./category.schema');
     return relations(products, ({ one }) => ({
       category: one(categories, {
         fields: [products.categoryId],
         references: [categories.id],
       }),
     }));
   };
   
   export type Product = typeof products.$inferSelect;
   export type NewProduct = typeof products.$inferInsert;
   ```

2. **Update the index file to include the new schema**

   ```typescript
   // src/db/schemas/index.ts
   import { users, getUserRelations, User, NewUser } from './user.schema';
   import { notes, getNoteRelations, Note, NewNote } from './note.schema';
   import { products, getProductRelations, Product, NewProduct } from './product.schema';

   // Initialize relations
   const userRelations = getUserRelations();
   const noteRelations = getNoteRelations();
   const productRelations = getProductRelations();

   export {
     // Schemas
     users, notes, products,
     // Relations
     userRelations, noteRelations, productRelations,
     // Types
     User, NewUser, Note, NewNote, Product, NewProduct,
   };
   ```

3. **Create a SQL migration file**

   ```sql
   -- drizzle/0002_create_products_table.sql
   
   -- Create products table
   CREATE TABLE IF NOT EXISTS "products" (
     "id" SERIAL PRIMARY KEY,
     "name" VARCHAR(255) NOT NULL,
     "description" TEXT,
     "price" NUMERIC NOT NULL,
     "category_id" INTEGER REFERENCES "categories"("id"),
     "is_active" BOOLEAN DEFAULT true,
     "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
     "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
   );
   
   -- Create indexes
   CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" ("category_id");
   ```

4. **Run the migration**

   ```bash
   node src/db/run-migration.js
   ```

The rest of the documentation about updating schemas, using enums, and setting up relations remains the same as before.

## API Testing

You can test the API using the included Postman collection.

1. Import the `NestJS-Auth-API.postman_collection.json` into Postman
2. Import the `NestJS-Auth-Environment.postman_environment.json` environment
3. Select the environment in Postman
4. Test the endpoints in the collection

## License

MIT 