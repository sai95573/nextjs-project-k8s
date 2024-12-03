/*
  Warnings:

  - You are about to drop the column `device_id` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `pri_users` on the `Device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Device` DROP COLUMN `device_id`,
    DROP COLUMN `pri_users`,
    ADD COLUMN `device_mac` VARCHAR(191) NULL;
