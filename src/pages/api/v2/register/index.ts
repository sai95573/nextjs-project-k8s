import { generateOTP, sendOtp } from "../../../../lib/middleware/sms";
import { decryptOtp, encryptOtp } from "../../../../lib/middleware/commonUtils";
import prisma from "../../utils/prisma";
import {
  guestAccessTokenGeneration,
  guestRefreshTokenGeneration,
} from "@/lib/middleware/jwt";
import { NextApiRequest, NextApiResponse } from "next";

interface RegisterRequestBody {
  user_name: string;
  email: string;
  mobile: string;
  mobile_device_id?: string;
  is_registered: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user_name, email, mobile, mobile_device_id } =
    req.body as RegisterRequestBody;

  if (!user_name || !email || !mobile) {
    return res
      .status(400)
      .json({
        status: "Error",
        message: "Name, email, and mobile are required",
      });
  }

  // Validate mobile number
  if (!validatePhoneNumber(mobile)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number." });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid email address." });
  }

  try {
    // Find the user by mobile number and check if user registered
    const existingMobileNumber = await prisma.users.findUnique({
      where: {
        mobile: mobile,
        is_registered: true
      },
      select: { id: true, mobile: true, is_registered: true },
    });

    if (existingMobileNumber) {
      return res
        .status(409)
        .json({
          status: "Error",
          message: "User already registered with this mobile number. Please login.",
        });
    }

    // Find the user by mobile number if not registered
    const user = await prisma.users.findFirst({
      where: {
        mobile: mobile
      },
      select: { id: true, name: true, mobile: true, is_registered: true },
    });


    if (!user?.mobile) {
      const otp = generateOTP();
      // Send OTP
      await sendOtp(mobile, otp);

      const encryptedOTP = await encryptOtp(otp);

      const randomString: string = mobile_device_id || generateRandomString(10);

      await prisma.users.create({
        data: {
          name: user_name,
          email,
          mobile,
          otp: encryptedOTP,
          otp_expired: new Date(),
          mobile_device_id: randomString,
          roleId: 3,
        },
      });
    } else {
      const otp = generateOTP();

      await sendOtp(mobile, otp);

      const encryptedOTP = await encryptOtp(otp);

      const randomString: string = mobile_device_id || generateRandomString(10);
      await prisma.users.update({
        where: { mobile },
        data: {
          otp: encryptedOTP,
          otp_expired: new Date(),
          mobile_device_id: randomString,
        },
      });
    }

    //get the created user details
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

// Validate email format
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
