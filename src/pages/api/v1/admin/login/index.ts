// import { adminAccessTokenGeneration } from "../../../../middleware/jwt";
// import {
//   decryptOtp,
//   validatePhoneNumber,
// } from "../../../../middleware/commonUtils";
// import prisma from "../../../utils/prisma";
// import { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res
//       .status(400)
//       .json({ status: "Error", message: "Email or Password are required" });
//   }

//   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//   if (!email || !emailRegex.test(email)) {
//     return res.status(400).json({ error: "Invalid email address" });
//   }

//   try {
//     //checking if the user already exist
//     const user = await prisma.users.findFirst({
//       where: { email },
//       select: { otp: true, otp_expired: true },
//     });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ status: "Error", message: "User not found" });
//     }

//     adminAccessTokenGeneration;

//     return res
//       .status(200)
//       .json({ status: "Success", message: "OTP verified successfully", data });
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ status: "Error", message: "Internal server error" });
//   }
// }

import bcrypt from "bcrypt";
import { adminAccessTokenGeneration } from "../../../../../lib/middleware/jwt"; // Assuming this is your custom token function
import prisma from "../../../utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  // Validate email and password presence
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "Error", message: "Email and Password are required" });
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ status: "Error", message: "Invalid email address" });
  }

  try {
    // Check if user exists
    const user = await prisma.users.findFirst({
      where: { email },
      select: {
        otp: true,
        otp_expired: true,
        password: true,
        id: true,
        email: true,
      }, // Assuming you store the hashed password
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found" });
    }

    // Check if password exists
    if (!user.password) {
      return res
        .status(400)
        .json({ status: "Error", message: "Password not set for this user" });
    }

    // Verify the password using bcrypt
    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "Error", message: "Invalid password" });
    }

    // Create JWT token using the function or directly via jsonwebtoken
    const token = await adminAccessTokenGeneration(email, user.id);

    // Send response with token and success message
    return res.status(200).json({
      status: "Success",
      message: "OTP verified successfully",
      token,
      userId:user.id
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
}
