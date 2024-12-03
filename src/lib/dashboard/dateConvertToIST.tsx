// utils/dateUtils.ts
export const convertToIST = (timestamp: any): string => {
  // Ensure timestamp is a valid number
  if (typeof timestamp !== "number" || timestamp <= 0) {
    return "Invalid timestamp";
  }

  const date = new Date(timestamp * 1000);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  try {
    const formatter = new Intl.DateTimeFormat("en-IN", options);
    return formatter.format(date);
  } catch (error) {
    return "Error formatting date";
  }
};

// utils/dateUtils.js (utility file)
// utils/dateUtils.js (utility file)
export const formatDateToCustomFormat = (dateString) => {
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata", // Convert to IST
  };

  const formatter = new Intl.DateTimeFormat("en-IN", options);
  const formattedDate = formatter.format(date);

  // Extract hours and minutes in IST
  const hours = String(date.getHours()).padStart(2, "0"); // Ensure two digits
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Ensure two digits

  // Split the formatted date to rearrange the components
  const [day, month, year] = formattedDate.split(" ");

  return `${parseInt(day)} ${month} ${year} (${hours}:${minutes})`; // Remove leading zero from day and format time
};

export const convertTimestampToCustomFormat = (timestamp) => {
  // Ensure the timestamp is a valid number
  if (typeof timestamp !== "number" || timestamp <= 0) {
    return "Invalid timestamp";
  }

  // Create a date object from the timestamp (in seconds)
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Format options for date
  const options = {
    timeZone: "Asia/Kolkata", // Set to IST
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  try {
    const formatter = new Intl.DateTimeFormat("en-IN", options);
    const formattedDate = formatter.format(date);

    // Extract hours and minutes in IST
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Ensure two digits

    // Convert to 12-hour format
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Convert to 12-hour format
    const period = hours < 12 ? "AM" : "PM"; // Determine AM or PM

    // Split the formatted date to rearrange the components
    const [day, month, year] = formattedDate.split(" ");

    // Return the formatted date and time in the desired format
    return `${parseInt(day)} ${month} ${year} (${formattedHours}:${minutes} ${period})`; // Remove leading zero from day
  } catch (error) {
    return "Error formatting date";
  }
};

export const findMissingDates = (syncedRecords) => {
  // Check if syncedRecords is not empty
  if (!syncedRecords || syncedRecords.length === 0) {
    return [];
  }

  // Step 1: Extract unique dates from synced records
  const dates = syncedRecords.map((timestamp) => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to Date
    date.setUTCHours(0, 0, 0, 0); // Set time to UTC midnight
    return date.toISOString().split("T")[0]; // Get date in 'YYYY-MM-DD' format
  });

  // Step 2: Create a set of unique dates
  const uniqueDates = Array.from(new Set(dates));

  // Step 3: Get min and max date
  const minDate = new Date(Math.min(...uniqueDates.map((d) => new Date(d))));
  const maxDate = new Date(Math.max(...uniqueDates.map((d) => new Date(d))));

  // Step 4: Generate all dates between min and max date
  const missingDates = [];
  const currentDate = new Date(minDate);

  // Check for missing dates
  while (currentDate <= maxDate) {
    const formattedDate = currentDate.toISOString().split("T")[0];
    if (!uniqueDates.includes(formattedDate)) {
      missingDates.push(formattedDate); // Push missing date
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  // Step 5: Format the dates in 'DD MMM YYYY' format
  return missingDates.map((date) => {
    const currentDate = new Date(date);
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString("default", { month: "short" });
    const year = currentDate.getFullYear();
    return `${day} ${month} ${year}`; // Format as 'DD MMM YYYY'
  });
};
