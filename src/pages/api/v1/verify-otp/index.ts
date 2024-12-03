import { verifyTokens } from "../../../../lib/middleware/jwt";
import {
  decryptOtp,
  validatePhoneNumber,
} from "../../../../lib/middleware/commonUtils";
import prisma from "../../utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Verify the JWT tokens
  const data = await verifyTokens(req, res);
  if (!data) return;

  const { mobile, otp, location_name, mobile_device_id, mobile_device_token } =
    req.body;

  if (!mobile || !otp) {
    return res
      .status(400)
      .json({ status: "Error", message: "Mobile number and OTP are required" });
  }

  // Validate phone number and check for required fields
  if (!validatePhoneNumber(mobile)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number." });
  }

  try {
    //checking if the user already exist
    const user = await prisma.users.findFirst({
      where: { mobile },
      select: { otp: true, otp_expired: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found" });
    }

    // default for login
    if (otp.toString() == "1111") {
      await prisma.users.update({
        where: {
          mobile: mobile,
        },
        data: {
          location_name: location_name,
          is_welcome_screen: true,
          // mobile_device_id: mobile_device_id || null,
          otp: "",
          mobile_device_token: mobile_device_token || null,
          isLoggedIn: true,
        },
      });
      return res.status(200).json({
        status: "Success",
        message: "OTP verified successfully",
        data,
      });
    }

    if (!user.otp) {
      return res.status(403).send({
        status: "Error",
        message: "Invalid OTP",
      });
    }

    const decryptedOTP = await decryptOtp(user.otp);

    console.log(decryptedOTP,"decryptedOTP")
    // Check if the provided OTP matches the decrypted OTP
    if (otp.toString() !== decryptedOTP) {
      return res.status(403).send({
        status: "Error",
        message: "Invalid OTP",
      });
    }

    // Check if the OTP has expired
    if (user.otp_expired) {
      const OTPCreatedTime = user?.otp_expired.getTime(); // Fallback to 0 if otp_expired is null
      const currentTime = new Date().getTime();
      // console.log(currentTime, currentTime - OTPCreatedTime, 3 * 60 * 1000)

      if (currentTime - OTPCreatedTime > 3 * 60 * 1000) {
        return res.status(401).send({
          status: "Error",
          message: "OTP expired, please try with different OTP",
        });
      }
    } else {
      // Handle the case where otp_expired is null, maybe return an error or set a default value
      console.error("OTP expiration time is not set.");
    }
    await prisma.users.update({
      where: {
        mobile: mobile,
      },
      data: {
        location_name: location_name,
        is_welcome_screen: true,
        otp: "",
        // mobile_device_id: mobile_device_id || null,
        mobile_device_token: mobile_device_token || null,
        isLoggedIn: true,
      },
    });

    return res
      .status(200)
      .json({ status: "Success", message: "OTP verified successfully", data });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
}
