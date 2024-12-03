-- CreateTable
CREATE TABLE `UserSync` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `device_id` VARCHAR(191) NULL,
    `sync_date` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserSync_sync_date_key`(`sync_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SleepHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `sync_date` DATETIME(3) NOT NULL,
    `sync_id` INTEGER NOT NULL,
    `averageBreathRate` INTEGER NOT NULL,
    `averageHeartBeatRate` INTEGER NOT NULL,
    `fallAsleepAllTime` INTEGER NOT NULL,
    `wakeAndLeaveBedBeforeAllTime` INTEGER NOT NULL,
    `leaveBedTimes` INTEGER NOT NULL,
    `turnOverTimes` INTEGER NOT NULL,
    `bodyMovementTimes` INTEGER NOT NULL,
    `heartBeatPauseTimes` INTEGER NOT NULL,
    `breathPauseTimes` INTEGER NOT NULL,
    `deepSleepPerc` INTEGER NOT NULL,
    `inSleepPerc` INTEGER NOT NULL,
    `lightSleepPerc` INTEGER NOT NULL,
    `wakeSleepPerc` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,
    `wakeTimes` INTEGER NOT NULL,
    `lightSleepAllTime` INTEGER NOT NULL,
    `inSleepAllTime` INTEGER NOT NULL,
    `deepSleepAllTime` INTEGER NOT NULL,
    `wakeAllTime` INTEGER NOT NULL,
    `breathPauseAllTime` INTEGER NOT NULL,
    `heartBeatPauseAllTime` INTEGER NOT NULL,
    `leaveBedAllTime` INTEGER NOT NULL,
    `maxHeartBeatRate` INTEGER NOT NULL,
    `maxBreathRate` INTEGER NOT NULL,
    `minHeartBeatRate` INTEGER NOT NULL,
    `minBreathRate` INTEGER NOT NULL,
    `sleepScore` INTEGER NOT NULL,
    `fallsleepTimeStamp` INTEGER NOT NULL,
    `wakeupTimeStamp` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `user_date_index`(`user_id`, `sync_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSync` ADD CONSTRAINT `UserSync_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
