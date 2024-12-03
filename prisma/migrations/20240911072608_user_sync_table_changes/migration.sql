/*
  Warnings:

  - You are about to drop the column `sync_date` on the `sleephistory` table. All the data in the column will be lost.
  - You are about to drop the column `sync_date` on the `usersync` table. All the data in the column will be lost.
  - Added the required column `syncDate` to the `UserSync` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `user_date_index` ON `sleephistory`;

-- DropIndex
DROP INDEX `UserSync_sync_date_key` ON `usersync`;

-- AlterTable
ALTER TABLE `sleephistory` DROP COLUMN `sync_date`,
    ADD COLUMN `syncDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `usersync` DROP COLUMN `sync_date`,
    ADD COLUMN `syncDate` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `user_date_index` ON `SleepHistory`(`user_id`, `syncDate`);
