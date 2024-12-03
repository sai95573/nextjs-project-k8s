import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';
import { verifyTokens } from '../../../../lib/middleware/jwt';

interface Tokens {
    accesstoken: string;
    refreshtoken: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const tokens = await verifyTokens(req, res) as Tokens;
    if (!tokens) return;

    // Set the tokens into response headers
    res.setHeader('accesstoken', tokens.accesstoken);
    res.setHeader('refreshtoken', tokens.refreshtoken);

    try {
        const { userId } = req.query;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        const syncRecords = await prisma.sleepHistory.findMany({
            where: {
                userId: Number(userId),
            },
            select: {
                id: true,
                syncDate: true,
            },
            orderBy: {
                syncDate: 'desc',
            },
            take: 35,
        });

        let lastSyncDate: number | null = null;
        let latestSyncDateGMT: string | null = null; 

        if (syncRecords.length === 0) {
            // Calculate fallback date as 10 days before the current date
            const fallbackDate = new Date();
            fallbackDate.setDate(fallbackDate.getDate() - 10);
            lastSyncDate = Math.floor(fallbackDate.getTime() / 1000);
        } else {
            // Group timestamps by date
            const groupedSyncDates: { [key: string]: number } = {};

            syncRecords.forEach((record) => {
                const date = new Date(Number(record.syncDate) * 1000).toISOString().split('T')[0]; // Get YYYY-MM-DD
                const syncTimestamp = Number(record.syncDate);

                if (!groupedSyncDates[date]) {
                    groupedSyncDates[date] = syncTimestamp; // Initialize with the current syncDate
                } else {
                    // Keep the latest syncDate for this date
                    groupedSyncDates[date] = Math.max(groupedSyncDates[date], syncTimestamp);
                }
            });

            // Find the latest sync date and its timestamp
            const latestDateEntry = Object.entries(groupedSyncDates).reduce((latest, [date, timestamp]) => {
                return timestamp > latest.timestamp ? { date, timestamp } : latest;
            }, { date: '', timestamp: 0 });

            // Assign the latest timestamp and convert it to GMT
            lastSyncDate = latestDateEntry.timestamp;
            latestSyncDateGMT = new Date(lastSyncDate * 1000).toUTCString(); // Convert to GMT format
        }

        // Prepare serialized sync data for response
        const serializedSyncRecords = syncRecords.map((record) => ({
            reportId: Number(record.id), // Convert id to Number
            syncDateUnix: Number(record.syncDate), // Use Number for serialization
            syncDateGMT: new Date(Number(record.syncDate) * 1000).toUTCString(), // Convert to GMT string
        }));

        // Return response with sync data
        return res.status(200).json({
            data: {
                lastSyncDate, // Latest sync timestamp
                latestSyncDateGMT, // Latest sync date in GMT format
                syncedRecords: serializedSyncRecords, // Serialized sync records
            },
        });


    } catch (error) {
        console.error('Error fetching sync data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
