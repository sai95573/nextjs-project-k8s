import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { type, device_mac, device_name, device_type, connection_status, userId, device_id } = req.body;


        if (!userId || !device_id) {
            return res.status(400).json({ message: "UserId & deviceId  is required" });
        }

        if (type === "Bluetooth") {
            if (connection_status === "Connected") {
                const existingDevice = await prisma.device.findFirst({
                    where: {
                        user_id: Number(userId), device_id: device_id,
                    },
                    select: { id: true, oth_users: true },
                });
                if (!existingDevice) {
                    // Create a new device entry
                    const device = await prisma.device.create({
                        data: {
                            device_mac,
                            device_id,
                            device_name,
                            device_type,
                            user_id: userId,
                        },
                    });

                    // Create the device details record
                    await prisma.deviceDetails.create({
                        data: {
                            device_id: device.id,
                            connection_status,
                            user_id: userId,
                        },
                    });
                } else {
                    // Handle existing device and update oth_users
                    const existingOthUsers = existingDevice.oth_users ? (existingDevice.oth_users as number[]) : [];
                    if (!existingOthUsers.includes(userId)) {
                        existingOthUsers.push(userId);
                    }


                    // Update device with new oth_users
                    const updatedDevice = await prisma.device.update({
                        where: { id: existingDevice.id },
                        data: {
                            oth_users: existingOthUsers,
                            updatedAt: new Date(),
                            user_id: userId,

                        },
                    });
                    console.log("updatedDevice", updatedDevice)
                    // Create device details record for the updated device
                    await prisma.deviceDetails.create({
                        data: {
                            device_id: updatedDevice.id,
                            connection_status,
                            user_id: userId,
                        },
                    });
                }

                return res.status(200).json({ message: "Device connected via Bluetooth and record added to the database." });
            }
        }

        // If the type is not Bluetooth or the status is not Connected
        return res.status(400).json({ message: "Invalid connection type or status." });

    } catch (error) {
        console.error("Error connecting device:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
