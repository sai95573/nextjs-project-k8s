"use client";
import Input from "@/app/ui/form/input";
import Pagination from "@/components/Pagination/Pagination";
import Skeleton from "@/components/Skeleton/skeleton";
import {
  useGetDeviceDetailsQuery,
  useGetFullDeviceDetailsQuery,
} from "@/store/slice/device/getAllDeviceDetails";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ImSpinner2 } from "react-icons/im";

const TableThree = () => {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [Loader, setLoader] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [debouncedDeviceIdValue, setDebouncedDeviceIdValue] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  console.log("filteredData", filteredData);
  const [currentPage, setCurrentPage] = useState(1);
  // const [limit, setLimit] = useState();
  const limit = 10;
  const itemsPerPage = 10; // Number of items per page

  const {
    data: deviceDetails,
    isLoading: userLoading,
    isFetching: isApiFetching,
  } = useGetDeviceDetailsQuery({
    limit,
    page: currentPage,
    deviceId: debouncedDeviceIdValue,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDeviceIdValue(deviceId);
    }, 900);

    return () => {
      clearTimeout(handler);
    };
  }, [deviceId]);

  useEffect(() => {
    // Reset pagination to first page when query parameters change
    setCurrentPage(1);
  }, [debouncedDeviceIdValue]);

  const { data: deviceDetails1, isLoading: deviceLoading1 } =
    useGetFullDeviceDetailsQuery({});

  useEffect(() => {
    if (deviceDetails) {
      const { data } = deviceDetails;
      const searchLower = debouncedDeviceIdValue.toLowerCase();
      const filtered = data.filter((item: any) => {
        const deviceId = (item.device_id || "").toString().toLowerCase();
        const matchesSearch = deviceId.startsWith(searchLower);
        return matchesSearch;
      });

      setFilteredData(filtered);
    }
  }, [deviceDetails, debouncedDeviceIdValue]);

  useEffect(() => {
    setIsFetching(userLoading || isApiFetching);
  }, [userLoading, isApiFetching]);

  const handleUpdateUser = (userId: any, deviceId: any) => {
    router.push(`/forms/create-device?id=${userId}&deviceId=${deviceId}`);
  };

  const handleExportExcel = async () => {
    // Create a new workbook and a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Devices");

    // Define columns for the device data
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Device ID", key: "device_id", width: 30 },
      { header: "Device MAC", key: "device_mac", width: 20 },
      { header: "Device Type", key: "device_type", width: 15 },
    ];

    // Add data rows, including deviceDetails and connectedUsers
    // filteredData.forEach((device: any) => {
    // device.deviceDetails.forEach((detail: any) => {
    // worksheet.addRow({
    // id: "1",
    // device_id: device.device_id,
    // device_mac: device.device_mac,
    // device_type: device.device_type,
    // });
    // });
    // });

    filteredData?.forEach((elm: any) => {
      worksheet.addRow({
        id: elm?.id,
        device_id: elm.device_id,
        device_mac: elm.device_mac,
        device_type: elm.device_type,
      });
    });

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "devices.xlsx");
    setLoader(false);
  };

  // const handleRowExportExcel = async (id: any) => {
  //   const filterDevice = deviceDetails?.data?.filter(
  //     (item: any) => item?.id === Number(id),
  //   );
  //   console.log("filterDevice===>", filterDevice);
  //   // setLoader(true);
  //   // Create a new workbook and a worksheet
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Devices");

  //   // Define columns for the device data
  //   worksheet.columns = [
  //     { header: "ID", key: "id", width: 10 },
  //     { header: "Device ID", key: "device_id", width: 10 },
  //     // For connected users
  //   ];

  //   // Add data rows, including deviceDetails and connectedUsers
  //   filterDevice.forEach((device: any) => {
  //     console.log("devicedevice", device);
  //     device.forEach((detail: any) => {
  //       worksheet.addRow({
  //         id: device.id,
  //         device_id: device.device_id,
  //       });
  //     });
  //   });

  //   // Create a buffer and trigger download
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   saveAs(blob, "devices1.xlsx");
  //   // setLoader(false);
  // };

  const handleRowExportExcel = async (id: any) => {
    const filterDevice = deviceDetails?.data?.filter(
      (item: any) => item?.id === Number(id),
    );

    // Create a new workbook and a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Devices");

    // Define columns for the device data
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Device ID", key: "device_id", width: 30 },
      { header: "MAC Address", key: "device_mac", width: 30 },
      { header: "Device Type", key: "device_type", width: 15 },
      // { header: "Connected User Name", key: "user_name", width: 20 },
      // { header: "User Email", key: "user_email", width: 25 },
    ];

    // Add data rows, including deviceDetails and connectedUsers
    filterDevice.forEach((device: any) => {
      device.deviceDetails.forEach((detail: any) => {
        // Assuming you also want to add the connected users to the Excel
        const connectedUser = device.connectedUsers?.[0]; // Adjust for multiple users if needed

        worksheet.addRow({
          id: detail.id,
          device_id: device.device_id,
          device_mac: device.device_mac,
          device_type: device.device_type,
          // user_name: connectedUser?.name || "",
          // user_email: connectedUser?.email || "",
        });
      });
    });

    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.ms-excel.sheet.macroEnabled.12", // MIME type for xlsm
    });
    saveAs(blob, "devices.xlsm");
  };

  const totalPages = Math.ceil(
    deviceDetails?.pagination?.totalCount / itemsPerPage,
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleDeviceId = (e: any) => {
    setDeviceId(e.target.value);
  };

  return (
    <>
      <div className="-mb-6 flex items-center justify-between space-x-4 ">
        <div>
          <Input
            lang={""}
            name={""}
            className="w-73"
            placeholder="Search by Device Id"
            onChange={handleDeviceId}
            variant="blue"
          />
        </div>
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
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#4C8691] text-left dark:bg-meta-4">
                <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                  Device ID
                </th>
                <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                  Mobile Number
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-white dark:text-white">
                  Mac ID
                </th>

                <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                  Device Type
                </th>

                <th className="px-4 py-4 font-medium text-white dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                Array.from({ length: 7 }).map((_, idx) => (
                  <tr key={idx}>
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-gray-500 p-4 text-center">
                    No data found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map((elm: any, key: any) => {
                  return (
                    <tr key={key}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {elm.device_id}
                        </h5>
                      </td>

                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        {elm?.connectedUsers?.map((item: any) => (
                          <h5
                            key={item?.mobile}
                            className="font-medium text-black dark:text-white"
                          >
                            {item?.mobile || "00"}
                          </h5>
                        ))}
                      </td>

                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          <p className="text-sm">{elm?.device_mac}</p>
                        </p>
                      </td>

                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p>{elm?.device_type}</p>
                      </td>

                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <button
                            className="hover:text-primary"
                            onClick={() =>
                              handleUpdateUser(elm?.user_id, elm?.device_id)
                            }
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
                            onClick={() => handleRowExportExcel(elm?.id)}
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
        <div>
          {filteredData.length > 0 && totalPages > 1 && (
            <div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TableThree;
