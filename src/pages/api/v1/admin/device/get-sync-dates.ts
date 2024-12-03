import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId } = req.query;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
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
        syncDate: "desc",
      },
      take: 35,
    });

    console.log(syncRecords, "syncRecords");

    let lastSyncDate: number | null = null;
    let latestSyncDateGMT: string | null = null;
    const unsyncedDates: string[] = []; // Array to hold unsynced dates

    if (syncRecords.length === 0) {
      lastSyncDate = null; // No sync records available
    } else {
      const groupedSyncDates: { [key: string]: number } = {};

      syncRecords.forEach((record) => {
        const date = new Date(
          Number(record.syncDate) * 1000,
        ).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

        const syncTimestamp = Number(record.syncDate);

        if (!groupedSyncDates[date]) {
          groupedSyncDates[date] = syncTimestamp;
        } else {
          groupedSyncDates[date] = Math.max(
            groupedSyncDates[date],
            syncTimestamp,
          );
        }
      });

      // Find the earliest and latest sync dates
      const earliestSyncDate = new Date(
        Math.min(...syncRecords.map((record) => Number(record.syncDate))) *
          1000,
      );
      const currentDate = new Date(); // Current date

      // Iterate from the earliest sync date to the current date to find missing (unsynced) dates
      for (
        let d = new Date(earliestSyncDate);
        d <= currentDate;
        d.setDate(d.getDate() + 1)
      ) {
        const formattedDate = d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        });
        if (!groupedSyncDates[formattedDate]) {
          unsyncedDates.push(formattedDate); // Add unsynced date
        }
      }

      // Find the latest sync date and its timestamp
      const latestDateEntry = Object.entries(groupedSyncDates).reduce(
        (latest, [date, timestamp]) => {
          return timestamp > latest.timestamp ? { date, timestamp } : latest;
        },
        { date: "", timestamp: 0 },
      );

      lastSyncDate = latestDateEntry.timestamp;
      latestSyncDateGMT = new Date(lastSyncDate * 1000).toUTCString();
    }

    const serializedSyncRecords = syncRecords.map((record) => ({
      reportId: Number(record.id),
      syncDateUnix: Number(record.syncDate),
      syncDateGMT: new Date(Number(record.syncDate) * 1000).toUTCString(),
    }));

    // Return response with sync data and unsynced dates
    return res.status(200).json({
      data: {
        lastSyncDate,
        latestSyncDateGMT,
        syncedRecords: serializedSyncRecords,
        unsyncedDates, // Include unsynced dates from all gaps
      },
    });
  } catch (error) {
    console.error("Error fetching sync data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
