CREATE TABLE `whatsapp_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phoneNumber` text(15) NOT NULL,
	`userId` text(256) NOT NULL,
	`verificationId` text(24) NOT NULL,
	`createdAt` text(26) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`verificationId`) REFERENCES `whatsapp_verifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `whatsapp_users_phoneNumber_unique` ON `whatsapp_users` (`phoneNumber`);--> statement-breakpoint
CREATE UNIQUE INDEX `whatsapp_users_userId_unique` ON `whatsapp_users` (`userId`);--> statement-breakpoint
CREATE TABLE `whatsapp_verifications` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`phoneNumber` text(15) NOT NULL,
	`code` text(8) NOT NULL,
	`createdAt` text(26) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`codeExpiresAt` text(26) NOT NULL,
	`completedAt` text(26)
);
