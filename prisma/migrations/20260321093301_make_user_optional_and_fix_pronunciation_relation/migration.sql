-- DropForeignKey
ALTER TABLE `presentations` DROP FOREIGN KEY `presentations_userId_fkey`;

-- DropForeignKey
ALTER TABLE `pronunciation_mistakes` DROP FOREIGN KEY `pronunciation_mistakes_pronunciationAnalysisId_fkey`;

-- DropIndex
DROP INDEX `pronunciation_mistakes_pronunciationAnalysisId_key` ON `pronunciation_mistakes`;

-- AlterTable
ALTER TABLE `presentations` MODIFY `userId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `pronunciation_mistakes_pronunciationAnalysisId_idx` ON `pronunciation_mistakes`(`pronunciationAnalysisId`);

-- AddForeignKey
ALTER TABLE `presentations` ADD CONSTRAINT `presentations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pronunciation_mistakes` ADD CONSTRAINT `pronunciation_mistakes_pronunciationAnalysisId_fkey` FOREIGN KEY (`pronunciationAnalysisId`) REFERENCES `pronunciation_analyses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
