import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../utils/prisma";
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
} from "../../utils/common";

dayjs.extend(utc);
dayjs.extend(timezone);

const localTimeZone = "Asia/Kolkata";

interface QueryParams {
  device_mac: string;
  type: "day" | "week" | "month";
  reportType:
  | "sleepCycle"
  | "heartRate"
  | "respirationRate"
  | "sleepScore"
  | "sleepEffectiveness"
  | "sleepRegularity"
  | "sleepInterruption"
  | "apena";
  startDate: string;
  endDate?: string;
  userId: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { type, reportType, startDate, endDate, userId, reportId } =
      req.query as unknown as QueryParams;

    // Input validation
    if (!["day", "week", "month"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Invalid type. Must be day, week, or month" });
    }

    if (
      ![
        "sleepCycle",
        "heartRate",
        "respirationRate",
        "emancipateOneSelf",
        "sleepDuration",
        "sleepScore",
        "sleepEffectiveness",
        "sleepRegularity",
        "sleepInterruption",
        "apena"
      ].includes(reportType)
    ) {
      return res.status(400).json({
        message: "Invalid reportType. Must be one of the defined types",
      });
    }

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!startDate) {
      return res.status(400).json({ message: "Start date is required" });
    }

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

    // Find the user
    let user = await prisma.users.findFirst({
      where: { id: Number(userId) },
      select: { id: true, gender: true, mobile: true },
    });

    console.log(reportId, "============reportId")

    const whereConditions: any = {
      userId: Number(userId),
      startTime: {
        not: null,
    },
      syncDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      ...(type === 'day' && reportId && { id: Number(reportId) }),
    };

    // Include reportId if provided
    // if (type == 'day' && reportId) {
    //   whereConditions.id = Number(reportId);
    // }
    console.log("whereConditions", whereConditions)

    // Fetch related sleep history data based on syncDate
    const sleepHistoryData = await prisma.sleepHistory.findMany({
      where: whereConditions,
      orderBy: {
        syncDate: "asc",
      },
    });

    // console.log(sleepHistoryData)

    if (!sleepHistoryData.length) {
      return res
        .status(404)
        .json({ message: "No sleep history data found for this user" });
    }

    const formattedData = sleepHistoryData.map(convertBigIntToNumber);
    let responseData = {};

    // Handle 'day' type request
    if (type === "day") {
      const dayData = formattedData[0];

      if (!dayData) {
        return res
          .status(404)
          .json({ message: "No sleep data found for the specified day" });
      }

      responseData = handleDayReport(dayData, reportType, user);
    } else if (type === "week" || type === "month") {
      responseData = handleWeekOrMonthReport(formattedData, reportType, user, type, startDate, endDate);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching sleep history data:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Function to handle 'day' type report generation
function handleDayReport(dayData: any, reportType: string, user) {
  // console.log(dayData)
  switch (reportType) {
    case "sleepCycle":
      let sleepCurveArray = Array.isArray(dayData.sleepCurveArray)
        ? dayData.sleepCurveArray
        : JSON.parse(dayData.sleepCurveArray);

      const sleepDataArray = processSleepData(dayData.startTime, dayData.endTime, sleepCurveArray);

      return {
        status: "Success",
        sleepCycle: {
          startTime: dayData.startTime,
          endTime: dayData.endTime,
          actualSleepTime:
            dayData.hour === null && dayData.minute === null
              ? null
              : `${dayData.hour} hours, ${dayData.minute} minutes`,
          hour: dayData.hour,
          minute: dayData.minute,
          leaveBedTime: dayData.leaveBedTime,
          awakeSleep: dayData.awakeSleep,
          midSleep: dayData.midSleep,
          deepSleep: dayData.deepSleep,
          lightSleep: dayData.lightSleep,
          // recordCount:dayData.recordCount,
          dataArray: sleepDataArray
        },
        calculatedRecords: [formatDate(Number(dayData.syncDate))],
      };


    case "heartRate":

      let heartRate = Array.isArray(dayData.heartRate)
        ? dayData.heartRate
        : JSON.parse(dayData.heartRate);


      const heartRateArray = processSleepData(dayData.startTime, dayData.endTime, heartRate);


      return {
        status: "Success",
        heartRateTag: getHeartRateTag(dayData.avgHeartRate || 0),
        avgHeartRate: dayData.avgHeartRate,
        dataArray: heartRateArray,
        calculatedRecords: [formatDate(Number(dayData.syncDate))],
      };

    case "respirationRate":

      let breathRate = Array.isArray(dayData.breathRate)
        ? dayData.breathRate
        : JSON.parse(dayData.breathRate);


      const breathRateArray = processSleepData(dayData.startTime, dayData.endTime, breathRate);


      return {
        status: "Success",
        avgBreathRate: dayData.avgBreathRate,
        respirationRateTag: getRespirationRateTag(
          dayData.avgBreathRate || 0,
          user?.gender || "Male",
        ),
        dataArray: breathRateArray,
        calculatedRecords: [formatDate(Number(dayData.syncDate))],
      };

    case "emancipateOneSelf":

      let turnOverStatusAry = Array.isArray(dayData.turnOverStatusAry)
        ? dayData.turnOverStatusAry
        : JSON.parse(dayData.turnOverStatusAry);

      const turnOverStatusArray = processSleepData(dayData.startTime, dayData.endTime, turnOverStatusAry);

      return {
        status: "Success",
        emancipateOneSelfTag: getEmancipateOneSelfTag(
          dayData.trunOverTimes || 0,
        ),
        trunOverTimes: dayData.trunOverTimes || 0,
        dataArray: turnOverStatusArray,
        calculatedRecords: [formatDate(Number(dayData.syncDate))],
      };

    default:
      throw new Error("Invalid reportType for day data");
  }
}

// function groupAndFilterByDate(data: any[], dateKey: string) {
//   return data.reduce((acc, curr) => {
//     const date = formatDate(Number(curr[dateKey]));
//     if (!acc[date] || curr.recordCount > acc[date].recordCount) {
//       acc[date] = curr; // Store record with the highest recordCount for the day
//     }
//     return acc;
//   }, {});
// }


// Function to handle 'week' or 'month' type report generation
function handleWeekOrMonthReport(formattedData: any[], reportType: string, user: object, type: string, startDate: string, endDate: string) {

  // const data = Object.values(groupAndFilterByDate(formattedData, 'syncDate'));
  const groupedByDate = formattedData.reduce((acc, data) => {
    // const dateKey = dayjs.unix(data.syncDate).format("YYYY-MM-DD");
    const dateKey = dayjs.unix(data.syncDate).tz(localTimeZone).format("YYYY-MM-DD");
    // console.log("dateKey============", dateKey)
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(data);
    return acc;
  }, {});

  // Filter to get highest recordCount for each date
  const data = Object.entries(groupedByDate).map(([date, records]) => {
    const highestRecord = records.reduce((max, record) =>
      (record.recordCount > max.recordCount ? record : max), records[0]);

    return highestRecord; // return the record with the highest count
  });


  switch (reportType) {
    case "sleepDuration":
      // const breathRate = data.map((data) => data.avgBreathRate);
      // const deepSleepAllTime = data.map((data) => data.deepSleepAllTime);
      const breathRate = data.filter((item) => item.avgBreathRate !== null && item.avgBreathRate !== 0).map((item) => item.avgBreathRate);
      const deepSleepAllTime = data.filter((item) => item.deepSleepAllTime !== null && item.deepSleepAllTime !== 0).map((item) => item.deepSleepAllTime);

      const sleepDurationSyncedData = data.map((d) => ({
        yAxisData: d.deepSleepAllTime || 0,
        xAxisData: d.syncDate
      }));
      const sleepDurationDataArray = getDataArray(startDate, endDate, type, sleepDurationSyncedData);
      const sleepDurationCalculatedRecords = sleepDurationDataArray.map((d) => formatDate(d.xAxisData));

      return {
        status: "Success",
        sleepDurationTag: getSleepDurationTag(
          calculateAverage(deepSleepAllTime || 0),
        ),
        avgBreathRate: calculateAverage(breathRate),
        deepSleepAllTime: calculateAverage(deepSleepAllTime),
        dataArray: sleepDurationDataArray,
        // dataArray: data.map((d) => ({
        //   yAxisData: d.deepSleepAllTime || 0,
        //   xAxisData: d.syncDate,
        // })),
        calculatedRecords: sleepDurationCalculatedRecords,
      };
    case "sleepScore":
      // const sleepScores = data.map((d) => d.sleepScore);

      const sleepScores = data.filter((item) => item.sleepScore !== null && item.sleepScore !== 0).map((item) => item.sleepScore);
      // console.log("sleepScores", sleepScores)
      const sleepScoreSyncedData = data.map((d) => ({
        yAxisData: d.sleepScore || 0,
        xAxisData: d.syncDate
      }));
      const sleepScoreDataArray = getDataArray(startDate, endDate,type, sleepScoreSyncedData);
      const sleepScoreCalculatedRecords = sleepScoreDataArray.map((d) => formatDate(d.xAxisData));

      return {
        status: "Success",
        sleepScoreTag: getSleepScoreTag(calculateAverage(sleepScores || 0)),
        avgSleepScore: calculateAverage(sleepScores),
        dataArray: sleepScoreDataArray,
        // dataArray: data.map((d) => ({
        //   yAxisData: d.sleepScore || 0,
        //   xAxisData: d.syncDate,
        // })),
        calculatedRecords: sleepScoreCalculatedRecords,
      };

    case "sleepEffectiveness":
      // const midSleep = data.map((d) => d.midSleep);
      // const deepSleep = data.map((d) => d.deepSleep);

      const midSleep = data.filter((item) => item.midSleep !== null && item.midSleep !== 0).map((item) => item.midSleep);
      const deepSleep = data.filter((item) => item.deepSleep !== null && item.deepSleep !== 0).map((item) => item.deepSleep);

      // console.log(midSleep, deepSleep)

      // console.log("sleepScores", sleepScores)
      const sleepEffectivenessSyncedData = data.map((d) => ({
        xAxisData: d.syncDate,
        midSleep: d.midSleep || 0,
        deepSleep: d.deepSleep || 0,
      }));
      const sleepEffectivenessDataArray = getDataArray(startDate, endDate,type, sleepEffectivenessSyncedData);
      const sleepEffectivenessCalculatedRecords = sleepEffectivenessDataArray.map((d) => formatDate(d.xAxisData));


      return {
        status: "Success",
        sleepEffectivenessTag: getSleepEffectivenessTag(
          calculateAverage(midSleep || 0),
        ),
        avgMidSleep: calculateAverage(midSleep),
        avgDeepSleep: calculateAverage(deepSleep),
        dataArray: sleepEffectivenessDataArray,
        // dataArray: data.map((d) => ({
        //   xAxisData: d.syncDate,
        //   midSleep: d.midSleep || 0,
        //   deepSleep: d.deepSleep || 0,
        // })),
        calculatedRecords: sleepEffectivenessCalculatedRecords,
      };
    case "sleepRegularity":
      const avgStartTime = data.filter((item) => item.startTime !== null && item.startTime !== 0).map((item) => item.startTime);
      const avgEndTime = data.filter((item) => item.endTime !== null && item.endTime !== 0).map((item) => item.endTime);
      const recordCount = data.filter((item) => item.recordCount !== null && item.recordCount !== 0).map((item) => item.recordCount);

      // console.log(avgEndTime, avgEndTime, recordCount,data)

      // console.log("sleepScores", sleepScores)
      const sleepRegularitySyncedData = data.map((d) => ({
        startTime: d.startTime || 0,
        endTime: d.endTime || 0,
        xAxisData: d.syncDate,
      }));

      // console.log(sleepRegularitySyncedData)
      const sleepRegularityDataArray = getDataArrayForLineGraph(startDate, endDate,type, sleepRegularitySyncedData);
      const sleepRegularityCalculatedRecords = sleepRegularityDataArray.map((d) => formatDate(d.xAxisData));


      return {
        status: "Success",
        sleepRegularityTag: getSleepRegularityTag(
          calculateAverage(recordCount || 0),
        ),
        avgStartTime: calculateAverage(avgStartTime),
        avgEndTime: calculateAverage(avgEndTime),
        dataArray: sleepRegularityDataArray,
        // dataArray: data.map((li) => ({
        //   startTime: li.startTime || 0,
        //   endTime: li.endTime || 0,
        //   xAxisData: li.syncDate,
        // })),
        calculatedRecords: sleepRegularityCalculatedRecords,
      };

    case "heartRate":
      const avgHeartRate = data.filter((item) => item.avgHeartRate !== null && item.avgHeartRate !== 0).map((item) => item.avgHeartRate);
      // console.log("avgHeartRate======", avgHeartRate)

      // Generate dataArray with synced data
      const syncedData = data.map((d) => ({
        yAxisData: d.avgHeartRate || 0,
        xAxisData: d.syncDate
      }));
      const dataArray = getDataArray(startDate, endDate,type, syncedData);
      const calculatedRecords = dataArray.map((d) => formatDate(d.xAxisData));

      return {
        status: "Success",
        heartRateTag: getHeartRateTag(calculateAverage(avgHeartRate || 0)),
        avgHeartRate: calculateAverage(avgHeartRate),
        dataArray: dataArray,
        // dataArray: data.map((d) => ({
        //   yAxisData: d.avgHeartRate || 0,
        //   xAxisData: d.syncDate,
        // })),
        calculatedRecords: calculatedRecords,
      };
    case "sleepInterruption":
      // const awakeTime = data.map((data) => data.awakeTime);
      // const leaveBedTime = data.map((data) => data.leaveBedTime);

      const awakeTime = data.filter((item) => item.awakeTime !== null && item.awakeTime !== 0).map((item) => item.awakeTime);
      const leaveBedTime = data.filter((item) => item.leaveBedTime !== null && item.leaveBedTime !== 0).map((item) => item.leaveBedTime);

      // Generate dataArray with synced data
      const sleepInterruptionSyncedData = data.map((d) => ({
        awakeTime: d.awakeTime || 0,
        leaveBedTime: d.leaveBedTime || 0,
        xAxisData: d.syncDate
      }));
      const sleepInterruptionDataArray = getDataArrayForLineGraph(startDate, endDate,type, sleepInterruptionSyncedData);
      const sleepInterruptionCalculatedRecords = sleepInterruptionDataArray.map((d) => formatDate(d.xAxisData));

      return {
        status: "Success",
        sleepInterruptionTag: getSleepInterruptionTag(
          calculateAverage(leaveBedTime),
        ),
        awakeTime: calculateAverage(awakeTime),
        leaveBedTime: calculateAverage(leaveBedTime),
        dataArray: sleepInterruptionDataArray,
        // dataArray: data.map((li) => ({
        //   awakeTime: li.awakeTime || 0,
        //   leaveBedTime: li.leaveBedTime || 0,
        //   xAxisData: li.syncDate,
        // })),
        calculatedRecords: sleepInterruptionCalculatedRecords,
      };
    case "respirationRate":
      // const avgBreathRate = data.map((data) => data.avgBreathRate);

      const avgBreathRate = data.filter((item) => item.avgBreathRate !== null && item.avgBreathRate !== 0).map((item) => item.avgBreathRate);

      // Generate dataArray with synced data
      const respirationRateSyncedData = data.map((d) => ({
        yAxisData: d.avgBreathRate || 0,
        xAxisData: d.syncDate
      }));
      const respirationRatedataArray = getDataArray(startDate, endDate,type, respirationRateSyncedData);
      const respirationRateCalculatedRecords = respirationRatedataArray.map((d) => formatDate(d.xAxisData));
      return {
        status: "Success",
        respirationRateTag: getRespirationRateTag(
          calculateAverage(avgBreathRate || 0),
          user.gender || "Male",
        ),
        avgBreathRate: calculateAverage(avgBreathRate),
        dataArray: respirationRatedataArray,
        // dataArray: data.map((li) => ({
        //   yAxisData: li.avgBreathRate || 0,
        //   xAxisData: li.syncDate,
        // })),
        calculatedRecords: respirationRateCalculatedRecords,
      };
    default:
      throw new Error("Invalid reportType for week/month data");
  }
}

// Utility functions
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  // Format date in Asia/Kolkata timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

function convertBigIntToNumber(data: any): any {
  const convertedData = { ...data };
  Object.keys(convertedData).forEach((key) => {
    if (typeof convertedData[key] === "bigint") {
      convertedData[key] = Number(convertedData[key]);
    }
  });
  return convertedData;
}

//calculate average
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const total = numbers.reduce((acc, num) => acc + num, 0);
  return total / numbers.length;
}


// Convert timestamp to human-readable time format in IST (HH:MM)
function formatTime(timestamp: number) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options = {
    timeZone: 'Asia/Kolkata', // Set timezone to IST
    hour12: false,            // Use 24-hour format
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString('en-GB', options);
}

// Group sleep cycle data into 1-hour intervals and calculate the average
function getSleepCycleAverages(sleepCycle: string | any[], totalMinutes: number) {
  const averages = [];
  const interval = 60; // 1-hour intervals, sleepCycle has minute data

  // Calculate averages based on the total minutes
  let minutesProcessed = 0;
  while (minutesProcessed < totalMinutes) {
    const nextInterval = Math.min(interval, totalMinutes - minutesProcessed); // Handle last interval being less than 60 minutes
    const startIndex = minutesProcessed;
    const endIndex = startIndex + nextInterval;
    const intervalData = sleepCycle.slice(startIndex, endIndex);

    if (intervalData.length > 0) {
      const average = intervalData.reduce((sum: any, value: any) => sum + value, 0) / intervalData.length;
      averages.push(average);
    }
    minutesProcessed += nextInterval;
  }

  return averages;
}

// Main function to create data points for graph
function processSleepData(startTime: number, endTime: number, sleepCycle: string | any[]) {
  const start = new Date(startTime * 1000); // Start time in milliseconds
  const end = new Date(endTime * 1000);     // End time in milliseconds
  const totalMinutes = Math.floor((end - start) / 60000); // Total sleep time in minutes

  const yAxisData = getSleepCycleAverages(sleepCycle, totalMinutes);
  const xAxisData = [];

  // Generate time labels based on the total minutes
  for (let i = 0; i < totalMinutes; i += 60) {
    const currentHour = new Date(start.getTime() + i * 60000); // Generate label per 60 minutes
    xAxisData.push(formatTime(currentHour / 1000)); // Convert back to seconds for formatting
  }

  // Return data in the required format
  const dataArray = xAxisData.map((x, index) => ({
    xAxisData: x,
    yAxisData: yAxisData[index] || 0,
  }));

  return dataArray;
}



// Dynamic getDataArray function to include missing dates
function getDataArray(startDate: string, endDate: string, type:string, syncedData: any[]) {
  if (!syncedData.length) return [];
  // if (type == "month") return syncedData;
  const syncedDates = syncedData.map(item => formatDate(item.xAxisData));
  const dataArray = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let currentDate = start;

  const defaultValues = {
    yAxisData: syncedData[0]?.yAxisData !== undefined ? 0 : undefined,
    midSleep: syncedData[0]?.midSleep !== undefined ? 0 : undefined,
    deepSleep: syncedData[0]?.deepSleep !== undefined ? 0 : undefined,
    startTime: syncedData[0]?.startTime !== undefined ? 0 : undefined,
    endTime: syncedData[0]?.endTime !== undefined ? 0 : undefined,
    awakeTime: syncedData[0]?.awakeTime !== undefined ? 0 : undefined,
    leaveBedTime: syncedData[0]?.leaveBedTime !== undefined ? 0 : undefined,
  };
  
  // Loop through each date from start to end
  while (currentDate <= end) {
    const currentUnixTimestamp = Math.floor(currentDate.getTime() / 1000);
    const dateString = formatDate(currentUnixTimestamp);

    if (!syncedDates.includes(dateString)) {
      // console.log("syncedDates,dateString",syncedData)
      // If the date is not synced
      dataArray.push({
        ...defaultValues,
        xAxisData: currentUnixTimestamp,
      });
    } else {
      // If the date is synced, retain the original data
      const syncedItem = syncedData.find(item => formatDate(item.xAxisData) === dateString);
      if (syncedItem) {
        dataArray.push({
          // yAxisData: syncedItem.yAxisData,
          xAxisData: syncedItem.xAxisData,
          ...(syncedItem.yAxisData !== undefined && { yAxisData: syncedItem.yAxisData }),
          ...(syncedItem.midSleep !== undefined && { midSleep: syncedItem.midSleep }),
          ...(syncedItem.deepSleep !== undefined && { deepSleep: syncedItem.deepSleep }),
          ...(syncedItem.startTime !== undefined && { startTime: syncedItem.startTime }),
          ...(syncedItem.endTime !== undefined && { endTime: syncedItem.endTime }),
          ...(syncedItem.awakeTime !== undefined && { awakeTime: syncedItem.awakeTime }),
          ...(syncedItem.leaveBedTime !== undefined && { leaveBedTime: syncedItem.leaveBedTime })
        });
      }
    }
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dataArray;
}

// Dynamic getDataArray function to include missing dates
function getDataArrayForLineGraph(startDate: string, endDate: string, type:string, syncedData: any[]) {
  if (!syncedData.length) return [];
  // if (type == "month") return syncedData;
  const syncedDates = syncedData.map(item => formatDate(item.xAxisData));
  const dataArray = [];
  const start = new Date(startDate);
  const end = new Date();
  let currentDate = start;

  // Loop through each date from start to end
  while (currentDate <= end) {
    const currentUnixTimestamp = Math.floor(currentDate.getTime() / 1000);
    const dateString = formatDate(currentUnixTimestamp);

      // If the date is synced, retain the original data
      const syncedItem = syncedData.find(item => formatDate(item.xAxisData) === dateString);
      if (syncedItem) {
        dataArray.push({
          // yAxisData: syncedItem.yAxisData,
          xAxisData: syncedItem.xAxisData,
          ...(syncedItem.yAxisData !== undefined && { yAxisData: syncedItem.yAxisData }),
          ...(syncedItem.midSleep !== undefined && { midSleep: syncedItem.midSleep }),
          ...(syncedItem.deepSleep !== undefined && { deepSleep: syncedItem.deepSleep }),
          ...(syncedItem.startTime !== undefined && { startTime: syncedItem.startTime }),
          ...(syncedItem.endTime !== undefined && { endTime: syncedItem.endTime }),
          ...(syncedItem.awakeTime !== undefined && { awakeTime: syncedItem.awakeTime }),
          ...(syncedItem.leaveBedTime !== undefined && { leaveBedTime: syncedItem.leaveBedTime })
        });
      }
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dataArray;
}