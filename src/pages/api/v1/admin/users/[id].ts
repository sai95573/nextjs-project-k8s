import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;

  try {
    const users = await prisma.users.findMany({
      where: {
        id: Number(id), // Convert id to number if it's a numeric value
        roleId: { not: 3 },
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        roleId: true,
        gender: true,
        dateOfBirth: true,
        height: true,
        weight: true,
        createdAt: true,
        roles: {
          select: {
            id: true,
            name: true,
            permission: true,
          },
        },
      },
    });

    return res.status(200).json({ status: "Success", users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error retrieving users." });
  }
}
