// pages/api/sendNotification.js
import admin from '../../../firebase/firebaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../utils/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { message } = req.body;

        // const data = await prisma.users.findMany({
        //     where: {
        //         id: { in: [1, 2, 12] },
        //     }
        // })
        // console.log(data,"data-------------------")

        const tokens = [
            "fCbxgdqdQ9-ODoaUGHIGnO:APA91bGu7YVt-MHZf2FpGM-u8uci-gEn1o1DZSRRI43hl0vMJIHENsdcJoheJMtMwBrPTmhW-HHQC36Lkbm9LWWFounOcu57PLxqEwqV8m4g93lxbJy7wekbOKjczkO78SxasWQrXXaS"
        ]
        try {
            const response = await admin.messaging().sendMulticast({
                tokens: tokens,
                notification: {
                    title: message.title,
                    body: message.body,
                },
            });
            console.log("response======>", response)
            res.status(200).json({ success: true, response });
        } catch (error) {
            console.log(error, "++++++++++++++++")
            res.status(500).json({ error: 'Failed to send notification' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
