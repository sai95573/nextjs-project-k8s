import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Destructure the request body correctly
        const { device_id, userId } = req.body;

        // Check if the device exists first
        const devices = await prisma.device.findMany({
            where: {
                user_id: userId,
                device_id: device_id,
            },
        });

        // If no device is found, return an appropriate response
        if (devices.length === 0) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Delete the device(s)
        const deleteDevice = await prisma.device.deleteMany({
            where: {
                user_id: userId,
                device_id: device_id,
            },
        });

        // Return success response
        return res.status(200).json({
            message: 'Device removed successfully',
        });
    } catch (error) {
        console.error('Error during device removal:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
