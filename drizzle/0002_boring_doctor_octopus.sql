CREATE TABLE "venues" (
	"id" serial PRIMARY KEY NOT NULL,
	"venue_name" varchar(255) NOT NULL,
	"venue_description" text,
	"is_active" boolean DEFAULT true,
	"halls" jsonb,
	"start_price" integer,
	"end_price" integer,
	"location" jsonb,
	"time_slots" jsonb,
	"contact_info" jsonb,
	"amenities" text[],
	"categories" text[],
	"images" jsonb,
	"is_disabled" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;