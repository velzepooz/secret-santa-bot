CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`invite_code` text NOT NULL,
	`organizer_telegram_id` text NOT NULL,
	`budget` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer,
	`drawn_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `groups_invite_code_unique` ON `groups` (`invite_code`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`telegram_id` text NOT NULL,
	`telegram_username` text,
	`display_name` text NOT NULL,
	`assigned_to_id` text,
	`joined_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participant_group_user_idx` ON `participants` (`group_id`,`telegram_id`);--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`item` text NOT NULL,
	`url` text,
	`created_at` integer,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE cascade
);
