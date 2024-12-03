import jwt from "jsonwebtoken";
// import { Request, Response } from 'express';
// import { getUserDetails } from '../services';
import prisma from "../../pages/api/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

const jwtSecretKey = "sleep_company" || process.env.jwt_secret_key;

export async function accessTokenGeneration(
  phoneNumber: number,
  userId: number,
  deviceId: string,
) {
  const generateAccessToken = jwt.sign(
    {
      mobile: phoneNumber,
      userId: userId,
      mobile_device_id: deviceId,
    },
    jwtSecretKey,
    {
      expiresIn: "1d",
    },
  );

  return generateAccessToken;
}

export async function adminAccessTokenGeneration(
  email: string,
  userId: number,
) {
  const generateAccessToken = jwt.sign(
    {
      email: email,
      userId: userId,
    },
    jwtSecretKey,
    {
      expiresIn: "7d",
    },
  );

  return generateAccessToken;
}

export async function refreshTokenGeneration(
  phoneNumber: number,
  userId: number,
  deviceId: string,
) {
  const generateRefershToken = jwt.sign(
    {
      mobile: phoneNumber,
      userId: userId,
      mobile_device_id: deviceId,
    },
    jwtSecretKey,
    {
      expiresIn: "180d", //6 months
    },
  );
  return generateRefershToken;
}

// checking the device id
async function deviceTracking(mobile: number, mobile_device_id: string) {
  // const [data] = await getUserDetails(mobile);
  const data = await prisma.users.findFirst({
    where: {
      mobile,
    },
    select: { id: true, mobile_device_id: true, mobile: true },
  });
  return data && data.id && data.mobile_device_id !== mobile_device_id;
}

export const verifyTokens = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const access_token = req.headers["accesstoken"];
    const refresh_token = req.headers["refreshtoken"];

    if (!access_token) {
      return res.status(404).json({ message: "Access token not found." });
    }
    if (!refresh_token) {
      return res.status(404).json({ message: "Refresh token not found." });
    }

    // Return a promise to handle the asynchronous nature
    return new Promise((resolve, reject) => {
      jwt.verify(
        access_token,
        jwtSecretKey,
        async (accessTokenError: any, user: any) => {
          if (accessTokenError) {
            if (accessTokenError.name === "TokenExpiredError") {
              // Access token expired, verify refresh token
              jwt.verify(
                refresh_token,
                jwtSecretKey,
                async (refreshTokenError: any) => {
                  if (refreshTokenError) {
                    if (refreshTokenError.name === "TokenExpiredError") {
                      return reject(
                        res.status(401).json({ message: "Unauthorized!" }),
                      );
                    } else if (refreshTokenError.name === "JsonWebTokenError") {
                      return reject(
                        res.status(403).json({ message: "Access Denied." }),
                      );
                    }
                  }

                  const decodedRefreshToken = jwt.decode(refresh_token);
                  console.log(decodedRefreshToken,"-----------------1");
                  const isDeviceTracked = await deviceTracking(
                    decodedRefreshToken.mobile,
                    decodedRefreshToken.mobile_device_id,
                  );

                  if (!isDeviceTracked) {
                    const newAccessToken = await accessTokenGeneration(
                      decodedRefreshToken.mobile,
                      decodedRefreshToken.userId,
                      decodedRefreshToken.mobile_device_id,
                    );

                    const newRefreshToken = await refreshTokenGeneration(
                      decodedRefreshToken.mobile,
                      decodedRefreshToken.userId,
                      decodedRefreshToken.mobile_device_id,
                    );

                    resolve({
                      accesstoken: newAccessToken,
                      refreshtoken: newRefreshToken,
                      mobile: decodedRefreshToken.mobile,
                      userId: decodedRefreshToken.userId,
                      mobile_device_id: decodedRefreshToken.mobile_device_id,
                    });
                  } else {
                    reject(
                      res.status(401).json({
                        message:
                          "User already logged in. Please log out before attempting to log in again!",
                      }),
                    );
                  }
                },
              );
            } else {
              return reject(
                res.status(401).json({ message: "Invalid Access token!" }),
              );
            }
          } else {
            // Access token is valid
            const decodedAccessToken = jwt.decode(access_token);
            console.log(decodedAccessToken,"----------------2");


            const newAccessToken = await accessTokenGeneration(
              decodedAccessToken.mobile,
              decodedAccessToken.userId,
              decodedAccessToken.mobile_device_id,
            );

            const newRefreshToken = await refreshTokenGeneration(
              decodedAccessToken.mobile,
              decodedAccessToken.userId,
              decodedAccessToken.mobile_device_id,
            );


            const isDeviceTracked = await deviceTracking(
              decodedAccessToken.mobile,
              decodedAccessToken.mobile_device_id,
            );

            if (!isDeviceTracked) {
              resolve({
                accesstoken: newAccessToken,
                refreshtoken: newRefreshToken,
                mobile: decodedAccessToken.mobile,
                userId: decodedAccessToken.userId,
                mobile_device_id: decodedAccessToken.mobile_device_id,
              });
            } else {
              reject(
                res.status(401).json({
                  message:
                    "User already logged in. Please log out before attempting to log in again!",
                }),
              );
            }
          }
        },
      );
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export async function guestRefreshTokenGeneration(
  phoneNumber: string,
  userId: any,
  deviceId: string,
) {
  const generateRefershToken = jwt.sign(
    {
      mobile: phoneNumber,
      userId: userId,
      mobile_device_id: deviceId,
    },
    jwtSecretKey,
    {
      expiresIn: "10m",
    },
  );
  return generateRefershToken;
}

export async function guestAccessTokenGeneration(
  phoneNumber: string,
  userId: any,
  deviceId: any,
) {
  const generateAccessToken = jwt.sign(
    {
      mobile: phoneNumber,
      userId: userId,
      mobile_device_id: deviceId,
    },
    jwtSecretKey,
    {
      expiresIn: "6m",
    },
  );

  return generateAccessToken;
}
