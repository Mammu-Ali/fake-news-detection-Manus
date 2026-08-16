CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`articleText` text NOT NULL,
	`verdict` enum('Fake','Real') NOT NULL,
	`confidence` int NOT NULL,
	`processingTimeMs` int NOT NULL,
	`explanation` text NOT NULL,
	`signals` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
