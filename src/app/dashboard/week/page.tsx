"use client";

import Badge from "@/components/Badge/Badge";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Button from "@/components/ui/button";
import { useGetDashboardDetailsQuery } from "@/store/slice/dashboard/getAllDashboard";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TagComponent from "@/lib/dashboard/tagComponent";

const TablesPage = () => {
  const d = useSearchParams();
  const customerId = d?.get("id");
  const [isDatePickerOpen1, setIsDatePickerOpen1] = useState(false); // State to control the date picker
  const [startDate1, setStartDate1] = useState(new Date());
  const [endDate, setEndDate]: any = useState(new Date());
  const [badgeStyle, setBadgeStyle] = useState(false);

  // const formatDateToYYYYMMDD = (startDate: any) => {
  //   // Create a Date object from the input
  //   const date = new Date(startDate);

  //   // Extract year, month, and day
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  //   const day = String(date.getDate()).padStart(2, "0");

  //   // Combine them into the yyyy-mm-dd format
  //   return `${year}-${month}-${day}`;
  // };

  // // Example usage
  // const stdate = formatDateToYYYYMMDD(startDate1);
  // const eddate = formatDateToYYYYMMDD(endDate);

  // const formatDateToYYYYMMDD = (date: Date) => {
  //   // Extract year, month, and day
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  //   const day = String(date.getDate()).padStart(2, "0");

  //   // Combine them into the yyyy-mm-dd format
  //   return `${year}-${month}-${day}`;
  // };

  // Helper function to format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to get the current week (Sunday to Saturday)
  const getCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return [startOfWeek, endOfWeek];
  };

  // State to hold the selected date range
  const [dateRange, setDateRange] = useState<any>([null, null]);
  console.log(
    "dateRange",
    dateRange[0] ? formatDateToYYYYMMDD(dateRange[0]) : "N/A",
    dateRange[1] ? formatDateToYYYYMMDD(dateRange[1]) : "N/A",
  );

  const stdate = dateRange[0] ? formatDateToYYYYMMDD(dateRange[0]) : "N/A";
  const eddate = dateRange[1] ? formatDateToYYYYMMDD(dateRange[1]) : "N/A";

  // Auto-select current week on component mount
  useEffect(() => {
    const currentWeek = getCurrentWeek();
    setDateRange(currentWeek); // Automatically set the current week range
  }, []);

  const getWeekRange = (startDate: Date, numberOfWeeks: number) => {
    const startOfWeek = new Date(startDate);
    const dayOfWeek = startOfWeek.getDay(); // Get the current day of the week
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Move back to the previous Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7 * numberOfWeeks - 1); // Add number of weeks to the start date

    // Format the dates
    const formattedStartDate = formatDateToYYYYMMDD(startOfWeek);
    const formattedEndDate = formatDateToYYYYMMDD(endOfWeek);

    return { startDate2: formattedStartDate, endDate1: formattedEndDate };
  };

  // Example usage
  const today = new Date();
  const numberOfWeeks = 1; // Number of weeks to include in the range
  const { startDate2, endDate1 } = getWeekRange(today, numberOfWeeks);
  console.log("sd===>", startDate2, endDate1);

  const dattype = useSearchParams();
  const typeSelected = dattype?.get("type");
  const { data: dashboarDetails, error }: any = useGetDashboardDetailsQuery({
    type: typeSelected,
    // startDate: startDate2 || "2024-09-01",
    startDate: stdate || "",
    endDate: eddate || "",
    // endDate: endDate1 || "2024-09-07",
    userId: Number(customerId),
  });

  console.log("dashboarDetails1==>", dashboarDetails);

  const handleWeekClick = () => {
    setIsDatePickerOpen1(true); // Show the date picker when button is clicked
  };

  // Function to format a Unix timestamp to "HH:mm" in IST
  const formatUnixTimestampToIST = (timestamp) => {
    // Check if the timestamp is valid (e.g., not null, undefined, or NaN)
    if (!timestamp || isNaN(timestamp)) return "00:00";

    // Convert Unix timestamp to milliseconds
    const date = new Date(timestamp * 1000);

    // Convert to IST (UTC+5:30)
    const istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(date.getTime() + istOffset);

    // Get hours and minutes in IST
    const hours = istDate.getHours(); // Use getHours instead of getUTCHours
    const minutes = istDate.getMinutes(); // Use getMinutes instead of getUTCMinutes

    // Format hours and minutes as strings
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    // Combine hours and minutes
    return `${formattedHours}:${formattedMinutes}`;
  };

  // // Access Unix timestamps
  const startTime = dashboarDetails?.sleepHistoryData?.startTime;
  const endTime = dashboarDetails?.sleepHistoryData?.endTime;

  // Format both timestamps in IST
  const formattedStartTime = formatUnixTimestampToIST(startTime);
  const formattedEndTime = formatUnixTimestampToIST(endTime);

  const printDocument = () => {
    const input = document.getElementById("divToPrint");
    console.log("inputinput", input);
    // Define padding (in mm)
    const padding = 5; // 10mm padding around the content
    // const headlineText = "Day Report"; // Headline text
    const headlineText = `Week Report(${formatDateRange(stdate, eddate)})`; // Headline text
    const headlineHeight = 5; // Space for headline in mm

    // Capture the content with html2canvas
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Initialize jsPDF in portrait mode with A4 size
      setBadgeStyle(true);
      const pdf = new jsPDF("p", "mm", "a4");

      // Define the A4 page dimensions (210mm x 297mm)
      const pageWidth = 210;
      const pageHeight = 297;

      // Set font and add headline
      pdf.setFontSize(16);
      pdf.text(headlineText, pageWidth / 2, padding, { align: "center" });

      // Calculate image dimensions within the page, considering padding
      const imgWidth = pageWidth - 2 * padding; // Reduce width for padding
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Adjust height based on the aspect ratio

      let heightLeft = imgHeight;
      let position = padding + headlineHeight; // Start with padding at the top

      // Add the first page with padding
      pdf.addImage(imgData, "PNG", padding, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 2 * padding; // Subtract padding for height calculation

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + padding;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", padding, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 2 * padding; // Reduce the height, accounting for padding
      }

      // Save the generated PDF with padding
      pdf.save("week-report.pdf");
    });
    setBadgeStyle(false);
  };

  const formatDateRange = (startDate3: any, endDate3: any) => {
    console.log("startDate3", startDate3, endDate3);

    const start = new Date(startDate3);

    if (isNaN(start.getTime())) {
      return "Invalid start date"; // Handle invalid start date
    }

    const options: any = { day: "numeric", month: "short" }; // Options for formatting day and month
    const startFormatted = start.toLocaleDateString("en-US", options); // Example: 15 Sept

    if (!endDate3) {
      // If end date is not selected or is invalid, return only the start date
      return `${startFormatted}, ${start.getFullYear()}`;
    }

    const end = new Date(endDate3);

    if (isNaN(end.getTime())) {
      return `${startFormatted}, ${start.getFullYear()}`; // Handle invalid end date, return only start date
    }

    const endFormatted = end.toLocaleDateString("en-US", options); // Example: 21 Sept
    return `${startFormatted} - ${endFormatted} , ${end.getFullYear()}`;
  };

  if (!stdate || !eddate) return null;
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Week Report" isGoBack={true} />
      {/* <div className="flex flex-col gap-10">
        
        </div> */}
      <>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className=" text-xl">Select Week :</div>
              <div>
                <button
                  className=" cursor-pointer rounded-md bg-[#A8CED6] px-3 py-2 font-bold text-black"
                  onClick={handleWeekClick}
                >
                  Week
                </button>
                {isDatePickerOpen1 && (
                  // <DatePicker
                  //   selected={startDate1}
                  //   onChange={handleDateChange1}
                  //   onClickOutside={() => setIsDatePickerOpen1(false)}
                  //   open={isDatePickerOpen1}
                  //   selectsRange
                  //   startDate={startDate1}
                  //   endDate={endDate}
                  //   popperPlacement="bottom"
                  //   className="hidden"
                  // />
                  <DatePicker
                    // selected={startDate1}
                    // onChange={handleDateChange1}
                    onChange={(update: [Date | null, Date | null]) => {
                      setDateRange(update); // Update the selected range when user selects a new range
                    }}
                    onClickOutside={() => setIsDatePickerOpen1(false)}
                    open={isDatePickerOpen1}
                    selectsRange
                    startDate={dateRange[0]}
                    endDate={dateRange[1]}
                    popperPlacement="bottom"
                    className="hidden"
                    dateFormat="yyyy-MM-dd"
                  />
                  // <DatePicker
                  //   selectsRange
                  //   startDate={dateRange[0]}
                  //   endDate={dateRange[1]}
                  //   onChange={(update: [Date | null, Date | null]) => {
                  //     setDateRange(update); // Update the selected range when user selects a new range
                  //   }}
                  //   dateFormat="yyyy-MM-dd"
                  //   inline
                  //   onClickOutside={() => setIsDatePickerOpen1(false)}
                  //   popperPlacement="bottom"
                  //   className="hidden"
                  // />
                )}
              </div>
            </div>
          </div>
          <div className=" text-lg font-bold">
            {/* {stdate}-{eddate} */}
            {formatDateRange(stdate, eddate)}
          </div>
          <div>
            <Button variant="signupfooter" onClick={printDocument}>
              Download Week Report
            </Button>
          </div>
        </div>
        {error?.status === 404 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="text-gray-500 bg-white p-4 px-19 text-center shadow-md">
              {error?.data?.message}
            </div>
          </div>
        ) : (
          <div id="divToPrint">
            <div className="grid w-full grid-cols-1 gap-6  py-14 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
              <div className=" flex w-full justify-center rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="mt-9 flex gap-6 p-3">
                  <div className="px-8 py-1">
                    <div className=" text-7xl font-bold">
                      {/* {Math.floor(dashboarDetails?.sleepHistoryData?.sleepScore) ||
                    0} */}
                      <div style={{ width: "150px", height: "150px" }}>
                        <CircularProgressbar
                          value={
                            Math.floor(
                              dashboarDetails?.sleepHistoryData?.sleepScore,
                            ) || 0
                          }
                          text={`${
                            Math.floor(
                              dashboarDetails?.sleepHistoryData?.sleepScore,
                            ) || 0
                          }`}
                          styles={buildStyles({
                            textSize: "35px", // Change this value to adjust text size
                            textColor: "#000", // Optional: customize text color
                            pathColor: "#A9CFD7",
                            trailColor: "#0B0B33",
                          })}
                        />
                      </div>
                    </div>
                    <div className=" text-center text-xl">Sleep Score</div>
                  </div>
                </div>
              </div>
              <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="p-6">
                  <div className="flex justify-between ">
                    <div className="text-title-md font-bold text-black dark:text-white">
                      Sleep Score
                    </div>
                  </div>
                  <div className="py-3">
                    <TagComponent
                      title={dashboarDetails?.sleepHistoryData?.sleepScoreTag}
                      customColors={{
                        green: "bg-lime-500",
                        orange: "bg-amber-500",
                        red: "bg-rose-700",
                        default: "bg-gray-600",
                      }}
                    />
                  </div>
                  {/* <div className="py-4">
                    <Badge status="BAD" badgeStyle={badgeStyle} />
                  </div> */}

                  <div className=" flex justify-end py-2">
                    <div style={{ width: "80px", height: "80px" }}>
                      <CircularProgressbar
                        value={
                          Math.floor(
                            dashboarDetails?.sleepHistoryData?.sleepScore,
                          ) || 0
                        }
                        text={`${
                          Math.floor(
                            dashboarDetails?.sleepHistoryData?.sleepScore,
                          ) || 0
                        }`}
                        styles={buildStyles({
                          textSize: "35px", // Change this value to adjust text size
                          textColor: "#000", // Optional: customize text color
                          pathColor: "#A9CFD7",
                          trailColor: "#0B0B33",
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.sleepScore,
                        ) || 0}
                      </div>
                      <div className=" text-sm font-medium">Avg.BPM</div>
                    </div>
                    {/* <div>
                  <Image
                    src={"/images/report/sleepscore.png"}
                    alt="Logo"
                    width={50}
                    height={32}
                  />
                </div> */}
                  </div>
                </div>
              </div>
              <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="p-6">
                  <div className="flex justify-between ">
                    <div className="text-title-md font-bold text-black dark:text-white">
                      Sleep Duration
                    </div>
                  </div>
                  {/* <div className="py-4">
                    <Badge status="LOW" />
                  </div> */}
                  <div className="py-3">
                    <TagComponent
                      title={
                        dashboarDetails?.sleepHistoryData?.sleepDurationTag
                      }
                      customColors={{
                        green: "bg-lime-500",
                        orange: "bg-amber-500",
                        red: "bg-rose-700",
                        default: "bg-gray-600",
                      }}
                    />
                  </div>
                  <div className=" flex justify-end py-2">
                    <Image
                      src={"/images/report/sleep-duration.png"}
                      alt="Logo"
                      width={80}
                      height={32}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.avgHeartRate,
                        ) || 0}
                        <span className=" text-sm font-medium">M</span>
                      </div>
                      <div className=" text-sm font-medium">Avg.BPM</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.deepSleepAllTime,
                        ) || 0}{" "}
                        <span className=" text-sm font-medium">d</span>
                      </div>
                      <div className=" text-sm font-medium">
                        Sleep deprivation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-6  md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
              <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="p-6">
                  <div className="flex justify-between ">
                    <div className="text-title-md font-bold text-black dark:text-white">
                      Sleep Effectiveness
                    </div>
                  </div>
                  {/* <div className="py-4">
                    <Badge status="LOW" />
                  </div> */}
                  <div className="py-3">
                    <TagComponent
                      title={
                        dashboarDetails?.sleepHistoryData?.sleepEffectivenessTag
                      }
                      customColors={{
                        green: "bg-lime-500",
                        orange: "bg-amber-500",
                        red: "bg-rose-700",
                        default: "bg-gray-600",
                      }}
                    />
                  </div>
                  <div className=" flex justify-end py-2">
                    <Image
                      src={"/images/report/sleep-eff.png"}
                      alt="Logo"
                      width={50}
                      height={32}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.midSleep,
                        ) || 0}
                        <span className=" text-sm font-medium">%</span>
                      </div>
                      <div className=" text-sm font-medium">
                        Avg.Sleep Efficienct
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.deepSleep,
                        ) || 0}{" "}
                        <span className=" text-sm font-medium">%</span>
                      </div>
                      <div className=" text-sm font-medium">
                        Avg. Deep Sleep
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="p-6">
                  <div className="flex justify-between ">
                    <div className="text-title-md font-bold text-black dark:text-white">
                      Sleep Regularity
                    </div>
                  </div>
                  {/* <div className="py-4">
                    <Badge status="BAD" />
                  </div> */}
                  <div className="py-3">
                    <TagComponent
                      title={
                        dashboarDetails?.sleepHistoryData?.sleepRegularityTag
                      }
                      customColors={{
                        green: "bg-lime-500",
                        orange: "bg-amber-500",
                        red: "bg-rose-700",
                        default: "bg-gray-600",
                      }}
                    />
                  </div>
                  <div className=" flex justify-end py-2">
                    <Image
                      src={"/images/report/sleep-int.png"}
                      alt="Logo"
                      width={60}
                      height={32}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {formattedStartTime}
                        {/* <span className=" text-sm font-medium">%</span> */}
                      </div>
                      <div className=" text-sm font-medium">
                        Avg. Start Sleep
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {formattedEndTime}{" "}
                        {/* <span className=" text-sm font-medium">%</span> */}
                      </div>
                      <div className=" text-sm font-medium">Avg. Get Up</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="p-6">
                  <div className="flex justify-between ">
                    <div className="text-title-md font-bold text-black dark:text-white">
                      Sleep Interruption
                    </div>
                  </div>
                  {/* <div className="py-4">
                    <Badge status="LOW" />
                  </div> */}
                  <div className="py-3">
                    <TagComponent
                      title={
                        dashboarDetails?.sleepHistoryData?.sleepInterruptionTag
                      }
                      customColors={{
                        green: "bg-lime-500",
                        orange: "bg-amber-500",
                        red: "bg-rose-700",
                        default: "bg-gray-600",
                      }}
                    />
                  </div>
                  <div className=" flex justify-end py-2">
                    <Image
                      src={"/images/report/sleep-int.png"}
                      alt="Logo"
                      width={50}
                      height={32}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.awakeTime,
                        ) || 0}
                        <span className=" text-sm font-medium">time(s)</span>
                      </div>
                      <div className=" text-sm font-medium">Avg. Wakeup</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.leaveBedTime,
                        ) || 0}
                        <span className=" text-sm font-medium">time(s)</span>
                      </div>
                      <div className=" text-sm font-medium">Avg. left Bed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 py-8  md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
              <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="p-6">
                  <div className="flex justify-between ">
                    <div className="text-title-md font-bold text-black dark:text-white">
                      Heart Rate
                    </div>
                  </div>
                  {/* <div className="py-4">
                    <Badge status="NORMAL" />
                  </div> */}
                  <div className="py-3">
                    <TagComponent
                      title={dashboarDetails?.sleepHistoryData?.heartRateTag}
                      customColors={{
                        green: "bg-lime-500",
                        orange: "bg-amber-500",
                        red: "bg-rose-700",

                        default: "bg-gray-600",
                      }}
                    />
                  </div>
                  <div className=" flex justify-center py-2">
                    <Image
                      src={"/images/report/Vector.png"}
                      alt="Logo"
                      width={120}
                      height={32}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.avgHeartRate,
                        ) || 0}
                      </div>
                      <div className=" text-sm font-medium">Avg.BPM</div>
                    </div>
                    <div>
                      <Image
                        src={"/images/report/heart.png"}
                        alt="Logo"
                        width={50}
                        height={32}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="p-6">
                  <div className="flex justify-between ">
                    <div className="text-title-md font-bold text-black dark:text-white">
                      Respiratory Rate
                    </div>
                  </div>
                  {/* <div className="py-4">
                    <Badge status="BAD" />
                  </div> */}
                  <div className="py-3">
                    <TagComponent
                      title={
                        dashboarDetails?.sleepHistoryData?.respirationRateTag
                      }
                      customColors={{
                        green: "bg-lime-500",
                        orange: "bg-amber-500",
                        red: "bg-rose-700",

                        default: "bg-gray-600",
                      }}
                    />
                  </div>
                  <div className=" flex justify-center py-2">
                    <Image
                      src={"/images/report/respiratory.png"}
                      alt="Logo"
                      width={140}
                      height={32}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold text-black dark:text-white">
                        {Math.floor(
                          dashboarDetails?.sleepHistoryData?.avgBreathRate,
                        ) || 0}
                      </div>
                      <div className=" text-sm font-medium">Avg.BPM</div>
                    </div>
                    <div>
                      <Image
                        src={"/images/report/resp.png"}
                        alt="Logo"
                        width={50}
                        height={32}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className="p-6">
                  <div className="flex justify-between ">
                    <div className="text-title-md font-bold text-black dark:text-white">
                      Apena-Hypopnea index
                    </div>
                  </div>
                  {/* <div className="py-4">
                    <Badge status="NORMAL" />
                  </div> */}
                  <div className="py-3">
                    <TagComponent
                      title={dashboarDetails?.sleepHistoryData?.apenaTag}
                      customColors={{
                        green: "bg-lime-500",
                        orange: "bg-amber-500",
                        red: "bg-rose-700",

                        default: "bg-gray-600",
                      }}
                    />
                  </div>
                  <div className=" flex justify-end py-2">
                    <Image
                      src={"/images/report/hypo.png"}
                      alt="Logo"
                      width={105}
                      height={32}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold text-black dark:text-white">
                          {/* {dashboarDetails?.sleepHistoryData?.apena || 0} */}

                          {Math.floor(
                            dashboarDetails?.sleepHistoryData?.apena,
                          ) || 0}
                          <span className=" text-sm font-medium">events/h</span>
                        </div>
                        <div className=" text-sm font-medium">Avg. Wakeup</div>
                      </div>
                    </div>
                    {/* <div>
                  <Image
                    src={"/images/report/hypo.png"}
                    alt="Logo"
                    width={50}
                    height={32}
                  />
                </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </DefaultLayout>
  );
};

export default TablesPage;
