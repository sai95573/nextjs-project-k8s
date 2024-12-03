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

        // Fetch all sync records for the user, ordered by the latest sync date
        const syncedData = await prisma.sleepHistory.findMany({
            where: {
                userId: Number(userId)
            },
            select: {
                syncDate: true,
            },
            orderBy: {
                syncDate: 'desc',
            },
            take: 35,
        });

        // Function to get dates for the last 10 days including the current date
        const getUnsyncedDates = (days) => {
            const dates = [];
            const currentDate = new Date(); // Get the current date

            // Start from yesterday (one day less)
            for (let i = 1; i <= days; i++) {
                const date = new Date(currentDate);
                date.setDate(currentDate.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
            }
            return dates;
        };

        // If there is no synced data, return current date as lastSyncDate
        let lastSyncDate: string;
        let syncedDates: string[] = [];
        // const currentDate = new Date().toISOString().split('T')[0];

        if (syncedData.length === 0) {
            lastSyncDate = ""; // Current date if no syncs found
            return res.status(200).json({
                data: {
                    lastSyncDate,
                    syncedDates: [],
                    unsyncedDates: getUnsyncedDates(10)
                },
            });
        } else {
            // Convert UNIX timestamps to ISO date strings
            lastSyncDate = new Date(Number(syncedData[0].syncDate) * 1000).toISOString().split('T')[0];
            syncedDates = syncedData.map(data => new Date(Number(data.syncDate) * 1000).toISOString().split('T')[0]);
        }
        console.log(new Date(Number(syncedData[syncedData.length - 1].syncDate) * 1000));

        // Generate a range of dates from the earliest sync date to today
        const firstSyncDate = new Date(Number(syncedData[syncedData.length - 1].syncDate) * 1000);

        const today = new Date();
        const allDates: string[] = [];

        for (let date = new Date(firstSyncDate); date <= today; date.setDate(date.getDate() + 1)) {
            allDates.push(new Date(date).toISOString().split('T')[0]);
        }

        // Find unsynced dates by comparing allDates and syncedDates
        const unsyncedDates = allDates.filter(date => !syncedDates.includes(date));

        return res.status(200).json({
            data: {
                lastSyncDate,  // Return last sync date or current date
                syncedDates,   // Return all synced dates
                unsyncedDates
            }
        });

    } catch (error) {
        console.error('Error fetching sync data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
