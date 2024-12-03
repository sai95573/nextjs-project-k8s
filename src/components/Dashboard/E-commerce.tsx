"use client";
import { useGetCustomersByIdQuery } from "@/store/slice/customer/getCustomerDetails";
import { useGetDashboardDetailsQuery } from "@/store/slice/dashboard/getAllDashboard";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendarDate } from "react-icons/ci";
import CardDataStats from "../CardDataStats";
import Tooltip from "../Tooltip/Tooltip";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useGetFullDeviceDetailsQuery } from "@/store/slice/device/getAllDeviceDetails";
import Skeleton from "../Skeleton/skeleton";
import Button from "../ui/button";
import { useGetSyncDataQuery } from "@/store/slice/sync/getSyncSlice";

const ECommerce: React.FC = () => {
  const router = useRouter();

  const dattype = useSearchParams();
  const customerId = dattype?.get("id");
  const deviceId = dattype?.get("deviceid");

  const { data: syncedData } = useGetSyncDataQuery({
    id: customerId,
  });

  const convertToIST = (timestamp) => {
    // Ensure timestamp is a valid number
    if (typeof timestamp !== "number" || timestamp <= 0) {
      console.error("Invalid timestamp");
      return "Invalid timestamp";
    }

    const date = new Date(timestamp * 1000); // Convert to milliseconds

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date");
      return "Invalid date";
    }

    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short", // 'short' will give abbreviated month names
      day: "2-digit",
    };

    try {
      const formatter = new Intl.DateTimeFormat("en-IN", options);
      return formatter.format(date);
    } catch (error) {
      console.error("Error formatting date:", error.message);
      return "Error formatting date";
    }
  };

  const istTime = convertToIST(syncedData?.data?.lastSyncDate);
  console.log("Converted IST Time:", istTime);

  console.log("syncedData==>", syncedData, syncedData?.data?.lastSyncDate);

  // Define the date
  const date = new Date();

  // Extract year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(date.getDate() - 1).padStart(2, "0");

  // Combine them into the yyyy-mm-dd format
  const formattedDate1 = `${year}-${month}-${day}`;
  const sdate = syncedData?.data?.lastSyncDate;
  console.log("sdate", sdate);
  const { data: dashboarDetails } = useGetDashboardDetailsQuery({
    type: "day",
    startDate: sdate,
    endDate: sdate,
    userId: Number(customerId),
  });

  const { data: deviceDetails } = useGetFullDeviceDetailsQuery({});

  const filterDevice = deviceDetails?.data?.filter(
    (item: any) => item?.id === Number(customerId),
  );

  console.log(
    "filterDevicefilterDevice",
    typeof formattedDate1,
    formattedDate1,
    syncedData?.data?.lastSyncDate,
  );

  const { data: customerDetailsById, isLoading } = useGetCustomersByIdQuery({
    customerid: customerId,
  });

  const handleDay = (type: any) => {
    router.push(`/dashboard/day?type=${type}&id=${customerId}`);
  };
  const handleWeek = (type: any) => {
    router.push(`/dashboard/week?type=${type}&id=${customerId}`);
  };
  const handleMonth = (type: any) => {
    router.push(`/dashboard/month?type=${type}&id=${customerId}`);
  };

  // const today = new Date();
  // const options: any = { day: "numeric", month: "short", year: "numeric" };
  // const formattedDate = today.toLocaleDateString("en-GB", options);
  // console.log("formattedDate", formattedDate);
  const today = new Date();
  today.setDate(today.getDate() - 1); // Subtract one day

  const options: any = { day: "numeric", month: "short", year: "numeric" };
  const formattedDate = today.toLocaleDateString("en-GB", options);

  console.log("formattedDate", formattedDate);

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

  const handleSync = (deviceID: any, customerMobile: any) => {
    router.push(
      `/sync?deviceId=${deviceID}&customerNum=${customerMobile}&customerId=${customerId}`,
    );
  };
  return (
    <>
      <div className="flex justify-between">
        <div className=" text-2xl font-bold">DashBoard</div>
        <div>
          <Button
            type="submit"
            className="mb-6 mt-2 flex h-11 w-full flex-col gap-1.5 rounded bg-[#34475E]"
            disabled={isLoading}
            variant="signupfooter"
            onClick={() => handleSync(deviceId, customerDetailsById?.mobile)}
          >
            Sync History
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <div className=" justify-center text-center">
          {/* <div className=" text-xl">{formattedDate}</div> */}
          {/* <div className=" text-xl">{syncedData?.data?.lastSyncDate}</div> */}
          <p>Last Synced Date</p>
          <div className=" text-xl">{istTime}</div>
          <div className=" flex justify-center py-4 text-6xl font-bold">
            {/* {dashboarDetails?.sleepHistoryData?.sleepScore || 0} */}
            <div style={{ width: "150px", height: "150px" }}>
              <CircularProgressbar
                value={dashboarDetails?.sleepHistoryData?.sleepScore || 0}
                text={`${dashboarDetails?.sleepHistoryData?.sleepScore || 0}`}
                styles={buildStyles({
                  textSize: "35px", // Change this value to adjust text size
                  textColor: "#000", // Optional: customize text color
                  pathColor: "#A9CFD7",
                  trailColor: "#0B0B33",
                })}
              />
            </div>
          </div>
          <div className=" text-2xl">Sleep Score</div>
        </div>
        {isLoading ? (
          Array.from({ length: 1 }).map((_, idx) => (
            <div key={idx} className="mt-2 bg-white shadow-2">
              <div className="flex">
                <Skeleton className=" h-18 w-full" />
              </div>
            </div>
          ))
        ) : (
          <div className=" mt-6 flex justify-center gap-8">
            {customerDetailsById?.name && (
              <>
                <div>
                  <div className="text-title-md font-bold text-black dark:text-white">
                    {customerDetailsById?.name}
                  </div>
                  <div className="text-sm font-medium">Name</div>
                </div>
                <div className="h-12 w-px bg-black"></div>
              </>
            )}

            <div>
              <div className="text-title-md font-bold text-black dark:text-white">
                {`${dashboarDetails?.sleepHistoryData?.hour || 0}H${dashboarDetails?.sleepHistoryData?.minute || 0}M`}
              </div>
              <div className="text-sm font-medium">Actual Sleep Time</div>
            </div>
            <div className="h-12 w-px bg-black"></div>

            <div>
              <div className="text-title-md font-bold text-black dark:text-white">
                {formattedStartTime}
              </div>
              <div className="text-sm font-medium">Sleep at</div>
            </div>
            <div className="h-12 w-px bg-black"></div>

            <div>
              <div className="text-title-md font-bold text-black dark:text-white">
                {formattedEndTime}
              </div>
              <div className="text-sm font-medium">Wake up</div>
            </div>
            <div className="h-12 w-px bg-black"></div>
            {deviceId && (
              <>
                {" "}
                <div>
                  <div className="text-title-md font-bold text-black dark:text-white">
                    {deviceId}
                  </div>
                  <div className="text-sm font-medium"> Device ID</div>
                </div>
                <div className="h-12 w-px bg-black"></div>
              </>
            )}

            {customerDetailsById?.mobile && (
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-title-md font-bold text-black dark:text-white">
                    {customerDetailsById?.mobile}
                  </div>
                  {/* <div>
                    <Tooltip
                      content={
                        <div className=" text-black">
                          {filterDevice?.map((elm: any) => {
                            return (
                              <>
                                <p className=" font-bold">Connected Users</p>
                                {elm?.connectedUsers?.map((item: any) => {
                                  return (
                                    <div key={item?.name} className=" text-sm">
                                      {item?.name} - {item?.mobile}
                                    </div>
                                  );
                                })}
                              </>
                            );
                          })}
                        </div>
                      }
                    >
                      <AiOutlineInfoCircle />
                    </Tooltip>
                  </div> */}
                </div>
                <div className="text-sm font-medium">Mobile</div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* <div className="mb-4 ml-10 flex gap-6">
        <div>
          <button
            className=" cursor-pointer rounded-md bg-[#A8CED6] px-4 py-3 font-bold text-black"
            onClick={handleDayClick}
          >
            Day
          </button>
          {isDatePickerOpen && (
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              onClickOutside={() => setIsDatePickerOpen(false)} // Close on click outside
              open={isDatePickerOpen} // Ensure DatePicker visibility is controlled
              popperPlacement="bottom" // Optionally adjust where the calendar shows
              className=" hidden"
            />
          )}
        </div>
        <div>
          <button
            className=" rounded-md bg-[#A8CED6] px-4 py-3 font-bold text-black"
            onClick={handleWeekClick}
          >
            Week
          </button>
          {isDatePickerOpen1 && (
            <DatePicker
              selected={startDate1}
              onChange={handleDateChange1}
              onClickOutside={() => setIsDatePickerOpen1(false)}
              open={isDatePickerOpen1}
              selectsRange
              startDate={startDate}
              endDate={endDate}
              popperPlacement="bottom"
              className=" hidden"
            />
          )}
        </div>
        <div>
          <button
            className=" rounded-md bg-[#A8CED6] px-4 py-3 font-bold text-black"
            onClick={handleMonthClick}
          >
            Month
          </button>
          {isDatePickerOpen2 && (
            <DatePicker
              // selected={startDate2}
              onChange={(date) => handleDateChange2(date)}
              onClickOutside={() => setIsDatePickerOpen2(false)}
              open={isDatePickerOpen2}
              showMonthYearPicker // This shows only the month and year picker
              dateFormat="MM/yyyy" // Optional: format to display month and year
              popperPlacement="bottom"
              calendarClassName="py-5 px-10"
              className="hidden"
            />
          )}
        </div>
      </div> */}
      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5"> */}
      <div className="grid grid-cols-1 gap-4  py-14 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5 ">
        <div onClick={() => handleDay("day")} className=" cursor-pointer">
          <CardDataStats title="Report" total="Day" rate="">
            <CiCalendarDate size={35} />
          </CardDataStats>
        </div>
        <div onClick={() => handleWeek("week")} className=" cursor-pointer">
          <CardDataStats title="Report" total="Week" rate="">
            {/* <svg
            className="fill-primary dark:fill-white"
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.0937 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4219 12.2343 19.8687 11.7531 19.8687Z"
              fill=""
            />
            <path
              d="M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.56245 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.7062 19.8687 4.2937 19.4562 4.2937 18.9406C4.2937 18.425 4.7062 18.0125 5.22183 18.0125C5.73745 18.0125 6.14995 18.425 6.14995 18.9406C6.14995 19.4219 5.73745 19.8687 5.22183 19.8687Z"
              fill=""
            />
            <path
              d="M19.0062 0.618744H17.15C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H1.37185C1.0281 6.01562 0.684353 6.18749 0.443728 6.46249C0.237478 6.73749 0.134353 7.11562 0.237478 7.45937C0.237478 7.49374 0.237478 7.49374 0.237478 7.52812L2.36873 13.9562C2.50623 14.4375 2.9531 14.7812 3.46873 14.7812H12.9562C14.2281 14.7812 15.3281 13.8187 15.5 12.5469L16.9437 2.26874C16.9437 2.19999 17.0125 2.16562 17.0812 2.16562H18.9375C19.35 2.16562 19.7281 1.82187 19.7281 1.37499C19.7281 0.928119 19.4187 0.618744 19.0062 0.618744ZM14.0219 12.3062C13.9531 12.8219 13.5062 13.2 12.9906 13.2H3.7781L1.92185 7.56249H14.7094L14.0219 12.3062Z"
              fill=""
            />
          </svg> */}
            <CiCalendarDate size={35} />
          </CardDataStats>
        </div>
        <div onClick={() => handleMonth("month")} className=" cursor-pointer">
          <CardDataStats title="Report" total="Month" rate="">
            {/* <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6656 19.4907 19.0438 19.2157 19.3531Z"
              fill=""
            />
            <path
              d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.1814 8.35313 8.1814 6.80625C8.1814 6.6 8.21577 6.42813 8.25015 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73765 5.87813C6.6689 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z"
              fill=""
            />
          </svg> */}
            <CiCalendarDate size={35} />
          </CardDataStats>
        </div>
        {/* <CardDataStats title="Total Users" total="3.456" rate="0.95%" levelDown>
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z"
              fill=""
            />
            <path
              d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z"
              fill=""
            />
            <path
              d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7874 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.7874 17.4906H20.2468C20.8999 17.4906 21.4499 16.9406 21.4499 16.2875V15.4625C21.4155 12.4719 18.9749 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.9219 3.74678 10.3406 5.67178 10.3406H8.73115C10.6562 10.3406 12.2374 11.9219 12.2374 13.8469V15.9438H2.16553V15.9438ZM19.8687 15.9438H13.7499V13.8469C13.7499 13.2969 13.6468 12.7469 13.4749 12.2313C14.0937 11.7844 14.8499 11.5781 15.6405 11.5781H15.9499C18.0812 11.5781 19.8343 13.3313 19.8343 15.4625V15.9438H19.8687Z"
              fill=""
            />
          </svg>
        </CardDataStats> */}
      </div>

      {/* <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
        <MapOne />
        <div className="col-span-12 xl:col-span-8">
          <TableOne />
        </div>
        <ChatCard />
      </div> */}
    </>
  );
};

export default ECommerce;
