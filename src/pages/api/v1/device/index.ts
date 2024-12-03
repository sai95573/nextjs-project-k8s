import prisma from "../../utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    try {
        const device = await prisma.device.findMany({
            where: {
                user_id: Number(userId)
            },
            select: {
                device_id: true,
                device_mac: true,
                device_name: true,
                device_type: true,
                updatedAt: true,

            }
        });

        return res.status(200).json({ status: "Status", data: device });

    } catch (error) {
        console.error("Error updating device", error);
        return res.status(500).json({ status: "Error", message: "Internal server error" });
    }
}
