ALTER TABLE `predictions` ADD `linguisticPatterns` text NOT NULL;--> statement-breakpoint
ALTER TABLE `predictions` ADD `emotionalTone` text NOT NULL;--> statement-breakpoint
ALTER TABLE `predictions` ADD `credibilitySignals` text NOT NULL;--> statement-breakpoint
ALTER TABLE `predictions` ADD `highlightedPhrases` text NOT NULL;