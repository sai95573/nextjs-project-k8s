import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { sleep_history, userId } = req.body;

        // To store the response of synced data
        const syncedData = [];

        // Loop through each sleep history record
        for (const history of sleep_history) {
            const { syncDate, ...sleepHistoryData } = history;

            // Ensure syncDate is a number and convert UNIX timestamp to BigInt
            const syncDateBigInt = BigInt(syncDate);
            console.log(syncDateBigInt, "++++++++++++++++++");

            // Check if sleep history exists for this syncDate and userId
            const sleepDataExists = await prisma.sleepHistory.findFirst({
                where: {
                    userId,
                    syncDate: syncDateBigInt,
                },
            });

            // Only insert new sleep history if it doesn't exist
            if (!sleepDataExists) {
                // Insert sleep history data linked with the sync_id (UserSync)
                await prisma.sleepHistory.create({
                    data: {
                        userId,
                        syncDate: syncDateBigInt,
                        ...sleepHistoryData,
                    },
                });
                // Add the synced data to the response
                syncedData.push({
                    syncDate: syncDateBigInt.toString(), // Convert BigInt to string for response
                    sleepData: sleepHistoryData,
                });
            }
        }

        // Return the synced data in the response
        return res.status(200).json({
            message: 'Sync completed successfully',
            syncedData,
        });
    } catch (error) {
        console.error('Sync error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
