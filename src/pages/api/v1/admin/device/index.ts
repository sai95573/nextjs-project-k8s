import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract query parameters
  const { page = "1", limit = "10", deviceId } = req.query;

  // Convert page and limit to numbers
  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  // Basic input validation
  if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
    return res.status(400).json({ error: "Invalid page or limit parameters" });
  }
  console.log("deviceId", deviceId);

  try {
    // Initialize filter for search if provided
    const deviceFilter: any = {};
    if (deviceId) {
      deviceFilter.device_id = deviceId as string;
    }


    // Fetch paginated devices with optional search filter
    const [devices, totalCount] = await Promise.all([
      prisma.device.findMany({
        orderBy: { id: "asc" },
        where: deviceFilter,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        // include: {
        //   deviceDetails: true,
        // },
      }),
      prisma.device.count({ where: deviceFilter }), // Fetch total count for pagination info
    ]);

    if (devices.length === 0) {
      return res.status(404).json({ message: "No devices found" });
    }

    // Fetch connected users for each device
    const devicesWithUsers = await Promise.all(
      devices.map(async (device) => {
        const userIds = device.oth_users || [];

        let connectedUsers = [] as any;
        if (userIds.length > 0) {
          try {
            connectedUsers = await prisma.users.findMany({
              where: {
                id: {
                  in: userIds,
                },
              },
              select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                dateOfBirth: true,
                gender: true,
                height: true,
                weight: true,
                location_name: true,
                createdAt: true,
                updatedAt: true,
              },
            });
          } catch (userError) {
            console.error("Error fetching connected users:", userError);
          }
        }

        return {
          ...device,
          connectedUsers,
        };
      }),
    );

    // Return the fetched data with pagination info
    return res.status(200).json({
      data: devicesWithUsers,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching devices or users:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
}
