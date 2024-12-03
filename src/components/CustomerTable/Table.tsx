/* eslint-disable react/jsx-key */
"use client";
import Input from "@/app/ui/form/input";
import { useGetCustomerDetailsQuery } from "@/store/slice/customer/getCustomerDetails";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Pagination from "../Pagination/Pagination";
import Skeleton from "../Skeleton/skeleton";
import { ImSpinner2 } from "react-icons/im";

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

const getNextDay = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1); // Add one day
  return date.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
};

const TableThree = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [customerName, setCustomerName] = useState("");
  // Define a state to hold the selected value
  const [selectedValue, setSelectedValue] = useState("");
  const [Loader, setLoader] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [startDateValue, setStartDate] = useState("");
  const [endDateValue, setEndDate] = useState("");
  const [debouncedStartDateValue, setDebouncedStartDateValue] = useState("");
  const [debouncedEndDateValue, setDebouncedEndDateValue] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  console.log("selectedValue", selectedValue);
  console.log("filter", filteredData);

  const adjustedEndDate = getNextDay(debouncedEndDateValue);
  const {
    data: customerDetails,
    isLoading: userLoading,
    isFetching: isApiFetching,
    error,
  }: any = useGetCustomerDetailsQuery({
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

      const filtered = data?.filter((item: any) => {
        const orderId = (item.name || "").toString().toLowerCase();
        const mobileNo = (item.mobile || "").toString().toLowerCase();
        const deviceType = new Set(
          item?.device?.map((device: any) => device?.device_type),
        );

        const pillow = Array.from(deviceType);

        console.log("deviceType", deviceType, pillow[0], pillow[1]);
        const deviceTypee = (pillow[0] || "").toString().toLowerCase();
        const deviceTypee1 = (pillow[1] || "").toString().toLowerCase();

        const orderDate = new Date(item.createdAt.substring(0, 10));

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
    router.push(`/forms/create-customers?id=${userId}`);
    // router.push(`/forms/create-customers`);
  };

  const {
    formState: { errors },
  } = useForm<InputProps>({});

  const handleExportExcel = async () => {
    setLoader(true);

    // Create a new workbook and a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users and Devices");

    // Define columns for the user and device data
    worksheet.columns = [
      { header: "User ID", key: "user_id", width: 10 },
      { header: "Devie ID", key: "device_id", width: 30 },
      { header: "Devie Name", key: "device_name", width: 30 },
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 20 },
      { header: "Device Type", key: "device_type", width: 15 },
    ];

    // Log the filtered data to see its content
    console.log("Filtered Data:", filteredData);

    // Ensure filteredData is an array
    if (!Array.isArray(filteredData)) {
      console.error("Filtered data is not an array:", filteredData);
      setLoader(false);
      return;
    }

    // Iterate over each user in filteredData
    filteredData.forEach((user, userIndex) => {
      console.log(`Processing user ${userIndex + 1}:`, user);

      // Check if user.device is an array
      if (Array.isArray(user.device)) {
        user.device.forEach((device: any, deviceIndex: any) => {
          console.log(`  Processing device ${deviceIndex + 1}:`, device);

          // Add a row for each device associated with the user
          worksheet.addRow({
            user_id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            role_name: user.roles?.name || "N/A", // Safely access role name
            device_id: device.device_id,
            device_name: device.device_name || "N/A",
            device_mac: device.device_mac,
            device_type: device.device_type,
            device_createdAt: device.createdAt,
          });
        });
      } else {
        console.log(
          `  User ${user.id} has no devices or device is not an array.`,
        );
      }
    });

    // Confirm how many rows were added to the worksheet

    try {
      // Create a buffer and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "customer_list.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }

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

  return (
    <div>
      <div className="mb-4 flex justify-between space-x-4">
        <div>
          <Input
            lang={""}
            name={""}
            className="w-65"
            placeholder="Search by Customer Name / Mobile"
            onChange={handleCustomerName}
            variant="blue"
          />
        </div>
        <div>
          <select
            className="border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg border px-4  py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(76,134,145)] dark:text-white"
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
        <div className="flex items-center space-x-2">
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
        </div>
        <div>
          <div
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
          </div>
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
                  filteredData?.map((item: any, key: any) => {
                    // Create a Set to store unique device types
                    const uniqueDeviceTypes: any = new Set(
                      item?.device.map((device: any) => device?.device_type),
                    );
                    const deviceArray = [...uniqueDeviceTypes]; // Convert Set to Array

                    return (
                      <tr key={key}>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <h5 className="font-medium text-black dark:text-white">
                            {item.name}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <h5 className="font-medium text-black dark:text-white">
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
                            <p className="text-sm">{item.email}</p>
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            <p className="text-sm">{item.mobile}</p>
                          </p>
                        </td>

                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <button
                              className="hover:text-primary"
                              onClick={() => handleUpdateUser(item?.id)}
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
