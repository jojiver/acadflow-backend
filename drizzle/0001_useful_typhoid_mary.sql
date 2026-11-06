ALTER TABLE "subject" ADD COLUMN "schedule" text;--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "category" text DEFAULT 'Core' NOT NULL;