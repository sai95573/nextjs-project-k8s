import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';
import { verifyTokens } from '../../../../lib/middleware/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const verifyUser = (await verifyTokens(req, res)) as Tokens;
    if (!verifyUser) return;

    try {
        const user = await prisma.users.findUnique({
            where: { id: Number(verifyUser.userId) },
        });

        if (!user) {
            return res
                .status(404)
                .json({ status: "Error", message: "User not found" });
        }

        // Insert user data into DeletedUser table
        await prisma.DeletedUser.create({
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                height: user.height ? user.height.toString() : null,
                weight: user.weight ? user.weight.toString() : null,
            },
        });

        await prisma.users.delete({
            where: { id: Number(verifyUser.userId) },
        });

        return res.status(200).json({
            status: 'Success', message: 'User account deleted successfully',
        });
    } catch (error) {
        console.error('Error during device removal:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
