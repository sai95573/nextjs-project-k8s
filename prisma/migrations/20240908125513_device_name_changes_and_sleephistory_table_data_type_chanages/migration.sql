/*
  Warnings:

  - You are about to drop the column `device_id` on the `UserSync` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SleepHistory` MODIFY `user_id` INTEGER NULL,
    MODIFY `sync_date` DATETIME(3) NULL,
    MODIFY `sync_id` INTEGER NULL,
    MODIFY `averageBreathRate` INTEGER NULL,
    MODIFY `averageHeartBeatRate` INTEGER NULL,
    MODIFY `fallAsleepAllTime` INTEGER NULL,
    MODIFY `wakeAndLeaveBedBeforeAllTime` INTEGER NULL,
    MODIFY `leaveBedTimes` INTEGER NULL,
    MODIFY `turnOverTimes` INTEGER NULL,
    MODIFY `bodyMovementTimes` INTEGER NULL,
    MODIFY `heartBeatPauseTimes` INTEGER NULL,
    MODIFY `breathPauseTimes` INTEGER NULL,
    MODIFY `deepSleepPerc` INTEGER NULL,
    MODIFY `inSleepPerc` INTEGER NULL,
    MODIFY `lightSleepPerc` INTEGER NULL,
    MODIFY `wakeSleepPerc` INTEGER NULL,
    MODIFY `duration` INTEGER NULL,
    MODIFY `wakeTimes` INTEGER NULL,
    MODIFY `lightSleepAllTime` INTEGER NULL,
    MODIFY `inSleepAllTime` INTEGER NULL,
    MODIFY `deepSleepAllTime` INTEGER NULL,
    MODIFY `wakeAllTime` INTEGER NULL,
    MODIFY `breathPauseAllTime` INTEGER NULL,
    MODIFY `heartBeatPauseAllTime` INTEGER NULL,
    MODIFY `leaveBedAllTime` INTEGER NULL,
    MODIFY `maxHeartBeatRate` INTEGER NULL,
    MODIFY `maxBreathRate` INTEGER NULL,
    MODIFY `minHeartBeatRate` INTEGER NULL,
    MODIFY `minBreathRate` INTEGER NULL,
    MODIFY `sleepScore` INTEGER NULL,
    MODIFY `fallsleepTimeStamp` INTEGER NULL,
    MODIFY `wakeupTimeStamp` INTEGER NULL;

-- AlterTable
ALTER TABLE `UserSync` DROP COLUMN `device_id`,
    ADD COLUMN `device_mac` VARCHAR(191) NULL;
