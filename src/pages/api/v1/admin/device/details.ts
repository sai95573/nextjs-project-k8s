import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract query parameters and handle defaults
  const { page = "1", limit = "10", userId, deviceId } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  // Input validation for page and limit
  if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
    return res.status(400).json({ error: "Invalid page or limit parameters" });
  }

  try {
    // Fetch devices based on userId and deviceId, including paginated device details
    const devices = await prisma.device.findMany({
      where: { user_id: Number(userId), device_id: deviceId },
      include: {
        deviceDetails: {
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
        },
        users: {
          select: {
            id: true,
            name: true,
            mobile: true,
            location_name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!devices.length) {
      return res.status(404).json({ message: "No devices found" });
    }

    // Fetch total count of device details for pagination
    const totalCount = await prisma.deviceDetails.count({
      where: { device_id: devices[0].id },
    });

    // Get sync dates
    const syncData = await getSyncDates(Number(userId));

    // Return paginated data with sync information
    return res.status(200).json({
      data: devices,
      syncData,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching device details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function to get sync dates and unsynced dates
const getSyncDates = async (userId: number) => {
  const syncRecords = await prisma.sleepHistory.findMany({
    where: { userId },
    select: { id: true, syncDate: true },
    orderBy: { syncDate: "desc" },
    take: 35, // Adjust this as needed for performance
  });

  if (!syncRecords.length)
    return {
      lastSyncDate: null,
      latestSyncDateGMT: null,
      unsyncedDates: [],
      syncedRecords: [],
    };

  // Group and format sync dates
  const groupedSyncDates = groupSyncDates(syncRecords);

  // Identify missing (unsynced) dates
  const unsyncedDates = getUnsyncedDates(groupedSyncDates);

  // Get the latest sync date
  const latestSyncDate = findLatestSyncDate(groupedSyncDates);

  return {
    lastSyncDate: latestSyncDate.timestamp,
    latestSyncDateGMT: new Date(latestSyncDate.timestamp * 1000).toUTCString(),
    syncedRecords: serializeSyncRecords(syncRecords),
    unsyncedDates,
  };
};

// Helper function to group sync records by formatted date
const groupSyncDates = (
  syncRecords: Array<{ id: bigint; syncDate: bigint }>,
) => {
  const grouped: { [key: string]: number } = {};
  syncRecords.forEach((record) => {
    const date = formatDate(record.syncDate);
    grouped[date] = Math.max(grouped[date] || 0, Number(record.syncDate));
  });
  return grouped;
};

// Helper function to find missing dates
const getUnsyncedDates = (groupedSyncDates: { [key: string]: number }) => {
  const unsyncedDates: string[] = [];
  const earliestSyncDate = new Date(
    Math.min(...Object.values(groupedSyncDates)) * 1000,
  );
  const currentDate = new Date();

  for (
    let d = new Date(earliestSyncDate);
    d <= currentDate;
    d.setDate(d.getDate() + 1)
  ) {
    const formattedDate = formatDate(Math.floor(d.getTime() / 1000));
    if (!groupedSyncDates[formattedDate]) {
      unsyncedDates.push(formattedDate);
    }
  }

  return unsyncedDates;
};

// Helper function to find the latest sync date
const findLatestSyncDate = (groupedSyncDates: { [key: string]: number }) => {
  return Object.entries(groupedSyncDates).reduce(
    (latest, [date, timestamp]) =>
      timestamp > latest.timestamp ? { date, timestamp } : latest,
    { date: "", timestamp: 0 },
  );
};

// Helper function to serialize sync records for response
const serializeSyncRecords = (
  syncRecords: Array<{ id: bigint; syncDate: bigint }>,
) => {
  return syncRecords.map((record) => ({
    reportId: Number(record.id),
    syncDateUnix: Number(record.syncDate),
    syncDateGMT: new Date(Number(record.syncDate) * 1000).toUTCString(),
  }));
};

// Utility function to format Unix timestamp to 'en-IN' date string
const formatDate = (unixTimestamp: bigint | number) => {
  return new Date(Number(unixTimestamp) * 1000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};
