CREATE TABLE `consents` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`text_version` text NOT NULL,
	`accepted_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consents_lead_id_unique` ON `consents` (`lead_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`type` text NOT NULL,
	`meta_json` text,
	`lead_id` text,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`ip` text,
	`first_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`budget` text,
	`property_type` text,
	`areas` text DEFAULT '[]' NOT NULL,
	`timing` text,
	`call_preference` text,
	`timezone` text DEFAULT 'Asia/Bangkok' NOT NULL,
	`message` text,
	`locale` text DEFAULT 'en' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `post_translations` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`body_html` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_translations_post_locale_idx` ON `post_translations` (`post_id`,`locale`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`excerpt` text,
	`body_html` text NOT NULL,
	`category` text,
	`pillar` integer DEFAULT 0 NOT NULL,
	`seo_json` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);