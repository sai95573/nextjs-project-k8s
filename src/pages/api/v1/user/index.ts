import { verifyTokens } from "../../../../lib/middleware/jwt";
import prisma from "../../utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
interface Tokens {
  accesstoken: string;
  refreshtoken: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const tokens = (await verifyTokens(req, res)) as Tokens;
  if (!tokens) return;

  // Set the tokens into response headers
  res.setHeader("accesstoken", tokens.accesstoken);
  res.setHeader("refreshtoken", tokens.refreshtoken);

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch the updated user details
    const updatedUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    try {

        // Fetch the updated user details
        const updatedUser = await prisma.users.findUnique({
            where: { id: parseInt(id) },
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
                isLoggedIn:true,
                is_welcome_screen:true,
                image_url: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return res.status(200).json({ status: 'Success', data: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
    return res.status(200).json({ status: "Success", data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
}
