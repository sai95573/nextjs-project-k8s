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
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const tokens = (await verifyTokens(req, res)) as Tokens;
  if (!tokens) return;

  // Set the tokens into response headers
  res.setHeader("accesstoken", tokens.accesstoken);
  res.setHeader("refreshtoken", tokens.refreshtoken);

  const { mobile, gender, dateOfBirth, height, weight } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  try {
    const user = await prisma.users.findFirst({
      where: { mobile },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      gender,
      dateOfBirth: dateOfBirth || null,
      height: height || null,
      weight: weight || null,
      is_registered: true
    };

    await prisma.users.update({
      where: { mobile },
      data: updateData,
    });

    return res
      .status(200)
      .json({
        status: "Sucesss",
        message: "User details updated successfully",
      });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
}
