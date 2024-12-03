"use client";
import Input from "@/app/ui/form/input";
import Pagination from "@/components/Pagination/Pagination";
import Skeleton from "@/components/Skeleton/skeleton";
import { useGetCustomerDetailsQuery } from "@/store/slice/customer/getCustomerDetails";
import { useGetDashboardDetailsQuery } from "@/store/slice/dashboard/getAllDashboard";
import { useGetAllReportDetailsQuery } from "@/store/slice/report/getReportDetails";
import { useGetSyncDataQuery } from "@/store/slice/sync/getSyncSlice";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ImSpinner2 } from "react-icons/im";
import { toast } from "react-toastify";

interface InputProps {
  description: string;
  permission: string;
  status: string;
  role: string;
  rolesAccess: any;
}

const statusData = [
  { label: "All", value: "All" },
  { label: "Pillow", value: "Pillow" },
  { label: "Mattress", value: "Mattress" },
];
const downloadReport = [
  { label: "Day Report", value: "day" },
  { label: "Week Report", value: "week" },
  { label: "Month Report", value: "month" },
];

const getNextDay = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1); // Add one day
  return date.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
};

const TableThree = () => {
  const router = useRouter();
  const limit = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDate, setCurrentDate] = useState();
  const [startOfWeek, setStartOfWeek] = useState("");
  const [endOfWeek, setEndOfWeek] = useState("");
  const [startOfMonth, setStartOfMonth] = useState("");
  const [endOfMonth, setEndOfMonth] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [reportType, setReportType] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [Loader, setLoader] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [startDateValue, setStartDate] = useState("");
  const [endDateValue, setEndDate] = useState("");
  const [debouncedStartDateValue, setDebouncedStartDateValue] = useState("");
  const [debouncedEndDateValue, setDebouncedEndDateValue] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [startDate1, setStartDate1]: any = useState(null);
  const [endDate1, setEndDate1]: any = useState(null);
  const [todayDate, setToday] = useState("");
  const adjustedEndDate = getNextDay(debouncedEndDateValue);
  const {
    data: customerDetails,
    isLoading: userLoading,
    isFetching: isApiFetching,
    error,
  } = useGetCustomerDetailsQuery({
    limit,
    page: currentPage,
    search: debouncedSearchValue,
    fromDate: debouncedStartDateValue,
    toDate: adjustedEndDate,
    deviceType: selectedValue,
  });

  // const [limit, setLimit] = useState();
  const itemsPerPage = 10; // Number of items per page

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(customerName);
      setDebouncedStartDateValue(startDateValue);
      setDebouncedEndDateValue(endDateValue);
    }, 900); // 900ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [customerName, startDateValue, endDateValue]);

  const onStartDateChange = (e: any) => {
    setStartDate(e.target.value);
  };
  const onEndDateChange = (e: any) => {
    setEndDate(e.target.value);
  };

  useEffect(() => {
    // Reset pagination to first page when query parameters change
    setCurrentPage(1);
  }, [debouncedSearchValue, debouncedStartDateValue, adjustedEndDate]);

  useEffect(() => {
    if (customerDetails) {
      const { data } = customerDetails;
      const searchLower = debouncedSearchValue.toLowerCase();
      const start = debouncedStartDateValue
        ? new Date(debouncedStartDateValue)
        : null;
      const end = adjustedEndDate ? new Date(adjustedEndDate) : null;

      const filtered = data.filter((item: any) => {
        const orderId = (item.name || "").toString().toLowerCase();
        const mobileNo = (item.mobile || "").toString().toLowerCase();
        const deviceType = new Set(
          item?.device?.map((device: any) => device?.device_type),
        );

        const pillow = Array.from(deviceType);
        const orderDate = new Date(item.createdAt.substring(0, 10));
        const deviceTypee = (pillow[0] || "").toString().toLowerCase();
        const deviceTypee1 = (pillow[1] || "").toString().toLowerCase();

        const matchesSearch =
          orderId.startsWith(searchLower) ||
          mobileNo.startsWith(searchLower) ||
          deviceTypee.startsWith(searchLower) ||
          deviceTypee1.startsWith(searchLower);

        const matchesStartDate = start ? orderDate >= start : true;
        const matchesEndDate = end ? orderDate <= end : true;

        return matchesSearch && matchesStartDate && matchesEndDate;
      });

      setFilteredData(filtered);
    }
  }, [
    customerDetails,
    debouncedSearchValue,
    debouncedStartDateValue,
    adjustedEndDate,
  ]);

  useEffect(() => {
    setIsFetching(userLoading || isApiFetching);
  }, [userLoading, isApiFetching]);

  const handleUpdateUser = (userId: any) => {
    router.push(`/maindashborad?id=${userId}`);
  };

  //month details

  // Helper function to get the start and end dates of the selected month
  const getMonthStartEndDates = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1); // First day of the month
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of the month
    return { start, end };
  };

  // useEffect(() => {
  //   const currentDate: any = new Date();
  //   const { start, end }: any = getMonthStartEndDates(currentDate);
  //   setStartDate1(start);
  //   setEndDate1(end);
  // }, []);

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
  const stdate = formatDateToYYYYMMDD(startDate1);
  const eddate = formatDateToYYYYMMDD(endDate1);

  const { data: dashboarDetails }: any = useGetDashboardDetailsQuery({
    type: "month",
    startDate: stdate,
    endDate: eddate,
    userId: 1,
  });

  const { data: syncedData } = useGetSyncDataQuery({
    id: 1,
  });
  const sdate = syncedData?.data?.lastSyncDate;

  // Convert the dynamic date string to a Date object
  const dateObj = new Date(sdate);

  // Set a specific time if needed, e.g., 16:50:33
  dateObj.setHours(16, 50, 33);

  // Get the formatted date string
  const formattedDate11 = dateObj.toString();

  // Define the date
  const date = new Date(formattedDate11);

  // Extract year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Combine them into the yyyy-mm-dd format
  const formattedDate = `${year}-${month}-${day}`;

  const { data: daydashboarDetails }: any = useGetDashboardDetailsQuery({
    type: "day",
    // startDate: formattedDate,
    startDate: formattedDate,
    endDate: formattedDate,
    userId: 1,
  });

  const {
    formState: { errors },
  } = useForm<InputProps>({});

  const handleExportExcel = async () => {
    setLoader(true);
    // Create a new workbook and a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users and Devices");

    worksheet.columns = [
      { header: "User ID", key: "user_id", width: 10 },
      { header: "Devie ID", key: "device_id", width: 30 },
      { header: "Devie Name", key: "device_name", width: 30 },
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 20 },
      { header: "Mobile", key: "mobile", width: 20 },
      { header: "Device Type", key: "device_type", width: 15 },
      //month
      { header: "Sleep Score", key: "sleepScore", width: 15 },
    ];

    // Add data rows
    customerDetails?.data?.forEach((user: any) => {
      user.device.forEach((device: any) => {
        worksheet.addRow({
          user_id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          role_name: user.roles.name, // Role name
          device_id: device.device_id,
          device_name: device.device_name || "N/A",
          device_mac: device.device_mac,
          device_type: device.device_type,
          device_createdAt: device.createdAt,
          sleepScore: dashboarDetails?.sleepHistoryData?.sleepScore,
        });
      });
    });

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "report.xlsx");
    setLoader(false);
  };

  const totalPages = Math.ceil(
    customerDetails?.pagination?.totalCount / itemsPerPage,
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleCustomerName = (e: any) => {
    setCustomerName(e.target.value);
  };

  const today = new Date().toISOString().split("T")[0];

  // Function to handle changes in the select input
  const handleSelectChange = (event: any) => {
    const value = event.target.value;
    setSelectedValue(value === "All" ? "" : value);
  };

  // Fetch the report details based on report type and date range
  const handleDownloadReport = async (event: any) => {
    console.log("event?.target?.value", event?.target?.value);
    setReportType(event?.target?.value);

    if (event?.target?.value === "day") {
      const today = new Date();
      today.setDate(today.getDate() - 1); // Subtract 1 day
      const formattedDate = today.toISOString().split("T")[0];
      console.log("formattedDate", formattedDate);
      setToday(formattedDate);

      // Call the function to fetch report details and generate the report
      await fetchAndGenerateReport(formattedDate);
    }
    if (event?.target?.value === "week") {
      const today = new Date();
      const currentDay = today.getDay();

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay); // Sunday

      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - currentDay)); // Saturday

      const formatDate = (date: any) => date.toISOString().split("T")[0];
      // Set the state values for both start and end of the week
      const formattedDateStart = startOfWeek.toISOString().split("T")[0];
      const formattedDateEnd = startOfWeek.toISOString().split("T")[0];

      // Call the function to fetch report details and generate the report
      await fetchAndGenerateReport1(formattedDateStart, formattedDateEnd);
    }
    if (event?.target?.value === "month") {
      const today = new Date(); // Get the current date

      // Get the first day of the current month
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get the last day of the current month
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const formatDate = (date: any) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure month is two digits
        const day = String(date.getDate()).padStart(2, "0"); // Ensure day is two digits
        return `${year}-${month}-${day}`;
      };

      // Format the dates to 'yyyy-mm-dd'
      const formattedDateStart = formatDate(firstDay);
      const formattedDateEnd = formatDate(lastDay);

      // Call the function to fetch report details and generate the report
      await fetchAndGenerateReport2(formattedDateStart, formattedDateEnd);
    }
  };

  //day
  // Function to fetch report details and generate the Excel report
  const fetchAndGenerateReport = async (formattedDate: string) => {
    try {
      // Fetch report details based on the selected date
      const reportData = await fetchReportDetails(
        "day",
        formattedDate,
        formattedDate,
      );

      // Call the function to generate the Excel report with fetched data
      generateExcelReport(reportData);
    } catch (error) {
      console.error("Error fetching or generating report:", error);
    }
  };

  // Function to fetch report details
  const fetchReportDetails = async (
    reportType: string,
    startDate: any,
    endDate: any,
  ) => {
    // Replace with your actual API call
    const response = await fetch(
      `/api/v1/admin/reports/download?type=${reportType}&startDate=${startDate}&endDate=${endDate}`,
    );
    const data = await response.json();

    return data;
  };

  // Function to generate the Excel report
  const generateExcelReport = async (reportDetails: { data: any[] }) => {
    console.log("reportDetails==>", reportDetails);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Day Report");

    worksheet.columns = [
      { header: "Device Id", key: "deviceId", width: 15 },
      { header: "User Id", key: "userId", width: 15 },
      { header: "User Name", key: "name", width: 25 },
      { header: "User Mobile", key: "mobile", width: 25 },
      { header: "Sleep Score", key: "sleepScore", width: 15 },
      { header: "Heart Rate", key: "avgHeartRate", width: 15 },
      { header: "Respiratory Rate", key: "avgBreathRate", width: 15 },
      { header: "Sleep Cycle", key: "leaveBedTime", width: 15 },
      { header: "Emancipate one self", key: "trunOverTimes", width: 25 },
    ];

    reportDetails?.data.forEach((elm) => {
      elm?.sleepHistoryData?.forEach((item: any) => {
        item?.users?.device?.forEach((it: any) => {
          worksheet.addRow({
            deviceId: it?.device_id,
            userId: elm.userId,
            name: item.users.name,
            mobile: item.users.mobile,
            sleepScore: item.sleepScore,
            avgHeartRate: item.avgHeartRate,
            avgBreathRate: item.avgBreathRate,
            leaveBedTime: item.leaveBedTime,
            trunOverTimes: item.trunOverTimes,
          });
        });
      });
    });

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "day-report.xlsx");
  };

  //week
  // Function to fetch report details and generate the Excel report
  const fetchAndGenerateReport1 = async (startOfWeek: any, endOfWeek: any) => {
    try {
      // Fetch report details based on the selected date
      const reportData = await fetchReportDetails1(
        "week",
        startOfWeek,
        endOfWeek,
      );

      // Call the function to generate the Excel report with fetched data
      generateExcelReport1(reportData);
    } catch (error) {
      console.error("Error fetching or generating report:", error);
    }
  };

  // Function to fetch report details
  const fetchReportDetails1 = async (
    reportType: string,
    startDate: any,
    endDate: any,
  ) => {
    // Replace with your actual API call
    const response = await fetch(
      `/api/v1/admin/reports/download?type=${reportType}&startDate=${startDate}&endDate=${endDate}`,
    );
    const data = await response.json();
    return data;
  };

  // Function to generate the Excel report
  const generateExcelReport1 = async (reportDetails: { data: any[] }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Week Report");

    worksheet.columns = [
      { header: "User Name", key: "userName", width: 25 },
      { header: "User Mobile", key: "userMobile", width: 25 },
      { header: "Device ID", key: "deviceId", width: 25 },
      { header: "User ID", key: "userId", width: 25 },
      { header: "Sleep Score", key: "sleepScore", width: 15 },
      { header: "Sleep Duration", key: "avgHeartRate", width: 15 },
      { header: "Deep Sleep All Time", key: "deepSleepAllTime", width: 15 },
      { header: "Mid Sleep", key: "midSleep", width: 15 },
      { header: "Deep Sleep", key: "deepSleep", width: 15 },
      { header: "Awake Time", key: "awakeTime", width: 15 },
      { header: "Leave Bed Time", key: "leaveBedTime", width: 15 },
      { header: "Heart Rate", key: "avgHeartRate", width: 15 },
      { header: " Respiratory Rate", key: "avgBreathRate", width: 15 },
      { header: "Apena-Hypopnea index", key: "apena", width: 15 },
    ];

    // Add data rows
    reportDetails?.data?.forEach((user: any) => {
      user?.users?.device?.forEach((item: any) => {
        worksheet.addRow({
          userName: user?.users?.name,
          userMobile: user?.users?.mobile,
          deviceId: item?.device_id,
          userId: user.userId,
          sleepScore: user?.sleepHistoryData.sleepScore,
          avgHeartRate: user.sleepHistoryData.avgHeartRate,
          deepSleepAllTime: user.sleepHistoryData.deepSleepAllTime,
          midSleep: user.sleepHistoryData.midSleep,
          deepSleep: user.sleepHistoryData.deepSleep,
          awakeTime: user.sleepHistoryData.awakeTime,
          leaveBedTime: user.sleepHistoryData.leaveBedTime,
          avgHeartRate1: user.sleepHistoryData.avgHeartRate,
          avgBreathRate: user.sleepHistoryData.avgBreathRate,
          apena: user.sleepHistoryData.apena,
        });
      });
    });

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "week-report.xlsx");
  };

  //month
  // Function to fetch report details and generate the Excel report
  const fetchAndGenerateReport2 = async (startOfWeek: any, endOfWeek: any) => {
    try {
      // Fetch report details based on the selected date
      const reportData = await fetchReportDetails2(
        "month",
        startOfWeek,
        endOfWeek,
      );

      // Call the function to generate the Excel report with fetched data
      generateExcelReport2(reportData);
    } catch (error) {
      console.error("Error fetching or generating report:", error);
    }
  };

  // Function to fetch report details
  const fetchReportDetails2 = async (
    reportType: string,
    startDate: any,
    endDate: any,
  ) => {
    // Replace with your actual API call
    const response = await fetch(
      `/api/v1/admin/reports/download?type=${reportType}&startDate=${startDate}&endDate=${endDate}`,
    );
    const data = await response.json();
    return data;
  };

  // Function to generate the Excel report
  const generateExcelReport2 = async (reportDetails: { data: any[] }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Month Report");

    worksheet.columns = [
      { header: "User Name", key: "userName", width: 25 },
      { header: "User Mobile", key: "userMobile", width: 25 },
      { header: "Device ID", key: "deviceId", width: 25 },
      { header: "User ID", key: "userId", width: 15 },
      { header: "Sleep Score", key: "sleepScore", width: 15 },
      { header: "Sleep Duration", key: "avgHeartRate", width: 15 },
      { header: "Deep Sleep All Time", key: "deepSleepAllTime", width: 15 },
      { header: "Mid Sleep", key: "midSleep", width: 15 },
      { header: "Deep Sleep", key: "deepSleep", width: 15 },
      { header: "Awake Time", key: "awakeTime", width: 15 },
      { header: "Leave Bed Time", key: "leaveBedTime", width: 15 },
      { header: "Heart Rate", key: "avgHeartRate", width: 15 },
      { header: " Respiratory Rate", key: "avgBreathRate", width: 15 },
      { header: "Apena-Hypopnea index", key: "apena", width: 15 },
    ];

    // Add data rows
    reportDetails?.data?.forEach((user: any) => {
      user?.users?.device?.forEach((item: any) => {
        worksheet.addRow({
          userId: user.userId,
          sleepScore: user?.sleepHistoryData.sleepScore,
          avgHeartRate: user.sleepHistoryData.avgHeartRate,
          deepSleepAllTime: user.sleepHistoryData.deepSleepAllTime,
          midSleep: user.sleepHistoryData.midSleep,
          deepSleep: user.sleepHistoryData.deepSleep,
          awakeTime: user.sleepHistoryData.awakeTime,
          leaveBedTime: user.sleepHistoryData.leaveBedTime,
          avgHeartRate1: user.sleepHistoryData.avgHeartRate,
          avgBreathRate: user.sleepHistoryData.avgBreathRate,
          apena: user.sleepHistoryData.apena,
        });
      });
    });

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "month-report.xlsx");
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between space-x-4">
        <div className="flex gap-4">
          <Input
            lang={""}
            name={""}
            className="w-65"
            placeholder="Search by Customer Name / Mobile"
            onChange={handleCustomerName}
            variant="blue"
          />
          <div>
            <select
              className="border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(76,134,145)] dark:text-white"
              value={selectedValue}
              onChange={handleSelectChange}
            >
              <option value="" disabled hidden>
                Select
              </option>
              {statusData.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* <div className="flex items-center space-x-2">
          <label htmlFor="sdate" className="text-sm font-black">
            Start Date:
          </label>
          <input
            type="date"
            id="sdate"
            value={startDateValue}
            onChange={onStartDateChange}
            max={today}
            className="border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(76,134,145)] dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="edate" className="text-sm font-black">
            End Date:
          </label>
          <input
            type="date"
            id="edate"
            value={endDateValue}
            onChange={onEndDateChange}
            max={today}
            className="border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(76,134,145)] dark:text-white"
          />
        </div> */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div>
            <select
              className="border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(76,134,145)] dark:text-white"
              value={selectedValue}
              onChange={handleDownloadReport}
            >
              <option value="" disabled hidden>
                Download Report
              </option>
              {downloadReport.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {/* <div
            className=" bottom-1 right-1 z-10 w-40 xsm:bottom-4 xsm:right-4"
            onClick={handleExportExcel}
          >
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded bg-[#4C8691] px-2 py-3 text-sm font-medium text-white hover:bg-opacity-80 xsm:px-4"
            >
              {Loader ? (
                <ImSpinner2 className="ml-2 h-5 w-5 animate-spin ltr:-mr-1 ltr:ml-3 rtl:-ml-1 rtl:mr-3 " />
              ) : (
                <div className="flex">
                  <span className="mt-0.5">Export Report</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="ml-2 fill-current"
                  >
                    <path d="M5 20h14v-2H5v2zm7-18v12.17l3.59-3.58L17 12l-5 5-5-5 1.41-1.41L11 14.17V2h2z" />
                  </svg>
                </div>
              )}
            </label>
          </div> */}
        </div>
      </div>
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <div>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-[#4C8691] text-left dark:bg-meta-4">
                  <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                    Customer Name
                  </th>
                  <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                    Device Type
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-white dark:text-white">
                    Email ID
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-white dark:text-white">
                    Mobile Number
                  </th>

                  <th className="px-4 py-4 font-medium text-white dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  Array.from({ length: 7 }).map((_, key) => (
                    <tr key={key}>
                      <td className="px-4 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredData.length === 0 || error?.status === 404 ? (
                  <tr>
                    <td colSpan={5} className="text-gray-500 p-4 text-center">
                      No data found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((packageItem: any, key: any) => {
                    const uniqueDeviceTypes: any = new Set(
                      packageItem?.device?.map(
                        (device: any) => device?.device_type,
                      ),
                    );
                    const deviceArray = [...uniqueDeviceTypes];
                    return (
                      <tr key={key}>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <h5 className="font-medium text-black dark:text-white">
                            {packageItem.name}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <h5 className="font-medium text-black dark:text-white">
                            {/* Pillow */}
                            <div className="flex space-x-2">
                              {deviceArray.map((deviceType, index) => (
                                <div key={index}>
                                  {deviceType}
                                  {index < deviceArray.length - 1 && " , "}
                                </div>
                              ))}
                            </div>
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            <p className="text-sm">{packageItem.email}</p>
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            <p className="text-sm">{packageItem.mobile}</p>
                          </p>
                        </td>

                        {/* <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p>{packageItem?.status}</p>
                  </td> */}
                        {/* <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p>{packageItem?.roles?.role}</p>
                  </td> */}
                        {/* <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p>04-09-2024</p>
                  </td> */}
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <button
                              className="hover:text-primary"
                              onClick={() => handleUpdateUser(packageItem?.id)}
                            >
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                                  fill=""
                                />
                                <path
                                  d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                                  fill=""
                                />
                              </svg>
                            </button>
                            <button
                              className="hover:text-primary"
                              onClick={handleExportExcel}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="fill-current"
                              >
                                <path d="M5 20h14v-2H5v2zm7-18v12.17l3.59-3.58L17 12l-5 5-5-5 1.41-1.41L11 14.17V2h2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {error?.status === 404 ? (
          <></>
        ) : (
          <>
            {filteredData.length > 0 && totalPages > 1 && (
              <div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TableThree;
