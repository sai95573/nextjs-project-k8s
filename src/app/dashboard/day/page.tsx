"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import EmblaCarousel from "@/components/EmblaCarousel/EmblaCarousel/EmblaCarousel";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Button from "@/components/ui/button";
import TimeFormatter from "@/lib/dashboard/unixDayFormat";
import { useGetDashboardDetailsQuery } from "@/store/slice/dashboard/getAllDashboard";
import { useGetSyncDataQuery } from "@/store/slice/sync/getSyncSlice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useEmblaCarousel from "embla-carousel-react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import TagComponent from "@/lib/dashboard/tagComponent";
import Skeleton from "@/components/Skeleton/skeleton";

const TablesPage = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dattype = useSearchParams();
  const typeSelected = dattype?.get("type");
  const [currentIndex, setCurrentIndex] = useState(0);
  const customerId = dattype?.get("id");

  const { data: syncedData } = useGetSyncDataQuery({
    id: customerId,
  });

  const convertToIST = (timestamp: any) => {
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

  const istTime = convertToIST(syncedData?.data?.lastSyncDate);

  const sdate = istTime;

  // Convert the dynamic date string to a Date object
  const dateObj = new Date(sdate);

  // Set a specific time if needed, e.g., 16:50:33
  dateObj.setHours(16, 50, 33);

  // Get the formatted date string
  const formattedDate11 = dateObj.toString();

  useEffect(() => {
    if (syncedData?.data?.lastSyncDate) {
      const sdate = syncedData.data.lastSyncDate;

      // Convert the dynamic date string to a Date object
      const dateObj = new Date(istTime);

      // Set a specific time if needed, e.g., 16:50:33
      dateObj.setHours(16, 50, 33);

      // Update the state with the valid date
      setStartDate(dateObj);
    }
  }, [syncedData]);

  const [startDate, setStartDate] = useState(new Date(formattedDate11));

  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (date: any) => {
    setStartDate(date);
    setIsDatePickerOpen(false); // Optionally close the date picker after selection
  };
  const handleDayClick = () => {
    setIsDatePickerOpen(true);
  };

  // Define the date
  const date = new Date(startDate);

  // Extract year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Combine them into the yyyy-mm-dd format
  const formattedDate = `${year}-${month}-${day}`;

  const { data: dashboarDetails, isLoading: isLoade }: any =
    useGetDashboardDetailsQuery({
      type: typeSelected,
      // startDate: formattedDate,
      startDate: formattedDate,
      endDate: formattedDate,
      userId: Number(customerId),
    });

  console.log("dashboarDetails==>", isLoade);

  // Access Unix timestamps
  const startTime = dashboarDetails?.sleepHistoryData?.startTime;
  const endTime = dashboarDetails?.sleepHistoryData?.endTime;

  // Format both timestamps
  // const formattedStartTime = formatUnixTimestamp(startTime);
  // const formattedStartTime = <TimeFormatter timestamp={startTime} />;
  const formattedStartTime = new Date(Number(startTime) * 1000).toUTCString();
  // const formattedEndTime = formatUnixTimestamp(endTime);
  // const formattedEndTime = <TimeFormatter timestamp={endTime} />;
  const formattedEndTime = new Date(Number(endTime) * 1000).toUTCString();

  const printDocument = (index: number) => {
    setIsLoading(true);
    // const input = document.getElementById("divToPrint");
    const input = document.getElementById(`divToPrint-${index}`);
    // Define padding (in mm)
    const padding = 10; // 10mm padding around the content
    const headlineText = `Day Report (${formattedDate})`; // Headline text
    const headlineHeight = 10; // Space for headline in mm

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
      // while (heightLeft > 0) {
      //   position = heightLeft - imgHeight + padding;
      //   pdf.addPage();
      //   pdf.addImage(imgData, "PNG", padding, position, imgWidth, imgHeight);
      //   heightLeft -= pageHeight - 2 * padding; // Reduce the height, accounting for padding
      // }

      // Save the generated PDF with padding
      pdf.save("day-report.pdf");
      setIsLoading(false);
    });
  };

  // Function to format a date string to "DD MMM YYYY"

  const formatDate = (dateStr: any) => {
    // Parse the date string
    const date = new Date(dateStr);

    // Define month abbreviations
    const monthAbbreviations = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Extract day, month, and year
    const day = date.getDate();
    const month = monthAbbreviations[date.getMonth()];
    const year = date.getFullYear();

    // Format and return the date
    return `${day} ${month} ${year}`;
  };

  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  // Callback to update the navigation button states
  const updateButtonStates = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  // Navigate to the previous slide
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  // Navigate to the next slide
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Attach event listeners and update button states when the carousel changes
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateButtonStates);
    emblaApi.on("init", updateButtonStates);

    updateButtonStates();
  }, [emblaApi, updateButtonStates]);

  // const [isAutoScroll, setIsAutoScroll] = useState(true);

  // useEffect(() => {
  //   let scrollInterval: any;

  //   if (isAutoScroll && emblaApi) {
  //     scrollInterval = setInterval(() => {
  //       if (
  //         emblaApi.selectedScrollSnap() <
  //         emblaApi.scrollSnapList().length - 1
  //       ) {
  //         emblaApi.scrollNext();
  //       } else {
  //         emblaApi.scrollTo(0); // Reset to the first slide when reaching the end
  //       }
  //     }, 20000); // Adjust the interval time as needed (3000 ms = 3 seconds)
  //   }

  //   return () => {
  //     clearInterval(scrollInterval); // Cleanup the interval on unmount
  //   };
  // }, [emblaApi, isAutoScroll]);

  useEffect(() => {
    if (!emblaApi) return;

    // Update the current index whenever the carousel slides
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // Set the initial index value

    // Cleanup listener when the component unmounts
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  const formatTime = (timestamp: any) => {
    const date = new Date(Number(timestamp) * 1000);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}H ${minutes}M`;
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Day Report" isGoBack={true} />
      <>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className=" text-xl">Select Date :</div>
              <div>
                <button
                  className=" cursor-pointer rounded-md bg-[#A8CED6] px-3 py-2 font-bold text-black"
                  onClick={handleDayClick}
                >
                  Day
                </button>
                {isDatePickerOpen && (
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    onClickOutside={() => setIsDatePickerOpen(false)}
                    open={isDatePickerOpen}
                    popperPlacement="bottom"
                    className=" hidden"
                    maxDate={new Date()}
                  />
                )}
              </div>
            </div>
          </div>
          {formatDate(formattedDate)}{" "}
          <div>
            <Button
              variant="signupfooter"
              // onClick={printDocument}
              onClick={() => printDocument(currentIndex)}
              loading={isLoading}
            >
              Download Day Report
            </Button>
          </div>
        </div>
        {dashboarDetails?.sleepHistoryData?.length > 1 && (
          <div className=" mb-6 flex justify-center text-lg ">
            {prevBtnEnabled && (
              <>
                {dashboarDetails?.sleepHistoryData?.length > 1 && (
                  <button
                    className="embla__button embla__button--prev"
                    onClick={scrollPrev}
                    disabled={!prevBtnEnabled}
                  >
                    <BsChevronLeft />
                  </button>
                )}
              </>
            )}
            <div className="ml-2 mr-2">Report {currentIndex + 1}</div>
            {currentIndex < dashboarDetails?.sleepHistoryData?.length - 1 && (
              <button
                className="embla__button embla__button--next"
                onClick={scrollNext}
              >
                <BsChevronRight />
              </button>
            )}
          </div>
        )}

        {isLoade ? (
          Array.from({ length: 1 }).map((_, idx) => (
            <>
              <div key={idx} className="flex w-full justify-center">
                <div className="flex w-fit flex-wrap rounded-2xl   bg-white   shadow-default">
                  <div className=" h-54 w-96">
                    <Skeleton className=" h-54 w-96" />
                  </div>
                </div>
              </div>
              <div key={idx} className="mt-6 flex w-full justify-between">
                <div className=" flex flex-wrap rounded-2xl   bg-white   shadow-default">
                  <div className=" h-54  w-125">
                    <Skeleton className=" h-54 w-125" />
                  </div>
                </div>
                <div className="flex w-fit flex-wrap rounded-2xl   bg-white   shadow-default">
                  <div className=" h-54 w-125">
                    <Skeleton className=" h-54 w-125" />
                  </div>
                </div>
              </div>
            </>
          ))
        ) : (
          <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container gap-0 md:gap-4">
                {dashboarDetails?.sleepHistoryData?.map(
                  (item: any, index: any) => (
                    <div
                      key={index}
                      className="embla__slide flex-grow-0 basis-full md:basis-full lg:basis-full"
                    >
                      <div
                        id={`divToPrint-${index}`}
                        className="w-full overflow-hidden"
                      >
                        <div className="flex w-full justify-center">
                          <div className="flex w-fit flex-wrap gap-4 rounded-2xl border border-stroke bg-white  px-3  py-8 shadow-default">
                            <div className=" h-48 w-48">
                              <CircularProgressbar
                                value={item?.sleepScore || 0}
                                text={`${item?.sleepScore || 0}`}
                                styles={buildStyles({
                                  textSize: "35px",
                                  textColor: "#000",
                                  pathColor: "#A9CFD7",
                                  trailColor: "#0B0B33",
                                })}
                              />
                              <div className=" text-center text-xl">
                                Average
                              </div>
                            </div>

                            <div>
                              <div>
                                <div>
                                  <div className="flex items-center  gap-3">
                                    <div>
                                      <Image
                                        src={"/images/report/clock.png"}
                                        alt="Logo"
                                        width={22}
                                        height={22}
                                      />
                                    </div>
                                    <div className="text-title-md font-bold text-black dark:text-white">
                                      {`${item?.hour || 0}H${item?.minute || 0}M`}
                                    </div>
                                  </div>
                                  <div className="px-8 text-sm font-medium">
                                    Actual Sleep Time
                                  </div>
                                </div>
                                <div className="py-4">
                                  <div className="flex items-center  gap-3">
                                    <div>
                                      <Image
                                        src={"/images/report/sleep-at.png"}
                                        alt="Logo"
                                        width={22}
                                        height={22}
                                      />
                                    </div>
                                    <div className="text-title-md font-bold text-black dark:text-white">
                                      {/* {formattedStartTime(item?.startTime, item?.endItem)} */}
                                      {/* {new Date(
                                    Number(item?.startTime) * 1000,
                                  ).toUTCString()} */}
                                      {formatTime(item?.startTime)}
                                    </div>
                                  </div>
                                  <div className="px-8 text-sm font-medium">
                                    Sleep at
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center  gap-3">
                                    <div>
                                      <Image
                                        src={"/images/report/wake-up.png"}
                                        alt="Logo"
                                        width={22}
                                        height={22}
                                      />
                                    </div>
                                    <div className="text-title-md font-bold text-black dark:text-white">
                                      {/* {formattedEndTime} */}
                                      {formatTime(item?.endTime)}
                                    </div>
                                  </div>
                                  <div className="px-8 text-sm font-medium">
                                    wake up
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1  py-14 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                          <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                            <div className="p-6">
                              <div className="flex justify-between ">
                                <div className="text-title-md font-bold text-black dark:text-white">
                                  Heart Rate
                                </div>
                                <TagComponent
                                  title={item?.heartRateTag}
                                  customColors={{
                                    green: "bg-lime-500",
                                    orange: "bg-amber-500",
                                    red: "bg-red-700",
                                    default: "bg-gray-600",
                                  }}
                                />
                              </div>
                              <div className=" py-2">
                                <Image
                                  src={"/images/report/Vector.png"}
                                  alt="Logo"
                                  width={150}
                                  height={32}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-5xl font-bold text-black dark:text-white">
                                    {item?.avgHeartRate || 0}
                                  </div>
                                  <div className=" text-sm font-medium">
                                    Avg.BPM
                                  </div>
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
                                <TagComponent
                                  title={item?.respirationRateTag}
                                  customColors={{
                                    green: "bg-lime-500",
                                    orange: "bg-amber-500",
                                    red: "bg-red-700",
                                    default: "bg-gray-600",
                                  }}
                                />
                              </div>
                              <div className=" py-2">
                                <Image
                                  src={"/images/report/respiratory.png"}
                                  alt="Logo"
                                  width={150}
                                  height={32}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-5xl font-bold text-black dark:text-white">
                                    {item?.avgBreathRate || 0}
                                  </div>
                                  <div className=" text-sm font-medium">
                                    Avg.BPM
                                  </div>
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                          <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                            <div className="p-6">
                              <div className="flex justify-between ">
                                <div className="text-title-md font-bold text-black dark:text-white">
                                  Sleep Cycle
                                </div>
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={"/images/report/left-bed.png"}
                                    alt="Logo"
                                    width={45}
                                    height={32}
                                  />
                                  Left Bed{" "}
                                  <span className=" text-xl font-bold">
                                    {item?.leaveBedTime || 0} times
                                  </span>
                                </div>
                              </div>
                              <div className=" py-15">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-5xl font-bold text-black dark:text-white">
                                      {`${item?.hour || 0}H ${item?.minute || 0}M`}
                                    </div>
                                    <div className=" text-sm font-medium">
                                      Left bed - {item?.leaveBedTime || 0} times
                                    </div>
                                  </div>
                                  <div>
                                    <Image
                                      src={"/images/report/Chart.png"}
                                      alt="Logo"
                                      width={176}
                                      height={32}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <div className="h-20 w-20">
                                  <CircularProgressbar
                                    value={item?.deepSleep || 0}
                                    // text={`${item?.deepSleep || 0}`}
                                    text={
                                      <>
                                        <tspan
                                          x="50%"
                                          dy="-10"
                                          className=" text-xl font-bold"
                                        >
                                          {`${item?.sleepScore ? `${item?.sleepScore}%` : ""}` ||
                                            `${0}%`}
                                        </tspan>
                                        <tspan
                                          x="50%"
                                          dy="20"
                                          className=" text-sm"
                                        >
                                          Deep
                                        </tspan>
                                      </>
                                    }
                                    styles={buildStyles({
                                      textSize: "23px",
                                      textColor: "#000",
                                      pathColor: "#A9CFD7",
                                      trailColor: "#0B0B33",
                                    })}
                                  />
                                </div>
                                <div className="h-20 w-20">
                                  <CircularProgressbar
                                    value={item?.midSleep || 0}
                                    // text={`${item?.midSleep || 0}`}
                                    text={
                                      <>
                                        <tspan
                                          x="50%"
                                          dy="-10"
                                          className=" text-xl font-bold"
                                        >
                                          {`${item?.midSleep ? `${item?.midSleep}%` : ""}` ||
                                            `${0}%`}
                                        </tspan>
                                        <tspan
                                          x="50%"
                                          dy="20"
                                          className=" text-sm"
                                        >
                                          Mid
                                        </tspan>
                                      </>
                                    }
                                    styles={buildStyles({
                                      textSize: "23px",
                                      textColor: "#000",
                                      pathColor: "#A9CFD7",
                                      trailColor: "#0B0B33",
                                    })}
                                  />
                                </div>
                                <div className="h-20 w-20">
                                  <CircularProgressbar
                                    value={item?.lightSleep || 0}
                                    // text={`${item?.lightSleep || 0}`}
                                    text={
                                      <>
                                        <tspan
                                          x="50%"
                                          dy="-10"
                                          className=" text-xl font-bold"
                                        >
                                          {`${item?.lightSleep ? `${item?.lightSleep}%` : ""}` ||
                                            `${0}%`}
                                        </tspan>
                                        <tspan
                                          x="50%"
                                          dy="20"
                                          className=" text-sm"
                                        >
                                          Light
                                        </tspan>
                                      </>
                                    }
                                    styles={buildStyles({
                                      textSize: "23px",
                                      textColor: "#000",
                                      pathColor: "#A9CFD7",
                                      trailColor: "#0B0B33",
                                    })}
                                  />
                                </div>
                                <div className="h-20 w-20">
                                  <CircularProgressbar
                                    value={item?.awakeTime || 0}
                                    // text={`${item?.awakeTime || 0}`}
                                    text={
                                      <>
                                        <tspan
                                          x="50%"
                                          dy="-10"
                                          className=" text-xl font-bold"
                                        >
                                          {`${item?.awakeTime ? `${item?.awakeTime}%` : ""}` ||
                                            `${0}%`}
                                        </tspan>
                                        <tspan
                                          x="50%"
                                          dy="20"
                                          className=" text-sm"
                                        >
                                          Awake
                                        </tspan>
                                      </>
                                    }
                                    styles={buildStyles({
                                      textSize: "23px",
                                      textColor: "#000",
                                      pathColor: "#A9CFD7",
                                      trailColor: "#0B0B33",
                                    })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className=" h-fit w-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark lg:w-full">
                            <div className="p-6">
                              <div className="flex justify-between ">
                                <div className="text-title-md font-bold text-black dark:text-white">
                                  Emancipate one self
                                </div>
                                <TagComponent
                                  title={item?.emancipateOneSelfTag}
                                  customColors={{
                                    green: "bg-lime-500",
                                    orange: "bg-amber-500",
                                    red: "bg-red-700",
                                    default: "bg-gray-600",
                                  }}
                                />
                              </div>
                              <div className="py-12">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div>
                                      <div className="text-5xl font-bold text-black dark:text-white">
                                        {item?.trunOverTimes || 0}
                                      </div>
                                      <div className=" text-sm font-medium">
                                        Avg.RPM
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Image
                                      src={"/images/report/Group.png"}
                                      alt="Logo"
                                      width={100}
                                      height={32}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-1 ">
                          {/* <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:gap-7.5"> */}
                          <div>
                            <div className="overflow-hidden py-6">
                              <div>
                                {item?.sleepInterpretationArray.length > 0 ? (
                                  <div className="py-4 text-2xl font-bold">
                                    Sleep Interpretation
                                  </div>
                                ) : null}
                              </div>
                              <div className="scrollbar-custom relative overflow-x-auto overflow-y-hidden">
                                <div className="flex min-w-max">
                                  {item?.sleepInterpretationArray?.map(
                                    (elm) => (
                                      <div
                                        key={elm?.title}
                                        className="mx-2 h-fit w-[280px]"
                                      >
                                        <div className="flex h-40 w-full flex-col justify-between rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark">
                                          <div className="px-6 py-3">
                                            <div className="text-xl font-bold text-black dark:text-white">
                                              {elm?.title}
                                            </div>
                                          </div>
                                          <div className="px-6 pb-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7db8c5] font-bold text-black">
                                              {elm?.value || 0}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </>
    </DefaultLayout>
  );
};

export default TablesPage;
