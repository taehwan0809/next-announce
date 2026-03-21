-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `presentations` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `script` TEXT NULL,
    `audioUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `presentations_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transcripts` (
    `id` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `presentationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `transcripts_presentationId_key`(`presentationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analysis_results` (
    `id` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `speakingSpeedWpm` INTEGER NOT NULL,
    `speakingSpeedRating` VARCHAR(191) NOT NULL,
    `fillerWordsTotal` INTEGER NOT NULL,
    `fillerWords` JSON NOT NULL,
    `silencesTotal` INTEGER NOT NULL,
    `silencesAvgDuration` DOUBLE NOT NULL,
    `silencesLongest` DOUBLE NOT NULL,
    `presentationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `analysis_results_presentationId_key`(`presentationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pronunciation_analyses` (
    `id` VARCHAR(191) NOT NULL,
    `accuracy` INTEGER NOT NULL,
    `wellPronounced` JSON NOT NULL,
    `analysisResultId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `pronunciation_analyses_analysisResultId_key`(`analysisResultId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pronunciation_mistakes` (
    `id` VARCHAR(191) NOT NULL,
    `expected` VARCHAR(191) NOT NULL,
    `recognized` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `pronunciationAnalysisId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `pronunciation_mistakes_pronunciationAnalysisId_key`(`pronunciationAnalysisId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedbacks` (
    `id` VARCHAR(191) NOT NULL,
    `overall` TEXT NOT NULL,
    `score` INTEGER NOT NULL,
    `strengths` JSON NOT NULL,
    `improvements` JSON NOT NULL,
    `presentationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `feedbacks_presentationId_key`(`presentationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `difficulty` VARCHAR(191) NOT NULL,
    `presentationId` VARCHAR(191) NOT NULL,

    INDEX `questions_presentationId_idx`(`presentationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `presentations` ADD CONSTRAINT `presentations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transcripts` ADD CONSTRAINT `transcripts_presentationId_fkey` FOREIGN KEY (`presentationId`) REFERENCES `presentations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analysis_results` ADD CONSTRAINT `analysis_results_presentationId_fkey` FOREIGN KEY (`presentationId`) REFERENCES `presentations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pronunciation_analyses` ADD CONSTRAINT `pronunciation_analyses_analysisResultId_fkey` FOREIGN KEY (`analysisResultId`) REFERENCES `analysis_results`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pronunciation_mistakes` ADD CONSTRAINT `pronunciation_mistakes_pronunciationAnalysisId_fkey` FOREIGN KEY (`pronunciationAnalysisId`) REFERENCES `pronunciation_analyses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_presentationId_fkey` FOREIGN KEY (`presentationId`) REFERENCES `presentations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_presentationId_fkey` FOREIGN KEY (`presentationId`) REFERENCES `presentations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
