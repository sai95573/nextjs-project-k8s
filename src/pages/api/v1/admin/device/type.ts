import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma"; // Adjust the path to your Prisma instance

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract query parameters
  const { deviceType } = req.query;

  try {
    // Initialize filters
    const filters: any = {};

    // Conditionally add deviceType filter
    if (deviceType) {
      filters.device = {
        some: {
          device_type: { contains: deviceType as string },
        },
      };
    }

    console.log(filters);
    // Fetch customers with the applied filters and pagination
    const [customersWithDevices, totalCount] = await Promise.all([
      prisma.users.findMany({
        where: filters,
        select: {
          id: true,
          mobile: true,
          name: true,
        },
      }),
      prisma.users.count({ where: filters }), // Fetch total count for pagination info
    ]);

    // Return 404 if no customers are found
    if (customersWithDevices.length === 0) {
      return res
        .status(404)
        .json({ status: "Error", message: "No customers found" });
    }

    // Return the fetched data as a response with pagination info
    return res.status(200).json({
      data: customersWithDevices,
    });
  } catch (error) {
    console.log("🚀 Error: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
