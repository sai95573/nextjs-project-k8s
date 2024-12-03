import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     try {
//         const { type, device_id, device_type, connection_status, userId } = req.body;

//         if (type === "Manual") {
//             const existingDevice = await prisma.device.findFirst({
//                 where: {
//                     AND: [
//                         { device_id: device_id },
//                         { device_type: device_type }
//                     ]
//                 },
//                 select: { id: true, device_id: true, device_name: true },
//             });

//             console.log(existingDevice)
//             if (!existingDevice) {
//                 return res.status(200).json({ message: "device not found" });
//             }

//             return res.status(200).json({ message: "Device connected manually" });
//         }

//         return res.status(400).json({ message: "Invalid connection type or status" });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { type, device_mac, device_name, device_type, connection_status, userId, device_id } = req.body;

        //  // Check if the user exists
        //  const user = await prisma.user.findUnique({
        //     where: { id: userId },
        // });

        // if (!user) {
        //     return res.status(400).json({ message: "User does not exist" });
        // }

        if (type === "Manual") {
            if (connection_status === "Connected") {
                const existingDevice = await prisma.device.findFirst({
                    where: {  user_id: Number(userId), device_id: device_id,},
                    select: { id: true, oth_users: true },
                });

                if (existingDevice) {

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
                            updatedAt: new Date()
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

                } else {

                    return res.status(404).json({ message: "Device not found" });

                }

                return res.status(200).json({ message: "Device connected via Manual and record added to the database." });
            }
        }

        // If the type is not Manual or the status is not Connected
        return res.status(400).json({ message: "Invalid connection type or status." });

    } catch (error) {
        console.error("Error connecting device:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
