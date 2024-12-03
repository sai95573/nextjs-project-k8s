import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';
import { Parser } from 'json2csv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        switch (req.method) {
            case 'GET':
                // Fetch all sleep history records for the given userId with all fields
                const sleepHistory = await prisma.sleepHistory.findMany({
                    where: {
                        userId: Number(userId),
                    },
                    select: {
                        id: true,
                        sleepScore: true,
                        leaveBedTime: true,
                        awakeTime: true,
                        breathRate: true,
                        awakeSleep: true,
                        midSleep: true,
                        deepSleep: true,
                        leaveBedTimes: true,
                        fallSleepTimeStamp: true,
                        wakeupTimeStamp: true,
                        turnTime: true,
                        sleepCurveArray: true,
                        startTime: true,
                        avgBreathRate: true,
                        avgHeartRate: true,
                        heartRate: true,
                        recordCount: true,
                        endTime: true,
                        lightSleep: true,
                        minute: true,
                        hour: true,
                        createdAt: true,
                        updatedAt: true,
                        syncDate: true,
                        apena: true,
                        turnOverStatusAry: true,
                        trunOverTimes: true,
                        deepSleepAllTime: true,
                        bradypnea: true,
                        restless: true,
                        upNightMore: true,
                        actualSleepLong: true,
                        fallAsleepHard: true,
                        abnormalBreathing: true,
                        startSleepTimeTooLatter: true,
                        wakeTimesTooMuch: true,
                        benignSleep: true,
                    }
                });

                if (sleepHistory.length === 0) {
                    return res.status(404).json({ message: 'No sleep history found for this user' });
                }

                // Map all fields for CSV export
                const fields = [
                    { label: 'ID', value: 'id' },
                    { label: 'Sleep Score', value: 'sleepScore' },
                    { label: 'Leave Bed Time', value: 'leaveBedTime' },
                    { label: 'Awake Time', value: 'awakeTime' },
                    { label: 'Breath Rate', value: 'breathRate' },
                    { label: 'Awake Sleep', value: 'awakeSleep' },
                    { label: 'Mid Sleep', value: 'midSleep' },
                    { label: 'Deep Sleep', value: 'deepSleep' },
                    { label: 'Leave Bed Times', value: 'leaveBedTimes' },
                    { label: 'Fall Sleep Timestamp', value: 'fallSleepTimeStamp' },
                    { label: 'Wakeup Timestamp', value: 'wakeupTimeStamp' },
                    { label: 'Turn Time', value: 'turnTime' },
                    { label: 'Sleep Curve Array', value: 'sleepCurveArray' },
                    { label: 'Start Time', value: 'startTime' },
                    { label: 'Average Breath Rate', value: 'avgBreathRate' },
                    { label: 'Average Heart Rate', value: 'avgHeartRate' },
                    { label: 'Heart Rate', value: 'heartRate' },
                    { label: 'Record Count', value: 'recordCount' },
                    { label: 'End Time', value: 'endTime' },
                    { label: 'Light Sleep', value: 'lightSleep' },
                    { label: 'Minute', value: 'minute' },
                    { label: 'Hour', value: 'hour' },
                    { label: 'Created At', value: 'createdAt' },
                    { label: 'Updated At', value: 'updatedAt' },
                    { label: 'Sync Date', value: 'syncDate' },
                    { label: 'Apnea', value: 'apena' },
                    { label: 'Turn Over Status Array', value: 'turnOverStatusAry' },
                    { label: 'Turn Over Times', value: 'trunOverTimes' },
                    { label: 'Deep Sleep All Time', value: 'deepSleepAllTime' },
                    { label: 'Bradypnea', value: 'bradypnea' },
                    { label: 'Restless', value: 'restless' },
                    { label: 'Up Night More', value: 'upNightMore' },
                    { label: 'Actual Sleep Long', value: 'actualSleepLong' },
                    { label: 'Fall Asleep Hard', value: 'fallAsleepHard' },
                    { label: 'Abnormal Breathing', value: 'abnormalBreathing' },
                    { label: 'Start Sleep Time Too Latter', value: 'startSleepTimeTooLatter' },
                    { label: 'Wake Times Too Much', value: 'wakeTimesTooMuch' },
                    { label: 'Benign Sleep', value: 'benignSleep' },
                ];

                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(sleepHistory);

                // Set headers to indicate file download
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=sleep-history-user-${userId}.csv`);

                // Send the CSV data as the response
                return res.status(200).send(csv);

            case 'DELETE':
                // Fetch records to confirm existence before deletion
                const sleepHistoryToDelete = await prisma.sleepHistory.findMany({
                    where: {
                        userId: Number(userId),
                    },
                    select: {
                        id: true,
                    },
                });

                if (sleepHistoryToDelete.length === 0) {
                    return res.status(404).json({ message: "No data found to delete" });
                }

                // Delete the sleep history records for the given userId
                const deleted = await prisma.sleepHistory.deleteMany({
                    where: {
                        userId: Number(userId),
                    },
                });

                // Return success response after deletion
                return res.status(200).json({
                    deleted,
                    message: 'Records removed successfully',
                });

            default:
                return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
