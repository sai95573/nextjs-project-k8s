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

    // // Ensure the dates are parsed in UTC to avoid timezone issues
    // const startOfDay = dayjs.utc(startDate, "YYYY-MM-DD").startOf("day").unix();
    // const endOfDay = dayjs.utc(endDate, "YYYY-MM-DD").endOf("day").unix();

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
      syncDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // Include reportId if provided
    if (type == 'day' && reportId) {
      whereConditions.id = Number(reportId);
    }
    console.log("whereConditions", whereConditions)

    // Fetch related sleep history data based on syncDate
    const sleepHistoryData = await prisma.sleepHistory.findMany({
      where: whereConditions,
      orderBy: {
        syncDate: "asc",
      },
    });

    console.log(sleepHistoryData)

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
      responseData = handleWeekOrMonthReport(formattedData, reportType, user);
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
    // case "sleepCycle":
    //   const sleepStartTime = dayData.startTime;
    //   const sleepEndTime = dayData.endTime;
    //   const recordCount = dayData.recordCount;

    //   // Calculate time increment for xAxisData
    //   const timeIncrement = (sleepEndTime - sleepStartTime) / (recordCount - 1);

    //   const xAxisData = [];
    //   for (let i = 0; i < recordCount; i++) {
    //     xAxisData.push(sleepStartTime + i * timeIncrement);
    //   }

    //   let sleepCurveArray = Array.isArray(dayData.sleepCurveArray)
    //     ? dayData.sleepCurveArray
    //     : JSON.parse(dayData.sleepCurveArray);

    //   const groupedData1HourSleepCycle = groupDataByInterval(
    //     xAxisData,
    //     sleepCurveArray,
    //     "hour",
    //     1,
    //   );
    //   return {
    //     status: "Success",
    //     sleepCycle: {
    //       startTime: dayData.startTime,
    //       endTime: dayData.endTime,
    //       actualSleepTime:
    //         dayData.hour === null && dayData.minute === null
    //           ? null
    //           : `${dayData.hour} hours, ${dayData.minute} minutes`,
    //       hour: dayData.hour,
    //       minute: dayData.minute,
    //       leaveBedTime: dayData.leaveBedTime,
    //       awakeSleep: dayData.awakeSleep,
    //       midSleep: dayData.midSleep,
    //       deepSleep: dayData.deepSleep,
    //       lightSleep: dayData.lightSleep,
    //       // recordCount:dayData.recordCount,
    //       dataArray:
    //         groupedData1HourSleepCycle.length === 0
    //           ? null
    //           : groupedData1HourSleepCycle.map((li) => ({
    //             yAxisData: li.y || 0,
    //             xAxisData: li.x,
    //           })),
    //     },
    //     calculatedRecords: [formatDate(Number(dayData.syncDate))],
    //   };

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
function handleWeekOrMonthReport(formattedData: any[], reportType: string, user) {

  // const data = Object.values(groupAndFilterByDate(formattedData, 'syncDate'));
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
  const data = Object.entries(groupedByDate).map(([date, records]) => {
    const highestRecord = records.reduce((max, record) =>
      (record.recordCount > max.recordCount ? record : max), records[0]);

    return highestRecord; // return the record with the highest count
  });


  switch (reportType) {
    case "sleepDuration":
      const breathRate = data.map((data) => data.avgBreathRate);
      const deepSleepAllTime = data.map((data) => data.deepSleepAllTime);
console.log("breathRate================>", breathRate)
      return {
        status: "Success",
        sleepDurationTag: getSleepDurationTag(
          calculateAverage(deepSleepAllTime || 0),
        ),
        avgBreathRate: calculateAverage(breathRate),
        deepSleepAllTime: calculateAverage(deepSleepAllTime),
        dataArray: data.map((d) => ({
          yAxisData: d.deepSleepAllTime || 0,
          xAxisData: d.syncDate,
        })),
        calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))),
      };
    case "sleepScore":
      const sleepScores = data.map((d) => d.sleepScore);
console.log("sleepScores", sleepScores)

      return {
        status: "Success",
        sleepScoreTag: getSleepScoreTag(calculateAverage(sleepScores || 0)),
        avgSleepScore: calculateAverage(sleepScores),
        dataArray: data.map((d) => ({
          yAxisData: d.sleepScore || 0,
          xAxisData: d.syncDate,
        })),
        calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))),
      };

    case "sleepEffectiveness":
      const midSleep = data.map((d) => d.midSleep);
      const deepSleep = data.map((d) => d.deepSleep);
 console.log(midSleep,deepSleep)

      return {
        status: "Success",
        sleepEffectivenessTag: getSleepEffectivenessTag(
          calculateAverage(midSleep || 0),
        ),
        avgMidSleep: calculateAverage(midSleep),
        avgDeepSleep: calculateAverage(deepSleep),
        dataArray: data.map((d) => ({
          xAxisData: d.syncDate,
          midSleep: d.midSleep || 0,
          deepSleep: d.deepSleep || 0,
        })),
        calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))),
      };
    case "sleepRegularity":
      const avgStartTime = data.map((d) => d.startTime);
      const avgEndTime = data.map((d) => d.endTime);
      const recordCount = data.map((d) => d.recordCount);
 console.log(avgEndTime,avgEndTime,recordCount)

      return {
        status: "Success",
        sleepRegularityTag: getSleepRegularityTag(
          calculateAverage(recordCount || 0),
        ),
        avgStartTime: calculateAverage(avgStartTime),
        avgEndTime: calculateAverage(avgEndTime),
        dataArray: data.map((li) => ({
          startTime: li.startTime || 0,
          endTime: li.endTime || 0,
          xAxisData: li.syncDate,
        })),
        calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))), // List of dates used for calculations
      };

    case "heartRate":
      const avgHeartRate = data.map((d) => d.avgHeartRate);
//  console.log(avgEndTime,avgEndTime)

      return {
        status: "Success",
        heartRateTag: getHeartRateTag(calculateAverage(avgHeartRate || 0)),
        avgHeartRate: calculateAverage(avgHeartRate),
        dataArray: data.map((d) => ({
          yAxisData: d.avgHeartRate || 0,
          xAxisData: d.syncDate,
        })),
        calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))),
      };
    case "sleepInterruption":
      const awakeTime = data.map((data) => data.awakeTime);
      const leaveBedTime = data.map((data) => data.leaveBedTime);

      return {
        status: "Success",
        sleepInterruptionTag: getSleepInterruptionTag(
          calculateAverage(leaveBedTime),
        ),
        awakeTime: calculateAverage(awakeTime),
        leaveBedTime: calculateAverage(leaveBedTime),
        dataArray: data.map((li) => ({
          awakeTime: li.awakeTime || 0,
          leaveBedTime: li.leaveBedTime || 0,
          xAxisData: li.syncDate,
        })),
        calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))),
      };
    case "respirationRate":
      const avgBreathRate = data.map((data) => data.avgBreathRate);
      return {
        status: "Success",
        respirationRateTag: getRespirationRateTag(
          calculateAverage(avgBreathRate || 0),
          user.gender || "Male",
        ),
        avgBreathRate: calculateAverage(avgBreathRate),
        dataArray: data.map((li) => ({
          yAxisData: li.avgBreathRate || 0,
          xAxisData: li.syncDate,
        })),
        calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))),
      };
    case "apena":
      //   const awakeTime = data.map((data) => data.awakeTime);
      // const leaveBedTime = data.map((data) => data.leaveBedTime);

      return {
        status: "Success",
        apena: 2,
        apenaTag: getApena(16),
        // getSleepInterruptionTag(
        //   calculateAverage(leaveBedTime),
        // ),
        // awakeTime: calculateAverage(awakeTime),
        // apena: calculateAverage(leaveBedTime),

        dataArray: data.map((li) => ({
          healthy: 0,
          mid: 0,
          moderate: 0,
          severe: 0,
          xAxisData: li.syncDate,
        })),
        calculatedRecords: data.map((d) => formatDate(Number(d.syncDate))),
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

// Helper function to group data by a dynamic time unit and interval
function groupDataByInterval(xData, yData, unit, interval) {
  const groupedData = {};

  xData.forEach((timestamp, index) => {
    // Calculate the start of the interval dynamically
    const roundedTime = dayjs
      .unix(timestamp)
      .startOf(unit)
      .add(
        Math.floor(dayjs.unix(timestamp)[unit]() / interval) * interval,
        unit,
      )
      .unix();

    // Initialize the group if not already present
    if (!groupedData[roundedTime]) {
      groupedData[roundedTime] = { sum: 0, count: 0 };
    }

    // Sum the y-axis values for the same interval
    groupedData[roundedTime].sum += yData[index];
    groupedData[roundedTime].count += 1;
  });

  // Prepare the final averaged data with formatted time
  const result = Object.keys(groupedData).map((intervalStart) => {
    const avg =
      groupedData[intervalStart].sum / groupedData[intervalStart].count;
    return { x: dayjs.unix(intervalStart).format("HH:mm"), y: avg }; // Format time as HH:mm
  });

  return result;
}

// Example: Group data by every 5 minutes
//   const groupedData5Min = groupDataByInterval(dataArray.xAxisData, dataArray.yAxisData, 'minute', 5);

// Example: Group data by every 1 hour (you can adjust to any interval)
//   const groupedData1Hour = groupDataByInterval(dataArray.xAxisData, dataArray.yAxisData, 'hour', 1);


// Convert timestamp to human-readable time format (HH:MM)
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options = {
    timeZone: 'GMT', // Force the time zone to GMT
    hour12: false,   // 24-hour format
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString('en-GB', options);
}

// Group sleep cycle data into 1-hour intervals and calculate the average
function getSleepCycleAverages(sleepCycle, totalMinutes) {
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
      const average = intervalData.reduce((sum, value) => sum + value, 0) / intervalData.length;
      averages.push(average);
    }
    minutesProcessed += nextInterval;
  }

  return averages;
}

// Main function to create data points for graph
function processSleepData(startTime, endTime, sleepCycle) {
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

// Example data
// const startTime = 1728807073; // Sample timestamp for start
// const endTime = 1728865033;   // Sample timestamp for end (21 minutes apart)

// // Sample sleep cycle array for 21 minutes (replace with actual data)
// const sleepCycle = [0.0, -0.02390194, -0.048755884, -0.0092663765, -0.030327082, -0.022876978, -0.009778738, -0.015239954, -0.015892982, -0.03026104, 0.0, 0.0, 0.03576517, 0.09363437, 0.09363437, 0.03576517, 0.0, 0.0, 0.36181927, 0.5430949, 0.70593953, 0.85171556, 0.9822941, 1.0985891, 1.2003114, 1.2858124, 1.3535151, 1.4023924, 1.4332101, 1.4443824, 1.4076806, 1.2885292, 1.1288947, 0.9224186, 0.6654229, 0.36056066, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.027283192, 0.088588476, 0.13775134, 0.13775134, 0.13775134, 0.06887579, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.027283192, 0.088588476, 0.13775134, 0.13775134, 0.088588476, 0.02728343, 0.09038162, 0.0, 0.027283192, 0.088588476, 0.13775134, 0.13775134, 0.088588476, 0.02728343, 0.0, 0.0, 0.0, 0.0, 0.0, 0.03576517, 0.09363437, 0.09363437, 0.09363437, 0.0, 0.0, 0.0, 0.0, 0.011883736, 0.045930147, 0.097540855, 0.1597457, 0.2241435, 0.28203702, 0.32560754, 0.3489704, 0.3489704, 0.3489704, 0.33169103, 0.2832749, 0.21331191, 0.1356585, 0.065695524, 0.017279387, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.010269165, 0.022430182, 0.035672188, 0.048914194, 0.062696695, 0.07810044, 0.09566641, 0.11620498, 0.14133763, 0.17187524, 0.20754719, 0.24727297, 0.2913227, 0.33915567, 0.389421, 0.4407673, 0.49427557, 0.5502162, 0.60885906, 0.6683128, 0.727226, 0.78505826, 0.84099865, 0.89396644, 0.94315076, 0.9885516, 1.0312502, 1.0725977, 1.1134045, 1.1534005, 1.1917751, 1.2274473, 1.2609575, 1.2923056, 1.3214918, 1.3482461, 1.372568, 1.3952686, 1.4166178, 1.4366158, 1.455803, 1.4741797, 1.4914753, 1.5076901, 1.5239047, 1.5412003, 1.5603876, 1.5817368, 1.6057886, 1.633083, 1.664161, 1.6992927, 1.7376673, 1.7787445, 1.8230644, 1.8700868, 1.9198116, 1.9714282, 2.0230446, 2.0741208, 2.125197, 2.1757326, 2.2246466, 2.2708583, 2.3140974, 2.3538232, 2.389225, 2.420303, 2.4470572, 2.468947, 2.4859724, 2.497863, 2.5046191, 2.5073216, 2.506831, 2.504378, 2.5002081, 2.494812, 2.488557, 2.481689, 2.4744532, 2.4672172, 2.4598587, 2.4527454, 2.446, 2.4393773, 2.4331224, 2.427481, 2.4228203, 2.419509, 2.4175467, 2.4168108, 2.417424, 2.419509, 2.4230657, 2.4282167, 2.434962, 2.4434245, 2.4531133, 2.4639058, 2.4760475, 2.4894156, 2.5037649, 2.5189726, 2.5345485, 2.550492, 2.566681, 2.58287, 2.5988135, 2.6142666, 2.6291065, 2.6432104, 2.6565785, 2.669456, 2.6815977, 2.6931262, 2.7040415, 2.714221, 2.7234192, 2.7316363, 2.7385721, 2.744349, 2.74909, 2.7527947, 2.7555861, 2.7568634, 2.7546802, 2.7438493, 2.721238, 2.6859198, 2.636009, 2.5715048, 2.492728, 2.3995347, 2.2922447, 2.1716413, 2.037725, 1.8904951, 1.7283857, 1.5513964, 1.3603107, 1.1566949, 0.9413321, 0.71735454, 0.48554564, 0.24668837, 0.0, 0.0, 0.0, 2.3841858E-7, 0.012608051, 0.04851246, 0.10224724, 0.16563153, 0.22901607, 0.2827506, 0.318655, 0.33126307, 0.31865525, 0.28275084, 0.22901607, 0.16563153, 0.10224724, 0.04851246, 0.012608051, 0.13954806, 0.0, 0.008130789, 0.032011747, 0.070142746, 0.12012768, 0.17882586, 0.24254894, 0.30729342, 0.36899042, 0.423764, 0.46817207, 0.4994247, 0.51555777, 0.51555777, 0.4994247, 0.46817207, 0.42376423, 0.36899066, 0.30729342, 0.24254918, 0.17882586, 0.12012792, 0.070142746, 0.032011747, 0.008130789, 0.0, 0.0, 0.0, 0.84837484, 1.6967499, 1.6905966, 1.6764942, 1.6565623, 1.63292, 1.6079136, 1.5826797, 1.5574459, 1.5326667, 1.5090243, 1.4865185, 1.4658314, 1.446963, 1.4303678, 1.4162734, 1.4044522, 1.3953589, 1.3889936, 1.3846743, 1.3819466, 1.3799006, 1.3778546, 1.3762633, 1.374899, 1.3730804, 1.3703525, 1.3651237, 1.3580767, 1.3492107, 1.3392082, 1.3282962, 1.3160204, 1.3021532, 1.2869221, 1.2698722, 1.2510037, 1.2300893, 1.2062196, 1.1791672, 1.1493866, 1.1175604, 1.0848247, 1.050043, 1.0141246, 0.97684216, 0.93842316, 0.8993223, 0.85885763, 0.81657386, 0.77292633, 0.72814226, 0.68335795, 0.6385734, 0.59378934, 0.54877806, 0.5035391, 0.4585278, 0.4151075, 0.37123275, 0.32667565, 0.28098202, 0.23392463, 0.18663979, 0.1393547, 0.09229708, 0.045921087, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.031055927, 0.09316778, 0.12422371, 0.09316778, 0.031055927, 0.07529211, 0.0, 0.011237383, 0.04359436, 0.09316778, 0.15397859, 0.2186923, 0.2795031, 0.32907653, 0.3614335, 0.3726709, 0.3614335, 0.32907677, 0.2795031, 0.2186923, 0.15397882, 0.09316778, 0.04359436, 0.011237383, 0.0, 0.0, 0.0, 0.16967821, 0.33392715, 0.4886737, 0.6352763, 0.7750914, 0.90744066, 1.0296092, 1.1400356, 1.2367734, 1.3198225, 1.3897718, 1.4472103, 1.4934946, 1.527562, 1.5494126, 1.5606741, 1.5635625, 1.3981395, 0.8857789, 0.0, 0.0, 0.0, 0.0, 0.016642809, 0.062111855, 0.12422347, 0.18633533, 0.23180437, 0.24844718, 0.24844718, 0.22472262, 0.16261077, 0.08583641, 0.023724556, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.021796942, 0.076989174, 0.13975143, 0.18071651, 0.18071651, 0.13975143, 0.076989174, 0.021796942, 0.089791775, 0.09815693, 0.11361241, 0.13480854, 0.1612935, 0.19318223, 0.23047137, 0.2724681, 0.31871438, 0.3681922, 0.4196763, 0.47216296, 0.5249839, 0.5779164, 0.63073754, 0.6832242, 0.73504233, 0.7858577, 0.8365617, 0.8871541, 0.937412, 0.98700166, 1.0353653, 1.0820575, 1.1271894, 1.1705383, 1.2118814, 1.2508844, 1.2872128, 1.3205324, 1.350732, 1.3775883, 1.4014359, 1.4221631, 1.4406617, 1.4573771, 1.4727553, 1.4871306, 1.500726, 1.5132068, 1.5246849, 1.5352714, 1.544658, 1.5520899, 1.5571761, 1.559302, 1.5534507, 1.5313469, 1.4934773, 1.4314156, 1.3452873, 1.2352166, 1.1012045, 0.9475262, 0.77784467, 0.59411025, 0.40047455, 0.20133734, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.014352322, 0.05456662, 0.11267805, 0.17717695, 0.23528838, 0.27550268, 0.289855, 0.289855, 0.27043843, 0.21739125, 0.1449275, 0.07246375, 0.01941657, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.005364895, 0.021313906, 0.04741192, 0.08294678, 0.12694907, 0.17821908, 0.23535776, 0.2968068, 0.3608899, 0.4258592, 0.4899423, 0.55139136, 0.60853004, 0.65980005, 0.7038026, 0.7393372, 0.7654352, 0.7813842, 0.78674936, 0.79164505, 0.80619884, 0.8300135, 0.86243963, 0.90259266, 0.9493773, 1.0015173, 1.0575908, 1.1160678, 1.1753532, 1.2338303, 1.2899036, 1.3420436, 1.3888282, 1.4289812, 1.4614073, 1.4852222, 1.4997758, 0.0, 0.0, 0.0, 0.0, 0.006365061, 0.025215864, 0.055827856, 0.09702468, 0.147223, 0.204494, 0.2666366, 0.33126283, 0.39588904, 0.45803165, 0.51530266, 0.5655012, 0.60669804, 0.63731, 0.65616083, 0.6625259, 0.66984963, 0.6915395, 0.72676206, 0.7741637, 0.83192253, 0.8978193, 0.96932125, 1.043681, 1.1180408, 1.1895429, 1.2554395, 1.3131987, 1.3606002, 1.3958228, 1.4175127, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.048677683, 0.10358715, 0.16472793, 0.23164868, 0.30389762, 0.3807528, 0.46112967, 0.5443969, 0.63073444, 0.7196009, 0.81081533, 0.90347505, 0.99667645, 1.0894263, 1.1813632, 1.2722168, 1.361896, 1.4493176, 1.533849, 1.6149486, 1.6926165, 1.7668525, 1.8373857, 1.9034936, 1.9651763, 2.0224338, 2.075808, 2.1252987, 2.170906, 2.2126298, 2.2508316, 2.2860532, 2.3188362, 2.3491807, 2.3771775, 2.4028258, 2.4263067, 2.4479816, 2.468121, 2.4867253, 2.5037942, 2.5189664, 2.532784, 2.545518, 2.5575294, 2.5688183, 2.579204, 2.588687, 2.5978084, 2.6068394, 2.6159608, 2.6251726, 2.6344748, 2.6439576, 2.6538014, 2.6640067, 2.6743925, 2.6845977, 2.6946223, 2.704376, 2.7138586, 2.7228897, 2.7312887, 2.738875, 2.7447743, 2.7481136, 2.748636, 2.745695, 2.7393284, 2.7293677, 2.7150025, 2.6964, 2.673728, 2.6461756, 2.6138263, 2.5766802, 2.534905, 2.4878573, 2.4339147, 2.373888, 2.307778, 2.235584, 2.1573062, 2.0729446, 1.9824995, 1.8859705, 1.7841687, 1.6779057, 1.5679924, 1.45524, 1.3404597, 1.2232459, 1.106032, 0.9912517, 0.87890506, 0.7714255, 0.6700294, 0.5759342, 0.48995042, 0.41126704, 0.34069514, 0.27823544, 0.22348142, 0.17768097, 0.14002275, 0.11053729, 0.090051174, 0.07778382, 0.07376552, 0.07967973, 0.09390402, 0.11646938, 0.14739084, 0.18669868, 0.23520422, 0.2929077, 0.35983968, 0.4347527, 0.5147159, 0.5997298, 0.6881101, 0.7777531, 0.86781716, 0.95661855, 1.0433156, 1.1279085, 1.2087135, 1.2848892, 1.3560145, 1.4212477, 1.4814306, 1.5353007, 1.5828577, 1.6253645, 1.6605251, 1.6885997, 1.7101082, 1.7247598, 1.732233, 1.7313952, 1.7222465, 1.7056285, 1.6819621, 1.6511173, 1.6133541, 1.5678308, 1.5149683, 1.4553174, 1.389299, 1.3197906, 1.2473739, 1.1732123, 1.098469, 1.0245982, 0.95247245, 0.88151, 0.81200147, 0.744529, 0.6785109, 0.6148193, 0.5540359, 0.495579, 0.43944907, 0.38622713, 0.33562255, 0.28879905, 0.24633789, 0.20794821, 0.17379618, 0.14421344, 0.120238066, 0.10249281, 0.089482546, 0.081498146, 0.077792406, 0.076869965, 0.079312325, 0.085867405, 0.095496655, 0.10699582, 0.11920166, 0.13153219, 0.14294958, 0.15254045, 0.16030431, 0.1657846, 0.1698947, 0.17400503, 0.17811537, 0.18359542, 0.1904459, 0.19866633, 0.20825696, 0.22058773, 0.23748517, 0.2575798, 0.2808714, 0.30781627, 0.33887124, 0.37175322, 0.40828848, 0.44665074, 0.48546982, 0.5256586, 0.5672176, 0.61014676, 0.6553595, 0.7028556, 0.75217843, 0.80241466, 0.8558476, 0.91247773, 0.9723046, 1.035785, 1.1033756, 1.1714228, 1.2380999, 1.3029501, 1.3583893, 1.3972896, 1.4247074, 1.4397293, 1.4460413, 1.4431869, 1.4353088, 1.4132081, 1.3810275, 1.3387669, 1.2818271, 1.2111211, 1.1367615, 1.0564326, 0.971504, 0.88864684, 0.81407547, 0.7395041, 0.6690755, 0.6027899, 0.53857565, 0.46814704, 0.4039328, 0.34429216, 0.2892251, 0.24373579, 0.20825505, 0.1753583, 0.15005016, 0.13319135, 0.12478256, 0.12568521, 0.14133382, 0.1667242, 0.19771361, 0.23637366, 0.2872777, 0.34456015, 0.4065802, 0.4729073, 0.5426798, 0.6163287, 0.69299245, 0.7709482, 0.8484731, 0.9255674, 1.002231, 1.0763105, 1.1486672, 1.2193012, 1.2882124, 1.3541088, 1.4187131, 1.4803025, 1.5384463, 1.592714, 1.6413825, 1.6842998, 1.7223275, 1.7563267, 1.7862976, 1.8112266, 1.8320767, 1.8487462, 1.861286, 1.8696961, 1.8747364, 1.8762041, 1.8750621, 1.8721716, 1.8680141, 1.8634511, 1.858736, 1.8538688, 1.8441242, 1.8295022, 1.8102564, 1.7861837, 1.7573858, 1.723812, 1.6875765, 1.6484672, 1.6060069, 1.5594728, 1.5076568, 1.4487427, 1.3271122, 1.2057859, 1.0847638, 0.9687712, 0.8578079, 0.7517729, 0.64014363, 0.0, 0.0, -0.04593706, -0.04799199, -0.04758501, -0.030186892];

// const sleepDataArray = processSleepData(startTime, endTime, sleepCycle);
// console.log(sleepDataArray);
