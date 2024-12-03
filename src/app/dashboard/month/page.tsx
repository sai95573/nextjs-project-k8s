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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import TagComponent from "@/lib/dashboard/tagComponent";

const TablesPage = () => {
  const [isDatePickerOpen2, setIsDatePickerOpen2] = useState(false); // State to control the date picker
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate]: any = useState(null);
  const [endDate, setEndDate]: any = useState(null);
  const [currentMonth, setCurrentMonth] = useState();

  const ee = useSearchParams();
  const customerId = ee?.get("id");

  // Helper function to get the start and end dates of the selected month
  const getMonthStartEndDates = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1); // First day of the month
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of the month
    return { start, end };
  };

  // Set the current month as default on component mount
  useEffect(() => {
    const currentDate: any = new Date();
    const { start, end } = getMonthStartEndDates(currentDate);
    setSelectedDate(currentDate);
    setStartDate(start);
    setEndDate(end);
    // Get current month name
    const currentMonthName = currentDate.toLocaleString("default", {
      month: "long",
    });
    setCurrentMonth(currentMonthName);
  }, []);

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    // Log the month name
    const monthName = date.toLocaleString("default", { month: "long" });
    setCurrentMonth(monthName);
    const { start, end } = getMonthStartEndDates(date);
    setStartDate(start);
    setEndDate(end);
  };

  const formatDateToYYYYMMDD = (startDate: any) => {
    // Create a Date object from the input
    const date = new Date(startDate);

    // Extract year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");

    // Combine them into the yyyy-mm-dd format
    return `${year}-${month}-${day}`;
  };

  // Example usage
  const stdate = formatDateToYYYYMMDD(startDate);
  const eddate = formatDateToYYYYMMDD(endDate);

  const dattype = useSearchParams();
  const typeSelected = dattype?.get("type");
  const { data: dashboarDetails, error }: any = useGetDashboardDetailsQuery({
    type: typeSelected,
    startDate: stdate,
    endDate: eddate,
    userId: Number(customerId),
  });

  console.log("dashboarDetails", dashboarDetails);

  const handleMonthClick = () => {
    setIsDatePickerOpen2(true); // Show the date picker when button is clicked
  };

  // Function to format a Unix timestamp to "HH:mm" in UTC
  const formatUnixTimestamp = (timestamp: any) => {
    // Check if the timestamp is valid (e.g., not null, undefined, or NaN)
    if (!timestamp || isNaN(timestamp)) return "00:00";

    // Convert Unix timestamp to milliseconds
    const date = new Date(timestamp * 1000);

    // Get hours and minutes in UTC
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    // Format hours and minutes as strings
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    // Combine hours and minutes
    return `${formattedHours}:${formattedMinutes}`;
  };

  // Access Unix timestamps
  const startTime = dashboarDetails?.sleepHistoryData?.startTime;
  const endTime = dashboarDetails?.sleepHistoryData?.endTime;

  // Format both timestamps
  const formattedStartTime = formatUnixTimestamp(startTime);
  const formattedEndTime = formatUnixTimestamp(endTime);
  const printDocument = () => {
    const input = document.getElementById("divToPrint");
    // Define padding (in mm)
    const padding = 10; // 10mm padding around the content
    // const headlineText = "Day Report"; // Headline text
    const headlineText = `Month Report ${currentMonth}`; // Headline text
    const headlineHeight = 20; // Space for headline in mm

    // Capture the content with html2canvas
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Initialize jsPDF in portrait mode with A4 size
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
      pdf.save("month-report.pdf");
    });
  };
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Month Report" isGoBack={true} />
      <>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className=" text-xl">Select Month :</div>
              <div>
                <button
                  className=" cursor-pointer rounded-md bg-[#A8CED6] px-3 py-2 font-bold text-black"
                  onClick={handleMonthClick}
                >
                  Month
                </button>
                {isDatePickerOpen2 && (
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    onClickOutside={() => setIsDatePickerOpen2(false)}
                    open={isDatePickerOpen2}
                    showMonthYearPicker
                    dateFormat="MM/yyyy"
                    popperPlacement="bottom"
                    calendarClassName="py-5 px-10"
                    className="hidden"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="text-lg font-bold">{currentMonth}</div>
          <div>
            <Button variant="signupfooter" onClick={printDocument}>
              Download Month Report
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
            <div className="grid grid-cols-1 gap-6  py-14 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
              <div className=" rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                <div className=" flex justify-center">
                  <div className="flex items-center gap-8 px-6 py-6">
                    <div className=" h-48 w-48">
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
                          textSize: "35px",
                          textColor: "#000",
                          pathColor: "#A9CFD7",
                          trailColor: "#0B0B33",
                        })}
                      />
                      <div className=" text-center text-xl">Average</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-[2px] bg-black"></div>
                        <div>
                          <div className="text-sm text-black">Superb</div>
                          <div className=" text-lg font-bold">25%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-10 w-[2px] bg-black"></div>
                        <div>
                          <div className=" text-sm text-black">Good</div>
                          <div className=" text-lg font-bold">15%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-[2px] bg-black"></div>
                        <div>
                          <div className="text-sm text-black">Average</div>
                          <div className=" text-lg font-bold">13%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-10 w-[2px] bg-black"></div>
                        <div>
                          <div className="text-sm text-black">Bad</div>
                          <div className=" text-lg font-bold">15%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-[2px] bg-black"></div>
                        <div>
                          <div className="text-sm text-black">Not Reached</div>
                          <div className=" text-lg font-bold">55%</div>
                        </div>
                      </div>
                    </div>
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

                  {/* <div className="py-4">
                    <Badge status="BAD" />
                  </div> */}

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
                        Avg.Sleep Efficienct
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-black dark:text-white">
                        {formattedEndTime}{" "}
                        {/* <span className=" text-sm font-medium">%</span> */}
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
                      width={140}
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
                          {Math.floor(
                            dashboarDetails?.sleepHistoryData?.apena,
                          ) || 0}
                          <span className=" text-sm font-medium">events/h</span>
                        </div>
                        <div className=" text-sm font-medium">Avg. Wakeup</div>
                      </div>
                    </div>
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
