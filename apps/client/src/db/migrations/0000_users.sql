CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`baseline_sleep_minutes` integer DEFAULT 480 NOT NULL,
	`wake_up_minute_of_day` integer DEFAULT 390 NOT NULL
);
