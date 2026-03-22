/*
  Warnings:

  - A unique constraint covering the columns `[cognitoSub]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `cognitoSub` VARCHAR(191) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `users_cognitoSub_key` ON `users`(`cognitoSub`);
