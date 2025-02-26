PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_whatsapp_verifications` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`phoneNumber` text(15) NOT NULL,
	`code` text(8) NOT NULL,
	`createdAt` text(26) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`codeExpiresAt` integer NOT NULL,
	`completedAt` text(26)
);
--> statement-breakpoint
INSERT INTO `__new_whatsapp_verifications`("id", "phoneNumber", "code", "createdAt", "codeExpiresAt", "completedAt") SELECT "id", "phoneNumber", "code", "createdAt", "codeExpiresAt", "completedAt" FROM `whatsapp_verifications`;--> statement-breakpoint
DROP TABLE `whatsapp_verifications`;--> statement-breakpoint
ALTER TABLE `__new_whatsapp_verifications` RENAME TO `whatsapp_verifications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;