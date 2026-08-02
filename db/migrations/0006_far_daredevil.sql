CREATE TYPE "public"."employment_status" AS ENUM('employed', 'unemployed', 'freelance', 'student', 'other');--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "current_location" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "github_url" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "current_company" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "expected_salary" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "notice_period" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "employment_status" "employment_status";--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "interest_reason" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "why_consider" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "willing_onsite" boolean;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "available_join_date" text;