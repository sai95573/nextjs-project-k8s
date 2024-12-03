// pages/api/updateUser.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../utils/prisma";
import { verifyTokens } from "../../../../lib/middleware/jwt";

interface Tokens {
  accesstoken: string;
  refreshtoken: string;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb", // Set the maximum allowed payload size
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const tokens = (await verifyTokens(req, res)) as Tokens;
  if (!tokens) return;

  // Set the tokens into response headers
  res.setHeader("accesstoken", tokens.accesstoken);
  res.setHeader("refreshtoken", tokens.refreshtoken);

  const {
    id,
    name,
    email,
    mobile,
    gender,
    dateOfBirth,
    height,
    weight,
    image_url,
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id },
      select: { id: true, email: true, mobile: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the email is already in use by another user
    // if (email && email !== user.email) {
    //     const existingEmail = await prisma.users.findUnique({
    //         where: { email },
    //         select: { id: true, email: true }
    //     });

    //     if (existingEmail) {
    //         return res.status(400).json({ message: 'Email already exists' });
    //     }
    // }

    const updateData = {
      gender,
      name: name,
      email: email,
      dateOfBirth: dateOfBirth || null,
      height: height || null,
      weight: weight || null,
      image_url: image_url || null,
    };

    await prisma.users.update({
      where: { id },
      data: updateData,
    });

    return res
      .status(200)
      .json({
        status: "Success",
        message: "User details updated successfully",
      });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
}
