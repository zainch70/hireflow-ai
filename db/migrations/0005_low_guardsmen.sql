CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "applications_years_experience_idx" ON "applications" USING btree ("years_of_experience");--> statement-breakpoint
CREATE INDEX "ai_analyses_app_created_idx" ON "ai_analyses" USING btree ("application_id","created_at");