import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  getApena,
  getEmancipateOneSelfTag,
  getHeartRateTag,
  getRespirationRateTag,
  getSleepDurationTag,
  getSleepEffectivenessTag,
  getSleepInterruptionTag,
  getSleepRegularityTag,
  getSleepScoreTag,
} from "../../../utils/common";

dayjs.extend(utc);
dayjs.extend(timezone);

const localTimeZone = "Asia/Kolkata";

interface QueryParams {
  device_mac: string;
  type: "day" | "week" | "month";
  startDate: string;
  endDate?: string;
  userId: number;
}

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


  try {
    const { type, startDate, endDate, userId } =
      req.query as unknown as QueryParams;

    // Validate query parameters
    if (!type || !["day", "week", "month"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Invalid type. Must be day, week, or month" });
    }
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    }

    // Convert dates to UNIX timestamps
    // const startOfDay = dayjs(startDate, "YYYY-MM-DD").unix();
    // const endOfDay = dayjs(endDate, "YYYY-MM-DD").endOf('day').unix();

    // Parse dates in local timezone
    const startOfDay = dayjs
      .tz(startDate, "YYYY-MM-DD", localTimeZone)
      .startOf("day")
      .unix();
    const endOfDay = dayjs
      .tz(endDate, "YYYY-MM-DD", localTimeZone)
      .endOf("day")
      .unix();

    console.log("Fetching sleep history data from", startOfDay, "to", endOfDay);

    // Find the user by mobile number
    const user = await prisma.users.findFirst({
      where: { id: Number(userId) },
      select: { id: true, gender: true, mobile: true },
    });

    // Fetch related sleep history data based on syncDate
    const sleepHistoryData = await prisma.sleepHistory.findMany({
      where: {
        userId: Number(userId),
        syncDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        syncDate: "asc",
      },
    });

    // console.log("Fetched sleep history data:", sleepHistoryData);
    if (sleepHistoryData.length === 0) {
      return res
        .status(404)
        .json({ message: "No sleep history data found for this device" });
    }

    // Convert BigInt fields to Number for JSON serialization
    const formattedData = sleepHistoryData.map(convertBigIntToNumber);

    if (type === "day") {
      // Return sleep data for the specific day
      // console.log(formattedData, "=========================11")
      // Return sleep data for the specific day with multiple records
      const dayDataArray = formattedData.map((dayData) => {
        const {
          turnOverStatusAry,
          heartRate,
          sleepCurveArray,
          breathRate,
          ...filteredDayData
        } = dayData;

        filteredDayData.sleepScoreTag = getSleepScoreTag(
          filteredDayData.sleepScore || 0,
        );
        filteredDayData.heartRateTag = getHeartRateTag(
          dayData.avgHeartRate || 0,
        );
        filteredDayData.respirationRateTag = getRespirationRateTag(
          dayData.avgBreathRate || 0,
          user?.gender || "Male",
        );
        filteredDayData.emancipateOneSelfTag = getEmancipateOneSelfTag(
          dayData.trunOverTimes || 0,
        );
        filteredDayData.sleepDurationTag = getSleepDurationTag(
          dayData.deepSleepAllTime || 0,
        );
        filteredDayData.sleepEffectivenessTag = getSleepEffectivenessTag(
          dayData.midSleep || 0,
        );
        filteredDayData.sleepRegularityTag = getSleepRegularityTag(
          dayData.recordCount || 0,
        );
        filteredDayData.sleepInterruptionTag = getSleepInterruptionTag(
          dayData.leaveBedTime || 0,
        );
        filteredDayData.apenaTag = getApena(dayData.apena || 0);

        const formattedResult = [
          { title: "Bradypnea", value: filteredDayData.bradypnea },
          { title: "Restless", value: filteredDayData.restless },
          {
            title: "Too many times to get up at midnight",
            value: filteredDayData.upNightMore,
          },
          {
            title: "Actual Sleep Time Is Too Long",
            value: filteredDayData.actualSleepLong,
          },
          {
            title: "Fall Asleep Takes Long",
            value: filteredDayData.fallAsleepHard,
          },
          {
            title: "Abnormal Breath Rate",
            value: filteredDayData.abnormalBreathing,
          },
          {
            title: "Went to sleep late",
            value: filteredDayData.startSleepTimeTooLatter,
          },
          {
            title: "Wake up too often",
            value: filteredDayData.wakeTimesTooMuch,
          },
          {
            title: "Distribution of Healthy Sleep",
            value: filteredDayData.benignSleep,
          },
        ].filter((item) => item.value !== null && item.value !== 0);

        // Add formattedResult to each day's data
        filteredDayData.sleepInterpretationArray = formattedResult;

        return filteredDayData;
      });

      return res.status(200).json({
        status: "Success",
        sleepHistoryData: dayDataArray,
        calculatedRecords: dayDataArray.map((data) =>
          formatDate(Number(data.syncDate)),
        ),
      });
    } else {


      // Calculate weekly or monthly averages
      const responseData = handleWeeklyMonthlyReport(formattedData, type, user);
      return res.status(200).json(responseData);
    }
  } catch (error) {
    console.error("Error fetching sleep history data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

function handleWeeklyMonthlyReport(formattedData, type, user) {
  // Group by date
  const groupedByDate = formattedData.reduce((acc, data) => {
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

  // Calculate averages 
  const responseData = calculateAverages(finalData, user);

  return {
    status: "Success",
    sleepHistoryData: responseData.sleepHistoryData,
    calculatedRecords: finalData.map(record => formatDate(Number(record.syncDate))),
  };
}


// Function to calculate averages
function calculateAverages(data: any[], user) {
  // const sleepScores = data.map((d) => d.sleepScore);
  // const startTime = data.map((d) => d.startTime);
  // const endTime = data.map((d) => d.endTime);
  // const avgBreathRate = data.map((d) => d.avgBreathRate);
  // const avgHeartRate = data.map((d) => d.avgHeartRate);
  // const awakeTime = data.map((d) => d.awakeTime);
  // const leaveBedTime = data.map((d) => d.leaveBedTime);
  // const midSleep = data.map((d) => d.midSleep);
  // const deepSleep = data.map((d) => d.deepSleep);
  // const deepSleepAllTime = data.map((d) => d.deepSleepAllTime);
  // const trunOverTimes = data.map((d) => d.trunOverTimes);
  // const apena = data.map((d) => d.apena);
  // const recordCount = data.map((d) => d.recordCount);
  // const avgSleepTime = data.map((d) => d.recordCount);

  const sleepScores = data
    .filter(item => item.sleepScore !== null && item.sleepScore !== 0)
    .map(item => item.sleepScore);

  const startTime = data
    .filter(item => item.startTime !== null && item.startTime !== 0)
    .map(item => item.startTime);

  const endTime = data
    .filter(item => item.endTime !== null && item.endTime !== 0)
    .map(item => item.endTime);

  const avgBreathRate = data
    .filter(item => item.avgBreathRate !== null && item.avgBreathRate !== 0)
    .map(item => item.avgBreathRate);

  const avgHeartRate = data
    .filter(item => item.avgHeartRate !== null && item.avgHeartRate !== 0)
    .map(item => item.avgHeartRate);

  const awakeTime = data
    .filter(item => item.awakeTime !== null && item.awakeTime !== 0)
    .map(item => item.awakeTime);

  const leaveBedTime = data
    .filter(item => item.leaveBedTime !== null && item.leaveBedTime !== 0)
    .map(item => item.leaveBedTime);

  const midSleep = data
    .filter(item => item.midSleep !== null && item.midSleep !== 0)
    .map(item => item.midSleep);

  const deepSleep = data
    .filter(item => item.deepSleep !== null && item.deepSleep !== 0)
    .map(item => item.deepSleep);

  const deepSleepAllTime = data
    .filter(item => item.deepSleepAllTime !== null && item.deepSleepAllTime !== 0)
    .map(item => item.deepSleepAllTime);

  const trunOverTimes = data
    .filter(item => item.trunOverTimes !== null && item.trunOverTimes !== 0)
    .map(item => item.trunOverTimes);

  const apena = data
    .filter(item => item.apena !== null && item.apena !== 0)
    .map(item => item.apena);

  const recordCount = data
    .filter(item => item.recordCount !== null && item.recordCount !== 0)
    .map(item => item.recordCount);

  const avgSleepTime = data
    .filter(item => item.recordCount !== null && item.recordCount !== 0)
    .map(item => item.recordCount);


  // Create tags based on averages
  const sleepScoreTag = getSleepScoreTag(calculateAverage(sleepScores));
  const heartRateTag = getHeartRateTag(calculateAverage(avgHeartRate));
  const respirationRateTag = getRespirationRateTag(
    calculateAverage(avgBreathRate),
    user?.gender || "Male",
  );
  const emancipateOneSelfTag = getEmancipateOneSelfTag(
    calculateAverage(trunOverTimes),
  );
  const sleepDurationTag = getSleepDurationTag(
    calculateAverage(deepSleepAllTime),
  );
  const sleepEffectivenessTag = getSleepEffectivenessTag(
    calculateAverage(midSleep),
  );
  const sleepRegularityTag = getSleepRegularityTag(
    calculateAverage(recordCount),
  );
  const sleepInterruptionTag = getSleepInterruptionTag(
    calculateAverage(leaveBedTime),
  );
  const apenaTag = getApena(apena);

  return {
    status: "Success",
    sleepHistoryData: {
      sleepScore: calculateAverage(sleepScores),
      avgSleepTime: calculateAverage(avgSleepTime),
      startTime: calculateAverage(startTime),
      endTime: calculateAverage(endTime),
      avgBreathRate: calculateAverage(avgBreathRate),
      avgHeartRate: calculateAverage(avgHeartRate),
      awakeTime: calculateAverage(awakeTime),
      leaveBedTime: calculateAverage(leaveBedTime),
      midSleep: calculateAverage(midSleep),
      deepSleep: calculateAverage(deepSleep),
      apena: calculateAverage(apena),
      deepSleepAllTime: calculateAverage(deepSleepAllTime),
      trunOverTimes: calculateAverage(trunOverTimes),
      sleepScoreTag,
      heartRateTag,
      respirationRateTag,
      emancipateOneSelfTag,
      sleepDurationTag,
      sleepEffectivenessTag,
      sleepRegularityTag,
      sleepInterruptionTag,
      apenaTag,
    },
    calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))), // List of dates used for calculations
  };
}

// Function to calculate average
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

  // Format date in Asia/Kolkata timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}
