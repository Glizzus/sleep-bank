CREATE TABLE `sleep_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`night_date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sleep_log_user_id_night_date_unique` ON `sleep_log` (`user_id`,`night_date`);--> statement-breakpoint
CREATE TABLE `sleep_log_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`sleep_log_id` text NOT NULL,
	`start_minute_of_day` integer NOT NULL,
	`end_minute_of_day` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`sleep_log_id`) REFERENCES `sleep_log`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sleep_log_entry_sleep_log_id_idx` ON `sleep_log_entry` (`sleep_log_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`baseline_sleep_minutes` integer DEFAULT 480 NOT NULL,
	`wake_up_minute_of_day` integer DEFAULT 390 NOT NULL
);
