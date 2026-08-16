CREATE TABLE `datasets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`recordCount` int NOT NULL,
	`fakeCount` int NOT NULL,
	`realCount` int NOT NULL,
	`status` enum('ready','processing','archived') NOT NULL DEFAULT 'ready',
	`version` varchar(32) NOT NULL,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `datasets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modelMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelName` varchar(120) NOT NULL,
	`datasetName` varchar(180) NOT NULL,
	`accuracy` int NOT NULL,
	`precision` int NOT NULL,
	`recall` int NOT NULL,
	`f1Score` int NOT NULL,
	`truePositive` int NOT NULL,
	`trueNegative` int NOT NULL,
	`falsePositive` int NOT NULL,
	`falseNegative` int NOT NULL,
	`evaluatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modelMetrics_id` PRIMARY KEY(`id`)
);
