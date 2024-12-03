import { generateOTP, sendOtp } from "../../../../lib/middleware/sms";
import { decryptOtp, encryptOtp } from "../../../../lib/middleware/commonUtils";
import prisma from "../../utils/prisma";
import {
  guestAccessTokenGeneration,
  guestRefreshTokenGeneration,
} from "@/lib/middleware/jwt";
import { NextApiRequest, NextApiResponse } from "next";

interface RegisterRequestBody {
  mobile: string;
  mobile_device_id?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { mobile, mobile_device_id } = req.body as RegisterRequestBody;

  if (!mobile) {
    return res
      .status(400)
      .json({ status: "Error", message: "Mobile number is required" });
  }

  // Validate mobile number
  if (!validatePhoneNumber(mobile)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number." });
  }

  try {
    // Find the user by mobile number
    const user = await prisma.users.findFirst({
      where: { mobile },
      select: { id: true, name: true, mobile: true },
    });

    // If user does not exist, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    // Send OTP
    await sendOtp(mobile, otp);
    const encryptedOTP = await encryptOtp(otp);
    const randomString: string = mobile_device_id || generateRandomString(10);

    // Update the user with the OTP and other details
    await prisma.users.update({
      where: { mobile },
      data: {
        otp: encryptedOTP,
        otp_expired: new Date(),
        mobile_device_id: randomString,
      },
    });

    // Fetch the updated user
    const registeredUser = await prisma.users.findFirst({
      where: { mobile },
      select: { id: true, name: true, mobile: true },
    });

    // Generate JWT tokens
    const jwtAccessToken = await guestAccessTokenGeneration(
      mobile,
      registeredUser?.id || "",
      mobile_device_id || "",
    );
    const jwtRefreshToken = await guestRefreshTokenGeneration(
      mobile,
      registeredUser?.id || "",
      mobile_device_id || "",
    );

    return res.status(200).json({
      status: "Success",
      message: "OTP sent successfully",
      guest_token: {
        accesstoken: jwtAccessToken,
        refreshtoken: jwtRefreshToken,
      },
    });
  } catch (error) {
    console.error("Error handling OTP request:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
}

// Validate phone number format
const validatePhoneNumber = (mobile: string): boolean => {
  return /^[6-9]\d{9}$/.test(mobile);
};

// Generate a random alphanumeric string of specified length
function generateRandomString(length: number): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
