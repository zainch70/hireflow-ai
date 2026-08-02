ALTER TABLE "applications" ADD COLUMN "assigned_to_id" uuid;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_assigned_to_id_profiles_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_assigned_to_idx" ON "applications" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE INDEX "applications_archived_at_idx" ON "applications" USING btree ("archived_at");