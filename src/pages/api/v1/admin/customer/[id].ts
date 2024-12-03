import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma"; 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query; // Get user ID from query parameters

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const userWithDevices = await prisma.users.findUnique({
      where: { id: parseInt(id, 10) }, // Convert ID to number
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
    });

    if (!userWithDevices) {
      return res.status(404).json({ status: "Error", message: "User not found" });
    }

    return res.status(200).json(userWithDevices);
  } catch (error) {
    console.error("Error fetching user and devices:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
