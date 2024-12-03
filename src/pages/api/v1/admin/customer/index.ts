import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma"; // Adjust the path to your Prisma instance
import dayjs from "dayjs";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract query parameters
  const { search, deviceType, fromDate, toDate, page = '1', limit = '10' } = req.query;

  // Convert page and limit to numbers
  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  // Basic input validation
  if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
    return res.status(400).json({ error: 'Invalid page or limit parameters' });
  }

  try {
    // Initialize filters
    const filters: any = {
      roleId: 3, // Only customers (with roleId of 3)
    };

    // Conditionally add search filter
    if (search) {
      filters.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { mobile: { contains: search as string } },
        {
          device: {
            some: {
              device_mac: { contains: search as string },
            },
          },
        },
      ];
    }

    // Conditionally add deviceType filter
    if (deviceType) {
      filters.device = {
        some: {
          device_type: { contains: deviceType as string },
        },
      };
    }

    // Conditionally apply date range filter for 'createdAt'
    if (fromDate && toDate) {
      const from = dayjs(fromDate as string)
        .startOf('day')
        .toDate();
      const to = dayjs(toDate as string)
        .endOf('day')
        .toDate();
      filters.createdAt = { gte: from, lte: to };
    } else if (fromDate) {
      const from = dayjs(fromDate as string)
        .startOf('day')
        .toDate();
      filters.createdAt = { gte: from };
    } else if (toDate) {
      const to = dayjs(toDate as string)
        .endOf('day')
        .toDate();
      filters.createdAt = { lte: to };
    }

    // Fetch customers with the applied filters and pagination
    const [customersWithDevices, totalCount] = await Promise.all([
      prisma.users.findMany({
        orderBy: { id: "asc" },
        where: filters,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
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
          roles: {
            select: {
              id: true,
              name: true,
            },
          },
          device: {
            select: {
              id: true,
              device_id: true,
              device_name: true,
              device_mac: true,
              device_type: true,
              device_description: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.users.count({ where: filters }) // Fetch total count for pagination info
    ]);

    // Return 404 if no customers are found
    if (customersWithDevices.length === 0) {
      return res
        .status(404)
        .json({ status: 'Error', message: 'No customers found' });
    }

    // Return the fetched data as a response with pagination info
    return res.status(200).json({
      data: customersWithDevices,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.log('🚀 Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
