import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const localTimeZone = "Asia/Kolkata";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { type, startDate, endDate } = req.query as unknown as QueryParams;

        if (!type || !["day", "week", "month"].includes(type)) {
            return res
                .status(400)
                .json({ message: "Invalid type. Must be day, week, or month" });
        }

        if (!startDate) {
            return res.status(400).json({ message: "Start date is required" });
        }

        // Parse dates in local timezone to avoid server timezone issues
        const startOfDay = dayjs
            .tz(startDate, "YYYY-MM-DD", localTimeZone)
            .startOf("day")
            .unix();
        const endOfDay = dayjs
            .tz(endDate, "YYYY-MM-DD", localTimeZone)
            .endOf("day")
            .unix();

        console.log("Fetching sleep history data from", startOfDay, "to", endOfDay);

        // Fetch related sleep history data, users, and devices
        const sleepHistoryData = await prisma.sleepHistory.findMany({
            where: {
                syncDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                userId: 'asc',
            },
            include: {
                users: {
                    select: {
                        name: true,
                        gender:true,
                        mobile:true,
                        device: { 
                            select: { device_id: true, device_type:true },
                        },
                    },
                },
            },
        });

        if (sleepHistoryData.length === 0) {
            return res
                .status(404)
                .json({ message: "No sleep history data found for this device" });
        }

        // Convert BigInt fields to Number for JSON serialization
        const formattedData = sleepHistoryData.map(convertBigIntToNumber);

        // Group data by userId
        const groupedByUser = formattedData.reduce((acc: any, item) => {
            if (!acc[item.userId]) {
                acc[item.userId] = [];
            }
            acc[item.userId].push(item);
            return acc;
        }, {});

        // Prepare response based on type
        const result = Object.keys(groupedByUser).map((userId) => {
            const userSleepData = groupedByUser[userId];

            if (type === "day") {
                // Return sleep data for the specific day per user
                // const dayData = userSleepData;

                const dayDataArray = userSleepData.map((dayData) => {
                    const {
                        turnOverStatusAry,
                        heartRate,
                        sleepCurveArray,
                        breathRate,
                        ...filteredDayData
                    } = dayData;
                    // Return filtered day data
                    return filteredDayData;
                });
            
                if (!dayDataArray || dayDataArray.length === 0) {
                    return { userId, message: "No sleep data found for the specified day" };
                }
            
                return {
                    userId,
                    sleepHistoryData: dayDataArray,
                    calculatedRecords: dayDataArray.map((data) => 
                        formatDate(Number(data.syncDate))
                    ), // Single date for day calculation
                };
            } else {
                // console.log(userSleepData)

                const groupedByDate = userSleepData.reduce((acc, data) => {
                    // const dateKey = dayjs.unix(data.syncDate).format("YYYY-MM-DD");
                    const dateKey = dayjs.unix(data.syncDate).tz(localTimeZone).format("YYYY-MM-DD");
                    console.log("dateKey============", dateKey)
                    if (!acc[dateKey]) {
                        acc[dateKey] = [];
                    }
                    acc[dateKey].push(data);
                    return acc;
                }, {});
            
                // Filter to get highest recordCount for each date
                const finalData = Object.entries(groupedByDate).map(([date, records]) => {
                    const highestRecord = records.reduce((max, record) => 
                        (record.recordCount > max.recordCount ? record : max), records[0]);
            
                    return highestRecord; // return the record with the highest count
                });


                // Calculate weekly or monthly averages per user
                const sleepScores = finalData.map((data) => data.sleepScore || 0);
                const startTime = finalData.map((data) => data.startTime || 0);
                const endTime = finalData.map((data) => data.endTime || 0);
                const avgBreathRate = finalData.map((data) => data.avgBreathRate || 0);
                const avgHeartRate = finalData.map((data) => data.avgHeartRate || 0);
                const awakeTime = finalData.map((data) => data.awakeTime || 0);
                const leaveBedTime = finalData.map((data) => data.leaveBedTime || 0);
                const midSleep = finalData.map((data) => data.midSleep || 0);
                const deepSleep = finalData.map((data) => data.deepSleep || 0);
                const deepSleepAllTime = finalData.map((data) => data.deepSleepAllTime || 0);
                const trunOverTimes = finalData.map((data) => data.trunOverTimes || 0);
                const users = finalData.map((data) => data.users);

                return {
                    userId,
                    users:users[0],
                    sleepHistoryData: {
                        sleepScore: calculateAverage(sleepScores),
                        startTime: calculateAverage(startTime),
                        endTime: calculateAverage(endTime),
                        avgBreathRate: calculateAverage(avgBreathRate),
                        avgHeartRate: calculateAverage(avgHeartRate),
                        awakeTime: calculateAverage(awakeTime),
                        leaveBedTime: calculateAverage(leaveBedTime),
                        midSleep: calculateAverage(midSleep),
                        deepSleep: calculateAverage(deepSleep),
                        apena: 0,
                        deepSleepAllTime: calculateAverage(deepSleepAllTime),
                        trunOverTimes: calculateAverage(trunOverTimes),
                    },
                    calculatedRecords: userSleepData.map((data) =>
                        formatDate(Number(data.syncDate)),
                    ), // List of dates used for calculations
                };
            }
        });

        return res.status(200).json({ status: "Success", data: result });
    } catch (error) {
        console.error("Error fetching sleep history data:", error);
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
}


function calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const total = numbers.reduce((acc, num) => acc + num, 0);
    return total / numbers.length;
}

// Converts all BigInt fields to Number
function convertBigIntToNumber(data: any) {
    const convertedData = { ...data };
    Object.keys(convertedData).forEach((key) => {
        if (typeof convertedData[key] === "bigint") {
            convertedData[key] = Number(convertedData[key]);
        }
    });
    return convertedData;
}

// Utility functions
function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
}
