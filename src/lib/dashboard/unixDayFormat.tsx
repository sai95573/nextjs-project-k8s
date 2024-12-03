// import React from "react";

// const TimeFormatter = ({ timestamp }: any) => {
//   // Function to format a Unix timestamp to "HH:mm" in UTC
//   const formatUnixTimestamp = (timestamp: any) => {
//     // Check if the timestamp is valid (e.g., not null, undefined, or NaN)
//     if (!timestamp || isNaN(timestamp)) return "00:00";

//     // Convert Unix timestamp to milliseconds
//     const date = new Date(timestamp * 1000);

//     // Get hours and minutes in UTC
//     const hours = date.getUTCHours();
//     const minutes = date.getUTCMinutes();

//     // Format hours and minutes as strings
//     const formattedHours = String(hours).padStart(2, "0");
//     const formattedMinutes = String(minutes).padStart(2, "0");

//     // Combine hours and minutes
//     return `${formattedHours}:${formattedMinutes}`;
//   };

//   return <div>{formatUnixTimestamp(timestamp)}</div>;
// };

// export default TimeFormatter;

import React from "react";

const TimeFormatter = ({ timestamp }: any) => {
  // Function to format a Unix timestamp to "HH:mm" in Asia/Kolkata timezone
  const formatUnixTimestamp = (timestamp: any) => {
    // Check if the timestamp is valid (e.g., not null, undefined, or NaN)
    if (!timestamp || isNaN(timestamp)) return "00:00";

    // Convert Unix timestamp to milliseconds
    const date = new Date(timestamp * 1000);

    // Format date in Asia/Kolkata timezone with "HH:mm" format
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Use 24-hour format
    };

    // Format the date with the specified options
    return new Intl.DateTimeFormat("en-IN", options).format(date);
  };

  return <div>{formatUnixTimestamp(timestamp)}</div>;
};

export default TimeFormatter;
